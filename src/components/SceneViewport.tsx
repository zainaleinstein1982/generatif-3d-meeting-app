import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface SceneViewportProps {
  presenterModel: any;
  isPresenting?: boolean;
}

// 1. Model 3D Mobil Mainan (Kuning & Black Offroad sesuai foto)
function ToyCarModel() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* Body Utama - Kuning Offroad */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.7, 0.6, 1.0]} />
        <meshStandardMaterial color="#facc15" roughness={0.3} metalness={0.2} />
      </mesh>
      
      {/* Atap & Kaca - Hitam Matte */}
      <mesh position={[-0.1, 0.8, 0]}>
        <boxGeometry args={[0.9, 0.55, 0.9]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>

      {/* Roda Monster Truck Offroad (Besar & Hitam) */}
      {[
        [0.55, 0, 0.55],
        [0.55, 0, -0.55],
        [-0.55, 0, 0.55],
        [-0.55, 0, -0.55],
      ].map((pos, idx) => (
        <mesh key={idx} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.25, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
      ))}

      {/* Bumper Depan */}
      <mesh position={[0.9, 0.15, 0]}>
        <boxGeometry args={[0.15, 0.3, 0.95]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  );
}

// 2. Model 3D Boneka Kucing Bicolor
function CatPlushieModel() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      <mesh position={[0.4, 0, 0]}>
        <boxGeometry args={[0.8, 1.4, 1.4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      <mesh position={[-0.4, 0, 0]}>
        <boxGeometry args={[0.8, 1.4, 1.4]} />
        <meshStandardMaterial color="#111827" roughness={0.5} />
      </mesh>
      <mesh position={[-0.5, 0.9, 0.35]} rotation={[0, 0, 0.15]}>
        <coneGeometry args={[0.25, 0.45, 4]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[0.5, 0.9, 0.35]} rotation={[0, 0, -0.15]}>
        <coneGeometry args={[0.25, 0.45, 4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.38, 0.15, 0.71]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} />
      </mesh>
      <mesh position={[0.38, 0.15, 0.71]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#111827" roughness={0.1} />
      </mesh>
    </group>
  );
}

// 3. Custom Mesh Bertekstur Foto
function CustomScannedMesh({ imageUrl, geometryType = 'box' }: { imageUrl: string; geometryType: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const texture = useMemo(() => {
    if (!imageUrl) return null;
    const loader = new THREE.TextureLoader();
    const tex = loader.load(imageUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [imageUrl]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      {geometryType === 'cylinder' ? (
        <cylinderGeometry args={[1.2, 1.2, 2.0, 32]} />
      ) : geometryType === 'sphere' ? (
        <sphereGeometry args={[1.3, 32, 32]} />
      ) : (
        <boxGeometry args={[1.6, 1.6, 1.6]} />
      )}
      <meshStandardMaterial map={texture || null} color={texture ? '#ffffff' : '#38bdf8'} roughness={0.4} />
    </mesh>
  );
}

function DefaultAvatar() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#0284c7" wireframe transparent opacity={0.3} />
    </mesh>
  );
}

export default function SceneViewport({ presenterModel }: SceneViewportProps) {
  const is3DModel = typeof presenterModel === 'object' && presenterModel?.type === '3d_mesh';
  const imageUrl = typeof presenterModel === 'object' ? presenterModel?.imageUrl : undefined;
  const geometryType = typeof presenterModel === 'object' ? presenterModel?.geometryType : 'box';
  const objectType = typeof presenterModel === 'object' ? presenterModel?.objectType : 'car';

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950">
      <Canvas camera={{ position: [0, 1.2, 4.2], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 8, 5]} intensity={1.8} />
        <directionalLight position={[-5, -2, -5]} intensity={0.8} color="#38bdf8" />

        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

        {is3DModel ? (
          objectType === 'car' ? (
            <ToyCarModel key={presenterModel?.timestamp} />
          ) : objectType === 'cat' ? (
            <CatPlushieModel key={presenterModel?.timestamp} />
          ) : (
            <CustomScannedMesh
              key={presenterModel?.timestamp}
              imageUrl={imageUrl}
              geometryType={geometryType}
            />
          )
        ) : (
          <DefaultAvatar />
        )}

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} maxPolarAngle={Math.PI / 1.8} minDistance={2} maxDistance={10} />
      </Canvas>
    </div>
  );
}
