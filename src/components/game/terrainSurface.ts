import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export function normalizeAsset(source: THREE.Object3D, width?: number, height?: number, ground = false) {
  const clone = source.clone(true);
  const root = new THREE.Group();
  root.add(clone);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const factor = height ? height / size.y : (width ?? size.x) / size.x;
  const center = box.getCenter(new THREE.Vector3());
  clone.position.sub(new THREE.Vector3(center.x, box.min.y, center.z));
  root.scale.setScalar(factor);
  root.updateMatrixWorld(true);
  if (ground) {
    const ray = new THREE.Raycaster(new THREE.Vector3(0, 100, 0), new THREE.Vector3(0, -1, 0));
    const hit = ray.intersectObject(root, true)[0];
    if (hit) clone.position.y -= hit.point.y / factor;
  }
  root.updateMatrixWorld(true);
  return root;
}

// Match the two rendered scans exactly; placements follow their actual surface, not a flat Y.
export function useGroundHeight() {
  const near = useGLTF("/environment/coast_rocks_01.glb");
  const far = useGLTF("/environment/coast_rocks_01-lod.glb");
  return useMemo(() => {
    const a = normalizeAsset(near.scene, 35, undefined, true);
    a.position.set(0, -1.08, 0);
    const b = normalizeAsset(far.scene, 36);
    b.position.set(0, -1.8, -22);
    b.rotation.y = Math.PI;
    a.updateMatrixWorld(true);
    b.updateMatrixWorld(true);
    const ray = new THREE.Raycaster();
    return (x: number, z: number) => {
      ray.set(new THREE.Vector3(x, 30, z), new THREE.Vector3(0, -1, 0));
      return Math.max(-1.85, ray.intersectObjects([a, b], true)[0]?.point.y ?? -1.85);
    };
  }, [near.scene, far.scene]);
}
