"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, Raycaster, Vector3, type Intersection, type Object3D } from "three";
import type { OrbitControls } from "three-stdlib";
import { realmHeight } from "./realmConfig";
export default function RealmCameraGuard() {
  const storage = useRef({ ray: new Raycaster(), direction: new Vector3(), objects: [] as Object3D[], hits: [] as Intersection[] });
  useFrame(({ scene, camera, controls, gl }) => {
    const scratch = storage.current;
    const orbit = controls as OrbitControls | undefined;
    if (!orbit) return;
    const floor = Math.max(.3, realmHeight(camera.position.x, camera.position.z));
    camera.position.y = Math.max(camera.position.y, floor + 1.1);
    scratch.objects.length = 0;
    scene.traverse(o => { if (o instanceof Mesh && o.userData.realmObstacle) scratch.objects.push(o); });
    scratch.direction.copy(camera.position).sub(orbit.target);
    const distance = scratch.direction.length();
    scratch.ray.set(orbit.target, scratch.direction.normalize());
    scratch.ray.far = distance + .65;
    scratch.hits.length = 0;
    scratch.ray.intersectObjects(scratch.objects, false, scratch.hits);
    const hit = scratch.hits[0];
    if (hit && hit.distance < distance + .65) camera.position.copy(orbit.target).addScaledVector(scratch.direction, Math.max(.8, hit.distance - .65));
    camera.position.y = Math.max(camera.position.y, Math.max(.3, realmHeight(camera.position.x, camera.position.z)) + 1.1);
    camera.lookAt(orbit.target);
    if (process.env.NODE_ENV === "development") gl.domElement.dataset.realmCamera = JSON.stringify({ clearance: camera.position.y - realmHeight(camera.position.x, camera.position.z), obstructed: !!hit, camera: camera.position.toArray(), target: orbit.target.toArray(), hit: hit?.distance });
  }, -.1);
  return null;
}
