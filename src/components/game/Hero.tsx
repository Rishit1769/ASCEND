"use client";

import { useRef, useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

// ─── Tweakable constants ───────────────────────────────────────────
// Adjust these to fit your GLB character on screen.
const MODEL_PATH = "/models/armored_king.glb";

const HERO_SCALE = 1.2;                          // Character size (reduce if legs still cut off)
const HERO_POSITION: [number, number, number] = [0, -0.1, 0]; // Center hero so head and legs both visible
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

  // Play WALK_player_Root animation with loop and cleanup
  useEffect(() => {
    const walk = actions["WALK_player_Root"];

    if (!walk) {
      console.warn(
        "Using hero animation:",
        actions["WALK_player_Root"] ? "WALK_player_Root" : "NOT FOUND"
      );
      return;
    }

    console.log("[ASCEND] Using hero animation: WALK_player_Root");

    walk
      .reset()
      .setLoop(THREE.LoopRepeat, Infinity)
      .fadeIn(0.35)
      .play();

    return () => {
      walk.fadeOut(0.25);
      walk.stop();
    };
  }, [actions]);

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
