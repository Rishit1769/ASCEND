"use client";
import { useEffect, useMemo, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { createGroundSampler, normalizeAsset } from "../grounding";
import { TerrainSurfaceContext } from "../terrainSurface";
import { createMountainGeometry } from "./MountainTerrain";

export function MountainSurface({ children }: { children: ReactNode }) {
  const { scene } = useGLTF("/environment/modular_fort_01-lod.glb");
  const surface = useMemo(() => {
    const ground = new THREE.Mesh(createMountainGeometry(150), new THREE.MeshBasicMaterial());
    ground.name = "mountain-ground-collision";
    const source = scene.getObjectByName("modular_fort_01_wall_walkway_straight_01") ?? scene;
    const bridge = normalizeAsset(source, 3.8);
    bridge.name = "mountain-broken-bridge-collision";
    bridge.scale.y *= .22;
    bridge.scale.z *= 1.35;
    bridge.position.set(-1.2, 7.95, -40);
    bridge.rotation.y = -.1;
    bridge.traverse(child => { if (child instanceof THREE.Mesh) { child.castShadow = true; child.receiveShadow = true; } });
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
    {children}
  </TerrainSurfaceContext.Provider>;
}
