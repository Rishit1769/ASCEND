"use client";

// ─── Tweakable constants ───────────────────────────────────────────
// Lighting — adjust intensities/colors to taste.
// The character was too dark; these are boosted significantly.
const AMBIENT_INTENSITY = 1.5;
const AMBIENT_COLOR = "#c8c8e0";

const KEY_LIGHT_INTENSITY = 3;
const KEY_LIGHT_POSITION: [number, number, number] = [5, 8, 5];
const KEY_LIGHT_COLOR = "#f0e8d8";

const FILL_LIGHT_INTENSITY = 1.2;
const FILL_LIGHT_POSITION: [number, number, number] = [-3, 4, 3];
const FILL_LIGHT_COLOR = "#d4a543";

const RIM_LIGHT_INTENSITY = 0.8;
const RIM_LIGHT_POSITION: [number, number, number] = [0, 3, -3];
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
