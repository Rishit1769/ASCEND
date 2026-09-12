import type { RegionSlug } from "../types/game";

export type WorldPoint = [number, number, number];
export type TerrainLayer = "rock" | "dirt" | "gravel" | "moss" | "mud" | "wet-rock" | "sand" | "snow" | "forest-floor" | "paving";
export interface Checkpoint {
  id: string;
  level: number;
  name: string;
  description: string;
  worldPosition: WorldPoint;
  heroRotation: number;
  cameraOffset: WorldPoint;
  mapPosition: [number, number];
  nextCheckpoint: number | null;
}
export interface WorldRegion {
  id: RegionSlug;
  name: string;
  levelStart: number;
  levelEnd: number;
  theme: string;
  landmark: string;
  characterStage: string;
  status: "available" | "assets-required";
  terrainLayers: TerrainLayer[];
  atmosphere: { fog: string; density: number; sunIntensity: number };
  requiredAssets: string[];
  checkpoints: Checkpoint[];
}

const definitions: Omit<WorldRegion, "checkpoints">[] = [
  { id: "forgotten-shore", name: "The Forgotten Shore", levelStart: 1, levelEnd: 5, theme: "Beginning. Isolation. Discovery.", landmark: "Ancient Sanctuary", characterStage: "Wanderer", status: "available", terrainLayers: ["rock", "sand", "gravel", "moss", "wet-rock"], atmosphere: { fog: "#687f91", density: .022, sunIntensity: 2.8 }, requiredAssets: [] },
  { id: "forest-of-resolve", name: "Forest of Resolve", levelStart: 6, levelEnd: 10, theme: "Discipline. Consistency. Persistence.", landmark: "Guardian Tree and Gate", characterStage: "Warrior", status: "available", terrainLayers: ["forest-floor", "mud", "moss", "rock"], atmosphere: { fog: "#526963", density: .023, sunIntensity: 2.2 }, requiredAssets: [] },
  { id: "mountains-of-trial", name: "Mountains of Trial", levelStart: 11, levelEnd: 15, theme: "Difficulty. Pressure. Endurance.", landmark: "Mountain Temple", characterStage: "Champion", status: "available", terrainLayers: ["rock", "gravel", "moss", "snow"], atmosphere: { fog: "#8b9eac", density: .016, sunIntensity: 3.2 }, requiredAssets: ["Traversable mountain trail terrain with collision", "Broken bridge and mountain temple", "Waterfall and scree PBR set"] },
  { id: "temple-of-knowledge", name: "Temple of Knowledge", levelStart: 16, levelEnd: 20, theme: "Learning. Intellect. Mastery.", landmark: "Great Archive", characterStage: "Champion", status: "assets-required", terrainLayers: ["paving", "dirt", "moss", "rock"], atmosphere: { fog: "#b4b6b2", density: .014, sunIntensity: 3 }, requiredAssets: ["Archive architecture, courtyard and stairs", "Scholar statues, rune stones and fountain", "Weathered paving PBR set"] },
  { id: "realm-of-ascension", name: "Realm of Ascension", levelStart: 21, levelEnd: 25, theme: "Transformation. Power. New limits.", landmark: "Ascendant Sanctum", characterStage: "Ascendant", status: "assets-required", terrainLayers: ["paving", "rock", "moss"], atmosphere: { fog: "#b2c4cf", density: .012, sunIntensity: 3.5 }, requiredAssets: ["High-altitude geological terraces", "Cloud bridge, sanctum and throne", "Pale mineral stone PBR set"] },
  { id: "celestial-heights", name: "The Celestial Heights", levelStart: 26, levelEnd: 30, theme: "Mastery. Perspective. The final ascent.", landmark: "Summit Gate", characterStage: "Ascendant / Legend", status: "assets-required", terrainLayers: ["snow", "rock", "paving"], atmosphere: { fog: "#c4d6e0", density: .009, sunIntensity: 3.7 }, requiredAssets: ["Alpine pass and summit stair terrain", "Celestial ruins and summit gate", "Snow and ice PBR set"] },
  { id: "summit", name: "The Summit", levelStart: 31, levelEnd: Infinity, theme: "Achievement. Mastery. Legacy.", landmark: "Ascension Throne", characterStage: "Legend", status: "assets-required", terrainLayers: ["snow", "rock", "paving", "moss"], atmosphere: { fog: "#c9d6dd", density: .006, sunIntensity: 3.4 }, requiredAssets: ["Summit sanctuary and panoramic terrain", "Ascension throne and journey monuments"] },
];
const names = [
  ["The Landing", "The Drowned Path", "The Forgotten Ruins", "The Sanctuary Approach", "The First Gate"],
  ["Forest Threshold", "Rootbound Trail", "Shrine of Resolve", "The Deep Grove", "The Guardian Clearing"],
  ["Mountain Base", "The Ascending Trail", "The Broken Crossing", "Temple Approach", "The Mountain Gate"],
  ["Outer Courtyard", "Hall of Scholars", "The Rune Garden", "Stairway of Wisdom", "The Great Archive"],
  ["Ascendant Gate", "Cloud Bridge", "Hall of Ascendants", "The High Sanctum", "Ascension Throne"],
  ["The High Pass", "Stairway Above the Clouds", "The Celestial Ruins", "The Final Ascent", "The Summit Gate"],
  ["The Summit"],
];
const shorePositions: WorldPoint[] = [[0, 0, 6.5], [.5, 0, 4], [-.5, 0, -2], [0, 0, -10], [0, 0, -21]];
const forestPositions: WorldPoint[] = [8, -1, -12, -23, -34].map(z => [Math.sin(z * .19) * 1.65, 0, z]);
const mountainPositions: WorldPoint[] = [[0, 0, 10], [4, 4.2, -9], [-1.2, 8.2, -29], [5.2, 14.5, -50], [0, 21, -58]];
const mountainCameraOffsets: WorldPoint[] = [[0, 3.4, 12.5], [-2, 4.2, 12], [6, 4, 14], [-3, 9.5, 32], [0, 8, 38]];
const shoreDescriptions = ["Journey Begins. Beyond the tide, an ancient sanctuary waits.", "A ruined path rises through wet stone and moss.", "Broken masonry marks the first traces of the old world.", "The sanctuary rises above the final approach.", "The first gate opens toward the Forest of Resolve."];
const mapCenters = [225, 400, 280, 430, 300, 400, 325];

