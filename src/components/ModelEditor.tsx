import { useState, useRef } from 'react';
import { X, Box, Sparkles, Check, Image as ImageIcon, Camera, Mouse, GitFork, Loader2, Video, RefreshCw } from 'lucide-react';

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const activeModelId = typeof currentModel === 'string' ? currentModel : currentModel?.id || 'default';

  // Handler 1: Process File Upload Standard
  const handleFileProcess = (file?: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
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

  // Handler 2: Mengaktifkan Live Camera menggunakan MediaDevices API
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Gagal mengakses kamera:', err);
      alert('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di browser Anda.');
      setIsCameraActive(false);
    }
  };

  // Matikan Stream Kamera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture Frame dari Camera Video Stream & Kirim ke img2threejs Engine
  const captureFrameAndReconstruct = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL('image/jpeg');

        stopCamera();
        setIsAnalyzing(true);

        // Simulasi analisis VLM img2threejs (1.5 detik)
        setTimeout(() => {
          setIsAnalyzing(false);
          onSelectModel({
            id: 'img2threejs_procedural',
            type: 'img2threejs_procedural',
            imageUrl: imageUrl,
            name: 'Camera_Captured_Object',
          });
        }, 1500);
      }
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
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* MODAL LIVE WEBCAM FEED (Bila tombol kamera diklik) */}
      {isCameraActive ? (
        <div className="py-3 space-y-3">
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-emerald-500/50 shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              onLoadedMetadata={() => videoRef.current?.play()}
            />
            <div className="absolute top-2 left-2 bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Camera Feed
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={captureFrameAndReconstruct}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Capture & Build 3D</span>
            </button>
            <button
              onClick={stopCamera}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* List Options Model Preset */}
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

          {/* Fitur AI Image-to-3D Reconstruction */}
          <div className="pt-3 border-t border-slate-800 space-y-2 relative">
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl gap-2 text-emerald-300 border border-emerald-800">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-[10px] font-medium">Reconstructing img2threejs Model...</span>
              </div>
            )}

            <label className="flex items-center justify-between text-[11px] font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                AI Image-to-3D Reconstruction
              </span>
              <span className="text-[9px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                img2threejs
              </span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {/* Tombol 1: Pilih File Gambar */}
              <label className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-sky-600/20 border border-sky-500/40 hover:bg-sky-600/30 text-sky-300 text-[11px] font-medium cursor-pointer transition-all text-center gap-1">
                <ImageIcon className="w-4 h-4" />
                <span>Pilih File Gambar</span>
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={(e) => handleFileProcess(e.target.files?.[0])}
                  className="hidden"
                />
              </label>

              {/* Tombol 2: Kamera / Capture (Direct Webcam Stream) */}
              <button
                type="button"
                onClick={startCamera}
                disabled={isAnalyzing}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 text-emerald-300 text-[11px] font-medium transition-all text-center gap-1"
              >
                <Camera className="w-4 h-4" />
                <span>Kamera / Capture</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="pt-3 text-[10px] text-slate-500 text-center">
        Powered by Procedural img2threejs Code-Only Model Engine.
      </div>
    </div>
  );
}
