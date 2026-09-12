"use client";

// ─── Tweakable constants ───────────────────────────────────────────
// Lighting — adjust intensities/colors to taste.
const AMBIENT_INTENSITY = 1.2; // Global fill (lower = moodier shadows)
const AMBIENT_COLOR = "#9AAAC2";

const KEY_LIGHT_INTENSITY = 2.5; // Moonlit primary light
const KEY_LIGHT_POSITION: [number, number, number] = [5, 10, 6];
const KEY_LIGHT_COLOR = "#9bbce0";

const FILL_LIGHT_INTENSITY = 0.72; // Warm distant fire fill
const FILL_LIGHT_POSITION: [number, number, number] = [-3, 2, 2];
const FILL_LIGHT_COLOR = "#F2A93B";

const RIM_LIGHT_INTENSITY = 8; // Cool back/edge light for separation
const RIM_LIGHT_POSITION: [number, number, number] = [2, 3, -2];
const RIM_LIGHT_COLOR = "#8AA7C7";
// ───────────────────────────────────────────────────────────────────

export default function SceneLighting() {
  return (
    <>
      {/* Global fill — lifts everything out of pure black */}
      <hemisphereLight intensity={AMBIENT_INTENSITY} color={AMBIENT_COLOR} groundColor="#30271f" />

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
        position={[-2, 2, -1]}
        intensity={2}
        color="#E85D1F"
        distance={7}
        decay={2}
      />
    </>
  );
}
