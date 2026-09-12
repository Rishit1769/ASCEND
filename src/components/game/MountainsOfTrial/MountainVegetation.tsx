"use client";
import { useMemo } from "react";
import { useGraphicsQuality } from "../GraphicsQuality";
import { MOUNTAIN_CHECKPOINTS } from "./mountainConfig";
import * as THREE from "three";

function generatePineGeometry(height: number, preset: string) {
  const segments = preset === "potato" ? 4 : preset === "low" ? 6 : 8;
  const geometry = new THREE.ConeGeometry(2, height, segments, segments);
  const positions = geometry.getAttribute("position");

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    // Slight sway in wind
    const sway = Math.sin(x * 0.1 + y * 0.05) * 0.08;
    positions.setX(i, x + sway);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function generateShrubGeometry(height: number, preset: string) {
  const segments = preset === "potato" ? 4 : preset === "low" ? 6 : 8;
  const geometry = new THREE.SphereGeometry(height, segments, segments);
  const positions = geometry.getAttribute("position");

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    // Bushy, dense appearance
    const variance = Math.sin(x * 0.2 + y * 0.1) * 0.15;
    positions.setX(i, x + variance);
    positions.setZ(i, z + variance * 0.7);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function createVegetationMaterial(elevation: number, snowIntensity: number, preset: string) {
  // Pine green color, transitions to more sparse at higher elevations
  const pineGreen = new THREE.Color().setHSL(0.35, 0.5, 0.3);
  const snowWhite = new THREE.Color("#f0f4f5");

  const mixedColor = pineGreen.clone().lerp(snowWhite, snowIntensity * 0.3);

  const roughness = 0.8;

  return {
    color: mixedColor,
    roughness,
    metalness: 0,
  };
}

export default function MountainVegetation({ level }: { level: number }) {
  const { preset } = useGraphicsQuality();

  const checkpoint = MOUNTAIN_CHECKPOINTS.find(c => c.level === level) ?? MOUNTAIN_CHECKPOINTS[0];
  const segments = preset === "potato" ? 4 : preset === "low" ? 6 : preset === "medium" ? 8 : 12;

  const vegetation = useMemo(() => {
    // Lower levels have more pines, higher levels have fewer
    const pineCount = Math.max(0, Math.floor((8 - checkpoint.elevation) * 1.5));
    const shrubCount = Math.max(0, Math.floor((6 - checkpoint.elevation) * 1.2));

    const pines = [];
    const shrubs = [];

    // Generate pines around checkpoint
    for (let i = 0; i < pineCount; i++) {
      const angle = (i / pineCount) * Math.PI * 2;
      const distance = 8 + checkpoint.elevation * 1.5;
      const x = checkpoint.position[0] + Math.cos(angle) * distance;
      const z = checkpoint.position[2] + Math.sin(angle) * distance;
      const height = 5 + (8 - checkpoint.elevation) * 0.5;

      pines.push({
        position: [x, height / 2, z] as [number, number, number],
        geometry: generatePineGeometry(height, preset),
      });
    }

    // Generate shrubs at lower elevations
    if (checkpoint.elevation < 6) {
      for (let i = 0; i < shrubCount; i++) {
        const angle = (i / shrubCount) * Math.PI * 2 + 0.3;
        const distance = 6 + checkpoint.elevation * 1.2;
        const x = checkpoint.position[0] + Math.cos(angle) * distance;
        const z = checkpoint.position[2] + Math.sin(angle) * distance;
        const height = 1.5;

        shrubs.push({
          position: [x, height / 2, z] as [number, number, number],
          geometry: generateShrubGeometry(height, preset),
        });
      }
    }

    return {
      pines,
      shrubs,
      material: createVegetationMaterial(checkpoint.elevation, checkpoint.snowIntensity, preset),
    };
  }, [checkpoint, preset]);

  return (
    <group>
      {/* Pines */}
      {vegetation.pines.map((pine, index) => (
        <mesh
          key={`pine-${index}`}
          geometry={pine.geometry}
          position={pine.position}
          castShadow
        >
          <meshStandardMaterial
            color={vegetation.material.color}
            roughness={vegetation.material.roughness}
            attach="material"
          />
        </mesh>
      ))}

      {/* Shrubs */}
      {vegetation.shrubs.map((shrub, index) => (
        <mesh
          key={`shrub-${index}`}
          geometry={shrub.geometry}
          position={shrub.position}
        >
          <meshStandardMaterial
            color={vegetation.material.color}
            roughness={vegetation.material.roughness}
            attach="material"
          />
        </mesh>
      ))}
    </group>
  );
}
