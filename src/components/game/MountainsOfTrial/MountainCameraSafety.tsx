"use client";
import { useLayoutEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Box3, Color, Mesh, MeshBasicMaterial, Raycaster, Triangle, Vector3 } from "three";
import { acceleratedRaycast, MeshBVH } from "three-mesh-bvh";
import type { OrbitControls } from "three-stdlib";
import { useGraphicsQuality } from "../GraphicsQuality";
import { useWorldProgress } from "../WorldProgress";
import { MOUNTAIN } from "./mountainConfig";

const RADIUS = .9;
type Collider = { mesh: Mesh; bounds: Box3; ground: boolean };

// OrbitControls runs at -1 and progression at -.5. Validate once, at 0,
// and never call controls.update after applying the safe transform.
export default function MountainCameraSafety() {
  const scene = useThree(s => s.scene);
  const { preset } = useGraphicsQuality();
  const { level } = useWorldProgress();
  const data = useRef({ colliders: [] as Collider[], desired: new Vector3(), final: new Vector3(), ready: false,
    ray: new Raycaster(), down: new Vector3(0, -1, 0), point: new Vector3(), direction: new Vector3(),
    normal: new Vector3(), triangle: new Triangle(), closest: { point: new Vector3(), distance: 0, faceIndex: 0 }, ticks: 0 });

  useLayoutEffect(() => {
    const d = data.current;
    scene.updateMatrixWorld(true);
    scene.traverse(object => {
      if (!(object instanceof Mesh) || object.type === "InstancedMesh" || object.userData.backgroundMountain) return;
      let parent = object as typeof object.parent;
      let obstacle = false;
      while (parent) { obstacle ||= !!parent.userData.cameraObstacle; parent = parent.parent; }
      if (!obstacle) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      if (materials.some(m => m.transparent)) return;
      const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld);
      geometry.boundsTree = new MeshBVH(geometry);
      geometry.computeBoundingBox();
      const mesh = new Mesh(geometry, new MeshBasicMaterial());
      mesh.name = object.name;
      mesh.raycast = acceleratedRaycast;
      d.colliders.push({ mesh, bounds: geometry.boundingBox!.clone(), ground: !!object.userData.cameraGround });
    });
    d.ray.firstHitOnly = true;
    d.ready = false;
    return () => {
      for (const c of d.colliders) { c.mesh.geometry.dispose(); (c.mesh.material as MeshBasicMaterial).dispose(); }
      d.colliders = [];
      d.ready = false;
    };
  }, [scene, preset, level]);

  // Keep the user's requested radius independent of collision displacement.
  useFrame(({ camera }) => {
    const d = data.current;
    if (d.ready && camera.position.distanceToSquared(d.final) < .000001) camera.position.copy(d.desired);
  }, -2);

  useFrame(({ camera, controls, gl }, delta) => {
    const orbit = controls as OrbitControls | undefined;
    if (!orbit) return;
    const d = data.current;
    d.desired.copy(camera.position);
    if (d.ready && d.final.distanceTo(camera.position) < 3)
      camera.position.lerpVectors(d.final, camera.position, 1 - Math.exp(-delta * 14));
    camera.position.x = Math.max(-MOUNTAIN.width / 2 + 2, Math.min(MOUNTAIN.width / 2 - 2, camera.position.x));
    camera.position.z = Math.max(MOUNTAIN.minZ + 2, Math.min(MOUNTAIN.maxZ - 2, camera.position.z));
    let groundHit = false;
    let clearance = Infinity;
    for (let pass = 0; pass < 6; pass++) {
      d.direction.subVectors(camera.position, orbit.target);
      let distance = d.direction.length();
      d.direction.normalize();
      d.ray.set(orbit.target, d.direction);
      d.ray.far = distance;
      for (const c of d.colliders) {
        const obstruction = d.ray.intersectObject(c.mesh, false)[0];
        if (obstruction) distance = Math.min(distance, Math.max(1.5, obstruction.distance - RADIUS));
      }
      camera.position.copy(orbit.target).addScaledVector(d.direction, distance);
      d.ray.far = Infinity;
      for (const c of d.colliders) {
        if (c.ground) {
          d.point.set(camera.position.x, c.bounds.max.y + 10, camera.position.z);
          d.ray.set(d.point, d.down);
          const hit = d.ray.intersectObject(c.mesh, false)[0];
          if (hit) { groundHit = true; camera.position.y = Math.max(camera.position.y, hit.point.y + RADIUS * 1.5); }
        }
        if (c.bounds.distanceToPoint(camera.position) > RADIUS) continue;
        const geometry = c.mesh.geometry;
        const hit = geometry.boundsTree!.closestPointToPoint(camera.position, d.closest);
        if (!hit) continue;
        const p = geometry.getAttribute("position"), index = geometry.index;
        const a = hit.faceIndex * 3;
        d.triangle.a.fromBufferAttribute(p, index ? index.getX(a) : a);
        d.triangle.b.fromBufferAttribute(p, index ? index.getX(a + 1) : a + 1);
        d.triangle.c.fromBufferAttribute(p, index ? index.getX(a + 2) : a + 2);
        d.triangle.getNormal(d.normal);
        d.direction.subVectors(camera.position, hit.point);
        const signed = d.direction.dot(d.normal);
        clearance = Math.min(clearance, signed);
        if (signed < RADIUS && (hit.distance < RADIUS || c.bounds.containsPoint(camera.position))) {
          camera.position.copy(hit.point).addScaledVector(d.normal, RADIUS + .05);
        }
      }
    }
    if (!groundHit) {
      camera.position.copy(d.ready ? d.final : orbit.target);
      if (!d.ready) camera.position.y += 6;
    }
    camera.lookAt(orbit.target);
    d.final.copy(camera.position);
    d.ready = true;
    if (process.env.NODE_ENV === "development" && ++d.ticks % 30 === 0) {
      gl.domElement.dataset.cameraSafety = JSON.stringify({ level, groundHit, clearance, camera: camera.position.toArray(), target: orbit.target.toArray(), desired: d.desired.toArray(), colliders: d.colliders.length, near: camera.near, far: camera.far, clear: gl.getClearColor(new Color()).getHexString(), alpha: gl.getClearAlpha() });
      if (!groundHit) console.warn("[CameraSafety] No terrain hit; restored safe position", level, d.desired.toArray());
    }
  }, 0);
  return null;
}
