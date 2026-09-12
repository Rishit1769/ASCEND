"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import { useTerrainSurface } from "./terrainSurface";
import { findSoleProbes, measureSoles } from "./heroGrounding";

// ─── Tweakable constants ───────────────────────────────────────────
// Adjust these to fit your GLB character on screen.
const MODEL_PATH = "/models/armored_king.glb";

const HERO_SCALE = 1.2;                          // Character size (reduce if legs still cut off)
const HERO_POSITION: [number, number, number] = [0, 0, 0];
const HERO_ROTATION: [number, number, number] = [0, Math.PI, 0]; // Y rotation (PI = facing camera)
// ───────────────────────────────────────────────────────────────────

interface HeroProps {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  animation?: string;
}

export default function Hero({
  scale = HERO_SCALE,
  position = HERO_POSITION,
  rotation = HERO_ROTATION,
  animation,
}: HeroProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_PATH);
  const model = useMemo(() => clone(scene), [scene]);
  const probes = useMemo(() => findSoleProbes(model), [model]);
  const terrain = useTerrainSurface();
  const mixer = useMemo(() => new THREE.AnimationMixer(model), [model]);
  const names = useMemo(() => animations.map(clip => clip.name), [animations]);
  const activeAction = useRef<THREE.AnimationAction | null>(null);
  const [previewClip] = useState(() => process.env.NODE_ENV === "development" && typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("heroAnimation") : null);
  const selected = animation ?? (previewClip && names.includes(previewClip) ? previewClip : "FIGHTIDLE_Root");
  const debugTime = useRef(0);

  // Runs after the animation mixer. World grounding is outside the untouched animated rig.
  useFrame(({ gl }, delta) => {
    if (!group.current || !probes.length) return;
    mixer.update(delta);
    group.current.updateWorldMatrix(true, true);
    const skeletons = new Set(probes.map(p => p.mesh.skeleton));
    skeletons.forEach(skeleton => skeleton.update());
    const measurement = measureSoles(probes, terrain);
    const correction = measurement.correction;
    group.current.position.y += correction > 0 ? correction : correction * (1 - Math.exp(-delta * 18));
    group.current.updateWorldMatrix(true, true);
    skeletons.forEach(skeleton => skeleton.update());
    if (process.env.NODE_ENV === "development") {
      debugTime.current += delta;
      if (debugTime.current > .5) {
        const grounded = measureSoles(probes, terrain);
        gl.domElement.dataset.heroGrounding = JSON.stringify({ animation: selected, animationTime: activeAction.current?.time, animationWeight: activeAction.current?.getEffectiveWeight(), rootY: group.current.position.y, probeCount: probes.length, minClearance: Math.min(...grounded.contacts.map(p => p.clearance)), contacts: grounded.contacts });
        debugTime.current = 0;
      }
    }
  }, .25);

  // Log available animations once on mount
  useEffect(() => {
    console.log("[ASCEND] Available animations:", names);
  }, [names]);

  // Own the mixer root explicitly so clip changes cannot retain bindings to an old clone.
  useEffect(() => {
    const clip = animations.find(clip => clip.name === selected);
    if (!clip) {
      console.warn(
        "Using hero animation:",
        selected
      );
      return;
    }
    const walk = mixer.clipAction(clip, model);
    const previous = activeAction.current;
    activeAction.current = walk;

    console.log("[ASCEND] Using hero animation:", selected);

    walk
      .reset()
      .setLoop(THREE.LoopRepeat, Infinity)
      .fadeIn(0.35)
      .play();
    if (previous && previous !== walk) walk.crossFadeFrom(previous, .35, false);
  }, [animations, mixer, model, selected]);

  useEffect(() => () => { mixer.stopAllAction(); mixer.uncacheRoot(model); }, [mixer, model]);

  // Enable shadows on all meshes
  useEffect(() => {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [model]);

  return (
    <group ref={group} position={position}>
      <group scale={scale} rotation={rotation}>
        <primitive object={model} dispose={null} />
      </group>
    </group>
  );
}
