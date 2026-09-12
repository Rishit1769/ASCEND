"use client";
import * as THREE from "three";
import type { GraphicsPreset } from "../GraphicsQuality";

export type MountainPoint = [number, number, number];

export interface MountainCheckpoint {
  level: number;
  name: string;
  description: string;
  position: MountainPoint;
  elevation: number;
  cloudLevel: number;
  cameraOffset: MountainPoint;
  snowIntensity: number;
  windStrength: number;
}

export const MOUNTAIN_CHECKPOINTS: MountainCheckpoint[] = [
  { level: 11, name: "Mountain Base", description: "The climb begins. Pine forest thins as the trail rises toward the broken crossing.", position: [0, 0, 10], elevation: 0, cloudLevel: 29, cameraOffset: [0, 3.4, 12.5], snowIntensity: 0, windStrength: .3 },
  { level: 12, name: "The Ascending Trail", description: "The path narrows. Exposed rock and old stair fragments lead higher.", position: [4, 4.2, -9], elevation: 4.2, cloudLevel: 20, cameraOffset: [-2, 4.2, 12], snowIntensity: .12, windStrength: .52 },
  { level: 13, name: "The Broken Crossing", description: "A damaged stone bridge spans the ravine. Waterfalls drop into mist below.", position: [-1.2, 8.2, -29], elevation: 8.2, cloudLevel: 11, cameraOffset: [0, 8.5, 27], snowIntensity: .28, windStrength: .72 },
  { level: 14, name: "Temple Approach", description: "Snow accumulates. Giant statues carved into the mountain guard ancient stairs.", position: [5.2, 14.5, -50], elevation: 14.5, cloudLevel: 4, cameraOffset: [-3, 9.5, 32], snowIntensity: .62, windStrength: .9 },
  { level: 15, name: "The Mountain Gate", description: "The final climb. The monumental gate rises before the summit.", position: [0, 21, -58], elevation: 21, cloudLevel: -5, cameraOffset: [0, 8, 38], snowIntensity: 1, windStrength: 1 },
];

export const MOUNTAIN = {
  width: 118,
  length: 126,
  centerZ: -31,
  minZ: -94,
  maxZ: 32,
  wind: { direction: new THREE.Vector2(.86, -.5).normalize(), baseSpeed: .62, gustFrequency: .48, gustStrength: .72 },
};

export const MOUNTAIN_QUALITY: Record<GraphicsPreset, { segments: number; trees: number; rocks: number; debris: number; clouds: number; mist: number; snow: number; anisotropy: number; shadowCasters: boolean }> = {
  ultra: { segments: 180, trees: 82, rocks: 120, debris: 180, clouds: 18, mist: 120, snow: 180, anisotropy: 16, shadowCasters: true },
  high: { segments: 150, trees: 64, rocks: 96, debris: 120, clouds: 14, mist: 82, snow: 120, anisotropy: 8, shadowCasters: true },
  medium: { segments: 118, trees: 48, rocks: 68, debris: 70, clouds: 10, mist: 52, snow: 58, anisotropy: 4, shadowCasters: true },
  low: { segments: 82, trees: 30, rocks: 38, debris: 20, clouds: 6, mist: 20, snow: 10, anisotropy: 2, shadowCasters: false },
  potato: { segments: 54, trees: 16, rocks: 20, debris: 0, clouds: 4, mist: 0, snow: 0, anisotropy: 1, shadowCasters: false },
};

export function randomSequence(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function pathX(z: number) {
  return Math.sin((z + 8) * .115) * 4.6 + Math.sin((z + 31) * .037) * 2.4;
}

export function pathElevation(z: number) {
  const t = THREE.MathUtils.clamp((10 - z) / 82, 0, 1);
  return 22.4 * Math.pow(t, 1.12) + Math.sin(z * .16) * .25;
}

function ridgeNoise(x: number, z: number) {
  return Math.sin(x * .19 + z * .07) * Math.cos(z * .13) + Math.sin(x * .047 - z * .21) * 1.4;
}

export function mountainHeight(x: number, z: number) {
  const path = pathX(z);
  const dz = Math.abs(z + 29);
  const pathDistance = Math.abs(x - path);
  const climb = pathElevation(z);
  const trail = 1 - smoothstep(1.4, 6.8, pathDistance);
  const side = Math.max(0, pathDistance - 2.2);
  const gorge = Math.exp(-Math.pow(dz / 8.8, 2)) * smoothstep(4.2, 13.5, pathDistance) * 17;
  const cliffWalls = Math.pow(THREE.MathUtils.clamp(side / 22, 0, 1), 1.8) * (16 + (10 - z) * .17);
  const farPeaks = Math.pow(THREE.MathUtils.clamp((-z - 35) / 48, 0, 1), 1.3) * (Math.abs(x) * .1 + 18);
  const rough = ridgeNoise(x, z) * (.45 + side * .045);
  const stairTerrace = z < -45 ? Math.sin((z + 72) * 1.9) * .22 * smoothstep(6.2, 1.4, pathDistance) : 0;
  return climb + cliffWalls + farPeaks + rough + stairTerrace - gorge * (1 - trail * .82);
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function checkpointForLevel(level: number) {
  return MOUNTAIN_CHECKPOINTS.find(item => item.level === level) ?? MOUNTAIN_CHECKPOINTS[0];
}

export function createMountainGeometry(segments = 150) {
  const geometry = new THREE.PlaneGeometry(MOUNTAIN.width, MOUNTAIN.length, segments, segments);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0, MOUNTAIN.centerZ);
  const positions = geometry.getAttribute("position");
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    positions.setY(i, mountainHeight(x, z));
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}
