import { useState } from 'react';
import { Sparkles, ArrowRight, Video, MonitorPlay } from 'lucide-react';

const AVATAR_COLORS = ['#4f8cff', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#f97316'];

interface LobbyProps {
  onJoin: (name: string, meetingId?: string) => void;
}

export default function Lobby({ onJoin }: LobbyProps) {
  const [name, setName] = useState('');
  const [meetingCode, setMeetingCode] = useState('');

  const handleCreateMeeting = () => {
    if (!name.trim()) {
      alert('Please enter your name first');
      return;
    }
    onJoin(name);
  };

  const handleJoinMeeting = () => {
    if (!name.trim()) {
      alert('Please enter your name first');
      return;
    }
    if (!meetingCode.trim()) {
      alert('Please enter a meeting code');
      return;
    }
    onJoin(name, meetingCode);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col p-6 font-sans">
      <header className="flex items-center gap-3 pb-8 mb-8 border-b border-slate-800">
        <div className="p-3 rounded-2xl bg-sky-600/10 border border-sky-600/20">
          <Sparkles className="w-8 h-8 text-sky-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-50 tracking-tight">HoloMeet</h1>
          <p className="text-slate-400 text-lg">Generative 3D Meeting Space</p>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center py-12">
        <div className="bg-slate-900/50 p-10 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-xl">
          {/* Avatar Area */}
          <div className="mx-auto w-32 h-32 rounded-full bg-orange-400 flex items-center justify-center mb-8 border-4 border-slate-700/50 shadow-xl shadow-slate-900/50">
            <span className="text-6xl text-slate-900 font-bold">?</span>
          </div>

          <div className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-slate-300">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-lg"
              />
            </div>

            {/* Meeting Code Input */}
            <div className="space-y-2">
              <label htmlFor="meetingCode" className="text-sm font-medium text-slate-300">
                Meeting Code (optional)
              </label>
              <input
                id="meetingCode"
                type="text"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                placeholder="Paste a meeting code to join"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-lg"
              />
            </div>

            {/* Join Button */}
            <button
              onClick={handleJoinMeeting}
              className="w-full bg-sky-600 text-white font-semibold rounded-xl px-6 py-4 flex items-center justify-center gap-3 hover:bg-sky-500 transition-colors duration-200 text-lg"
            >
              <Video className="w-6 h-6" />
              Join Meeting
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-5">
              <div className="flex-grow border-t border-slate-700/50"></div>
              <span className="flex-shrink mx-6 text-sm text-slate-600 font-mono">or</span>
              <div className="flex-grow border-t border-slate-700/50"></div>
            </div>

            {/* New Meeting Button */}
            <button
              onClick={handleCreateMeeting}
              className="w-full bg-slate-800 text-slate-100 font-medium rounded-xl px-6 py-4 flex items-center justify-center gap-3 hover:bg-slate-700 border border-slate-700 transition-colors duration-200 text-lg"
            >
              <MonitorPlay className="w-6 h-6 text-sky-400" />
              Start a New Meeting
            </button>
          </div>
        </div>
      </main>

      <footer className="mt-16 text-center text-slate-600 pt-8 border-t border-slate-800/50">
        <p>© {new Date().getFullYear()} HoloMeet Inc. All rights reserved.</p>
        <p className="text-sm mt-1">Experimental Generative Meeting Platform</p>
      </footer>
    </div>
  );
}
