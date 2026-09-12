"use client";

// ─── Tweakable constants ───────────────────────────────────────────
// Lighting — adjust intensities/colors to taste.
const AMBIENT_INTENSITY = 0.72; // Global fill (lower = moodier shadows)
const AMBIENT_COLOR = "#c8c8e0";

const KEY_LIGHT_INTENSITY = 1.85; // Moonlit primary light
const KEY_LIGHT_POSITION: [number, number, number] = [4, 7, 5];
const KEY_LIGHT_COLOR = "#c2cce4";

const FILL_LIGHT_INTENSITY = 0.65; // Warm distant fire fill
const FILL_LIGHT_POSITION: [number, number, number] = [-3, 2, 2];
const FILL_LIGHT_COLOR = "#d4a543";

const RIM_LIGHT_INTENSITY = 1.1; // Cool back/edge light for separation
const RIM_LIGHT_POSITION: [number, number, number] = [0, 3, -4];
const RIM_LIGHT_COLOR = "#a0a0c0";
// ───────────────────────────────────────────────────────────────────

export default function SceneLighting() {
  return (
    <>
      {/* Global fill — lifts everything out of pure black */}
      <ambientLight intensity={AMBIENT_INTENSITY} color={AMBIENT_COLOR} />

      {/* Key light — main character illumination from upper-right */}
      <directionalLight
        position={KEY_LIGHT_POSITION}
        intensity={KEY_LIGHT_INTENSITY}
        color={KEY_LIGHT_COLOR}
        castShadow={false}
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
    </>
  );
}
