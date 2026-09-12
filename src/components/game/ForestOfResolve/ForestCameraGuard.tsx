"use client";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls } from "three-stdlib";

// Use trunk bases, not foliage, as camera obstacles. Build this list once after assets mount.
export default function ForestCameraGuard() {
  const obstacles = useRef<{ x: number; z: number; radius: number }[]>([]);
  const collect = useRef(true);
  useEffect(() => { collect.current = true; });
  useFrame(({ scene, camera, controls }) => {
    const orbit = controls as OrbitControls | undefined;
    if (!orbit) return;
    if (collect.current) {
      const found: typeof obstacles.current = [];
      const matrix = new THREE.Matrix4();
      const world = new THREE.Matrix4();
      const base = new THREE.Vector3();
      scene.updateMatrixWorld(true);
      scene.traverse(object => {
        if (!(object instanceof THREE.Mesh)) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        if (!materials.some(material => /bark/.test(material.name))) return;
        object.geometry.computeBoundingBox();
        const bounds = object.geometry.boundingBox!;
        const add = (transform: THREE.Matrix4) => {
          base.set((bounds.min.x + bounds.max.x) / 2, bounds.min.y, (bounds.min.z + bounds.max.z) / 2).applyMatrix4(transform);
          found.push({ x: base.x, z: base.z, radius: .8 });
        };
        if (object instanceof THREE.InstancedMesh) {
          for (let i = 0; i < object.count; i++) { object.getMatrixAt(i, matrix); world.multiplyMatrices(object.matrixWorld, matrix); add(world); }
        } else add(object.matrixWorld);
      });
      obstacles.current = found;
      collect.current = false;
    }
    const dx = camera.position.x - orbit.target.x;
    const dz = camera.position.z - orbit.target.z;
    const lengthSq = dx * dx + dz * dz;
    if (lengthSq < .01) return;
    let nearest = 1;
    for (const obstacle of obstacles.current) {
      const ox = obstacle.x - orbit.target.x, oz = obstacle.z - orbit.target.z;
      const t = (ox * dx + oz * dz) / lengthSq;
      if (t <= 0 || t > nearest) continue;
      const distanceSq = (ox - t * dx) ** 2 + (oz - t * dz) ** 2;
      if (distanceSq < obstacle.radius ** 2) nearest = Math.max(.32, t - Math.sqrt((obstacle.radius ** 2 - distanceSq) / lengthSq));
    }
    if (nearest < 1) {
      camera.position.lerp(orbit.target, 1 - nearest);
      camera.lookAt(orbit.target);
    }
  }, -.25);
  return null;
}
