"use client";

import { Suspense, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import Hero from "./Hero";
import SceneLighting from "./SceneLighting";
import SceneFallback from "./SceneFallback";
import ErrorBoundary from "./ErrorBoundary";

// ─── Tweakable constants ───────────────────────────────────────────
// Camera framing — controls how the character is composed on screen.
// Z farther = smaller character, higher Y = looking slightly down.
const CAMERA_POSITION: [number, number, number] = [0, 1.7, 8]; // Camera farther back to show full body
const CAMERA_FOV = 40; // Field of view (wider = more environment visible)
// ───────────────────────────────────────────────────────────────────

function WireframeFallback() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[0.5, 1.5, 0.5]} />
      <meshStandardMaterial color="#252540" wireframe opacity={0.3} transparent />
    </mesh>
  );
}

function SceneContent() {
  return (
    <ErrorBoundary fallback={<WireframeFallback />}>
      <Suspense fallback={<WireframeFallback />}>
        <Hero />
      </Suspense>
    </ErrorBoundary>
  );
}

export default function GameScene() {
  const handleCreated = useCallback(() => {
    console.log("[ASCEND] Three.js canvas created");
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <SceneFallback />
      <Canvas
        camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV }}
        style={{ pointerEvents: "none" }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
        onCreated={handleCreated}
      >
        <SceneLighting />
        <SceneContent />
      </Canvas>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, transparent 50%, #080810 80%)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "linear-gradient(to bottom, #080810 0%, transparent 15%, transparent 85%, #080810 100%)",
        }}
      />
    </div>
  );
}
