import { X, Box, Sparkles, Check } from 'lucide-react';

interface ModelEditorProps {
  currentModel: any;
  onSelectModel: (model: string) => void;
  onClose: () => void;
}

// Daftar preset model 3D yang aman dan valid
const MODEL_OPTIONS = [
  { id: 'default', name: 'Default Hologram', description: 'Orbital Holographic Sphere' },
  { id: 'cube', name: 'Generative Cube', description: 'Geometric Tech Matrix' },
  { id: 'presenter', name: 'Stage Presenter', description: 'Core Presentation Node' },
];

export default function ModelEditor({ currentModel, onSelectModel, onClose }: ModelEditorProps) {
  // Memastikan currentModel dibaca sebagai string sederhana
  const activeModelId = typeof currentModel === 'string' ? currentModel : currentModel?.id || 'default';

  return (
    <div className="absolute top-16 right-4 z-30 w-80 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl p-4 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-sky-400" />
          <h3 className="font-semibold text-sm">3D Generative Editor</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="py-3 space-y-2">
        <p className="text-xs text-slate-400">Pilih modul/model 3D panggung:</p>

        {MODEL_OPTIONS.map((item) => {
          const isSelected = activeModelId === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectModel(item.id);
              }}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between ${
                isSelected
                  ? 'bg-sky-600/20 border-sky-500/50 text-sky-200 shadow-md'
                  : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <Sparkles className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                  {item.name}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{item.description}</p>
              </div>

              {isSelected && <Check className="w-4 h-4 text-sky-400 mt-0.5" />}
            </button>
          );
        })}
      </div>

      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 text-center">
        Perubahan akan langsung tersinkronisasi ke seluruh peserta.
      </div>
    </div>
  );
}
