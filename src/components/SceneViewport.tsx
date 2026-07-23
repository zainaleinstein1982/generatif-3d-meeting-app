import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import GenerativeScene from './GenerativeScene';
import type { PresenterModel } from '@/lib/supabase';

type Props = {
  model: PresenterModel;
  isPresenting?: boolean;
};

export default function SceneViewport({ model, isPresenting = false }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <Stars radius={50} depth={50} count={1500} factor={4} saturation={0} fade speed={1} />
      <Environment preset="city" />
      <GenerativeScene model={model} isPresenting={isPresenting} />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={10}
        autoRotate={!isPresenting}
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}
