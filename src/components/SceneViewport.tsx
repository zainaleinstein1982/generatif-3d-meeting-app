import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

interface SceneViewportProps {
  presenterModel?: any;
  isPresenting?: boolean;
}

// Helper untuk membuat Texture Label Isoplus 2D yang ditempel melengkung sempurna
function useIsoplusLabelTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // 1. Latar Belakang Label (Biru Tua khas Isoplus)
      ctx.fillStyle = '#024da1';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Aksesori Gelombang / Stripe Kuning Khas Isoplus di Atas
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(canvas.width, 0);
      ctx.lineTo(canvas.width, 120);
      ctx.quadraticCurveTo(canvas.width * 0.5, 180, 0, 120);
      ctx.closePath();
      ctx.fill();

      // 3. Teks ISOPLUS (Cetak Tebal Putih dengan Shadow)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 110px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Render di Sisi Depan
      ctx.fillText('ISOPLUS', canvas.width * 0.25, canvas.height * 0.58);
      // Render di Sisi Belakang
      ctx.fillText('ISOPLUS', canvas.width * 0.75, canvas.height * 0.58);

      // 4. Sub-teks ISOTONIC DRINK
      ctx.fillStyle = '#024da1';
      ctx.font = 'bold 36px Arial, sans-serif';
      ctx.fillText('ISOTONIC', canvas.width * 0.25, 70);
      ctx.fillText('ISOTONIC', canvas.width * 0.75, 70);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);
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

// 4. Botol ISOPLUS 3D Presisi dengan Label Menempel
function Img2ThreeJSIsoplusBottle() {
  const bottleGroupRef = useRef<THREE.Group>(null!);
  const labelTexture = useIsoplusLabelTexture();

  // Kontur Lekukan Botol Asli
  const points = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    pts.push(new THREE.Vector2(0, -1.0));
    pts.push(new THREE.Vector2(0.38, -1.0));
    pts.push(new THREE.Vector2(0.42, -0.9));
    pts.push(new THREE.Vector2(0.42, -0.3));
    pts.push(new THREE.Vector2(0.37, 0.0));
    pts.push(new THREE.Vector2(0.37, 0.2));
    pts.push(new THREE.Vector2(0.42, 0.5));
    pts.push(new THREE.Vector2(0.22, 0.85));
    pts.push(new THREE.Vector2(0.2, 0.98));
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
        
        {/* Bodi Transparan Botol Plastik / Cairan Isotonic */}
        <mesh>
          <latheGeometry args={[points, 32]} />
          <meshPhysicalMaterial
            color="#a5f3fc"
            roughness={0.1}
            metalness={0.05}
            transmission={0.6}
            opacity={0.9}
            transparent
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Label Plastik ISOPLUS Menempel Sempurna (Tidak Mengambang) */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.395, 0.395, 0.85, 64, 1, true]} />
          <meshStandardMaterial
            map={labelTexture}
            roughness={0.3}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Tutup Botol Biru Solid */}
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 0.14, 32]} />
          <meshStandardMaterial color="#024da1" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Leher Ring Tutup Botol */}
        <mesh position={[0, 0.96, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.04, 32]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>

        {/* Glow Lighting Internal */}
        <pointLight position={[0, 0, 0]} color="#38bdf8" intensity={1.2} distance={2} />
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
      case 'presenter':
        return <CubeAvatar isPresenting={isPresenting} />;
      default:
        return <DefaultAvatar isPresenting={isPresenting} />;
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950">
      {/* Overlay UI - Source Photo */}
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

      {/* Overlay UI - RESULT IN CODE */}
      {isImg2ThreeJS && (
        <div className="absolute bottom-6 right-6 z-10">
          <span className="text-[10px] text-sky-400 font-mono tracking-widest uppercase bg-slate-900/90 border border-sky-500/30 px-3 py-1.5 rounded-md shadow-lg">
            RESULT IN CODE
          </span>
        </div>
      )}

      <Canvas camera={{ position: [0, 1.2, 4.2], fov: 45 }}>
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
