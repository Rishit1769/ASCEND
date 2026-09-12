import { type Region, type RegionSlug } from "@/types/game";
import { WORLD_REGIONS, normalizeLevel } from "./world";

export const REGIONS: Region[] = WORLD_REGIONS.map(region => ({ slug: region.id, name: region.name, levelRange: [region.levelStart, region.levelEnd] }));

export function getRegionForLevel(level: number): Region {
  return REGIONS.find(
    (r) => normalizeLevel(level) >= r.levelRange[0] && normalizeLevel(level) <= r.levelRange[1]
  ) ?? REGIONS[0];
}

export function xpForLevel(level: number): number {
  return 500 + level * 125;
}

export function getRegionSlug(level: number): RegionSlug {
  return getRegionForLevel(level).slug;
}
