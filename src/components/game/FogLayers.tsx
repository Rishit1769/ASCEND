"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FogLayersProps {
  reducedMotion: boolean;
}

const CLOUDS = [
  { position: [-4.8, 2.8, -8] as [number, number, number], scale: [3.5, 0.45, 1] as [number, number, number], opacity: 0.12 },
  { position: [2.5, 3.5, -10] as [number, number, number], scale: [4.5, 0.6, 1] as [number, number, number], opacity: 0.1 },
  { position: [5.5, 2.4, -7] as [number, number, number], scale: [2.8, 0.35, 1] as [number, number, number], opacity: 0.09 },
];

const SHORE_FOG = [
  { position: [-3.5, 0.1, -3.4] as [number, number, number], scale: [4.8, 0.7, 1] as [number, number, number], opacity: 0.14 },
  { position: [3.8, -0.2, -4.5] as [number, number, number], scale: [5.2, 0.8, 1] as [number, number, number], opacity: 0.11 },
];

function LayerGroup({
  layers,
  color,
  colors,
  reducedMotion,
  speed,
}: {
  layers: typeof CLOUDS;
  color: string;
  colors?: string[];
  reducedMotion: boolean;
  speed: number;
}) {
  const group = useRef<THREE.Group>(null);
  const alphaMap = useMemo(() => {
    const size = 64;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const radius = Math.hypot((x + 0.5) / size * 2 - 1, (y + 0.5) / size * 2 - 1);
        const edge = Math.pow(Math.max(0, 1 - radius), 1.8);
        const wisps = 0.7 + 0.3 * Math.sin(x * 0.23 + Math.sin(y * 0.31));
        const value = Math.round(255 * edge * wisps);
        const offset = (y * size + x) * 4;
        data.set([value, value, value, 255], offset);
      }
    }
    const texture = new THREE.DataTexture(data, size, size);
    texture.needsUpdate = true;
    return texture;
  }, []);

  useEffect(() => () => alphaMap.dispose(), [alphaMap]);

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
            color={colors?.[index] ?? color}
            alphaMap={alphaMap}
            transparent
            opacity={layer.opacity * 2}
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
      <LayerGroup
        layers={CLOUDS}
        color="#202A38"
        colors={["#202A38", "#39495E", "#111722"]}
        reducedMotion={reducedMotion}
        speed={0.018}
      />
      <LayerGroup layers={SHORE_FOG} color="#50647D" reducedMotion={reducedMotion} speed={0.01} />
    </>
  );
}
