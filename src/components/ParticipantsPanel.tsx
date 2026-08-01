import { Users, Crown } from 'lucide-react';

interface ParticipantsPanelProps {
  participants: any[];
}

export default function ParticipantsPanel({ participants = [] }: ParticipantsPanelProps) {
  // Pastikan participants selalu array valid
  const safeList = Array.isArray(participants) ? participants : [];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900/60 text-slate-100">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-sky-400" />
          <h2 className="font-semibold text-sm">Participants ({safeList.length})</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {safeList.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No participants joined yet</p>
        ) : (
          safeList.map((p, idx) => {
            if (!p) return null;
            const displayName = p.name || p.sender_name || 'Anonymous';
            const color = p.avatar_color || '#4f8cff';
            const isHost = p.is_host || idx === 0;

            return (
              <div
                key={p.id || idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-inner"
                    style={{ backgroundColor: color }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-slate-200">{displayName}</span>
                </div>
                {isHost && (
                  <span className="flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    <Crown className="w-3 h-3" /> Host
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
