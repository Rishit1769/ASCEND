"use client";

// ─── Tweakable constants ───────────────────────────────────────────
// Lighting — adjust intensities/colors to taste.
const AMBIENT_INTENSITY = 0.72; // Global fill (lower = moodier shadows)
const AMBIENT_COLOR = "#9AAAC2";

const KEY_LIGHT_INTENSITY = 2.05; // Moonlit primary light
const KEY_LIGHT_POSITION: [number, number, number] = [4, 7, 5];
const KEY_LIGHT_COLOR = "#8AA7C7";

const FILL_LIGHT_INTENSITY = 0.72; // Warm distant fire fill
const FILL_LIGHT_POSITION: [number, number, number] = [-3, 2, 2];
const FILL_LIGHT_COLOR = "#F2A93B";

const RIM_LIGHT_INTENSITY = 1.1; // Cool back/edge light for separation
const RIM_LIGHT_POSITION: [number, number, number] = [0, 3, -4];
const RIM_LIGHT_COLOR = "#8AA7C7";
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

      {/* Weak warm counter-rim keeps bronze armor separate from the cold shore. */}
      <pointLight
        position={[-4, 1.5, 3]}
        intensity={0.28}
        color="#E85D1F"
        distance={7}
        decay={2}
      />
    </>
  );
}
