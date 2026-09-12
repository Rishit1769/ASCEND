"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FogLayersProps {
  reducedMotion: boolean;
}

const CLOUDS = [
  { position: [-4.8, 2.8, -8] as [number, number, number], scale: [3.5, 0.45, 1] as [number, number, number], opacity: 0.12 },
  { position: [2.5, 3.5, -10] as [number, number, number], scale: [4.5, 0.6, 1] as [number, number, number], opacity: 0.1 },
  { position: [5.5, 2.4, -7] as [number, number, number], scale: [2.8, 0.35, 1] as [number, number, number], opacity: 0.08 },
];

const SHORE_FOG = [
  { position: [-3.5, 0.1, -3.4] as [number, number, number], scale: [4.8, 0.7, 1] as [number, number, number], opacity: 0.1 },
  { position: [3.8, -0.2, -4.5] as [number, number, number], scale: [5.2, 0.8, 1] as [number, number, number], opacity: 0.08 },
];

function LayerGroup({
  layers,
  color,
  reducedMotion,
  speed,
}: {
  layers: typeof CLOUDS;
  color: string;
  reducedMotion: boolean;
  speed: number;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (reducedMotion || !group.current) return;

    group.current.children.forEach((child, index) => {
      child.position.x += delta * speed * (index % 2 === 0 ? 1 : -0.7);
      if (child.position.x > 9) child.position.x = -9;
      if (child.position.x < -9) child.position.x = 9;
    });
  });

  return (
    <group ref={group}>
      {layers.map((layer, index) => (
        <mesh key={`${color}-${index}`} position={layer.position} scale={layer.scale}>
          <circleGeometry args={[1, 24]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={layer.opacity}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function FogLayers({ reducedMotion }: FogLayersProps) {
  return (
    <>
      <LayerGroup layers={CLOUDS} color="#8790a4" reducedMotion={reducedMotion} speed={0.018} />
      <LayerGroup layers={SHORE_FOG} color="#748090" reducedMotion={reducedMotion} speed={0.01} />
    </>
  );
}
