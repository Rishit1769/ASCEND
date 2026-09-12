"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGraphicsQuality } from "../GraphicsQuality";
import { MOUNTAIN_ATMOSPHERE } from "./mountainConfig";
import * as THREE from "three";

export default function MountainAtmosphere({ level }: { level: number }) {
  const { preset } = useGraphicsQuality();

  const atmosphere = useMemo(() => {
    // Fog density decreases at higher elevations (clearer air)
    const fogDensity = MOUNTAIN_ATMOSPHERE.fogDensity * (1 - level * 0.008);

    // Sun intensity increases at higher elevations
    const sunIntensity = MOUNTAIN_ATMOSPHERE.sunIntensity * (0.8 + level * 0.02);

    return {
      fogColor: MOUNTAIN_ATMOSPHERE.fogColor,
      fogDensity: Math.max(fogDensity, 0.005),
      sunIntensity: Math.min(sunIntensity, 4),
    };
  }, [level]);

  return (
    <>
      <fogExp2 attach="fog" args={[atmosphere.fogColor, atmosphere.fogDensity]} />
      <directionalLight
        position={[10, 15, 5]}
        intensity={atmosphere.sunIntensity}
        color="#ffe9c8"
        castShadow
        shadow-mapSize={preset === "potato" ? [512, 512] : preset === "low" ? [1024, 1024] : [2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-far={60}
      />
    </>
  );
}
