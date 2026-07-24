import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text } from '@react-three/drei';
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

// 5. REKONSTRUKSI PROCEDURAL 3D MURNI (Murni Mesh 3D tanpa gambar 2D)
function Img2ThreeJSProceduralBottle() {
  const bottleGroupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (bottleGroupRef.current) {
      bottleGroupRef.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <group position={[0, -0.2, 0]}>
      {/* Objek Botol Isoplus Procedural 3D */}
      <group ref={bottleGroupRef} position={[0, 0.3, 0]}>
        
        {/* Bodi Utama Botol (Biru Elektrik Berkilau) */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.45, 1.6, 32]} />
          <meshPhysicalMaterial
            color="#0ea5e9"
            roughness={0.1}
            metalness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Label Isoplus Modern Metallic Glow Band */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.43, 0.43, 0.8, 32]} />
          <meshStandardMaterial
            color="#0284c7"
            emissive="#0369a1"
            emissiveIntensity={0.4}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>

        {/* Aksesori Stripe Hijau / Kuning Isoplus */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.435, 0.435, 0.2, 32]} />
          <meshStandardMaterial color="#84cc16" emissive="#65a30d" emissiveIntensity={0.6} />
        </mesh>

        {/* Leher Botol Transparan */}
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.22, 0.38, 0.2, 32]} />
          <meshPhysicalMaterial color="#38bdf8" roughness={0.1} transmission={0.6} opacity={0.8} transparent />
        </mesh>

        {/* Tutup Botol High-Detail */}
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.12, 32]} />
          <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Light Glow Core Internal */}
        <pointLight position={[0, 0, 0]} color="#38bdf8" intensity={2} distance={2} />
      </group>

      {/* Podium Lingkaran Neon 3D */}
      <group position={[0, -0.6, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[1.0, 1.05, 64]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>

        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[1.3, 1.4, 0.2, 64]} />
          <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>

      {/* Label Nama Objek di Bawah */}
      <Text
        position={[0, -0.9, 0]}
        fontSize={0.18}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        Isotonic Drink Bottle
      </Text>
    </group>
  );
}

export default function SceneViewport({ presenterModel, isPresenting = false }: SceneViewportProps) {
  const isImg2ThreeJS = typeof presenterModel === 'object' && presenterModel?.type === 'img2threejs_procedural';

  const modelType = typeof presenterModel === 'string'
    ? presenterModel
    : presenterModel?.id || presenterModel?.type || 'default';

  const renderModel = () => {
    if (isImg2ThreeJS) {
      return <Img2ThreeJSProceduralBottle />;
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
            RESULT IN CODE
          </span>
        </div>
      )}

      <Canvas camera={{ position: [0, 1.2, 4.2], fov: 45 }}>
        {/* Studio Cinematic Lighting */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 8, 5]} intensity={2.0} color="#ffffff" />
        <pointLight position={[-4, 2, -2]} intensity={2.0} color="#0284c7" />
        <pointLight position={[4, -2, 2]} intensity={1.5} color="#38bdf8" />

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
