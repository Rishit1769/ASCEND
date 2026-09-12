import * as THREE from "three";
import { acceleratedRaycast, MeshBVH } from "three-mesh-bvh";

export const SEA_LEVEL = -1.62;
export const SEABED_Y = -3.1;
export type GroundHit = { point: THREE.Vector3; normal: THREE.Vector3; surface: string };
export type GroundSampler = (x: number, z: number) => GroundHit;

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

// Only these collision meshes are queried. Hero, water, foliage and architecture are excluded.
export function createGroundSampler(terrain: THREE.Object3D[]): GroundSampler {
  const meshes: THREE.Mesh[] = [];
  for (const root of terrain) {
    root.updateMatrixWorld(true);
    root.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry = object.geometry.clone();
      object.geometry.boundsTree = new MeshBVH(object.geometry);
      object.raycast = acceleratedRaycast;
      meshes.push(object);
    });
  }
  const ray = new THREE.Raycaster();
  ray.firstHitOnly = true;
  const normalMatrix = new THREE.Matrix3();
  return (x, z) => {
    ray.set(new THREE.Vector3(x, 60, z), new THREE.Vector3(0, -1, 0));
    const hit = ray.intersectObjects(meshes, false)[0];
    if (!hit || hit.point.y < SEABED_Y) return { point: new THREE.Vector3(x, SEABED_Y, z), normal: new THREE.Vector3(0, 1, 0), surface: "gravel-seabed" };
    const normal = (hit.face?.normal ?? new THREE.Vector3(0, 1, 0)).clone().applyMatrix3(normalMatrix.getNormalMatrix(hit.object.matrixWorld)).normalize();
    if (normal.y < 0) normal.negate();
    return { point: hit.point, normal, surface: hit.object.name };
  };
}

export function findDryGround(sample: GroundSampler, x: number, z: number): GroundHit {
  const center = sample(x, z);
  if (center.point.y > SEA_LEVEL + .06) return center;
  for (const radius of [.3, .6, 1, 1.6, 2.4, 3.2, 4.8, 6.4]) {
    for (let i = 0; i < 12; i++) {
      const angle = i * Math.PI / 6 - Math.PI / 2;
      const hit = sample(x + Math.cos(angle) * radius, z + Math.sin(angle) * radius);
      if (hit.point.y > SEA_LEVEL + .06 && hit.normal.y > .55) return hit;
    }
  }
  return center;
}

export function surfaceAlignment(normal: THREE.Vector3, amount: number) {
  const up = new THREE.Vector3(0, 1, 0);
  return new THREE.Quaternion().setFromUnitVectors(up, up.clone().lerp(normal, THREE.MathUtils.clamp(amount, 0, .35)).normalize());
}

export function snapToTerrain(object: THREE.Object3D, sample: GroundSampler, options: { offset?: number; burial?: number; normalAlignment?: number; dry?: boolean; footprint?: boolean } = {}) {
  object.updateWorldMatrix(true, true);
  const position = object.getWorldPosition(new THREE.Vector3());
  const initialBounds = new THREE.Box3().setFromObject(object);
  const baseBounds = new THREE.Box3();
  const vertex = new THREE.Vector3();
  // Tree canopies and off-center GLBs do not identify the actual point of support.
  object.traverse(child => {
    if (!(child instanceof THREE.Mesh)) return;
    const count = child.geometry.getAttribute("position").count;
    for (let i = 0; i < count; i++) {
      child.getVertexPosition(i, vertex).applyMatrix4(child.matrixWorld);
      if (vertex.y <= initialBounds.min.y + .12) baseBounds.expandByPoint(vertex);
    }
  });
  const base = (baseBounds.isEmpty() ? initialBounds : baseBounds).getCenter(new THREE.Vector3());
  const hit = options.dry ? findDryGround(sample, base.x, base.z) : sample(base.x, base.z);
  if (options.normalAlignment) {
    const orientation = object.getWorldQuaternion(new THREE.Quaternion()).premultiply(surfaceAlignment(hit.normal, options.normalAlignment));
    object.quaternion.copy(object.parent ? object.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(orientation) : orientation);
  }
  object.updateWorldMatrix(true, true);
  const bounds = new THREE.Box3().setFromObject(object);
  const burial = bounds.getSize(new THREE.Vector3()).y * (options.burial ?? 0);
  let groundY = hit.point.y;
  if (options.footprint) {
    const heights = [groundY];
    for (const x of [bounds.min.x, bounds.max.x]) for (const z of [bounds.min.z, bounds.max.z]) {
      const y = sample(x + hit.point.x - base.x, z + hit.point.z - base.z).point.y;
      if (!options.dry || y > SEA_LEVEL) heights.push(y);
    }
    heights.sort((a, b) => a - b);
    groundY = heights[Math.floor((heights.length - 1) * .25)];
  }
  const target = position.clone().add(new THREE.Vector3(hit.point.x - base.x, groundY - bounds.min.y + (options.offset ?? 0) - burial, hit.point.z - base.z));
  object.position.copy(object.parent ? object.parent.worldToLocal(target) : target);
  object.updateWorldMatrix(true, true);
  // A scan's lowest point may be off-center. Remove any remaining gap at its real base vertices.
  const placedBounds = new THREE.Box3().setFromObject(object);
  let contactGap = Infinity;
  object.traverse(child => {
    if (!(child instanceof THREE.Mesh)) return;
    const count = child.geometry.getAttribute("position").count;
    for (let i = 0; i < count; i++) {
      child.getVertexPosition(i, vertex).applyMatrix4(child.matrixWorld);
      if (vertex.y > placedBounds.min.y + .18) continue;
      contactGap = Math.min(contactGap, vertex.y - sample(vertex.x, vertex.z).point.y);
    }
  });
  const desiredGap = (options.offset ?? 0) - burial;
  if (Number.isFinite(contactGap) && contactGap > desiredGap) {
    const corrected = object.getWorldPosition(new THREE.Vector3());
    corrected.y -= contactGap - desiredGap;
    object.position.copy(object.parent ? object.parent.worldToLocal(corrected) : corrected);
    object.updateWorldMatrix(true, true);
    contactGap = desiredGap;
  }
  object.userData.terrainContact = { surface: hit.surface, contactGap, burial };
  return hit;
}
