"use client";
import { useEffect, useMemo, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { createGroundSampler, normalizeAsset } from "../grounding";
import { TerrainSurfaceContext } from "../terrainSurface";
import { createForestGeometry } from "./ForestTerrain";

export function ForestSurface({ children }: { children: ReactNode }) {
  const { scene } = useGLTF("/environment/modular_fort_01-lod.glb");
  const surface = useMemo(() => {
    const ground = new THREE.Mesh(createForestGeometry());
    ground.name = "forest-floor";
    const source = scene.getObjectByName("modular_fort_01_wall_walkway_straight_01");
    if (!source) throw new Error("Forest bridge asset is missing");
    const bridge = normalizeAsset(source, 3.4);
    bridge.scale.y *= .15;
    bridge.scale.z *= .65;
    bridge.position.set(0, -1, -18);
    bridge.name = "forest-stone-bridge";
    bridge.traverse(child => { if (child instanceof THREE.Mesh) { child.receiveShadow = true; child.castShadow = true; } });
    const original = ground.geometry;
    const sample = createGroundSampler([ground, bridge]);
    original.dispose();
    return { ground, bridge, sample };
  }, [scene]);
  useEffect(() => () => {
    surface.ground.geometry.dispose();
    (surface.ground.material as THREE.Material).dispose();
    surface.bridge.traverse(child => { if (child instanceof THREE.Mesh) child.geometry.dispose(); });
  }, [surface]);
  return <TerrainSurfaceContext.Provider value={surface.sample}>
    <primitive object={surface.bridge} dispose={null} />
    {children}
  </TerrainSurfaceContext.Provider>;
}
