import { type Region } from "@/types/game";
import { WORLD_REGIONS, normalizeLevel } from "./world";

export const REGIONS: Region[] = WORLD_REGIONS.map(region => ({ slug: region.id, name: region.name, levelRange: [region.levelStart, region.levelEnd] }));

export function getRegionForLevel(level: number): Region {
  return REGIONS.find(
    (r) => normalizeLevel(level) >= r.levelRange[0] && normalizeLevel(level) <= r.levelRange[1]
  ) ?? REGIONS[0];
}

/** Highest level playable in the MVP (Forest of Resolve ends at 10). */
export const MVP_MAX_LEVEL = 10;

/** XP required to advance from `level` to `level + 1`. */
export function xpForLevel(level: number): number {
  return 100 + level * 50;
}

/** Cumulative XP required to reach `level` (level 1 = 0 XP). */
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) total += xpForLevel(l);
  return total;
}

/** Derive the player level from accumulated lifetime XP, capped at the MVP max. */
export function levelForTotalXp(totalXp: number, maxLevel = MVP_MAX_LEVEL): number {
  let level = 1;
  while (level < maxLevel && totalXp >= totalXpForLevel(level + 1)) level++;
  return level;
}
