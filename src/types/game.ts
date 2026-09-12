export interface PlayerAttributes {
  strength: number;
  intellect: number;
  focus: number;
  vitality: number;
  discipline: number;
}

export interface PlayerData {
  username: string;
  level: number;
  xp: number;
  xpRequired: number;
  gold: number;
  streak: number;
  attributes: PlayerAttributes;
}

export type RegionSlug =
  | "forgotten-shore"
  | "forest-of-resolve"
  | "mountains-of-trial"
  | "temple-of-knowledge"
  | "realm-of-ascension"
  | "celestial-heights"
  | "summit";

export interface Region {
  slug: RegionSlug;
  name: string;
  levelRange: [number, number];
}

export type NavItem = "quests" | "character" | "forge" | "journey" | "map";
