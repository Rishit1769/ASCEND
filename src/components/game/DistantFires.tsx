"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GroundedAsset } from "./EnvironmentAsset";

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
      light.intensity = 1.8 + Math.sin(time * 2.2 + FIRES[index].phase) * 0.1;
    });
  });

  return (
    <>
      {FIRES.map((fire, index) => (
        <GroundedAsset key={fire.position.join("-")} id="wooden_lantern_01" height={.7} position={fire.position} burial={.015} castShadow>
          <pointLight
            position={[0, .35, 0]}
            ref={(light) => {
              lights.current[index] = light;
            }}
            color="#ff9a45"
            intensity={1.8}
            distance={5}
            decay={2}
          />
        </GroundedAsset>
      ))}
    </>
  );
}
