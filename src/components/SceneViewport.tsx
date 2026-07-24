import { useRef } from 'react';
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

// 5. REKONSTRUKSI MODEL 3D PROCEDURAL (GAYA EXACT IMG2THREEJS)
function Img2ThreeJSBottleModel() {
  const modelGroupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (modelGroupRef.current) {
      modelGroupRef.current.rotation.y += delta * 0.4; // Rotasi panggung 3D
    }
  });

  return (
    <group position={[0, -0.4, 0]}>
      {/* Objek Utama Botol / Produk Prosedural */}
      <group ref={modelGroupRef} position={[0, 0.6, 0]}>
        
        {/* Cairan / Bodi Dalam Berpendar (Isotonic Blue Glow) */}
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.52, 0.52, 1.4, 32]} />
          <meshStandardMaterial
            color="#0284c7"
            emissive="#0369a1"
            emissiveIntensity={0.6}
            roughness={0.1}
            metalness={0.3}
          />
        </mesh>

        {/* Label / Kemasan Luar Transparan dengan Aksen Cyan */}
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.56, 0.56, 1.45, 32]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transparent={true}
            opacity={0.4}
            roughness={0.1}
            transmission={0.6}
            thickness={0.2}
          />
        </mesh>

        {/* Bahu Botol Slanted */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.28, 0.55, 0.4, 32]} />
          <meshStandardMaterial
            color="#f8fafc"
            roughness={0.2}
            metalness={0.8}
            emissive="#38bdf8"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Leher & Tutup Botol Metallic Bright */}
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.25, 32]} />
          <meshStandardMaterial
            color="#38bdf8"
            roughness={0.1}
            metalness={0.9}
            emissive="#0ea5e9"
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Aksen Ring Glow Emas/Cyan di Tengah (Khas img2threejs) */}
        <mesh position={[0, 0.1, 0]}>
          <torusGeometry args={[0.58, 0.03, 16, 64]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Podium Ground Studio (Soft Dark Stage + Ring Glow) */}
      <group position={[0, -0.2, 0]}>
        {/* Glow Ring Dasar Panggung */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[1.2, 1.25, 64]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>

        {/* Stage Alas Gelap */}
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[1.5, 1.6, 0.2, 64]} />
          <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>

      {/* Garis Penunjuk Hubungan Foto ke Model 3D (3D Pointer Line) */}
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
      {/* Inset Photo Reference (Sesuai Gaya UI img2threejs) */}
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

      {/* Tag "RESULT IN CODE" di Pojok Kanan Atas Viewport */}
      {isImg2ThreeJS && (
        <div className="absolute top-6 right-6 z-10">
          <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-md">
            RESULT IN CODE
          </span>
        </div>
      )}

      <Canvas camera={{ position: [0, 1.5, 4.5], fov: 45 }}>
        {/* Studio Lighting Futuristik (Chroma / Metallic Look) */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={1.8} color="#ffffff" />
        <pointLight position={[-4, 2, -2]} intensity={2} color="#0284c7" />
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
