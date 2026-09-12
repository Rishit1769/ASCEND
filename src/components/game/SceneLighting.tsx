"use client";
import { useMemo } from "react";
import { Object3D } from "three";
import { useGraphicsQuality } from "./GraphicsQuality";
import { SUN_DIRECTION } from "./skyConfig";
import { useWorldProgress } from "./WorldProgress";
import { resolveWorld } from "@/lib/world";

const AMBIENT_INTENSITY = 0.8;
const AMBIENT_COLOR = "#a6c5dc";
const KEY_LIGHT_POSITION: [number, number, number] = [SUN_DIRECTION.x * 40, SUN_DIRECTION.y * 40, -12 + SUN_DIRECTION.z * 40];
const KEY_LIGHT_COLOR = "#ffe9c8";
const FILL_LIGHT_INTENSITY = 0.72;
const FILL_LIGHT_POSITION: [number, number, number] = [-3, 2, 2];
const FILL_LIGHT_COLOR = "#F2A93B";
const RIM_LIGHT_INTENSITY = 8;
const RIM_LIGHT_POSITION: [number, number, number] = [2, 3, -2];
const RIM_LIGHT_COLOR = "#8AA7C7";

export default function SceneLighting() {
  const { config, preset } = useGraphicsQuality();
  const { level } = useWorldProgress();
  const intensity = resolveWorld(level).region.atmosphere.sunIntensity;
  const target = useMemo(() => { const o = new Object3D(); o.position.set(0, 0, -12); return o; }, []);

  return (
    <>
      <primitive object={target} />
      <hemisphereLight intensity={AMBIENT_INTENSITY} color={AMBIENT_COLOR} groundColor="#30271f" />

      {config.shadowsEnabled && (
        <directionalLight
          key={preset}
          position={KEY_LIGHT_POSITION}
          intensity={intensity}
          color={KEY_LIGHT_COLOR}
          target={target}
          castShadow
          shadow-mapSize={config.shadowMapSize}
          shadow-camera-left={-config.shadowCameraSize}
          shadow-camera-right={config.shadowCameraSize}
          shadow-camera-top={config.shadowCameraSize}
          shadow-camera-bottom={-config.shadowCameraSize}
          shadow-camera-far={config.shadowCameraFar}
          shadow-bias={-0.0002}
          shadow-normalBias={0.02}
          shadow-radius={2}
        />
      )}

      {!config.shadowsEnabled && (
        <directionalLight
          position={KEY_LIGHT_POSITION}
          intensity={intensity * 0.9}
          color={KEY_LIGHT_COLOR}
          target={target}
        />
      )}

      <pointLight position={FILL_LIGHT_POSITION} intensity={FILL_LIGHT_INTENSITY} color={FILL_LIGHT_COLOR} distance={15} decay={2} />
      <pointLight position={RIM_LIGHT_POSITION} intensity={RIM_LIGHT_INTENSITY} color={RIM_LIGHT_COLOR} distance={12} decay={2} />
      <pointLight position={[-2, 2, -1]} intensity={2} color="#E85D1F" distance={7} decay={2} />
    </>
  );
}
