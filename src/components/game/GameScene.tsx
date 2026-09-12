"use client";

import { Suspense, useCallback, useRef } from "react";
import { ACESFilmicToneMapping, PCFShadowMap, SRGBColorSpace } from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls } from "@react-three/drei";
import Hero from "./Hero";
import SceneLighting from "./SceneLighting";
import SceneFallback from "./SceneFallback";
import ErrorBoundary from "./ErrorBoundary";
import Environment from "./Environment";
import AtmosphericSky from "./AtmosphericSky";

// ─── Tweakable constants ───────────────────────────────────────────
// Camera framing — controls how the character is composed on screen.
// Z farther = smaller character, higher Y = looking slightly down.
const CAMERA_POSITION: [number, number, number] = [0, 1.7, 7.2]; // Full body with a stronger world-scale composition
const CAMERA_FOV = 40; // Field of view (wider = more environment visible)

// OrbitControls — camera orbit around the character
const ORBIT_TARGET: [number, number, number] = [0, 0.8, 0]; // Look at character's torso
const ORBIT_MIN_DISTANCE = 5;   // Minimum zoom distance
const ORBIT_MAX_DISTANCE = 11;  // Maximum zoom distance
const ORBIT_MIN_POLAR = Math.PI / 3;   // Upper limit (can't go above ~60° from top)
const ORBIT_MAX_POLAR = Math.PI / 1.7; // Lower limit (can't go below ~106° from top)

function SceneStats() {
  const sample = useRef({ time: 0, frames: 0 });
  useFrame(({ gl }) => {
    const now = performance.now();
    if (!sample.current.time) sample.current.time = now;
    sample.current.frames++;
    if (now - sample.current.time > 3000) {
      gl.domElement.dataset.sceneStats = JSON.stringify({ fps: sample.current.frames * 1000 / (now - sample.current.time), triangles: gl.info.render.triangles, calls: gl.info.render.calls, textures: gl.info.memory.textures });
      sample.current = { time: 0, frames: 0 };
    }
  });
  return null;
}
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
    <>
      <ErrorBoundary fallback={<Html center position={[0, 3, 0]}>Environment could not load. Reload to retry.</Html>}>
        <Suspense fallback={<Html center position={[0, 3, 0]}><span style={{ color: "#c2c9cd", fontSize: 12, whiteSpace: "nowrap" }}>Preparing The Forgotten Shore...</span></Html>}>
          <Environment region="forgotten_shore" />
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary fallback={<WireframeFallback />}>
        <Suspense fallback={null}><Hero /></Suspense>
      </ErrorBoundary>
    </>
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
        shadows={{ type: PCFShadowMap }}
        camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV }}
        style={{ pointerEvents: "auto", cursor: "grab" }}
        gl={{ antialias: true, alpha: true, outputColorSpace: SRGBColorSpace, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        dpr={[1, 1.5]}
        onCreated={handleCreated}
      >
        <SceneLighting />
        {process.env.NODE_ENV === "development" && <SceneStats />}
        <AtmosphericSky />
        <fogExp2 attach="fog" args={["#566b79", 0.018]} />
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
        <ContactShadows
          position={[0, -1.08, 0]}
          opacity={0.42}
          scale={3.8}
          blur={2.4}
          far={2.6}
          resolution={256}
          color="#05070b"
        />
        <SceneContent />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16" style={{ background: "linear-gradient(#080c14b3, transparent)" }} />
    </div>
  );
}
