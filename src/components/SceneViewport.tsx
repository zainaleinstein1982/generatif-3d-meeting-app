import { useRef, useMemo } from 'react';
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

// 5. REKONSTRUKSI MODEL BOTOL ISOPLUS 3D PRESISI (Berdasarkan kontur asli Isoplus)
function Img2ThreeJSIsoplusBottle() {
  const bottleGroupRef = useRef<THREE.Group>(null!);

  // Membuat kontur lekukan asli botol Isoplus
  const points = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    // Dasar botol
    pts.push(new THREE.Vector2(0, -1.0));
    pts.push(new THREE.Vector2(0.38, -1.0));
    pts.push(new THREE.Vector2(0.42, -0.9));
    // Bodi bawah
    pts.push(new THREE.Vector2(0.43, -0.4));
    // Lekukan grip/pinggang khas Isoplus
    pts.push(new THREE.Vector2(0.36, -0.1));
    pts.push(new THREE.Vector2(0.36, 0.2));
    // Bodi atas (pundak botol)
    pts.push(new THREE.Vector2(0.42, 0.5));
    // Leher botol
    pts.push(new THREE.Vector2(0.22, 0.85));
    pts.push(new THREE.Vector2(0.2, 0.98));
    // Ulur & Mulut botol
    pts.push(new THREE.Vector2(0.22, 1.0));
    return pts;
  }, []);

  useFrame((_, delta) => {
    if (bottleGroupRef.current) {
      bottleGroupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group position={[0, -0.1, 0]}>
      <group ref={bottleGroupRef} position={[0, 0.2, 0]}>
        
        {/* Bodi Utama Botol Plastik Transparan Berlekuk */}
        <mesh>
          <latheGeometry args={[points, 32]} />
          <meshPhysicalMaterial
            color="#0ea5e9"
            roughness={0.15}
            metalness={0.1}
            transmission={0.4}
            opacity={0.85}
            transparent
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Label Plastik Kuning-Biru ISOPLUS (Membungkus Bodi) */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.39, 0.39, 0.75, 32, 1, true]} />
          <meshStandardMaterial
            color="#0284c7"
            roughness={0.3}
            metalness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Aksesori Stripe Kuning Khas Isoplus */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.395, 0.395, 0.18, 32, 1, true]} />
          <meshStandardMaterial color="#eab308" emissive="#ca8a04" emissiveIntensity={0.5} side={THREE.DoubleSide} />
        </mesh>

        {/* Logo Text ISOPLUS 3D Depan */}
        <Text
          position={[0, 0.08, 0.41]}
          fontSize={0.22}
          color="#ffffff"
          fontWeight="bold"
          anchorX="center"
          anchorY="middle"
        >
          ISOPLUS
        </Text>

        {/* Logo Text ISOPLUS 3D Belakang */}
        <Text
          position={[0, 0.08, -0.41]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.22}
          color="#ffffff"
          fontWeight="bold"
          anchorX="center"
          anchorY="middle"
        >
          ISOPLUS
        </Text>

        {/* Sub-Text ISOTONIC */}
        <Text
          position={[0, -0.12, 0.41]}
          fontSize={0.09}
          color="#facc15"
          anchorX="center"
          anchorY="middle"
        >
          ISOTONIC DRINK
        </Text>

        {/* Tutup Botol Biru Khas Isoplus */}
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 0.14, 32]} />
          <meshStandardMaterial color="#0369a1" roughness={0.2} metalness={0.6} />
        </mesh>

        {/* Ring Tutup Botol */}
        <mesh position={[0, 0.96, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.04, 32]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>

        {/* Glow Light Internal */}
        <pointLight position={[0, 0, 0]} color="#38bdf8" intensity={1.5} distance={2} />
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

      {/* Label Nama Objek di Bawah (Gaya img2threejs) */}
      <Text
        position={[0, -1.15, 0]}
        fontSize={0.16}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        ISOPLUS Isotonic Bottle
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
      return <Img2ThreeJSIsoplusBottle />;
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
      {/* Source Photo UI (Kiri Atas) */}
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

      {/* RESULT IN CODE UI (Kanan Bawah) */}
      {isImg2ThreeJS && (
        <div className="absolute bottom-6 right-6 z-10">
          <span className="text-[10px] text-sky-400 font-mono tracking-widest uppercase bg-slate-900/90 border border-sky-500/30 px-3 py-1.5 rounded-md shadow-lg">
            RESULT IN CODE
          </span>
        </div>
      )}

      <Canvas camera={{ position: [0, 1.2, 4.2], fov: 45 }}>
        {/* Pencahayaan Sinematik Studio */}
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
