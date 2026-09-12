export const PALETTE = {
  // Stone hierarchy — warm ivory with strong structural separation
  stone: "#D9CCB6",       // Main temple walls — warm ivory (not near-white)
  shade: "#9E9483",       // Recessed / structural stone (important for depth)
  darkStone: "#3E3A33",   // Deep recesses, window voids, under-ledge shadow
  stoneHighlight: "#EEE7DA", // Lighter raised trim / sunlit edges

  // Gold — rich, warm, metallic
  gold: "#9C6E22",        // Primary gold trim
  goldBright: "#D8B553",  // Highlight gold
  goldDark: "#5A3F12",    // Shadow gold

  // Banners — nearly black navy for maximum contrast
  banner: "#0A1020",
  bannerSecondary: "#101827",

  // Water — unmistakable blue/turquoise
  water: "#0B5E78",       // Deep water
  waterMid: "#178FA8",    // Mid depth
  waterShallow: "#4DB5C8", // Surface

  // Sky — clearly blue, paler toward the horizon
  sky: "#4E93C6",         // Celestial blue (zenith)
  skyMid: "#7FB6D8",      // Mid sky
  skyHorizon: "#C7DDEA",  // Pale horizon
  cloud: "#B4C9DA",       // Soft blue-grey cloud
  fog: "#A8C0D2",         // Blue-grey atmospheric fog

  // Lighting
  sunlight: "#FFD29A",    // Warm sunlight
  warmGlow: "#FFC96A",    // Warm accent

  // Vegetation — saturated emerald (no grey-green)
  foliage: "#3B7F52",     // Mid foliage
  foliageMid: "#3B7F52",
  foliageLight: "#5A9A63", // Sunlit foliage
  foliageDark: "#163B2A",  // Shadowed foliage

  // Flowers
  flowers: "#D8CDE0",     // Soft lavender

  // Shadow color for depth
  shadowBlue: "#6F8795",
};

export const REALM_QUALITY: Record<string, { plants: number; islands: number; clouds: number; reflection: number; segments: number }> = {
  ultra: { plants: 150, islands: 6, clouds: 12, reflection: 512, segments: 48 },
  high: { plants: 100, islands: 5, clouds: 10, reflection: 384, segments: 32 },
  medium: { plants: 60, islands: 4, clouds: 8, reflection: 0, segments: 24 },
  low: { plants: 25, islands: 3, clouds: 5, reflection: 0, segments: 4 },
  potato: { plants: 8, islands: 3, clouds: 3, reflection: 0, segments: 1 },
};

// ─── Realm camera composition ─────────────────────────────────────
// Single source of truth for the cinematic third-person framing.
// `offset` is relative to the hero; `target` is relative to the hero and
// points the camera forward along the walkway toward the temple.
export const REALM_CAMERA = {
  offset: [2.8, 5.6, 15.5] as [number, number, number],
  target: [0, 3.2, -16] as [number, number, number],
  fov: 52,
};

// Shared by visual stairs and the hero's sole probes.
export function realmHeight(x: number, z: number) {
  if (Math.abs(x) <= 6 && z <= -32 && z >= -44) return .3 + Math.min(24, Math.ceil((-z - 32) * 2)) * .25;
  if (Math.abs(x) <= 24 && z < -44 && z >= -68) return 6.3;
  if (x * x + (z - 8) ** 2 <= 100) return .3;
  if (Math.abs(x) <= 3 && z <= 8 && z >= -32) return .3;
  if (Math.abs(x) <= 20 && z <= 5 && z >= -33) return -.5;
  return -12;
}

export const REALM_AUDIO_HOOKS = ["soft-wind", "distant-waterfall", "temple-hum"] as const;
