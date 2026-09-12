"use client";

import { useRef, useEffect, useMemo } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

// ─── Tweakable constants ───────────────────────────────────────────
// Adjust these to fit your GLB character on screen.
const MODEL_PATH = "/models/armored_king.glb";
const HERO_SCALE = 3;                           // Overall model size
const HERO_POSITION: [number, number, number] = [0, -1.4, 0];  // Y raised so feet are visible
const HERO_ROTATION: [number, number, number] = [0, Math.PI, 0]; // Y=PI to face camera

const TARGET_ANIMATION = "FIGHTIDLE_Root";
const FALLBACK_KEYWORDS = ["idle", "fight", "stand", "breath"];
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

  const activeAnimation = useMemo(() => {
    if (names.length === 0) return null;

    const exactMatch = names.find((n) => n === TARGET_ANIMATION);
    if (exactMatch) return exactMatch;

    for (const keyword of FALLBACK_KEYWORDS) {
      const match = names.find((n) => n.toLowerCase().includes(keyword));
      if (match) return match;
    }

    return names[0];
  }, [names]);

  useEffect(() => {
    if (activeAnimation && actions[activeAnimation]) {
      actions[activeAnimation].reset().fadeIn(0.5).play();
      console.log("[ASCEND] Playing animation:", activeAnimation);
      console.log("[ASCEND] Available clips:", names);
    }
  }, [activeAnimation, actions, names]);

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
