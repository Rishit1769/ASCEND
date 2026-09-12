"use client";
import { useMemo } from "react";
import { useGraphicsQuality } from "../GraphicsQuality";
import { MOUNTAIN_CHECKPOINTS } from "./mountainConfig";
import * as THREE from "three";

function generateBridgeDeck(length: number, width: number, segments: number, damageFactor: number) {
  const geometry = new THREE.BoxGeometry(width, 0.5, length, segments, 1, segments);
  const positions = geometry.getAttribute("position");

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    // Add damage - remove some sections, tilt others
    const damage = Math.random() < damageFactor ? Math.random() * 0.8 : 0;
    const tilt = damage * Math.sin(x * 0.5) * 0.15;

    positions.setX(i, x);
    positions.setY(i, y + tilt);
    positions.setZ(i, z);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function generateBridgeSupports(length: number, width: number, segments: number) {
  const geometry = new THREE.BoxGeometry(width, 8, width, segments, segments, segments);
  const positions = geometry.getAttribute("position");

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    // Weathered appearance with some erosion
    const erosion = Math.sin(x * 0.3 + z * 0.2) * Math.cos(y * 0.15) * 0.1;
    positions.setX(i, x + erosion);
    positions.setZ(i, z + erosion * 0.5);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function createBridgeMaterial(snowIntensity: number, preset: string) {
  const baseColor = new THREE.Color().setHSL(0.55, 0.15, 0.35);
  const snowColor = new THREE.Color("#d8dfe0");
  const mixedColor = baseColor.clone().lerp(snowColor, snowIntensity * 0.5);

  const roughness = 0.9 - snowIntensity * 0.25;

  return {
    color: mixedColor,
    roughness,
    metalness: 0.03,
  };
}

export default function MountainBridge({ level }: { level: number }) {
  const { preset } = useGraphicsQuality();

  const checkpoint = MOUNTAIN_CHECKPOINTS.find(c => c.level === level) ?? MOUNTAIN_CHECKPOINTS[2]; // Level 13 is bridge
  const damageFactor = preset === "potato" ? 0.15 : preset === "low" ? 0.12 : 0.08;
  const segments = preset === "potato" ? 4 : preset === "low" ? 6 : preset === "medium" ? 8 : 12;

  const bridge = useMemo(() => {
    const length = 20;
    const width = 3;
    const deckSegments = segments;
    const supportSegments = segments;

    return {
      deckGeometry: generateBridgeDeck(length, width, deckSegments, damageFactor),
      supportGeometry: generateBridgeSupports(length, width, supportSegments),
      material: createBridgeMaterial(checkpoint.snowIntensity, preset),
    };
  }, [checkpoint, damageFactor, segments, preset]);

  return (
    <group position={checkpoint.position} rotation={[0, checkpoint.snowIntensity * 0.05, 0]}>
      {/* Bridge deck */}
      <mesh
        geometry={bridge.deckGeometry}
        position={[0, 0.3, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={bridge.material.color}
          roughness={bridge.material.roughness}
          metalness={bridge.material.metalness}
          attach="material"
        />
      </mesh>

      {/* Bridge supports/legs */}
      <mesh
        geometry={bridge.supportGeometry}
        position={[0, -4, 0]}
        castShadow
      >
        <meshStandardMaterial
          color={bridge.material.color}
          roughness={bridge.material.roughness}
          metalness={bridge.material.metalness}
          attach="material"
        />
      </mesh>
    </group>
  );
}
