"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGraphicsQuality } from "../GraphicsQuality";
import { MOUNTAIN_CHECKPOINTS } from "./mountainConfig";
import * as THREE from "three";

function seededRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function generateCloudGeometry(radius: number, detail: number, preset: string, seed: number) {
  const geometry = new THREE.SphereGeometry(radius, detail, detail);
  const positions = geometry.getAttribute("position");

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    // Cloud formation - puffy, irregular using seeded random
    const variance = Math.sin(x * 0.1 + seed) * Math.cos(y * 0.1 + seed * 0.5) * 0.3 + Math.sin(z * 0.1) * 0.2;
    positions.setX(i, x + variance);
    positions.setY(i, y + variance * 0.6);
    positions.setZ(i, z + variance * 0.8);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function createCloudMaterial(density: number, preset: string) {
  return {
    color: new THREE.Color("#f0f4f5"),
    transparent: true,
    opacity: density * 0.6,
    size: 2.5,
  };
}

export default function MountainClouds({ level }: { level: number }) {
  const { preset } = useGraphicsQuality();
  const cloudRef = useRef<THREE.Group>(null);

  const checkpoint = MOUNTAIN_CHECKPOINTS.find(c => c.level === level) ?? MOUNTAIN_CHECKPOINTS[0];
  const detail = preset === "potato" ? 4 : preset === "low" ? 6 : preset === "medium" ? 10 : 16;
  const cloudCount = preset === "potato" ? 2 : preset === "low" ? 4 : preset === "medium" ? 6 : 10;

  const clouds = useMemo(() => {
    // Cloud level decreases as elevation increases (clouds below player at high levels)
    const baseCloudLevel = checkpoint.cloudLevel - checkpoint.elevation * 1.5;
    const result = [];

    for (let i = 0; i < cloudCount; i++) {
      const angle = (i / cloudCount) * Math.PI * 2;
      const distance = 50 + checkpoint.elevation * 3;
      const x = checkpoint.position[0] + Math.cos(angle) * distance;
      const z = checkpoint.position[2] + Math.sin(angle) * distance;
      const seed = checkpoint.elevation * 50 + i;
      const y = Math.max(baseCloudLevel - seededRandom(seed) * 5, checkpoint.elevation - 10);

      result.push({
        position: [x, y, z] as [number, number, number],
        geometry: generateCloudGeometry(20 + seededRandom(seed + 1) * 10, detail, preset, seed),
        scale: 0.5 + seededRandom(seed + 2) * 0.5,
      });
    }

    const material = createCloudMaterial(0.35, preset);

    return { clouds: result, material };
  }, [checkpoint, detail, preset, cloudCount]);

  useFrame(() => {
    if (!cloudRef.current) return;

    // Slow cloud drift
    cloudRef.current.rotation.y += 0.00005;
  });

  return (
    <group ref={cloudRef}>
      {clouds.clouds.map((cloud, index) => {
        const rotation = [
          seededRandom(checkpoint.elevation * 100 + index) * 0.5,
          seededRandom(checkpoint.elevation * 100 + index + 1) * 0.5,
          seededRandom(checkpoint.elevation * 100 + index + 2) * 0.2,
        ];

        return (
          <mesh
            key={index}
            geometry={cloud.geometry}
            position={cloud.position}
            scale={cloud.scale}
            rotation={rotation as [number, number, number]}
          >
            <meshStandardMaterial
              color={clouds.material.color}
              transparent={true}
              opacity={clouds.material.opacity}
              roughness={0.9}
              metalness={0}
              attach="material"
            />
          </mesh>
        );
      })}
    </group>
  );
}
