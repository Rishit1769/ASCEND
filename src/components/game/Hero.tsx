"use client";

import { useRef, useEffect, useMemo } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

const MODEL_PATH = "/models/armored_king.glb";
const TARGET_ANIMATION = "FIGHTIDLE_Root";
const FALLBACK_KEYWORDS = ["idle", "fight", "stand", "breath"];

interface HeroProps {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export default function Hero({
  scale = 1,
  position = [0, -1.5, 0],
  rotation = [0, 0, 0],
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
