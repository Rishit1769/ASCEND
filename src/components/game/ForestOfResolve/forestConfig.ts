import type { GraphicsPreset } from "../GraphicsQuality";
import { PlaneGeometry } from "three";

export const FOREST = {
  width: 160, length: 180, centerZ: -24,
  segments: { ultra: 160, high: 140, medium: 100, low: 64, potato: 48 } as Record<GraphicsPreset, number>,
  waterLevel: -.48,
  wind: { speed: .55, strength: .014, flutter: .004 },
};
export const FOREST_REFLECTION: Record<GraphicsPreset, { enabled: boolean; resolution: number; cadence: number }> = {
  ultra: { enabled: true, resolution: 512, cadence: 1000 / 24 },
  high: { enabled: false, resolution: 0, cadence: 0 },
  medium: { enabled: false, resolution: 0, cadence: 0 },
  low: { enabled: false, resolution: 0, cadence: 0 },
  potato: { enabled: false, resolution: 0, cadence: 0 },
};
export const FOREST_QUALITY: Record<GraphicsPreset, { trees: number; ferns: number; rocks: number; leaves: number; anisotropy: number }> = {
  ultra: { trees: 170, ferns: 650, rocks: 95, leaves: 90, anisotropy: 16 },
  high: { trees: 145, ferns: 480, rocks: 75, leaves: 64, anisotropy: 8 },
  medium: { trees: 115, ferns: 300, rocks: 55, leaves: 32, anisotropy: 4 },
  low: { trees: 85, ferns: 140, rocks: 35, leaves: 0, anisotropy: 2 },
  potato: { trees: 65, ferns: 75, rocks: 22, leaves: 0, anisotropy: 1 },
};
export const pathX = (z: number) => Math.sin(z * .19) * 1.65;
export const streamZ = (x: number) => -18 + Math.sin(x * .13) * 3;
export function forestHeight(x: number, z: number) {
  const path = Math.abs(x - pathX(z));
  const hills = (Math.sin(x * .19 + z * .12) * .55 + Math.cos(z * .24 - x * .13) * .38 + .95);
  const blend = Math.max(0, Math.min(1, (path - 1.4) / 4.6));
  const bank = blend * blend * (3 - 2 * blend);
  const floor = .12 + hills * bank + Math.sin(x * 1.9 + z * 1.3) * .045 * bank;
  const channel = Math.exp(-Math.pow((z - streamZ(x)) / 2.2, 4));
  const pool = Math.exp(-((x - 7) ** 2 / 15 + (z + 12) ** 2 / 9));
  const waterfallRun = Math.exp(-Math.pow((x - 9) / 2.1, 4)) * (z < -17 && z > -51 ? 1 : 0);
  const perimeter = Math.max(0, Math.abs(x) - 29) * .17 + Math.max(0, -z - 53) * .25;
  return floor - Math.max(channel * 1.6, pool * 1.5, waterfallRun * 2.2) + perimeter;
}
export function randomSequence(seed: number) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}

export function createForestGeometry(segments: number = 160) {
  const geometry = new PlaneGeometry(FOREST.width, FOREST.length, segments, segments);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0, FOREST.centerZ);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) positions.setY(i, forestHeight(positions.getX(i), positions.getZ(i)));
  geometry.computeVertexNormals();
  return geometry;
}
