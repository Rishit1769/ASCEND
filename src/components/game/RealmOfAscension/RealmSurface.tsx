"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { createGroundSampler } from "../grounding";
import { TerrainSurfaceContext } from "../terrainSurface";
import { createRealmGeometry } from "./realmConfig";

export function RealmSurface({ children }: { children: ReactNode }) {
  const surface = useMemo(() => {
    const ground = new THREE.Mesh(createRealmGeometry());
    ground.name = "realm-platform-ground";
    ground.receiveShadow = true;
    const sample = createGroundSampler([ground]);
    return { ground, sample };
  }, []);
  useEffect(() => () => {
    surface.ground.geometry.dispose();
    (surface.ground.material as THREE.Material | undefined)?.dispose();
  }, [surface]);
  return <TerrainSurfaceContext.Provider value={surface.sample}>
    <primitive object={surface.ground}>
      <meshStandardMaterial color="#9a9ba0" roughness={.86} metalness={.04} />
    </primitive>
    {children}
  </TerrainSurfaceContext.Provider>;
}
