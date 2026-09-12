import type { GraphicsPreset } from "../GraphicsQuality";
export const PALETTE = {
  stone: "#e8e3d8", shade: "#b5b5ae", darkStone: "#727e83", gold: "#c9a95a",
  banner: "#161d2a", water: "#4c8fa8", sky: "#85b9de", fog: "#c4d8e3",
  light: "#ffdfa0", foliage: "#496851", flowers: "#ded7d9",
};
export const REALM_QUALITY: Record<GraphicsPreset, { plants: number; islands: number; clouds: number; reflection: number; segments: number }> = {
  ultra: { plants: 150, islands: 6, clouds: 12, reflection: 512, segments: 48 },
  high: { plants: 100, islands: 5, clouds: 10, reflection: 384, segments: 32 },
  medium: { plants: 60, islands: 4, clouds: 8, reflection: 0, segments: 24 },
  low: { plants: 25, islands: 3, clouds: 5, reflection: 0, segments: 4 },
  potato: { plants: 8, islands: 3, clouds: 3, reflection: 0, segments: 1 },
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
