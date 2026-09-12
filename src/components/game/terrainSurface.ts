import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { createGroundSampler, normalizeAsset } from "./grounding";
export { normalizeAsset } from "./grounding";

const surfaces = new WeakMap<THREE.Object3D, ReturnType<typeof createGroundSampler>>();

// Match the two rendered scans exactly; placements follow their actual surface, not a flat Y.
export function useTerrainSurface() {
  const near = useGLTF("/environment/coast_rocks_01.glb");
  const far = useGLTF("/environment/coast_rocks_01-lod.glb");
  return useMemo(() => {
    const cached = surfaces.get(near.scene);
    if (cached) return cached;
    const a = normalizeAsset(near.scene, 35, undefined, true);
    a.position.set(0, -1.08, 0);
    const b = normalizeAsset(far.scene, 36);
    b.position.set(0, -1.8, -22);
    b.rotation.y = Math.PI;
    a.updateMatrixWorld(true);
    b.updateMatrixWorld(true);
    const sample = createGroundSampler([a, b]);
    surfaces.set(near.scene, sample);
    return sample;
  }, [near.scene, far.scene]);
}

export function useGroundHeight() {
  const sample = useTerrainSurface();
  return useMemo(() => (x: number, z: number) => sample(x, z).point.y, [sample]);
}
