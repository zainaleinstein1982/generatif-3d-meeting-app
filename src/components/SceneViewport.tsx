import { useRef, useEffect, useState } from 'react';
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

// 5. REKONSTRUKSI EXACT IMG2THREEJS (PROPORTIONAL 3D PLANE RECONSTRUCTION)
function Img2ThreeJSBottleModel({ imageUrl }: { imageUrl: string }) {
  const modelGroupRef = useRef<THREE.Group>(null!);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [aspect, setAspect] = useState<number>(1);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      const img = tex.image;
      if (img && img.width && img.height) {
        setAspect(img.width / img.height);
      }
      setTexture(tex);
    });
  }, [imageUrl]);

  useFrame((_, delta) => {
    if (modelGroupRef.current) {
      // Rotasi mengayun halus khas panggung visualizer 3D
      modelGroupRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.2;
    }
  });

  const planeHeight = 2.2;
  const planeWidth = planeHeight * aspect;

  return (
    <group position={[0, -0.2, 0]}>
      <group ref={modelGroupRef} position={[0, 0.6, 0]}>

        {/* Panel 3D Utama: Menampilkan Foto Utuh Presisi Sesuai Rasio Asli */}
        {texture && (
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[planeWidth, planeHeight]} />
            <meshStandardMaterial
              map={texture}
              roughness={0.2}
              metalness={0.1}
              transparent={true}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Backplate / Bayangan Kedalaman 3D Cyan Frame */}
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[planeWidth + 0.1, planeHeight + 0.1]} />
          <meshBasicMaterial color="#0284c7" transparent opacity={0.3} />
        </mesh>

        {/* Halo / Glow Ring di Belakang Objek */}
        <mesh position={[0, 0, -0.08]}>
          <ringGeometry args={[1.0, 1.3, 64]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Podium Ground Studio (Gaya img2threejs) */}
      <group position={[0, -0.6, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[1.2, 1.25, 64]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>

        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[1.5, 1.6, 0.2, 64]} />
          <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>

      {/* Garis Penunjuk Cyan (Dashed Line) */}
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
    if (isImg2ThreeJS && presenterModel?.imageUrl) {
      return <Img2ThreeJSBottleModel imageUrl={presenterModel.imageUrl} />;
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
      {/* Inset Photo Reference (Gaya UI img2threejs) */}
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
        {/* Studio Lighting */}
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-4, 2, -2]} intensity={1.5} color="#0284c7" />

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
