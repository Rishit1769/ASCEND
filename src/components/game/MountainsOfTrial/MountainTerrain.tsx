"use client";
import { useMemo } from "react";
import { useGraphicsQuality } from "../GraphicsQuality";
import { MOUNTAIN_CHECKPOINTS } from "./mountainConfig";
import * as THREE from "three";

function generateTerrainGeometry(checkpoint: (typeof MOUNTAIN_CHECKPOINTS)[number], graphicsPreset: string) {
  const segments = graphicsPreset === "potato" ? 32 : graphicsPreset === "low" ? 48 : graphicsPreset === "medium" ? 64 : 96;
  const size = 40;
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);

  const positions = geometry.getAttribute("position");
  const elevation = checkpoint.elevation;

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    // Create mountain slope - higher elevation for higher checkpoints
    const slope = elevation * 0.5;
    const noise = Math.sin(x * 0.3) * Math.cos(z * 0.25) * 0.15 + Math.sin(x * 0.1) * Math.cos(z * 0.15) * 0.3;
    const height = slope + noise;

    positions.setY(i, height);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function createTerrainMaterial(checkpoint: (typeof MOUNTAIN_CHECKPOINTS)[number], preset: string) {
  const { snowIntensity } = checkpoint;

  // Base color varies by elevation - lower is more green/moss, higher is more rock/snow
  const baseColor = new THREE.Color().setHSL(
    0.08 + checkpoint.elevation * 0.01, // Hue shift from green to gray
    0.4 - checkpoint.elevation * 0.08,  // Saturation decrease
    0.35 + checkpoint.elevation * 0.02  // Lightness
  );

  // Snow color
  const snowColor = new THREE.Color("#e8f0f2");

  // Mix based on elevation and snow intensity
  const mixedColor = baseColor.clone().lerp(snowColor, snowIntensity * 0.7);

  const roughness = 0.85 - snowIntensity * 0.3;
  const metalness = 0.05;

  return {
    color: mixedColor,
    roughness,
    metalness,
    snowIntensity,
  };
}

export default function MountainTerrain({ level }: { level: number }) {
  const { preset } = useGraphicsQuality();

  const checkpoint = MOUNTAIN_CHECKPOINTS.find(c => c.level === level) ?? MOUNTAIN_CHECKPOINTS[0];

  const geometry = useMemo(
    () => generateTerrainGeometry(checkpoint, preset),
    [checkpoint, preset]
  );

  const material = useMemo(
    () => createTerrainMaterial(checkpoint, preset),
    [checkpoint, preset]
  );

  return (
    <mesh
      geometry={geometry}
      position={[checkpoint.position[0], 0, checkpoint.position[2]]}
      receiveShadow
      castShadow
    >
      <meshStandardMaterial
        color={material.color}
        roughness={material.roughness}
        metalness={material.metalness}
        attach="material"
      />
    </mesh>
  );
}
