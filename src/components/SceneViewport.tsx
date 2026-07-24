import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

interface SceneViewportProps {
  presenterModel?: any;
  isPresenting?: boolean;
}

// Helper untuk Crop & Focus pada Objek Tengah Kamera (Menghilangkan Background/Ruangan)
function createCroppedFocusedTexture(imageUrl: string, callback: (texture: THREE.Texture, aspect: number) => void) {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = imageUrl;

  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Ukuran Kanvas Tekstur Optimal
    canvas.width = 512;
    canvas.height = 768; // Proporsi standar kemasan / kotak rokok (2:3)

    if (ctx) {
      // 1. Fokus Potong Area Tengah Foto (35% - 65% area tengah tempat benda dipegang)
      // Ini akan memotong latar belakang ruangan, AC, dan wajah
      const cropWidth = img.width * 0.45;
      const cropHeight = img.height * 0.55;
      const cropX = (img.width - cropWidth) / 2;
      const cropY = (img.height - cropHeight) / 2;

      // Fill background netral
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Digambar hanya bagian tengah yang difokuskan
      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight, // Area sumber (ditengah)
        0, 0, canvas.width, canvas.height     // Area tujuan kanvas
      );
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    callback(texture, 0.65); // Aspect ratio presisi kotak/balok
  };
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

// 4. REKONSTRUKSI FOKUS OBJEK DENGAN AUTO-CROP
function DynamicImageTo3DObject({ imageUrl }: { imageUrl: string }) {
  const meshGroupRef = useRef<THREE.Group>(null!);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!imageUrl) return;
    createCroppedFocusedTexture(imageUrl, (focusedTex) => {
      setTexture(focusedTex);
    });
  }, [imageUrl]);

  useFrame((_, delta) => {
    if (meshGroupRef.current) {
      meshGroupRef.current.rotation.y += delta * 0.5;
    }
  });

  // Material terpisah per sisi agar sisi samping dan atas tidak melar ditarik gambar utama
  const boxMaterials = useMemo(() => {
    if (!texture) return null;

    const sideMaterial = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.4 });
    const frontBackMaterial = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.2 });

    // Multi-material untuk [Kanan, Kiri, Atas, Bawah, Depan, Belakang]
    return [
      sideMaterial,      // Right
      sideMaterial,      // Left
      sideMaterial,      // Top
      sideMaterial,      // Bottom
      frontBackMaterial, // Front (Gambar terfokus)
      frontBackMaterial, // Back
    ];
  }, [texture]);

  return (
    <group position={[0, -0.1, 0]}>
      <group ref={meshGroupRef} position={[0, 0.2, 0]}>
        {boxMaterials && (
          <mesh position={[0, 0, 0]} material={boxMaterials}>
            {/* Ukuran Proporsional Kotak Rokok (Lebar: 1.1, Tinggi: 1.6, Tebal: 0.4) */}
            <boxGeometry args={[1.1, 1.6, 0.4]} />
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
  const isImg2ThreeJS = typeof presenterModel === 'object' && presenterModel?.type === 'img2threejs_procedural';

  const modelType = typeof presenterModel === 'string'
    ? presenterModel
    : presenterModel?.id || presenterModel?.type || 'default';

  const renderModel = () => {
    if (isImg2ThreeJS && presenterModel?.imageUrl) {
      return <DynamicImageTo3DObject imageUrl={presenterModel.imageUrl} />;
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
      {/* Overlay UI - Source Photo */}
      {isImg2ThreeJS && presenterModel?.imageUrl && (
        <div className="absolute top-6 left-6 z-10 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-sky-500/40 shadow-2xl flex flex-col items-center">
          <div className="w-24 h-24 rounded-lg overflow-hidden border border-slate-700 bg-black">
            <img src={presenterModel.imageUrl} alt="Source Reference" className="w-full h-full object-cover" />
          </div>
          <span className="text-[9px] text-sky-400 font-mono mt-1.5 font-bold tracking-widest uppercase">
            SOURCE PHOTO
          </span>
        </div>
      )}

      {/* Overlay UI - RESULT IN CODE */}
      {isImg2ThreeJS && (
        <div className="absolute bottom-6 right-6 z-10">
          <span className="text-[10px] text-sky-400 font-mono tracking-widest uppercase bg-slate-900/90 border border-sky-500/30 px-3 py-1.5 rounded-md shadow-lg">
            FOCUSED 3D MODEL
          </span>
        </div>
      )}

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
