"use client";
import { useMemo } from "react";
import { Object3D } from "three";
import { useGraphicsQuality } from "./GraphicsQuality";
import { SUN_DIRECTION } from "./skyConfig";

// ─── Tweakable constants ───────────────────────────────────────────
// Lighting — adjust intensities/colors to taste.
const AMBIENT_INTENSITY = 0.8;
const AMBIENT_COLOR = "#a6c5dc";

const KEY_LIGHT_INTENSITY = 2.8;
const KEY_LIGHT_POSITION: [number, number, number] = [SUN_DIRECTION.x * 40, SUN_DIRECTION.y * 40, -12 + SUN_DIRECTION.z * 40];
const KEY_LIGHT_COLOR = "#ffe9c8";

const FILL_LIGHT_INTENSITY = 0.72; // Warm distant fire fill
const FILL_LIGHT_POSITION: [number, number, number] = [-3, 2, 2];
const FILL_LIGHT_COLOR = "#F2A93B";

const RIM_LIGHT_INTENSITY = 8; // Cool back/edge light for separation
const RIM_LIGHT_POSITION: [number, number, number] = [2, 3, -2];
const RIM_LIGHT_COLOR = "#8AA7C7";
// ───────────────────────────────────────────────────────────────────

export default function SceneLighting() {
  const quality = useGraphicsQuality();
  const target = useMemo(() => { const object = new Object3D(); object.position.set(0, 0, -12); return object; }, []);
  return (
    <>
      <primitive object={target} />
      {/* Global fill — lifts everything out of pure black */}
      <hemisphereLight intensity={AMBIENT_INTENSITY} color={AMBIENT_COLOR} groundColor="#30271f" />

      {/* Key light — main character illumination from upper-right */}
      <directionalLight
        key={quality}
        position={KEY_LIGHT_POSITION}
        intensity={KEY_LIGHT_INTENSITY}
        color={KEY_LIGHT_COLOR}
        target={target}
        castShadow
        shadow-mapSize={quality === "high" ? [2048, 2048] : quality === "medium" ? [1024, 1024] : [512, 512]}
        shadow-camera-left={-21}
        shadow-camera-right={21}
        shadow-camera-top={21}
        shadow-camera-bottom={-21}
        shadow-camera-far={75}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
        shadow-radius={2}
      />

      {/* Fill light — warm gold from the left for depth */}
      <pointLight
        position={FILL_LIGHT_POSITION}
        intensity={FILL_LIGHT_INTENSITY}
        color={FILL_LIGHT_COLOR}
        distance={15}
        decay={2}
      />

      {/* Rim/back light — separates character from background */}
      <pointLight
        position={RIM_LIGHT_POSITION}
        intensity={RIM_LIGHT_INTENSITY}
        color={RIM_LIGHT_COLOR}
        distance={12}
        decay={2}
      />

      {/* Weak warm counter-rim keeps bronze armor separate from the cold shore. */}
      <pointLight
        position={[-2, 2, -1]}
        intensity={2}
        color="#E85D1F"
        distance={7}
        decay={2}
      />
    </>
  );
}
