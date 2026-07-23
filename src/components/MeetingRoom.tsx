import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Users,
  Share2, Box, Copy, Check, Sparkles,
} from 'lucide-react';
import { supabase, type Meeting, type Participant, type ChatMessage, type PresenterModel, DEFAULT_MODEL } from '@/lib/supabase';
import SceneViewport from './SceneViewport';
import ModelEditor from './ModelEditor';
import ParticipantsPanel from './ParticipantsPanel';
import ChatPanel from './ChatPanel';

type Props = {
  meetingId: string;
  name: string;
  avatarColor: string;
  isHost: boolean;
  onLeave: () => void;
};

const AVATAR_COLORS = ['#4f8cff', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#f97316'];

export default function MeetingRoom({ meetingId, name, avatarColor, isHost, onLeave }: Props) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isPresenting, setIsPresenting] = useState(isHost);
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [model, setModel] = useState<PresenterModel>(DEFAULT_MODEL);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const participantIdRef = useRef<string | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load meeting data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: meetingData } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .maybeSingle();

      if (cancelled) return;

      if (meetingData) {
        setMeeting(meetingData as Meeting);
        setModel((meetingData as Meeting).presenter_model || DEFAULT_MODEL);
      }

      // Insert participant
      const { data: newPart, error } = await supabase
        .from('participants')
        .insert({
          meeting_id: meetingId,
          name,
          avatar_color: avatarColor,
          is_presenter: isHost,
          is_muted: false,
          is_video_on: true,
          last_seen: new Date().toISOString(),
        })
        .select()
        .single();

      if (!cancelled && !error && newPart) {
        participantIdRef.current = (newPart as Participant).id;
      } else if (error && error.code === '23505') {
        // Duplicate name — update existing
        const { data: existing } = await supabase
          .from('participants')
          .select('*')
          .eq('meeting_id', meetingId)
          .eq('name', name)
          .maybeSingle();
        if (!cancelled && existing) {
          participantIdRef.current = (existing as Participant).id;
          await supabase
            .from('participants')
            .update({ last_seen: new Date().toISOString(), is_presenter: isHost })
            .eq('id', (existing as Participant).id);
        }
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Heartbeat to keep presence alive
  useEffect(() => {
    heartbeatRef.current = setInterval(async () => {
      if (participantIdRef.current) {
        await supabase
          .from('participants')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', participantIdRef.current);
      }
    }, 5000);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, []);

  // Cleanup on leave
  const handleLeave = useCallback(async () => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    if (participantIdRef.current) {
      await supabase.from('participants').delete().eq('id', participantIdRef.current);
    }
    onLeave();
  }, [onLeave]);

  // Cleanup on unmount
  useEffect(() => {
    const handleUnload = () => {
      if (participantIdRef.current) {
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/participants?id=eq.${participantIdRef.current}`,
          new Blob([JSON.stringify({})], { type: 'application/json' })
        );
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    const partsChannel = supabase
      .channel('participants-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'participants',
        filter: `meeting_id=eq.${meetingId}`,
      }, async () => {
        // Re-fetch participants, filter by recent last_seen
        const cutoff = new Date(Date.now() - 15000).toISOString();
        const { data } = await supabase
          .from('participants')
          .select('*')
          .eq('meeting_id', meetingId)
          .gte('last_seen', cutoff)
          .order('joined_at', { ascending: true });
        if (data) setParticipants(data as Participant[]);
      })
      .subscribe();

    const msgChannel = supabase
      .channel('chat-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `meeting_id=eq.${meetingId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();

    // Initial fetch
    (async () => {
      const cutoff = new Date(Date.now() - 15000).toISOString();
      const { data: parts } = await supabase
        .from('participants')
        .select('*')
        .eq('meeting_id', meetingId)
        .gte('last_seen', cutoff)
        .order('joined_at', { ascending: true });
      if (parts) setParticipants(parts as Participant[]);

      const { data: msgs } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true })
        .limit(100);
      if (msgs) setMessages(msgs as ChatMessage[]);
    })();

    // Periodic refresh of participants (presence cleanup)
    const presenceInterval = setInterval(async () => {
      const cutoff = new Date(Date.now() - 15000).toISOString();
      const { data } = await supabase
        .from('participants')
        .select('*')
        .eq('meeting_id', meetingId)
        .gte('last_seen', cutoff)
        .order('joined_at', { ascending: true });
      if (data) setParticipants(data as Participant[]);
    }, 10000);

    return () => {
      supabase.removeChannel(partsChannel);
      supabase.removeChannel(msgChannel);
      clearInterval(presenceInterval);
    };
  }, [meetingId]);

  // Update mute/video state
  const toggleMute = async () => {
    const next = !isMuted;
    setIsMuted(next);
    if (participantIdRef.current) {
      await supabase.from('participants').update({ is_muted: next }).eq('id', participantIdRef.current);
    }
  };

  const toggleVideo = async () => {
    const next = !isVideoOn;
    setIsVideoOn(next);
    if (participantIdRef.current) {
      await supabase.from('participants').update({ is_video_on: next }).eq('id', participantIdRef.current);
    }
  };

  const togglePresenting = async () => {
    const next = !isPresenting;
    setIsPresenting(next);
    if (participantIdRef.current) {
      await supabase.from('participants').update({ is_presenter: next }).eq('id', participantIdRef.current);
    }
  };

  // Update model on server
  const updateModel = async (newModel: PresenterModel) => {
    setModel(newModel);
    await supabase.from('meetings').update({ presenter_model: newModel }).eq('id', meetingId);
  };

  // Listen for model changes
  useEffect(() => {
    const meetingChannel = supabase
      .channel('meeting-model')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'meetings',
        filter: `id=eq.${meetingId}`,
      }, (payload) => {
        const updated = payload.new as Meeting;
        if (updated.presenter_model) {
          setModel(updated.presenter_model);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(meetingChannel);
    };
  }, [meetingId]);

  const sendMessage = async (content: string) => {
    await supabase.from('chat_messages').insert({
      meeting_id: meetingId,
      participant_name: name,
      content,
    });
  };

  const copyMeetingId = () => {
    navigator.clipboard.writeText(meetingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Joining meeting...</p>
        </div>
      </div>
    );
  }

  const activePresenters = participants.filter((p) => p.is_presenter);

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">{meeting?.title || 'Untitled Meeting'}</h2>
            <p className="text-xs text-slate-500">{participants.length} participant(s)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyMeetingId}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Copy ID'}
          </button>
        </div>
      </header>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* 3D Stage */}
        <div className="relative flex-1">
          <SceneViewport model={model} isPresenting={isPresenting} />

          {/* Presenter badge */}
          {activePresenters.length > 0 && (
            <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-3 py-1.5 backdrop-blur-md">
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <span className="text-xs font-medium text-white">
                {activePresenters.map((p) => p.name).join(', ')} presenting
              </span>
            </div>
          )}

          {/* Model editor toggle */}
          <button
            onClick={() => setShowEditor(!showEditor)}
            className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-cyan-300 backdrop-blur-md transition hover:bg-slate-800/80"
          >
            <Box className="h-3.5 w-3.5" />
            3D Editor
          </button>

          {showEditor && (
            <ModelEditor model={model} onChange={updateModel} onClose={() => setShowEditor(false)} />
          )}

          {/* Bottom controls */}
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
            <button
              onClick={toggleMute}
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                isMuted ? 'bg-red-500 hover:bg-red-400' : 'bg-white/10 hover:bg-white/20'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <button
              onClick={toggleVideo}
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                !isVideoOn ? 'bg-red-500 hover:bg-red-400' : 'bg-white/10 hover:bg-white/20'
              }`}
              title={isVideoOn ? 'Stop Video' : 'Start Video'}
            >
              {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>
            <button
              onClick={togglePresenting}
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                isPresenting ? 'bg-cyan-500 hover:bg-cyan-400' : 'bg-white/10 hover:bg-white/20'
              }`}
              title={isPresenting ? 'Stop Presenting' : 'Start Presenting'}
            >
              <Share2 className="h-5 w-5" />
            </button>
            <div className="mx-1 h-8 w-px bg-white/10" />
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                showParticipants ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/10 hover:bg-white/20'
              }`}
              title="Participants"
            >
              <Users className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                showChat ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/10 hover:bg-white/20'
              }`}
              title="Chat"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
            <div className="mx-1 h-8 w-px bg-white/10" />
            <button
              onClick={handleLeave}
              className="flex h-11 items-center gap-2 rounded-xl bg-red-500 px-4 font-semibold transition hover:bg-red-400"
              title="Leave"
            >
              <PhoneOff className="h-5 w-5" />
              <span className="text-sm">Leave</span>
            </button>
          </div>

          {/* Self video tile (simulated) */}
          {isVideoOn && (
            <div className="absolute bottom-6 right-4 z-20">
              <div
                className="flex h-24 w-36 items-center justify-center rounded-xl border border-white/10 shadow-lg"
                style={{ backgroundColor: avatarColor + '40' }}
              >
                <div className="text-center">
                  <div
                    className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-white/80">{name}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side panels */}
        {(showParticipants || showChat) && (
          <aside className="flex w-80 flex-col border-l border-white/10 bg-slate-900/50 backdrop-blur-sm">
            {showParticipants && (
              <div className="flex-1 overflow-hidden border-b border-white/10">
                <ParticipantsPanel participants={participants} currentName={name} />
              </div>
            )}
            {showChat && (
              <div className="flex-1 overflow-hidden">
                <ChatPanel messages={messages} currentName={name} onSend={sendMessage} />
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
