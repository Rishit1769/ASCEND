"use client";
import { useMemo, type ReactNode } from "react";
import { Vector3 } from "three";
import { TerrainSurfaceContext } from "../terrainSurface";
import { realmHeight } from "./realmConfig";
import type { GroundSampler } from "../grounding";
export function RealmSurface({ children }: { children: ReactNode }) {
  const sample = useMemo<GroundSampler>(() => (x, z) => ({
    point: new Vector3(x, realmHeight(x, z), z), normal: new Vector3(0, 1, 0), surface: "ascension-stone",
  }), []);
  return <TerrainSurfaceContext.Provider value={sample}>{children}</TerrainSurfaceContext.Provider>;
}
