import { type Region, type RegionSlug } from "@/types/game";

export const REGIONS: Region[] = [
  { slug: "forgotten-shore", name: "The Forgotten Shore", levelRange: [1, 4] },
  { slug: "forest-of-resolve", name: "Forest of Resolve", levelRange: [5, 9] },
  { slug: "mountains-of-trial", name: "Mountains of Trial", levelRange: [10, 14] },
  { slug: "temple-of-knowledge", name: "Temple of Knowledge", levelRange: [15, 19] },
  { slug: "summit", name: "Realm of Ascension", levelRange: [20, Infinity] },
];

export function getRegionForLevel(level: number): Region {
  return REGIONS.find(
    (r) => level >= r.levelRange[0] && level <= r.levelRange[1]
  ) ?? REGIONS[0];
}

export function xpForLevel(level: number): number {
  return 500 + level * 125;
}

export function getRegionSlug(level: number): RegionSlug {
  return getRegionForLevel(level).slug;
}
