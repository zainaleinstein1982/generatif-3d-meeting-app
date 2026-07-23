import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PresenterModel } from '@/lib/supabase';

type Props = {
  model: PresenterModel;
  isPresenting?: boolean;
};

function CrystalShape({ model, isPresenting }: Props) {
  const group = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  const detail = Math.max(0, Math.floor(model.complexity * 4));

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const speed = model.speed * 2;
    if (group.current) {
      group.current.rotation.y = t * speed * 0.3;
      group.current.position.y = Math.sin(t * speed * 0.5) * 0.15;
    }
    if (meshRef.current) {
      meshRef.current.rotation.x = t * speed * 0.2;
      meshRef.current.rotation.z = t * speed * 0.1;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * speed * 0.5;
      innerRef.current.rotation.x = t * speed * 0.3;
      const s = 1 + Math.sin(t * speed) * 0.05;
      innerRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={group}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.4, detail]} />
        <meshStandardMaterial
          color={model.color}
          metalness={0.3}
          roughness={0.1}
          flatShading
          transparent
          opacity={0.85}
          emissive={model.color}
          emissiveIntensity={0.15}
        />
      </mesh>
      <mesh ref={innerRef}>
        <octahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial
          color={model.accentColor}
          metalness={0.6}
          roughness={0.2}
          emissive={model.accentColor}
          emissiveIntensity={0.4}
          wireframe
        />
      </mesh>
      <pointLight position={[2, 2, 2]} color={model.accentColor} intensity={isPresenting ? 3 : 1.5} />
      <pointLight position={[-2, -1, -2]} color={model.color} intensity={isPresenting ? 2 : 1} />
    </group>
  );
}

function TorusShape({ model }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const tube = Math.max(0.05, 0.2 + model.complexity * 0.3);
  const radialSeg = Math.max(3, Math.floor(3 + model.complexity * 8));
  const tubularSeg = Math.max(8, Math.floor(20 + model.complexity * 60));

  useFrame((state) => {
    const t = state.clock.elapsedTime * model.speed * 2;
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.3;
      meshRef.current.rotation.y = t * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, tube, tubularSeg, radialSeg]} />
      <meshStandardMaterial
        color={model.color}
        metalness={0.7}
        roughness={0.15}
        emissive={model.accentColor}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

function SphereShape({ model }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const segs = Math.max(8, Math.floor(8 + model.complexity * 40));

  useFrame((state) => {
    const t = state.clock.elapsedTime * model.speed * 2;
    if (meshRef.current) meshRef.current.rotation.y = t * 0.2;
    if (wireRef.current) {
      wireRef.current.rotation.y = -t * 0.4;
      wireRef.current.rotation.x = t * 0.2;
      const s = 1 + Math.sin(t) * 0.08;
      wireRef.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.3, segs, segs]} />
        <meshStandardMaterial color={model.color} metalness={0.4} roughness={0.3} transparent opacity={0.7} />
      </mesh>
      <mesh ref={wireRef}>
        <sphereGeometry args={[1.5, Math.min(segs, 32), Math.min(segs, 32)]} />
        <meshStandardMaterial color={model.accentColor} wireframe transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function WaveShape({ model }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(3, 3, 32, 32);
    return g;
  }, []);
  const segs = Math.max(8, Math.floor(8 + model.complexity * 24));

  useFrame((state) => {
    const t = state.clock.elapsedTime * model.speed * 2;
    const pos = geom.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = Math.sin(x * 2 + t) * 0.3 * model.complexity + Math.cos(y * 2 + t * 0.8) * 0.3 * model.complexity;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();
    if (meshRef.current) {
      meshRef.current.rotation.x = -0.5;
      meshRef.current.rotation.z = t * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geom}>
      <meshStandardMaterial color={model.color} metalness={0.5} roughness={0.2} side={THREE.DoubleSide} wireframe={segs % 2 === 0} />
    </mesh>
  );
}

function DnaShape({ model }: Props) {
  const group = useRef<THREE.Group>(null);
  const count = Math.max(20, Math.floor(20 + model.complexity * 80));

  const spheres = useMemo(() => {
    const arr: { pos: [number, number, number]; phase: number }[] = [];
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 6;
      arr.push({
        pos: [Math.cos(t) * 0.8, (i / count - 0.5) * 3, Math.sin(t) * 0.8],
        phase: t,
      });
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    const t = state.clock.elapsedTime * model.speed * 2;
    if (group.current) group.current.rotation.y = t * 0.3;
  });

  return (
    <group ref={group}>
      {spheres.map((s, i) => (
        <mesh key={i} position={s.pos}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? model.color : model.accentColor}
            emissive={i % 2 === 0 ? model.color : model.accentColor}
            emissiveIntensity={0.3}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function GenerativeScene({ model, isPresenting = false }: Props) {
  const shapes: Record<PresenterModel['type'], React.ReactNode> = {
    crystal: <CrystalShape model={model} isPresenting={isPresenting} />,
    torus: <TorusShape model={model} isPresenting={isPresenting} />,
    sphere: <SphereShape model={model} isPresenting={isPresenting} />,
    wave: <WaveShape model={model} isPresenting={isPresenting} />,
    dna: <DnaShape model={model} isPresenting={isPresenting} />,
  };

  return <>{shapes[model.type]}</>;
}
