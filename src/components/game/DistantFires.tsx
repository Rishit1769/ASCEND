"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const FIRES = [
  { position: [-4.3, -0.15, -4.8] as [number, number, number], phase: 0.4 },
  { position: [4.1, 0.05, -5.6] as [number, number, number], phase: 1.8 },
];

export default function DistantFires({ reducedMotion }: { reducedMotion: boolean }) {
  const lights = useRef<Array<THREE.PointLight | null>>([]);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const time = clock.getElapsedTime();
    lights.current.forEach((light, index) => {
      if (!light) return;
      light.intensity = 0.78 + Math.sin(time * 2.2 + FIRES[index].phase) * 0.1;
    });
  });

  return (
    <>
      {FIRES.map((fire, index) => (
        <group key={fire.position.join("-")} position={fire.position}>
          <pointLight
            ref={(light) => {
              lights.current[index] = light;
            }}
            color="#FF7A2F"
            intensity={0.78}
            distance={5}
            decay={2}
          />
          <mesh>
            <octahedronGeometry args={[0.09, 0]} />
            <meshBasicMaterial color="#F2A93B" />
          </mesh>
          <mesh position={[0, -0.25, 0]}>
            <coneGeometry args={[0.18, 0.5, 5]} />
            <meshStandardMaterial color="#15151d" roughness={1} />
          </mesh>
        </group>
      ))}
    </>
  );
}
