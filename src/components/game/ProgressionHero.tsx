"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CatmullRomCurve3, Group, Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { resolveWorld } from "@/lib/world";
import Hero from "./Hero";
import { useWorldProgress } from "./WorldProgress";
import { useTerrainSurface } from "./terrainSurface";
import { findDryGround } from "./grounding";
import { useReducedMotion } from "./useReducedMotion";
import { REALM_CAMERA } from "./RealmOfAscension/realmConfig";

export default function ProgressionHero() {
  const { level, preview, reloadCounter, previewAnimation } = useWorldProgress();
  const { checkpoint, region } = resolveWorld(level);
  const terrain = useTerrainSurface();
  const controls = useThree(state => state.controls) as OrbitControlsImpl | null;
  const root = useRef<Group>(null);
  const reducedMotion = useReducedMotion();
  const [walking, setWalking] = useState(false);
  const destination = useMemo(() => findDryGround(terrain, checkpoint.worldPosition[0], checkpoint.worldPosition[2]).point, [checkpoint, terrain]);
  const travel = useRef<{ curve: CatmullRomCurve3; elapsed: number; duration: number } | null>(null);
  const prior = useRef<number | null>(null);
  const lastTarget = useRef(new Vector3());
  const target = useRef(new Vector3());
  const targetDelta = useRef(new Vector3());
  const cameraOffset = useRef(new Vector3());
  const initialized = useRef(false);
  const frameLog = useRef(0);

  useEffect(() => {
    if (!root.current) return;
    const first = prior.current === null;
    const start = root.current.position.clone();
    const points = [start];
    const previous = prior.current === null ? level : prior.current;
    if (previous < level) {
      for (let step = previous + 1; step < level; step++) {
        const intermediate = resolveWorld(step);
        if (intermediate.region.id === region.id) {
          const p = intermediate.checkpoint.worldPosition;
          points.push(findDryGround(terrain, p[0], p[2]).point);
        }
      }
    }
    points.push(destination.clone());
    if (points.length === 2) points.splice(1, 0, start.clone().lerp(destination, .5));
    const curve = new CatmullRomCurve3(points, false, "centripetal");
    if (first || preview || reducedMotion || previous >= level) {
      root.current.position.copy(destination);
      initialized.current = false;
      travel.current = null;
    } else travel.current = { curve, elapsed: 0, duration: Math.max(1, curve.getLength() / 1.6) };
    prior.current = level;
  }, [level, region.id, destination, terrain, reducedMotion, preview, reloadCounter]);

  useEffect(() => {
    const reset = () => { initialized.current = false; };
    window.addEventListener("ascend-reset-camera", reset);
    return () => window.removeEventListener("ascend-reset-camera", reset);
  }, []);

  useFrame((state, delta) => {
    const camera = state.camera;
    const hero = root.current;
    if (!hero) return;
    const movement = travel.current;
    if (movement) {
      if (!walking) setWalking(true);
      movement.elapsed += Math.min(delta, .05);
      const t = Math.min(1, movement.elapsed / movement.duration);
      const point = movement.curve.getPointAt(t);
      hero.position.set(point.x, terrain(point.x, point.z).point.y, point.z);
      const tangent = movement.curve.getTangentAt(t);
      const heading = Math.atan2(tangent.x, tangent.z) - Math.PI;
      const angle = Math.atan2(Math.sin(heading - hero.rotation.y), Math.cos(heading - hero.rotation.y));
      hero.rotation.y += angle * (1 - Math.exp(-delta * 10));
      if (t === 1) { travel.current = null; setWalking(false); }
    } else if (walking) setWalking(false);
    if (!movement) hero.rotation.y += (0 - hero.rotation.y) * (1 - Math.exp(-delta * 5));
    const realmComposition = region.id === "realm-of-ascension";
    if (realmComposition) {
      // Authored cinematic third-person framing (see REALM_CAMERA): the camera
      // sits up and slightly to the side, aiming forward along the walkway.
      target.current.set(
        hero.position.x + REALM_CAMERA.target[0],
        hero.position.y + REALM_CAMERA.target[1],
        hero.position.z + REALM_CAMERA.target[2]
      );
    } else {
      target.current.set(0, region.id === "forest-of-resolve" ? 1.8 : 1, 0).add(hero.position);
    }
    if (controls) {
      if (!initialized.current) {
        cameraOffset.current.fromArray(realmComposition ? REALM_CAMERA.offset : checkpoint.cameraOffset);
        camera.position.copy(hero.position).add(cameraOffset.current);
        const terrainHit = terrain(camera.position.x, camera.position.z);
        const clearance = camera.position.y - terrainHit.point.y;
        if (clearance < 1.2) camera.position.y = terrainHit.point.y + 1.2;
        if (process.env.NODE_ENV === "development" && region.id === "realm-of-ascension") {
          console.info("[CameraSafety] Realm checkpoint", {
            heroPosition: hero.position.toArray(),
            cameraPosition: camera.position.toArray(),
            cameraTarget: target.current.toArray(),
            orbitTarget: controls.target.toArray(),
            distanceToHero: camera.position.distanceTo(hero.position),
            distanceToNearestTerrain: Math.max(0, clearance),
            terrainSurface: terrainHit.surface,
            intersectsMajorGeometry: clearance < 1.2,
          });
        }
        initialized.current = true;
      } else {
        targetDelta.current.copy(target.current).sub(lastTarget.current);
        camera.position.add(targetDelta.current);
      }
      controls.target.copy(target.current);
      if (!realmComposition) {
      const beforeOrbit = terrain(camera.position.x, camera.position.z);
      camera.position.y = Math.max(camera.position.y, beforeOrbit.point.y + 1.2);
      controls.update();
      const afterOrbit = terrain(camera.position.x, camera.position.z);
      const safeY = afterOrbit.point.y + 1.2;
      if (camera.position.y < safeY) {
        camera.position.y = safeY;
        camera.lookAt(controls.target);
      }
      } else controls.update();
      lastTarget.current.copy(target.current);
    }
    if (process.env.NODE_ENV === "development" && region.id === "realm-of-ascension" && frameLog.current < 4) {
      frameLog.current++;
      console.info("[RealmCam]", frameLog.current, "init", initialized.current, "hero", hero.position.toArray().map(n => +n.toFixed(2)), "cam", camera.position.toArray().map(n => +n.toFixed(2)), "target", target.current.toArray().map(n => +n.toFixed(2)));
    }
    if (process.env.NODE_ENV === "development") state.gl.domElement.dataset.worldState = JSON.stringify({ level, region: region.id, checkpoint: checkpoint.id, moving: !!movement, position: hero.position.toArray(), camera: camera.position.toArray() });
  }, -.5);
  // Hero's sole solver reads world coordinates, while the outer group owns translation.
  return <group ref={root}><Hero animation={preview ? previewAnimation : walking ? "WALK_player_Root" : "FIGHTIDLE_Root"} /></group>;
}
