import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text, useTexture } from '@react-three/drei';
import { Suspense } from 'react';

interface SceneViewportProps {
  presenterModel?: any;
  isPresenting?: boolean;
}

// 1. Model Default (Hologram Sphere & Ring)
function DefaultAvatar({ isPresenting }: { isPresenting?: boolean }) {
  return (
    <Float speed={isPresenting ? 5 : 1.5} rotationIntensity={isPresenting ? 1.5 : 0.4} floatIntensity={0.5}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={isPresenting ? '#06b6d4' : '#3b82f6'}
          roughness={0.2}
          metalness={0.9}
          wireframe={isPresenting}
        />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.5, 0.08, 16, 100]} />
        <meshBasicMaterial color={isPresenting ? '#38bdf8' : '#6366f1'} />
      </mesh>
    </Float>
  );
}

// 2. Model Generative Cube Matrix
function CubeAvatar({ isPresenting }: { isPresenting?: boolean }) {
  return (
    <Float speed={isPresenting ? 4 : 2} rotationIntensity={1} floatIntensity={0.6}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.4, 1.4, 1.4]} />
        <meshStandardMaterial
          color={isPresenting ? '#f43f5e' : '#10b981'}
          roughness={0.1}
          metalness={0.8}
          wireframe={isPresenting}
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
            wireframe={isPresenting}
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

// 4. Modul 3D Pipeline Diagram
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

// 5. BARU: Modul Generative 3D dari Gambar Import (JPEG / PNG)
function Generative3DImage({ imageUrl }: { imageUrl: string }) {
  const texture = useTexture(imageUrl);

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
      <group position={[0, 0, 0]}>
        {/* Panel Frame 3D Utama yang menampilkan gambar */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.2, 2.2, 0.15]} />
          <meshStandardMaterial map={texture} roughness={0.2} metalness={0.3} />
        </mesh>

        {/* Bingkai Hologram 3D di sekeliling gambar */}
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[3.35, 2.35, 0.1]} />
          <meshStandardMaterial color="#38bdf8" wireframe />
        </mesh>

        {/* Label AI Generative Output */}
        <Text position={[0, -1.35, 0]} fontSize={0.2} color="#38bdf8" anchorX="center" anchorY="middle">
          ✨ Generative 3D Mesh Output
        </Text>
      </group>
    </Float>
  );
}

export default function SceneViewport({ presenterModel, isPresenting = false }: SceneViewportProps) {
  const isCustomImage = typeof presenterModel === 'object' && presenterModel?.type === 'custom_image';
  const modelType = typeof presenterModel === 'string'
    ? presenterModel
    : presenterModel?.id || presenterModel?.type || 'default';

  const renderModel = () => {
    if (isCustomImage && presenterModel?.imageUrl) {
      return (
        <Suspense fallback={null}>
          <Generative3DImage imageUrl={presenterModel.imageUrl} />
        </Suspense>
      );
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
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 1.5, 5], fov: 50 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

        {renderModel()}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minDistance={2}
          maxDistance={12}
        />
      </Canvas>
    </div>
  );
}
