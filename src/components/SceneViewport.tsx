import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface SceneViewportProps {
  presenterModel?: any;
  isPresenting?: boolean;
}

// 1. Model Default
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
          wireframe={isPresenting}
        />
      </mesh>
    </Float>
  );
}

// 3. Model Mouse 3D Preset
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

// 5. MESH GENERATIVE 3D BERVOLUME (Modus Standard: Displacement Map)
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

        <Text position={[0, -1.4, 0]} fontSize={0.2} color="#38bdf8" anchorX="center" anchorY="middle">
          ✨ Reconstructed Generative 3D Mesh
        </Text>
      </group>
    </Float>
  );
}

// 6. BARU: PROCEDURAL CODE-ONLY 3D MODEL RECONSTRUCTION (Sesuai Konsep hoainho/img2threejs)
function Img2ThreeJSProceduralModel({ imageUrl }: { imageUrl: string }) {
  const texture = useTexture(imageUrl);
  const modelGroupRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  // Animasi rotasi & orbit prosedural yang dinamis (Animation-Ready)
  useFrame((_, delta) => {
    if (modelGroupRef.current) {
      modelGroupRef.current.rotation.y += delta * 0.4;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.7;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={modelGroupRef} position={[0, 0, 0]}>
        {/* Layer 1: Front Mesh Canvas bertumpu pada Tekstur Kamera */}
        <mesh position={[0, 0, 0.2]}>
          <boxGeometry args={[2.2, 1.6, 0.4]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.15}
            metalness={0.7}
            envMapIntensity={1.2}
          />
        </mesh>

        {/* Layer 2: Back Procedural Shell/Cylinder Structure */}
        <mesh position={[0, 0, -0.1]}>
          <cylinderGeometry args={[1.3, 1.4, 0.8, 32]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* Layer 3: Orbiting Emissive Ring Node */}
        <mesh ref={ringRef} position={[0, 0, 0]}>
          <torusGeometry args={[1.8, 0.04, 16, 100]} />
          <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.8} />
        </mesh>

        {/* Layer 4: Bounding Wireframe Nodes (Quality-Gated Visual Indicator) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.4, 1.8, 0.9]} />
          <meshStandardMaterial color="#34d399" wireframe />
        </mesh>

        {/* Floating Text Label untuk img2threejs */}
        <Text position={[0, -1.3, 0]} fontSize={0.18} color="#10b981" anchorX="center" anchorY="middle">
          ⚡ img2threejs Procedural 3D Model Reconstructed
        </Text>
      </group>
    </Float>
  );
}

export default function SceneViewport({ presenterModel, isPresenting = false }: SceneViewportProps) {
  // Pengecekan status kustom gambar/kamera
  const isCustomImage = typeof presenterModel === 'object' && presenterModel?.type === 'custom_image';
  const isImg2ThreeJS = typeof presenterModel === 'object' && presenterModel?.type === 'img2threejs_procedural';

  const modelType = typeof presenterModel === 'string'
    ? presenterModel
    : presenterModel?.id || presenterModel?.type || 'default';

  const renderModel = () => {
    // 1. Eksekusi Model Prosedural img2threejs saat tombol Kamera / Capture diklik
    if (isImg2ThreeJS && presenterModel?.imageUrl) {
      return <Img2ThreeJSProceduralModel imageUrl={presenterModel.imageUrl} />;
    }

    // 2. Eksekusi Model Displacement biasa saat "Pilih File Gambar" diklik
    if (isCustomImage && presenterModel?.imageUrl) {
      return <GenerativeMeshFromImage imageUrl={presenterModel.imageUrl} />;
    }

    // 3. Preset bawaan
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
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
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
