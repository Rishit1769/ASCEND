"use client";

import { Suspense, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Hero from "./Hero";
import SceneLighting from "./SceneLighting";
import SceneFallback from "./SceneFallback";
import ErrorBoundary from "./ErrorBoundary";
import Environment from "./Environment";

// ─── Tweakable constants ───────────────────────────────────────────
// Camera framing — controls how the character is composed on screen.
// Z farther = smaller character, higher Y = looking slightly down.
const CAMERA_POSITION: [number, number, number] = [0, 1.7, 8]; // Camera farther back to show full body
const CAMERA_FOV = 40; // Field of view (wider = more environment visible)

// OrbitControls — camera orbit around the character
const ORBIT_TARGET: [number, number, number] = [0, 0.8, 0]; // Look at character's torso
const ORBIT_MIN_DISTANCE = 5;   // Minimum zoom distance
const ORBIT_MAX_DISTANCE = 11;  // Maximum zoom distance
const ORBIT_MIN_POLAR = Math.PI / 3;   // Upper limit (can't go above ~60° from top)
const ORBIT_MAX_POLAR = Math.PI / 1.7; // Lower limit (can't go below ~106° from top)
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
        <Environment region="forgotten_shore" />
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
        style={{ pointerEvents: "auto", cursor: "grab" }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
        onCreated={handleCreated}
      >
        <SceneLighting />
        <fog attach="fog" args={["#111724", 10, 24]} />
        <OrbitControls
          target={ORBIT_TARGET}
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={ORBIT_MIN_DISTANCE}
          maxDistance={ORBIT_MAX_DISTANCE}
          minPolarAngle={ORBIT_MIN_POLAR}
          maxPolarAngle={ORBIT_MAX_POLAR}
          enableDamping={true}
          dampingFactor={0.05}
        />
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
