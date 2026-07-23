import { X, Box, Sparkles, Check, Image as ImageIcon, Camera, Mouse, GitFork } from 'lucide-react';

interface ModelEditorProps {
  currentModel: any;
  onSelectModel: (model: any) => void;
  onClose: () => void;
}

const MODEL_OPTIONS = [
  { id: 'default', name: 'Default Hologram', description: 'Orbital Holographic Sphere' },
  { id: 'cube', name: 'Generative Cube', description: 'Geometric Tech Matrix' },
  { id: 'presenter', name: 'Stage Presenter', description: 'Core Presentation Node' },
  { id: 'mouse', name: 'Mouse 3D Object', description: 'Generative 3D Model Mouse' },
  { id: 'pipeline', name: 'AI 3D Pipeline Diagram', description: 'Flow Architecture Diagram 3D' },
];

export default function ModelEditor({ currentModel, onSelectModel, onClose }: ModelEditorProps) {
  const activeModelId = typeof currentModel === 'string' ? currentModel : currentModel?.id || 'default';

  // Handler umum untuk memproses file baik dari Import File maupun Kamera
  const handleMediaProcess = (file?: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        // Mengirim data gambar ke Mesh Displacement Engine di SceneViewport
        onSelectModel({
          id: 'custom_image',
          type: 'custom_image',
          imageUrl: imageUrl,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="absolute top-16 right-4 z-30 w-80 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl p-4 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
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

      {/* List Options */}
      <div className="py-3 space-y-2">
        <p className="text-xs text-slate-400">Pilih modul/model 3D panggung:</p>

        {MODEL_OPTIONS.map((item) => {
          const isSelected = activeModelId === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectModel(item.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between ${
                isSelected
                  ? 'bg-sky-600/20 border-sky-500/50 text-sky-200 shadow-md'
                  : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  {item.id === 'mouse' ? (
                    <Mouse className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                  ) : item.id === 'pipeline' ? (
                    <GitFork className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                  ) : (
                    <Sparkles className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                  )}
                  {item.name}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{item.description}</p>
              </div>

              {isSelected && <Check className="w-4 h-4 text-sky-400 mt-0.5" />}
            </button>
          );
        })}
      </div>

      {/* Fitur AI Image-to-3D Reconstruction (File & Kamera Berdampingan) */}
      <div className="pt-3 border-t border-slate-800 space-y-2">
        <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          AI Image-to-3D Reconstruction
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          {/* Tombol 1: Pilih File Gambar */}
          <label className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-sky-600/20 border border-sky-500/40 hover:bg-sky-600/30 text-sky-300 text-[11px] font-medium cursor-pointer transition-all text-center gap-1">
            <ImageIcon className="w-4 h-4" />
            <span>Pilih File Gambar</span>
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp"
              onChange={(e) => handleMediaProcess(e.target.files?.[0])}
              className="hidden"
            />
          </label>

          {/* Tombol 2: Ambil Foto / Video via Kamera */}
          <label className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 text-emerald-300 text-[11px] font-medium cursor-pointer transition-all text-center gap-1">
            <Camera className="w-4 h-4" />
            <span>Kamera / Capture</span>
            <input
              type="file"
              accept="image/*,video/*"
              capture="environment"
              onChange={(e) => handleMediaProcess(e.target.files?.[0])}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 text-[10px] text-slate-500 text-center">
        Secara dinamis merekonstruksi piksel gambar menjadi Mesh 3D bervolume.
      </div>
    </div>
  );
}
