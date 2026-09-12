"use client";

import { useRef, useEffect, useMemo } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

// ─── Tweakable constants ───────────────────────────────────────────
// Adjust these to fit your GLB character on screen.
const MODEL_PATH = "/models/armored_king.glb";

const HERO_SCALE = 1.5;                          // Character size (reduce if too large)
const HERO_POSITION: [number, number, number] = [0, -1.6, 0]; // Vertical offset (lower = feet more visible)
const HERO_ROTATION: [number, number, number] = [0, Math.PI, 0]; // Y rotation (PI = facing camera)
// ───────────────────────────────────────────────────────────────────

interface HeroProps {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export default function Hero({
  scale = HERO_SCALE,
  position = HERO_POSITION,
  rotation = HERO_ROTATION,
}: HeroProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_PATH);
  const { names, actions } = useAnimations(animations, group);

  // Log available animations once on mount
  useEffect(() => {
    console.log("[ASCEND] Available animations:", names);
  }, [names]);

  // Select idle animation: prefer exact match, then case-insensitive "idle" substring
  const idleName = useMemo(() => {
    if (names.length === 0) return null;

    // Priority order for exact matches
    const exactPriority = ["Idle", "idle", "Idle Animation"];
    for (const candidate of exactPriority) {
      if (names.includes(candidate)) return candidate;
    }

    // Fallback: first name containing "idle" (case-insensitive)
    const fallback = names.find((n) => n.toLowerCase().includes("idle"));
    if (fallback) return fallback;

    // Last resort: no idle found
    console.warn("[ASCEND] No idle animation found. Available:", names);
    return null;
  }, [names]);

  // Play idle animation with loop and cleanup
  useEffect(() => {
    if (!idleName || !actions[idleName]) {
      if (animations.length === 0) {
        console.warn("[ASCEND] No animations found in hero GLB.");
      }
      return;
    }

    const action = actions[idleName];
    action
      .reset()
      .setLoop(THREE.LoopRepeat, Infinity)
      .fadeIn(0.4)
      .play();

    console.log("[ASCEND] Playing idle animation:", idleName);

    return () => {
      action.fadeOut(0.3);
    };
  }, [idleName, actions, animations.length]);

  // Enable shadows on all meshes
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <group ref={group} scale={scale} position={position} rotation={rotation}>
      <primitive object={scene} />
    </group>
  );
}
