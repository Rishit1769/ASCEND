"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGraphicsQuality } from "./GraphicsQuality";

function seededValue(value: number) {
  const sample = Math.sin(value * 12.9898) * 43758.5453;
  return sample - Math.floor(sample);
}

interface AmbientParticlesProps {
  reducedMotion: boolean;
}

export default function AmbientParticles({ reducedMotion }: AmbientParticlesProps) {
  const { config } = useGraphicsQuality();
  const count = config.particleCount;
  const points = useRef<THREE.Points>(null);

  const initialPositions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (seededValue(index + 1) - 0.5) * 12;
      positions[index * 3 + 1] = seededValue(index + 101) * 6 - 1;
      positions[index * 3 + 2] = seededValue(index + 201) * 7 - 7;
    }
    return positions;
  }, [count]);

  useFrame((_, delta) => {
    if (reducedMotion || !points.current || count === 0) return;
    const positionAttribute = points.current.geometry.getAttribute("position");
    for (let index = 0; index < count; index += 1) {
      const y = positionAttribute.getY(index) + delta * (0.018 + (index % 5) * 0.004);
      positionAttribute.setY(index, y > 5 ? -1 : y);
      positionAttribute.setX(
        index,
        positionAttribute.getX(index) + Math.sin(performance.now() * 0.00012 + index) * delta * 0.012
      );
    }
    positionAttribute.needsUpdate = true;
  });

  if (count === 0) return null;

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[initialPositions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#c8b99b"
        size={0.045}
        transparent
        opacity={0.42}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
