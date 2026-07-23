import { useState } from 'react';
// Tambahkan Sparkles di sini
import { Sparkles, ArrowRight, Video, MonitorPlay } from 'lucide-react';

type Props = {
  onJoin: (name: string, meetingId?: string) => void;
};

const AVATAR_COLORS = ['#4f8cff', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#f97316'];

export default function Lobby({ onJoin }: Props) {
  const [name, setName] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [color] = useState(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);

  const handleJoin = () => {
    if (!name.trim()) return;
    onJoin(name.trim(), meetingId.trim() || undefined);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    onJoin(name.trim());
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">HoloMeet</h1>
            <p className="text-sm text-slate-400">Generative 3D Meeting Space</p>
          </div>
        </div>

        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white shadow-lg"
              style={{ backgroundColor: color }}
            >
              {name.charAt(0).toUpperCase() || '?'}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-cyan-500/50"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Meeting Code (optional)
              </label>
              <input
                type="text"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                placeholder="Paste a meeting code to join"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-cyan-500/50"
              />
            </div>

            <button
              onClick={handleJoin}
              disabled={!name.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Video className="h-5 w-5" />
              Join Meeting
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-slate-500">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <button
              onClick={handleCreate}
              disabled={!name.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-5 w-5" />
              New Meeting
            </button>
          </div>
        </div>

        <p className="mt-6 flex items-center gap-1.5 text-xs text-slate-500">
          <ArrowRight className="h-3 w-3" />
          Powered by generative 3D &amp; real-time presence
        </p>
      </div>
    </div>
  );
}