export const WORLD_REGIONS: WorldRegion[] = definitions.map((region, index) => ({
  ...region,
  checkpoints: names[index].map((name, local) => {
    const level = region.levelStart + local;
    return {
      id: `${region.id}-${level}`, level, name,
      description: index === 0 ? shoreDescriptions[local] : `${name}. ${region.theme} The path leads toward ${region.landmark}.`,
      worldPosition: index === 0 ? shorePositions[local] : index === 1 ? forestPositions[local] : index === 2 ? mountainPositions[local] : [0, 0, -local * 5],
      heroRotation: Math.PI,
      cameraOffset: index === 2 ? mountainCameraOffsets[local] : index === 1 ? [0, 3.3, 9.8] : [0, 2.8, 8.2],
      mapPosition: [mapCenters[index] + Math.sin(local * 1.3 + index) * 65, 1400 - index * 205 - local * 33],
      nextCheckpoint: level < 31 ? level + 1 : null,
    };
  }),
}));
export const WORLD_CHECKPOINTS = WORLD_REGIONS.flatMap(region => region.checkpoints);
export const ASCENSION = { tier: 0, futureTiers: ["Ascension I", "Ascension II", "Ascension III"] };
export function normalizeLevel(level: number) { return Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1; }
export function resolveWorld(level: number) {
  const safe = normalizeLevel(level);
  const region = WORLD_REGIONS.find(region => safe >= region.levelStart && safe <= region.levelEnd)!;
  return { region, checkpoint: region.checkpoints[Math.min(safe - region.levelStart, region.checkpoints.length - 1)] };
}
export function levelRange(region: WorldRegion) { return Number.isFinite(region.levelEnd) ? `Levels ${region.levelStart}-${region.levelEnd}` : `Level ${region.levelStart}+`; }
