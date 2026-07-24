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

// 4. REKONSTRUKSI DINAMIS BERDASARKAN FOTO INPUT (Kotak Rokok, Botol, dll)
function DynamicImageTo3DObject({ imageUrl }: { imageUrl: string }) {
  const meshGroupRef = useRef<THREE.Group>(null!);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [isBoxShape, setIsBoxShape] = useState<boolean>(true);

  // Load Tekstur Dinamis dari Foto Kamera / Upload
  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      const loadedTexture = new THREE.Texture(img);
      loadedTexture.needsUpdate = true;
      setTexture(loadedTexture);

      // Hitung rasio gambar untuk menentukan proporsi objek 3D
      const aspect = img.width / img.height;
      setAspectRatio(aspect);

      // Deteksi sederhana: Jika rasio dekat persegi/panjang (seperti kotak rokok/kemasan)
      // Gunakan bentuk Box/Balok 3D, jika tidak gunakan silinder
      setIsBoxShape(true); 
    };
  }, [imageUrl]);

  useFrame((_, delta) => {
    if (meshGroupRef.current) {
      meshGroupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group position={[0, -0.1, 0]}>
      <group ref={meshGroupRef} position={[0, 0.2, 0]}>
        {texture && (
          isBoxShape ? (
            /* Rekonstruksi 3D Bentuk Kotak / Box (Cocok untuk Kotak Rokok, Kemasan, Buku) */
            <mesh position={[0, 0, 0]}>
              {/* Dimensi balok disesuaikan dengan proporsi foto */}
              <boxGeometry args={[1.2 * aspectRatio, 1.8, 0.5]} />
              <meshStandardMaterial
                map={texture}
                roughness={0.3}
                metalness={0.1}
              />
            </mesh>
          ) : (
            /* Rekonstruksi 3D Bentuk Silinder (Cocok untuk Botol / Kaleng) */
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.5, 0.5, 1.8, 32]} />
              <meshStandardMaterial
                map={texture}
                roughness={0.3}
                metalness={0.1}
              />
            </mesh>
          )
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
      {/* Overlay UI - Source Photo (Kiri Atas) */}
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

      {/* Overlay UI - RESULT IN CODE (Kanan Bawah) */}
      {isImg2ThreeJS && (
        <div className="absolute bottom-6 right-6 z-10">
          <span className="text-[10px] text-sky-400 font-mono tracking-widest uppercase bg-slate-900/90 border border-sky-500/30 px-3 py-1.5 rounded-md shadow-lg">
            DYNAMIC 3D MODEL
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
