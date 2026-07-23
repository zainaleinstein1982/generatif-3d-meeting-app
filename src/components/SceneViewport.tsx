import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';

interface SceneViewportProps {
  presenterModel?: any;
  isPresenting?: boolean;
}

function DefaultAvatar({ isPresenting }: { isPresenting?: boolean }) {
  return (
    <Float speed={isPresenting ? 5 : 1.5} rotationIntensity={isPresenting ? 1.5 : 0.4} floatIntensity={0.5}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={isPresenting ? '#06b6d4' : '#3b82f6'}
          roughness={0.2}
          metalness={0.9}
          wireframe={isPresenting} // Efek hologram bersinar saat presentasi aktif
        />
      </mesh>
      {/* Halo ring */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.5, 0.08, 16, 100]} />
        <meshBasicMaterial color={isPresenting ? '#38bdf8' : '#6366f1'} />
      </mesh>
    </Float>
  );
}

export default function SceneViewport({ presenterModel, isPresenting = false }: SceneViewportProps) {
  // Pengecekan aman agar tidak membaca properti 'type' dari undefined
  const modelType = presenterModel?.type || (typeof presenterModel === 'string' ? presenterModel : 'default');

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

        <DefaultAvatar isPresenting={isPresenting} />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minDistance={2}
          maxDistance={10}
        />
      </Canvas>
    </div>
  );
}
