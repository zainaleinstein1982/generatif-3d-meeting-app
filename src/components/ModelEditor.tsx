import { useState, useRef, useEffect } from 'react';

interface ModelEditorProps {
  onSelectModel: (model: any) => void;
  onClose?: () => void;
}

interface ScanPoint {
  x: number;
  y: number;
  z: number;
  color: string;
}

interface FrameData {
  id: number;
  imageUrl: string;
  pointCloud: ScanPoint[];
}

export default function ModelEditor({ onSelectModel, onClose }: ModelEditorProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [geometryType, setGeometryType] = useState<'box' | 'cylinder' | 'sphere'>('box');
  
  // STAT BARU: Menyimpan jenis objek yang dipindai
  const [objectType, setObjectType] = useState<'car' | 'cat' | 'custom'>('car');

  const [scannedFrames, setScannedFrames] = useState<FrameData[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<FrameData | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const totalRequiredSlots = 5;

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err) {
      setCameraError('Kamera tidak dapat diakses.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsScanning(false);
  };

  const captureSingleFrame = (): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.videoWidth === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.9);
    }
    return null;
  };

  const generatePointCloud = (): ScanPoint[] => {
    const points: ScanPoint[] = [];
    const colors = ['#38bdf8', '#34d399', '#f43f5e', '#fbbf24', '#ffffff'];
    for (let i = 0; i < 120; i++) {
      points.push({
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        z: Math.random(),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    return points;
  };

  const handleStartScan = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.videoWidth === 0) {
      alert('Kamera belum siap.');
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setScannedFrames([]);
    setSelectedFrame(null);

    let currentSlot = 0;
    const framesAcc: FrameData[] = [];

    const interval = setInterval(() => {
      currentSlot += 1;
      const progress = Math.min(Math.round((currentSlot / totalRequiredSlots) * 100), 100);
      setScanProgress(progress);

      const frameImg = captureSingleFrame();
      if (frameImg) {
        const newFrameData: FrameData = {
          id: currentSlot,
          imageUrl: frameImg,
          pointCloud: generatePointCloud(),
        };
        framesAcc.push(newFrameData);
        setScannedFrames([...framesAcc]);
      }

      if (currentSlot >= totalRequiredSlots || progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        if (framesAcc.length > 0) {
          setSelectedFrame(framesAcc[framesAcc.length - 1]);
        }
      }
    }, 1000);
  };

  const applyTo3DScene = (frame: FrameData) => {
    // Mengirim tipe objek, geometri, dan foto snapshot ke scene 3D
    onSelectModel({
      type: '3d_mesh',
      objectType: objectType, // 'car' | 'cat' | 'custom'
      imageUrl: frame.imageUrl,
      geometryType: geometryType,
      timestamp: Date.now(),
    });
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="w-full h-full bg-slate-900 p-4 text-slate-100 flex flex-col gap-4 overflow-y-auto font-sans">
      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
        <h3 className="font-bold text-sm text-sky-400">3D Photogrammetry Scanner</h3>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white px-2 py-1 text-xs bg-slate-800 rounded">
            ✕
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 bg-slate-950 p-3 rounded-xl border border-sky-500/30">
        
        {/* PILIHAN 1: KATEGORI BENDA / OBJEK SCAN */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-400 font-mono">1. PILIH OBJEK YANG DIPINDAI:</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'car', label: '🏎️ Mobil Mainan' },
              { id: 'cat', label: '🐱 Boneka Kucing' },
              { id: 'custom', label: '📦 Model Foto' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setObjectType(item.id as any)}
                className={`py-1.5 px-2 rounded text-[11px] text-center border transition-all ${
                  objectType === item.id
                    ? 'bg-amber-600/30 border-amber-400 text-amber-200 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* PILIHAN 2: GEOMETRI TARGET (Hanya aktif jika memilih 'Model Foto') */}
        {objectType === 'custom' && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 font-mono">2. PILIH GEOMETRI TARGET 3D:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'box', label: '📦 Boks' },
                { id: 'cylinder', label: '🥤 Tabung' },
                { id: 'sphere', label: '⚽ Bola' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setGeometryType(item.id as any)}
                  className={`py-1.5 px-2 rounded text-[11px] text-center border transition-all ${
                    geometryType === item.id
                      ? 'bg-sky-600/30 border-sky-400 text-sky-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {cameraError && (
          <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400 text-xs">
            {cameraError}
          </div>
        )}

        {!isCameraActive ? (
          <button
            onClick={startCamera}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs transition-all mt-1"
          >
            📷 Aktifkan Kamera Pemindai
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="relative rounded-lg overflow-hidden bg-black border border-sky-500/50 aspect-video w-full flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

              {isScanning && (
                <div className="absolute inset-0 bg-sky-950/40 pointer-events-none flex flex-col justify-between p-3 border-2 border-sky-500">
                  <div className="flex justify-between items-center bg-black/80 px-2 py-1 rounded">
                    <span className="text-[10px] font-mono text-sky-300 font-bold">
                      PROGRES SCAN: {scanProgress}%
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 animate-pulse">
                      ● SCANNING POINT CLOUD
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-sky-500/40">
                    <div
                      className="bg-sky-400 h-full transition-all duration-300"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleStartScan}
              disabled={isScanning}
              className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all ${
                isScanning
                  ? 'bg-amber-600 opacity-90 cursor-not-allowed text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
              }`}
            >
              {isScanning
                ? `🔄 Memproses Titik Scan (${scanProgress}%)...`
                : '⚡ Mulai Pindai Multi-Angle (Hingga 100%)'}
            </button>

            {/* HASIL SCANNING (POINT CLOUD DI SIDEBAR) */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-300">
                  HASIL SCANNING (POINT MESH CLOUD):
                </span>
                <span className="text-[9px] font-mono text-sky-400">
                  {scannedFrames.length}/{totalRequiredSlots} TERSCAN
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 bg-slate-900 p-2 rounded-lg border border-slate-800">
                {Array.from({ length: totalRequiredSlots }).map((_, idx) => {
                  const frame = scannedFrames[idx];
                  const isSelected = selectedFrame && frame && selectedFrame.id === frame.id;

                  return (
                    <div
                      key={idx}
                      onClick={() => frame && setSelectedFrame(frame)}
                      className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all flex flex-col items-center justify-center ${
                        frame
                          ? isSelected
                            ? 'border-sky-400 scale-95 cursor-pointer shadow-md shadow-sky-500/30 bg-slate-950'
                            : 'border-slate-700 cursor-pointer opacity-80 hover:opacity-100 bg-slate-950'
                          : 'border-dashed border-slate-800 bg-slate-950/60'
                      }`}
                    >
                      {frame ? (
                        <>
                          <div className="absolute inset-0 bg-slate-950 p-1">
                            {frame.pointCloud.map((pt, pIdx) => (
                              <div
                                key={pIdx}
                                className="absolute w-1 h-1 rounded-full"
                                style={{
                                  left: `${pt.x}%`,
                                  top: `${pt.y}%`,
                                  backgroundColor: pt.color,
                                  opacity: 0.8,
                                }}
                              />
                            ))}
                          </div>
                          <span className="absolute bottom-0 right-0 bg-black/90 text-[8px] text-sky-300 px-1 font-mono">
                            ✓ {frame.pointCloud.length} pts
                          </span>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-1">
                          <span className="text-[8px] font-mono text-slate-600 uppercase">Belum</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedFrame && (
                <button
                  onClick={() => applyTo3DScene(selectedFrame)}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md mt-1"
                >
                  🎯 Terapkan Hasil Scan #{selectedFrame.id} Menjadi Model 3D
                </button>
              )}
            </div>

            <button onClick={stopCamera} className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs mt-1">
              Tutup Kamera
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
