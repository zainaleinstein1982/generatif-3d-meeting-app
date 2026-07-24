import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

interface SceneViewportProps {
  presenterModel?: any;
  isPresenting?: boolean;
}

// 1. Model Default (Orbital Hologram)
function DefaultAvatar({ isPresenting }: { isPresenting?: boolean }) {
  return (
    <Float speed={isPresenting ? 5 : 1.5} rotationIntensity={isPresenting ? 1.5 : 0.4} floatIntensity={0.5}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={isPresenting ? '#06b6d4' : '#3b82f6'} roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.5, 0.08, 16, 100]} />
        <meshBasicMaterial color={isPresenting ? '#38bdf8' : '#6366f1'} />
      </mesh>
    </Float>
  );
}

// 2. Model Generative Cube
function CubeAvatar({ isPresenting }: { isPresenting?: boolean }) {
  return (
    <Float speed={isPresenting ? 4 : 2} rotationIntensity={1} floatIntensity={0.6}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.4, 1.4, 1.4]} />
        <meshStandardMaterial color={isPresenting ? '#f43f5e' : '#10b981'} roughness={0.1} metalness={0.8} />
      </mesh>
    </Float>
  );
}

// 3. Model Mouse 3D
function MouseAvatar({ isPresenting }: { isPresenting?: boolean }) {
  return (
    <Float speed={isPresenting ? 4 : 2} rotationIntensity={0.6} floatIntensity={0.4}>
      <group position={[0, -0.2, 0]}>
        <mesh scale={[0.9, 0.45, 1.4]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={isPresenting ? '#38bdf8' : '#6366f1'} roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.26, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.12, 16]} />
          <meshBasicMaterial color="#f43f5e" />
        </mesh>
      </group>
    </Float>
  );
}

