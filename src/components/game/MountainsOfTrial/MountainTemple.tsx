"use client";
import { useMemo } from "react";
import { useGraphicsQuality } from "../GraphicsQuality";
import { MOUNTAIN_CHECKPOINTS } from "./mountainConfig";
import * as THREE from "three";

function generateGateGeometry(width: number, height: number, depth: number, preset: string) {
  const segments = preset === "potato" ? 8 : preset === "low" ? 12 : 16;
  const geometry = new THREE.BoxGeometry(width, height, depth, segments, segments, segments);
  const positions = geometry.getAttribute("position");

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    // Ancient weathering effects
    const erosion = Math.sin(x * 0.3 + z * 0.2) * Math.cos(y * 0.15) * 0.08;
    positions.setX(i, x + erosion);
    positions.setZ(i, z + erosion * 0.8);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function generateStatueGeometry(height: number, preset: string) {
  const segments = preset === "potato" ? 6 : preset === "low" ? 8 : 12;
  const geometry = new THREE.CylinderGeometry(1.5, 2, height, segments, segments);
  const positions = geometry.getAttribute("position");

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    // Statue erosion - weathered appearance
    const erosion = Math.sin(x * 0.2 + z * 0.3) * Math.cos(y * 0.1) * 0.12;
    positions.setX(i, x + erosion);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function createGateMaterial(snowIntensity: number, preset: string) {
  const baseColor = new THREE.Color().setHSL(0.5, 0.2, 0.28);
  const trimColor = new THREE.Color("#b8a15a"); // Weathered bronze/gold
  const snowColor = new THREE.Color("#e8eef0");

  const mixedColor = baseColor.clone().lerp(trimColor, snowIntensity * 0.2);

  const roughness = 0.88;

  return {
    color: mixedColor,
    roughness,
    metalness: 0.05,
  };
}

function createLightMaterial(intensity: number) {
  return {
    color: new THREE.Color("#ffbf10"),
    emissive: new THREE.Color("#ffbf10"),
    emissiveIntensity: intensity,
  };
}

export default function MountainTemple({ level }: { level: number }) {
  const { preset } = useGraphicsQuality();

  const checkpoint = MOUNTAIN_CHECKPOINTS.find(c => c.level === level) ?? MOUNTAIN_CHECKPOINTS[4]; // Level 15 finale
  const segments = preset === "potato" ? 6 : preset === "low" ? 8 : preset === "medium" ? 12 : 16;

  const gate = useMemo(() => {
    const width = 8;
    const height = 12;
    const depth = 4;

    return {
      geometry: generateGateGeometry(width, height, depth, preset),
      material: createGateMaterial(checkpoint.snowIntensity, preset),
    };
  }, [checkpoint, preset]);

  const statues = useMemo(() => {
    const statueCount = preset === "potato" ? 2 : preset === "low" ? 2 : preset === "medium" ? 4 : 6;
    const result = [];

    for (let i = 0; i < statueCount; i++) {
      const angle = (i / statueCount) * Math.PI * 2;
      const distance = 6;
      const x = checkpoint.position[0] + Math.cos(angle) * distance;
      const z = checkpoint.position[2] + Math.sin(angle) * distance;
      const height = 8 + checkpoint.elevation * 0.5;

      result.push({
        position: [x, height / 2, z] as [number, number, number],
        geometry: generateStatueGeometry(height, preset),
      });
    }

    return result;
  }, [checkpoint, preset]);

  const lightMaterial = createLightMaterial(0.8);

  return (
    <group position={checkpoint.position}>
      {/* Main gate structure */}
      <mesh
        geometry={gate.geometry}
        position={[0, 6, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={gate.material.color}
          roughness={gate.material.roughness}
          metalness={gate.material.metalness}
          attach="material"
        />
      </mesh>

      {/* Statues flanking the gate */}
      {statues.map((statue, index) => (
        <mesh
          key={index}
          geometry={statue.geometry}
          position={statue.position}
          castShadow
        >
          <meshStandardMaterial
            color={gate.material.color}
            roughness={gate.material.roughness - 0.1}
            metalness={gate.material.metalness}
            attach="material"
          />
        </mesh>
      ))}

      {/* Warm light inside gate */}
      <pointLight
        position={[0, 8, 0]}
        color={lightMaterial.color}
        intensity={lightMaterial.emissiveIntensity}
        distance={15}
        decay={2}
      />
    </group>
  );
}
