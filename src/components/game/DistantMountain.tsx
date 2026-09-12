"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function DistantMountain() {
  const beacon = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!beacon.current) return;
    const pulse = 0.92 + Math.sin(clock.getElapsedTime() * 0.55) * 0.08;
    beacon.current.scale.setScalar(pulse);
  });

  return (
    <group position={[0, -1.05, -11]}>
      <mesh position={[-3.8, 2.2, 0]} scale={[1.5, 1.5, 1.2]}>
        <coneGeometry args={[2.6, 6.5, 5]} />
        <meshStandardMaterial color="#121827" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 2.8, -0.5]} scale={[1.8, 1.8, 1.4]}>
        <coneGeometry args={[2.8, 7.5, 6]} />
        <meshStandardMaterial color="#182031" roughness={1} flatShading />
      </mesh>
      <mesh position={[4.2, 1.9, 0.3]} scale={[1.4, 1.4, 1.1]}>
        <coneGeometry args={[2.5, 5.8, 5]} />
        <meshStandardMaterial color="#101622" roughness={1} flatShading />
      </mesh>

      <group position={[0, 1.4, 1.4]}>
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[2.4, 1.7, 0.6]} />
          <meshStandardMaterial color="#151c2a" roughness={1} />
        </mesh>
        <mesh position={[-0.8, 1.9, 0]}>
          <coneGeometry args={[0.45, 1.4, 4]} />
          <meshStandardMaterial color="#151c2a" roughness={1} />
        </mesh>
        <mesh position={[0.8, 1.9, 0]}>
          <coneGeometry args={[0.45, 1.4, 4]} />
          <meshStandardMaterial color="#151c2a" roughness={1} />
        </mesh>
        <mesh position={[0, 0.7, -0.34]}>
          <boxGeometry args={[0.45, 0.8, 0.03]} />
          <meshBasicMaterial color="#5b4320" transparent opacity={0.5} />
        </mesh>
        <pointLight position={[0, 1.65, 0.15]} color="#d19a49" intensity={0.28} distance={4} decay={2} />
        <mesh ref={beacon} position={[0, 1.65, 0.15]}>
          <octahedronGeometry args={[0.12, 0]} />
          <meshBasicMaterial color="#c99b52" transparent opacity={0.82} />
        </mesh>
      </group>
    </group>
  );
}