// 4. REKONSTRUKSI 3D VOLUMETRIK (KOTAK ROKOK 3D ASLI DENGAN Ketebalan)
function Volumetric3DBox({ imageUrl }: { imageUrl: string }) {
  const meshGroupRef = useRef<THREE.Group>(null!);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 768; // Proporsi pas kotak rokok

      if (ctx) {
        // Menggambar tekstur penuh dari hasil crop kotak panduan
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }

      const loadedTexture = new THREE.CanvasTexture(canvas);
      loadedTexture.needsUpdate = true;
      setTexture(loadedTexture);
    };
  }, [imageUrl]);

  useFrame((_, delta) => {
    if (meshGroupRef.current) {
      meshGroupRef.current.rotation.y += delta * 0.4;
    }
  });

  const boxMaterials = useMemo(() => {
    if (!texture) return null;
    const sideMaterial = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.3 });
    const frontBackMaterial = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.2 });

    return [
      sideMaterial,      // Kanan
      sideMaterial,      // Kiri
      sideMaterial,      // Atas
      sideMaterial,      // Bawah
      frontBackMaterial, // Depan
      frontBackMaterial, // Belakang
    ];
  }, [texture]);

  return (
    <group position={[0, -0.1, 0]}>
      <group ref={meshGroupRef} position={[0, 0.2, 0]}>
        {boxMaterials && (
          <mesh position={[0, 0, 0]} material={boxMaterials}>
            {/* Dimensi Balok 3D Nyata (Lebar, Tinggi, Ketebalan 0.6 agar terlihat tebal 3D) */}
            <boxGeometry args={[1.2, 1.7, 0.65]} />
          </mesh>
        )}
      </group>

      {/* Podium Panggung Neon 3D */}
      <group position={[0, -0.8, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[1.0, 1.05, 64]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[1.3, 1.4, 0.2, 64]} />
          <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

export default function SceneViewport({ presenterModel, isPresenting = false }: SceneViewportProps) {
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isImg2ThreeJS = typeof presenterModel === 'object' && presenterModel?.type === 'img2threejs_procedural';
  const activeImageUrl = capturedImage || presenterModel?.imageUrl;

  const modelType = typeof presenterModel === 'string'
    ? presenterModel
    : presenterModel?.id || presenterModel?.type || 'default';

  // Fungsi Membuka Kamera dengan Kotak Panduan
  const handleOpenCameraController = () => {
    setIsCameraModalOpen(true);
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Gagal mengakses kamera:", err));
  };

  // Fungsi Mengambil Foto yang difokuskan HANYA di dalam Kotak Panduan
  const handleCaptureFromGuideBox = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        canvas.width = 512;
        canvas.height = 768;

        // Mengambil area persis dari tengah video (Area Kotak Panduan Viewfinder)
        const vW = video.videoWidth;
        const vH = video.videoHeight;
        const sourceSize = Math.min(vW, vH) * 0.6;
        const startX = (vW - sourceSize * 0.7) / 2;
        const startY = (vH - sourceSize) / 2;

        ctx.drawImage(video, startX, startY, sourceSize * 0.7, sourceSize, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);

        // Matikan Kamera
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setIsCameraModalOpen(false);
      }
    }
  };

  const renderModel = () => {
    if (isImg2ThreeJS && activeImageUrl) {
      return <Volumetric3DBox imageUrl={activeImageUrl} />;
    }

    switch (modelType) {
      case 'cube':
        return <CubeAvatar isPresenting={isPresenting} />;
      case 'mouse':
        return <MouseAvatar isPresenting={isPresenting} />;
      case 'presenter':
        return <CubeAvatar isPresenting={isPresenting} />;
      default:
        return <DefaultAvatar isPresenting={isPresenting} />;
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950">
      
      {/* Tombol Pintas Kamera dengan Kotak Panduan */}
      {isImg2ThreeJS && (
        <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
          {activeImageUrl && (
            <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-sky-500/40 shadow-2xl flex flex-col items-center">
              <div className="w-24 h-24 rounded-lg overflow-hidden border border-slate-700 bg-black">
                <img src={activeImageUrl} alt="Source Reference" className="w-full h-full object-cover" />
              </div>
              <span className="text-[9px] text-sky-400 font-mono mt-1.5 font-bold tracking-widest uppercase">
                FOCUSED CAPTURE
              </span>
            </div>
          )}
          <button
            onClick={handleOpenCameraController}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg border border-sky-400/50 flex items-center gap-1.5 transition-all"
          >
            📸 Buka Kamera (Kotak Panduan)
          </button>
        </div>
      )}

      {/* MODAL KAMERA DENGAN KOTAK PANDUAN (VIEWFINDER GUIDE BOX) */}
      {isCameraModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-md aspect-[3/4] bg-slate-900 rounded-2xl overflow-hidden border-2 border-sky-500 shadow-2xl flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
            
            {/* KOTAK PANDUAN (GUIDE BOX) DI TENGAH */}
            <div className="absolute w-64 h-96 border-4 border-dashed border-sky-400 rounded-xl pointer-events-none flex items-center justify-center bg-sky-500/10 shadow-[0_0_30px_rgba(56,189,248,0.3)]">
              <span className="text-xs text-sky-200 font-mono bg-slate-950/80 px-3 py-1 rounded-full border border-sky-400/50">
                Posisikan Rokok di Sini
              </span>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => {
                if (videoRef.current) {
                  const stream = videoRef.current.srcObject as MediaStream;
                  stream?.getTracks().forEach(t => t.stop());
                }
                setIsCameraModalOpen(false);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-700"
            >
              Batal
            </button>
            <button
              onClick={handleCaptureFromGuideBox}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-sky-500/30"
            >
              Ambil Foto (Capture)
            </button>
          </div>
        </div>
      )}

      {/* Canvas 3D */}
      <Canvas camera={{ position: [0, 1.2, 4.2], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 8, 5]} intensity={2.0} color="#ffffff" />
        <pointLight position={[-4, 2, -2]} intensity={2.0} color="#0284c7" />
        <pointLight position={[4, -2, 2]} intensity={1.5} color="#eab308" />

        <Stars radius={80} depth={50} count={2500} factor={3} saturation={0} fade speed={1} />

        {renderModel()}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={2}
          maxDistance={10}
        />
      </Canvas>
    </div>
  );
}
