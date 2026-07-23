import { Mic, MicOff, Video, VideoOff, Crown, Users } from 'lucide-react';
import type { Participant } from '@/lib/supabase';

type Props = {
  participants: Participant[];
  currentName: string;
};

export default function ParticipantsPanel({ participants, currentName }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <Users className="h-4 w-4 text-cyan-400" />
        <h3 className="text-sm font-semibold text-white">
          Participants ({participants.length})
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {participants.map((p) => {
          const isMe = p.name === currentName;
          return (
            <div
              key={p.id}
              className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-white/5"
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: p.avatar_color }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium text-white">
                    {p.name} {isMe && <span className="text-cyan-400">(You)</span>}
                  </span>
                  {p.is_presenter && (
                    <Crown className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  {p.is_presenter ? 'Presenter' : 'Attendee'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {p.is_muted ? (
                  <MicOff className="h-4 w-4 text-red-400" />
                ) : (
                  <Mic className="h-4 w-4 text-slate-400" />
                )}
                {p.is_video_on ? (
                  <Video className="h-4 w-4 text-slate-400" />
                ) : (
                  <VideoOff className="h-4 w-4 text-slate-500" />
                )}
              </div>
            </div>
          );
        })}
        {participants.length === 0 && (
          <p className="px-3 py-8 text-center text-sm text-slate-500">No participants yet</p>
        )}
      </div>
    </div>
  );
}
