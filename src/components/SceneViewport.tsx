import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text, Line } from '@react-three/drei';
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

// 5. REKONSTRUKSI MODEL 3D PROCEDURAL BOTOL MINUMAN (MURNI MESH 3D - BUKAN FOTO)
function Img2ThreeJSBottleModel() {
  const modelGroupRef = useRef<THREE.Group>(null!);

  // Membuat Kurva Kontur Botol 3D Ergonomis (Lathe Geometry)
  const bottlePoints = useMemo(() => {
    const points: THREE.Vector2[] = [];
    points.push(new THREE.Vector2(0, -0.9));       // Dasar Bawah
    points.push(new THREE.Vector2(0.42, -0.9));    // Bawah
    points.push(new THREE.Vector2(0.45, -0.5));    // Lekukan Bawah
    points.push(new THREE.Vector2(0.38, -0.1));    // Pegangan Tengah (Grip)
    points.push(new THREE.Vector2(0.45, 0.3));     // Bahu Botol Atas
    points.push(new THREE.Vector2(0.22, 0.75));    // Leher Botol
    points.push(new THREE.Vector2(0.22, 0.9));     // Ulir Tutup
    points.push(new THREE.Vector2(0, 0.9));        // Puncak Tutup
    return points;
  }, []);

  useFrame((_, delta) => {
    if (modelGroupRef.current) {
      modelGroupRef.current.rotation.y += delta * 0.5; // Rotasi berputar 360 derajat
    }
  });

  return (
    <group position={[0, -0.2, 0]}>
      {/* Objek 3D Botol Utama */}
      <group ref={modelGroupRef} position={[0, 0.5, 0]}>

        {/* 1. Badan Botol Kaca/Plastik Transparan berlekuk */}
        <mesh>
          <latheGeometry args={[bottlePoints, 32]} />
          <meshPhysicalMaterial
            color="#0ea5e9"
            emissive="#0284c7"
            emissiveIntensity={0.2}
            roughness={0.1}
            metalness={0.1}
            transmission={0.8}
            thickness={0.5}
            transparent={true}
            opacity={0.85}
          />
        </mesh>

        {/* 2. Isi Cairan Isotonic Dalam Botol (Luminous Blue Liquid) */}
        <mesh position={[0, -0.05, 0]} scale={[0.92, 0.88, 0.92]}>
          <latheGeometry args={[bottlePoints, 32]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#0891b2"
            emissiveIntensity={0.5}
            roughness={0.3}
          />
        </mesh>

        {/* 3. Label Kemasan Botol (Yellow-Green Isotonic Branding Accent) */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.65, 32]} />
          <meshStandardMaterial
            color="#84cc16"
            emissive="#65a30d"
            emissiveIntensity={0.3}
            roughness={0.2}
            metalness={0.4}
          />
        </mesh>

        {/* 4. Tutup Botol Metalik Bright (Blue Cap) */}
        <mesh position={[0, 0.82, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.18, 32]} />
          <meshStandardMaterial
            color="#0284c7"
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* 5. Aksen Ring Glow Emas/Cyan Sesuai Gaya img2threejs */}
        <mesh position={[0, 0.1, 0]}>
          <torusGeometry args={[0.46, 0.02, 16, 64]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Podium Ground Studio (Dark Stage + Glowing Ring) */}
      <group position={[0, -0.5, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[1.2, 1.25, 64]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>

        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[1.5, 1.6, 0.2, 64]} />
          <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>

      {/* Garis Penunjuk Hubungan Foto Ref ke Model 3D */}
      <Line
        points={[[-2.0, 1.8, 0], [-0.8, 1.2, 0], [0, 0.8, 0]]}
        color="#38bdf8"
        lineWidth={2}
        dashed={true}
        dashScale={10}
      />
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
      return <Img2ThreeJSBottleModel />;
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
      {/* Inset Photo Reference (SOURCE PHOTO UI) */}
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

      {/* Tag RESULT IN CODE */}
      {isImg2ThreeJS && (
        <div className="absolute top-6 right-6 z-10">
          <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-md">
            RESULT IN CODE
          </span>
        </div>
      )}

      <Canvas camera={{ position: [0, 1.2, 4.2], fov: 45 }}>
        {/* Lighting Studio 3D (Reflektif & Glow) */}
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 8, 5]} intensity={2.0} color="#ffffff" />
        <pointLight position={[-4, 2, -2]} intensity={1.8} color="#0284c7" />
        <spotLight position={[0, 8, 0]} intensity={2.5} angle={0.5} penumbra={0.8} color="#38bdf8" />

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
