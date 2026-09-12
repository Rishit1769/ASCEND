"use client";
import { useMemo } from "react";
import { useWorldProgress } from "../WorldProgress";
import { useGraphicsQuality } from "../GraphicsQuality";
import { checkpointForLevel } from "./mountainConfig";

export default function MountainAtmosphere() {
  const { level } = useWorldProgress();
  const { preset, config } = useGraphicsQuality();
  const checkpoint = checkpointForLevel(level);
  const fogDensity = useMemo(() => Math.max(.008, .019 - checkpoint.elevation * .00035), [checkpoint.elevation]);
  const shadow = config.shadowsEnabled ? config.shadowMapSize : [256, 256] as [number, number];
  return <>
    <fogExp2 attach="fog" args={["#8fa5af", fogDensity]} />
    <hemisphereLight args={["#c9dce4", "#343832", .78]} />
    <directionalLight
      position={[-18, 28, 18]}
      intensity={preset === "potato" ? 1.65 : 2.55}
      color="#ffe0ad"
      castShadow={config.shadowsEnabled}
      shadow-mapSize={shadow}
      shadow-camera-left={-36}
      shadow-camera-right={36}
      shadow-camera-top={42}
      shadow-camera-bottom={-22}
      shadow-camera-far={115}
      shadow-bias={-.00008}
      shadow-normalBias={.04}
    />
    <directionalLight position={[12, 14, -35]} intensity={.72} color="#9fbfd3" />
    <pointLight position={[0, checkpoint.elevation + 3.2, checkpoint.position[2] + 4]} intensity={preset === "potato" ? 0 : 7} distance={16} color="#cfe7ff" />
  </>;
}
