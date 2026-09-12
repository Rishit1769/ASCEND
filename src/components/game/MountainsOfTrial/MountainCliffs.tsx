"use client";
import { useMemo } from "react";
import { useGraphicsQuality } from "../GraphicsQuality";
import { MOUNTAIN_CHECKPOINTS } from "./mountainConfig";
import * as THREE from "three";

function seededRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function generateCliffGeometry(position: [number, number, number], height: number, width: number, preset: string, seed: number) {
  const segments = preset === "potato" ? 8 : preset === "low" ? 12 : 16;
  const geometry = new THREE.BoxGeometry(width, height, width, segments, segments);

  const positions = geometry.getAttribute("position");
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    // Add noise for jagged cliff edges using seeded random
    const noise = Math.sin(x * 0.3 + y * 0.15 + seed) * Math.cos(z * 0.25) * 0.3;
    positions.setX(i, x + noise);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function createCliffMaterial(elevation: number, snowIntensity: number, preset: string) {
  // Cool gray base for rock
  const baseColor = new THREE.Color().setHSL(0.55, 0.25, 0.32 + elevation * 0.02);

  // Snow accumulation on upper parts
  const snowColor = new THREE.Color("#f0f4f5");
  const mixedColor = baseColor.clone().lerp(snowColor, snowIntensity * 0.8);

  const roughness = 0.88 - snowIntensity * 0.2;

  return {
    color: mixedColor,
    roughness,
    metalness: 0.02,
  };
}

export default function MountainCliffs({ level }: { level: number }) {
  const { preset } = useGraphicsQuality();

  const checkpoint = MOUNTAIN_CHECKPOINTS.find(c => c.level === level) ?? MOUNTAIN_CHECKPOINTS[0];

  // Generate cliffs around the checkpoint
  const cliffs = useMemo(() => {
    const cliffCount = preset === "potato" ? 4 : preset === "low" ? 6 : preset === "medium" ? 8 : 10;
    const result = [];

    for (let i = 0; i < cliffCount; i++) {
      const angle = (i / cliffCount) * Math.PI * 2;
      const distance = 12 + checkpoint.elevation * 2;
      const x = checkpoint.position[0] + Math.cos(angle) * distance;
      const z = checkpoint.position[2] + Math.sin(angle) * distance;
      const seed = checkpoint.elevation * 100 + i;
      const height = 15 + checkpoint.elevation * 3 + seededRandom(seed) * 5;
      const width = 4 + seededRandom(seed + 1) * 3;

      result.push({
        position: [x, height / 2, z] as [number, number, number],
        geometry: generateCliffGeometry([x, height / 2, z], height, width, preset, seed),
      });
    }

    const material = createCliffMaterial(checkpoint.elevation, checkpoint.snowIntensity * 0.6, preset);

    return { cliffs: result, material };
  }, [checkpoint, preset]);

  return (
    <group>
      {cliffs.cliffs.map((cliff, index) => (
        <mesh
          key={index}
          geometry={cliff.geometry}
          position={cliff.position}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={cliffs.material.color}
            roughness={cliffs.material.roughness}
            metalness={cliffs.material.metalness}
            attach="material"
          />
        </mesh>
      ))}
    </group>
  );
}
