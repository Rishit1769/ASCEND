export interface MountainCheckpoint {
  level: number;
  name: string;
  description: string;
  position: [number, number, number];
  elevation: number;
  cloudLevel: number;
  cameraOffset: [number, number, number];
  snowIntensity: number;
  windStrength: number;
}

export const MOUNTAIN_CHECKPOINTS: MountainCheckpoint[] = [
  {
    level: 11,
    name: "Mountain Base",
    description: "The climb begins. Pine forest thins as the trail rises toward the broken crossing.",
    position: [0, 0, 8],
    elevation: 0,
    cloudLevel: 30,
    cameraOffset: [0, 2.8, 8.2],
    snowIntensity: 0,
    windStrength: 0.3,
  },
  {
    level: 12,
    name: "The Ascending Trail",
    description: "The path narrows. Exposed rock and old stair fragments lead higher.",
    position: [2, 3, -6],
    elevation: 3,
    cloudLevel: 18,
    cameraOffset: [0, 3.2, 8.5],
    snowIntensity: 0.1,
    windStrength: 0.5,
  },
  {
    level: 13,
    name: "The Broken Crossing",
    description: "A damaged stone bridge spans the ravine. Waterfalls drop into mist below.",
    position: [-1, 7, -18],
    elevation: 7,
    cloudLevel: 10,
    cameraOffset: [0, 3.5, 9],
    snowIntensity: 0.25,
    windStrength: 0.7,
  },
  {
    level: 14,
    name: "Temple Approach",
    description: "Snow accumulates. Giant statues carved into the mountain guard ancient stairs.",
    position: [0, 12, -32],
    elevation: 12,
    cloudLevel: 5,
    cameraOffset: [0, 4, 10],
    snowIntensity: 0.6,
    windStrength: 0.85,
  },
  {
    level: 15,
    name: "The Mountain Gate",
    description: "The final climb. The monumental gate rises before the summit.",
    position: [0, 18, -48],
    elevation: 18,
    cloudLevel: 0,
    cameraOffset: [0, 4.5, 11],
    snowIntensity: 1,
    windStrength: 1,
  },
];

export interface MountainAtmosphere {
  fogColor: string;
  fogDensity: number;
  sunIntensity: number;
}

export const MOUNTAIN_ATMOSPHERE: MountainAtmosphere = {
  fogColor: "#8b9eac",
  fogDensity: 0.016,
  sunIntensity: 3.2,
};

export interface MountainWind {
  direction: [number, number, number];
  baseSpeed: number;
  gustFrequency: number;
  gustStrength: number;
}

export const MOUNTAIN_WIND: MountainWind = {
  direction: [1, 0, -0.4],
  baseSpeed: 0.6,
  gustFrequency: 0.8,
  gustStrength: 0.4,
};

export interface MountainTerrainLayers {
  level: number;
  layers: string[];
}

export const TERRAIN_LAYERS: MountainTerrainLayers[] = [
  { level: 11, layers: ["moss", "dirt", "gravel", "pine-needles"] },
  { level: 12, layers: ["gravel", "fractured-rock", "scree", "moss"] },
  { level: 13, layers: ["rock", "scree", "gravel", "snow"] },
  { level: 14, layers: ["exposed-rock", "cracked-paving", "snow", "ice"] },
  { level: 15, layers: ["rock", "snow", "ice", "ancient-stone"] },
];
