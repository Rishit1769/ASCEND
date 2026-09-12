"use client";
import { useMemo } from "react";
import { Object3D } from "three";
import { useGraphicsQuality } from "../GraphicsQuality";
import { useWorldProgress } from "../WorldProgress";
import { resolveWorld } from "@/lib/world";
import { SUN_DIRECTION } from "../skyConfig";

export default function ForestLighting() {
  const { config } = useGraphicsQuality();
  const { level } = useWorldProgress();
  const z = resolveWorld(level).checkpoint.worldPosition[2];
  const target = useMemo(() => { const object = new Object3D(); object.position.set(0, 0, z); return object; }, [z]);
  return <>
    <primitive object={target} />
    <hemisphereLight color="#adc9cb" groundColor="#333b28" intensity={.85} />
    <directionalLight position={[SUN_DIRECTION.x * 35, SUN_DIRECTION.y * 35, z + SUN_DIRECTION.z * 35]} target={target} color="#ffe4b0" intensity={2.4}
      castShadow={config.shadowsEnabled} shadow-mapSize={config.shadowMapSize} shadow-camera-left={-18} shadow-camera-right={18} shadow-camera-top={22} shadow-camera-bottom={-22} shadow-camera-far={100} shadow-normalBias={.045} shadow-bias={-.00015} />
    <directionalLight position={[-8, 10, z + 10]} target={target} color="#b9d4df" intensity={.85} />
    <pointLight position={[2, 3, z - 3]} color="#b8d1c5" intensity={15} distance={9} />
  </>;
}
