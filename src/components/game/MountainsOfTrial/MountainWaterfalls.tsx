"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGraphicsQuality } from "../GraphicsQuality";
import { MOUNTAIN_CHECKPOINTS } from "./mountainConfig";
import * as THREE from "three";

function generateWaterfallGeometry(height: number, width: number, preset: string) {
  const segments = preset === "potato" ? 4 : preset === "low" ? 6 : preset === "medium" ? 8 : 12;
  const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
  const positions = geometry.getAttribute("position");

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    // Water flowing downward with slight waviness
    const flow = Math.sin(x * 0.3) * 0.02 + Math.cos(z * 0.2) * 0.01;
    positions.setZ(i, z + flow);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function createWaterfallMaterial(preset: string) {
  return {
    color: new THREE.Color("#7fc0d0"),
    transparent: true,
    opacity: 0.7,
    roughness: 0.2,
  };
}

function generateMist(position: [number, number, number], count: number, preset: string) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 1.5;
    positions[i * 3] = position[0] + Math.cos(angle) * radius;
    positions[i * 3 + 1] = position[1] + Math.random() * 0.5;
    positions[i * 3 + 2] = position[2] + Math.sin(angle) * radius;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geometry;
}

export default function MountainWaterfalls({ level }: { level: number }) {
  const { preset } = useGraphicsQuality();
  const mistRef = useRef<THREE.Points>(null);

  const checkpoint = MOUNTAIN_CHECKPOINTS.find(c => c.level === level) ?? MOUNTAIN_CHECKPOINTS[0];
  const mistCount = preset === "potato" ? 0 : preset === "low" ? 3 : preset === "medium" ? 8 : 15;

  const waterfall = useMemo(() => {
    const height = 15 + checkpoint.elevation * 1.5;
    const width = 3;

    const waterfallGeometry = generateWaterfallGeometry(height, width, preset);
    const mistGeometry = generateMist(
      [checkpoint.position[0], checkpoint.elevation * 0.5 - 5, checkpoint.position[2]],
      mistCount,
      preset
    );

    return {
      geometry: waterfallGeometry,
      mist: mistCount > 0 ? mistGeometry : null,
      material: createWaterfallMaterial(preset),
    };
  }, [checkpoint, mistCount, preset]);

  useFrame(() => {
    if (!mistRef.current || mistCount === 0) return;

    // Animate mist particles
    const positions = mistRef.current.geometry.getAttribute("position");
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      positions.setY(i, y + Math.sin(y * 0.1) * 0.02);
    }
    positions.needsUpdate = true;
  });

  return (
    <group position={checkpoint.position}>
      {/* Waterfall */}
      <mesh
        geometry={waterfall.geometry}
        position={[0, checkpoint.elevation * 0.5, 0]}
        rotation={[Math.PI / 2 + 0.1, 0, 0]}
      >
        <meshStandardMaterial
          color={waterfall.material.color}
          transparent={waterfall.material.transparent}
          opacity={waterfall.material.opacity}
          roughness={waterfall.material.roughness}
          attach="material"
        />
      </mesh>

      {/* Mist points */}
      {waterfall.mist && (
        <points ref={mistRef} geometry={waterfall.mist}>
          <pointsMaterial
            color="#c0d0d5"
            size={0.15}
            transparent
            opacity={0.4}
            sizeAttenuation
          />
        </points>
      )}
    </group>
  );
}
