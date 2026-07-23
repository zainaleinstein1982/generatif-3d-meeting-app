import { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Users,
  Share2, Box, Copy, Check, Sparkles,
} from 'lucide-react';
import { supabase, type PresenterModel, DEFAULT_MODEL } from '@/lib/supabase';
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

export default function MeetingRoom({ meetingId, name, avatarColor, isHost, onLeave }: Props) {
  const [meetingTitle, setMeetingTitle] = useState(`${name}'s Meeting`);
  const [participants, setParticipants] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [activeTab, setActiveTab] = useState<'participants' | 'chat' | null>('participants');
  const [copied, setCopied] = useState(false);
  const [presenterModel, setPresenterModel] = useState<PresenterModel>(DEFAULT_MODEL);
  const [showEditor, setShowEditor] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);

  const myParticipantId = useRef<string | null>(null);

  // Default fallback peserta agar UI tidak crash/blank
  useEffect(() => {
    setParticipants([{ id: 'self', name: name, avatar_color: avatarColor || '#4f8cff' }]);
  }, [name, avatarColor]);

  // 1. Load & Listen Meeting
  useEffect(() => {
    if (!meetingId) return;

    supabase
      .from('meetings')
      .select('*')
      .eq('id', meetingId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) {
          if (data.title) setMeetingTitle(data.title);
          if (data.presenter_model) setPresenterModel(data.presenter_model);
        }
      })
      .catch((err) => console.log('Meeting fetch bypass:', err));

    const channel = supabase
      .channel(`meeting:${meetingId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'meetings', filter: `id=eq.${meetingId}` }, (payload) => {
        if (payload.new) {
          const updated = payload.new as any;
          if (updated.title) setMeetingTitle(updated.title);
          if (updated.presenter_model) setPresenterModel(updated.presenter_model);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meetingId]);

  // 2. Load & Join Participants
  useEffect(() => {
    if (!meetingId) return;

    let sub: ReturnType<typeof supabase.channel> | null = null;

    const syncParticipants = async () => {
      try {
        const { data } = await supabase.from('participants').select('*').eq('meeting_id', meetingId);
        if (data && data.length > 0) {
          setParticipants(data);
        }

        const { data: inserted } = await supabase
          .from('participants')
          .insert({
            meeting_id: meetingId,
            name: name,
            avatar_color: avatarColor || '#4f8cff',
          })
          .select()
          .single();

        if (inserted) {
          myParticipantId.current = inserted.id;
          const { data: updatedList } = await supabase.from('participants').select('*').eq('meeting_id', meetingId);
          if (updatedList) setParticipants(updatedList);
        }
      } catch (err) {
        console.log('Participants fallback active');
      }

      sub = supabase
        .channel(`participants:${meetingId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, async () => {
          const { data: latest } = await supabase.from('participants').select('*').eq('meeting_id', meetingId);
          if (latest && latest.length > 0) setParticipants(latest);
        })
        .subscribe();
    };

    syncParticipants();

    return () => {
      if (myParticipantId.current) {
        supabase.from('participants').delete().eq('id', myParticipantId.current).then();
      }
      if (sub) supabase.removeChannel(sub);
    };
  }, [meetingId, name, avatarColor]);

  // 3. Load Chat Messages
  useEffect(() => {
    if (!meetingId) return;

    supabase
      .from('chat_messages')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data);
      })
      .catch(() => {});

    const sub = supabase
      .channel(`chat:${meetingId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        if (payload.new) {
          setMessages((prev) => [...prev, payload.new]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [meetingId]);

  const handleSendMessage = async (text: string) => {
    const newMsg = { meeting_id: meetingId, sender_name: name, message: text, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, newMsg]);

    try {
      await supabase.from('chat_messages').insert({
        meeting_id: meetingId,
        sender_name: name,
        message: text,
      });
    } catch (e) {
      console.log('Chat fallback');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(meetingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateModel = async (model: PresenterModel) => {
    setPresenterModel(model);
    try {
      await supabase.from('meetings').update({ presenter_model: model }).eq('id', meetingId);
    } catch (e) {}
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-600/10 border border-sky-600/20">
            <Sparkles className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-100 text-sm md:text-base">
              {meetingTitle}
            </h1>
            <p className="text-xs text-slate-400">{participants.length} participant(s)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 transition-colors border border-slate-700/50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy ID'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* 3D Viewport */}
        <div className="flex-1 relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          <SceneViewport presenterModel={presenterModel} isPresenting={isPresenting} />

          {/* Floating Controls */}
          {isHost && (
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button
                onClick={() => setShowEditor(!showEditor)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs font-medium text-slate-200 hover:bg-slate-800 backdrop-blur-md shadow-lg transition-all"
              >
                <Box className="w-4 h-4 text-sky-400" />
                3D Editor
              </button>
            </div>
          )}

          {/* Self Video PIP Preview */}
          <div className="absolute bottom-6 right-6 z-10">
            <div className="w-36 h-24 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner"
                style={{ backgroundColor: avatarColor || '#4f8cff' }}
              >
                {(name || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] text-slate-300 font-medium mt-2 px-2 truncate max-w-full">
                {name}
              </span>
            </div>
          </div>
        </div>

        {/* Editor Modal */}
        {showEditor && (
          <ModelEditor
            currentModel={presenterModel}
            onSelectModel={updateModel}
            onClose={() => setShowEditor(false)}
          />
        )}

        {/* Right Side Panels */}
        {activeTab && (
          <div className="w-80 border-l border-slate-800/80 bg-slate-900/40 backdrop-blur-md flex flex-col z-10">
            {activeTab === 'participants' && <ParticipantsPanel participants={participants} />}
            {activeTab === 'chat' && <ChatPanel messages={messages} onSendMessage={handleSendMessage} name={name} />}
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <footer className="h-20 border-t border-slate-800/80 bg-slate-900/80 backdrop-blur-lg px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-2xl border transition-all ${
              isMuted
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-3.5 rounded-2xl border transition-all ${
              isVideoOff
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsPresenting(!isPresenting)}
            className={`p-3.5 rounded-2xl border transition-all ${
              isPresenting
                ? 'bg-sky-500/20 border-sky-500/40 text-sky-400'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(activeTab === 'participants' ? null : 'participants')}
            className={`p-3.5 rounded-2xl border transition-all ${
              activeTab === 'participants'
                ? 'bg-sky-600/20 border-sky-500/40 text-sky-400'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Users className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'chat' ? null : 'chat')}
            className={`p-3.5 rounded-2xl border transition-all ${
              activeTab === 'chat'
                ? 'bg-sky-600/20 border-sky-500/40 text-sky-400'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <button
            onClick={onLeave}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-medium transition-all shadow-lg shadow-rose-600/20 ml-4"
          >
            <PhoneOff className="w-5 h-5" />
            Leave
          </button>
        </div>
      </footer>
    </div>
  );
}
