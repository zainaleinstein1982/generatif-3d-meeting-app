import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text, useTexture } from '@react-three/drei';
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
        <meshStandardMaterial
          color={isPresenting ? '#06b6d4' : '#3b82f6'}
          roughness={0.2}
          metalness={0.9}
        />
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
        <meshStandardMaterial
          color={isPresenting ? '#f43f5e' : '#10b981'}
          roughness={0.1}
          metalness={0.8}
        />
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
          <meshStandardMaterial
            color={isPresenting ? '#38bdf8' : '#6366f1'}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        <mesh position={[0, 0.26, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.12, 16]} />
          <meshBasicMaterial color="#f43f5e" />
        </mesh>
      </group>
    </Float>
  );
}

// 4. Modul AI 3D Pipeline Diagram
function PipelineDiagramAvatar() {
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group position={[0, 0, 0]}>
        <group position={[-2.2, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.9, 0.9, 0.9]} />
            <meshStandardMaterial color="#38bdf8" wireframe />
          </mesh>
          <Text position={[0, 0.7, 0]} fontSize={0.22} color="#38bdf8" anchorX="center" anchorY="middle">
            1. Camera Input
          </Text>
        </group>

        <mesh position={[-1.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 1.2, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        <group position={[0, 0, 0]}>
          <mesh>
            <octahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial color="#a855f7" roughness={0.2} metalness={0.9} />
          </mesh>
          <Text position={[0, 0.8, 0]} fontSize={0.24} color="#c084fc" anchorX="center" anchorY="middle">
            2. AI 3D Engine
          </Text>
        </group>

        <mesh position={[1.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 1.2, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        <group position={[2.2, 0, 0]}>
          <mesh scale={[0.6, 0.3, 0.9]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#34d399" roughness={0.1} metalness={0.8} />
          </mesh>
          <Text position={[0, 0.7, 0]} fontSize={0.22} color="#34d399" anchorX="center" anchorY="middle">
            3. 3D Sync Output
          </Text>
        </group>
      </group>
    </Float>
  );
}

// 5. Mesh Generative dari Gambar Flat
function GenerativeMeshFromImage({ imageUrl }: { imageUrl: string }) {
  const texture = useTexture(imageUrl);

  return (
    <Float speed={2} rotationIntensity={0.8} floatIntensity={0.4}>
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[2.8, 2.2, 128, 128]} />
          <meshStandardMaterial
            map={texture}
            displacementMap={texture}
            displacementScale={0.6}
            roughness={0.3}
            metalness={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0, -0.3]}>
          <boxGeometry args={[2.85, 2.25, 0.2]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.8} />
        </mesh>
      </group>
    </Float>
  );
}

// 6. MODEL 3D BERGAYA IMG2THREEJS (Lengkap dengan Podia/Pedestal, Glow, & Studio Lighting)
function Img2ThreeJSProceduralModel({ imageUrl }: { imageUrl: string }) {
  const texture = useTexture(imageUrl);
  const modelGroupRef = useRef<THREE.Group>(null!);

  // Mirror tekstur secara horizontal agar posisi tidak terbalik
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;
  texture.center.set(0.5, 0.5);

  useFrame((_, delta) => {
    if (modelGroupRef.current) {
      modelGroupRef.current.rotation.y += delta * 0.3; // Rotasi panggung 360 derajat
    }
  });

  return (
    <group position={[0, -0.6, 0]}>
      {/* Objek Utama yang Berputar */}
      <group ref={modelGroupRef} position={[0, 0.8, 0]}>
        
        {/* Badan Utama Objek dengan Aksen Emas & Tekstur */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.75, 0.8, 1.8, 64]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.15}
            metalness={0.85}
            emissive="#d97706"
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Aksesori Atas Bergaya Metallic Emas */}
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.5, 0.72, 0.3, 32]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.1} metalness={0.9} />
        </mesh>

        {/* Penutup Emas Berpendar (Glow Cap) */}
        <mesh position={[0, 1.3, 0]}>
          <cylinderGeometry args={[0.52, 0.52, 0.2, 32]} />
          <meshStandardMaterial
            color="#f59e0b"
            roughness={0.05}
            metalness={0.95}
            emissive="#f59e0b"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>

      {/* Podium / Pedestal Panggung (Gaya Img2threejs) */}
      <group position={[0, -0.1, 0]}>
        {/* Base Ring Luar Glowing */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[1.5, 1.6, 64]} />
          <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} />
        </mesh>

        {/* Base Ring Dalam Glowing */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[1.1, 1.18, 64]} />
          <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} />
        </mesh>

        {/* Alas Panggung Reflektif Dark Metallic */}
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[1.8, 1.9, 0.2, 64]} />
          <meshStandardMaterial color="#090d16" roughness={0.1} metalness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

export default function SceneViewport({ presenterModel, isPresenting = false }: SceneViewportProps) {
  const isCustomImage = typeof presenterModel === 'object' && presenterModel?.type === 'custom_image';
  const isImg2ThreeJS = typeof presenterModel === 'object' && presenterModel?.type === 'img2threejs_procedural';

  const modelType = typeof presenterModel === 'string'
    ? presenterModel
    : presenterModel?.id || presenterModel?.type || 'default';

  const renderModel = () => {
    if (isImg2ThreeJS && presenterModel?.imageUrl) {
      return <Img2ThreeJSProceduralModel imageUrl={presenterModel.imageUrl} />;
    }

    if (isCustomImage && presenterModel?.imageUrl) {
      return <GenerativeMeshFromImage imageUrl={presenterModel.imageUrl} />;
    }

    switch (modelType) {
      case 'cube':
        return <CubeAvatar isPresenting={isPresenting} />;
      case 'mouse':
        return <MouseAvatar isPresenting={isPresenting} />;
      case 'pipeline':
        return <PipelineDiagramAvatar />;
      case 'presenter':
        return <CubeAvatar isPresenting={isPresenting} />;
      default:
        return <DefaultAvatar isPresenting={isPresenting} />;
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950">
      {/* Inset Reference Photo (Gaya img2threejs di pojok kiri atas) */}
      {isImg2ThreeJS && presenterModel?.imageUrl && (
        <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md p-2 rounded-xl border border-amber-500/30 shadow-2xl flex flex-col items-center">
          <div className="w-24 h-24 rounded-lg overflow-hidden border border-slate-700 bg-black">
            <img src={presenterModel.imageUrl} alt="Source Reference" className="w-full h-full object-cover" />
          </div>
          <span className="text-[10px] text-amber-400 font-mono mt-1.5 font-semibold tracking-wider uppercase">
            SOURCE PHOTO
          </span>
        </div>
      )}

      <Canvas camera={{ position: [0, 1.8, 4.5], fov: 45 }}>
        {/* Pencahayaan Studio Mewah */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={2.2} color="#fff7ed" />
        <pointLight position={[-5, 3, -3]} intensity={1.5} color="#d97706" />
        <spotLight position={[0, 10, 0]} intensity={2} angle={0.6} penumbra={0.8} color="#fbbf24" />

        <Stars radius={80} depth={50} count={2000} factor={3} saturation={0} fade speed={1} />

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
