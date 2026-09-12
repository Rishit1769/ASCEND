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

export default function ProgressionHero() {
  const { level } = useWorldProgress();
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
  const initialized = useRef(false);

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
    if (first || reducedMotion || previous >= level) {
      root.current.position.copy(destination);
      travel.current = null;
    } else travel.current = { curve, elapsed: 0, duration: Math.max(1, curve.getLength() / 1.6) };
    prior.current = level;
  }, [level, region.id, destination, terrain, reducedMotion]);

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
    const target = hero.position.clone().add(new Vector3(0, 1, 0));
    if (controls) {
      if (!initialized.current) {
        camera.position.copy(hero.position).add(new Vector3(...checkpoint.cameraOffset));
        initialized.current = true;
      } else camera.position.add(target.clone().sub(lastTarget.current));
      controls.target.copy(target);
      camera.position.y = Math.max(camera.position.y, terrain(camera.position.x, camera.position.z).point.y + 1.2);
      controls.update();
      lastTarget.current.copy(target);
    }
    if (process.env.NODE_ENV === "development") state.gl.domElement.dataset.worldState = JSON.stringify({ level, region: region.id, checkpoint: checkpoint.id, moving: !!movement, position: hero.position.toArray(), camera: camera.position.toArray() });
  }, -.5);
  // Hero's sole solver reads world coordinates, while the outer group owns translation.
  return <group ref={root}><Hero animation={walking ? "WALK_player_Root" : "FIGHTIDLE_Root"} /></group>;
}
