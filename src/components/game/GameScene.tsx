"use client";

import { Suspense, useCallback, useEffect, useRef } from "react";
import { ACESFilmicToneMapping, PCFShadowMap, SRGBColorSpace } from "three";
import { applyProps, Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment as SkyLighting, Html, OrbitControls } from "@react-three/drei";
import Hero from "./Hero";
import SceneLighting from "./SceneLighting";
import SceneFallback from "./SceneFallback";
import ErrorBoundary from "./ErrorBoundary";
import Environment from "./Environment";
import AtmosphericSky from "./AtmosphericSky";
import { GraphicsProvider, useGraphicsQuality } from "./GraphicsQuality";
import GraphicsSettings from "./GraphicsSettings";
import SceneEffects from "./SceneEffects";
import RealisticSky from "./RealisticSky";

// ─── Tweakable constants ───────────────────────────────────────────
const CAMERA_POSITION: [number, number, number] = [0, 1.7, 7.2];
const CAMERA_FOV = 40;
const ORBIT_TARGET: [number, number, number] = [0, 0.8, 0];
const ORBIT_MIN_DISTANCE = 5;
const ORBIT_MAX_DISTANCE = 11;
const ORBIT_MIN_POLAR = Math.PI / 3;
const ORBIT_MAX_POLAR = Math.PI / 1.7;
// ───────────────────────────────────────────────────────────────────

/* ─── Scene stats (dev only) ─────────────────────────────────────── */
function SceneStats() {
  const gl = useThree(state => state.gl);
  useEffect(() => {
    const previous = gl.info.autoReset;
    applyProps(gl.info, { autoReset: false });
    return () => { applyProps(gl.info, { autoReset: previous }); };
  }, [gl]);
  useFrame(() => gl.info.reset(), -100);
  const sample = useRef({ time: 0, frames: 0 });
  useFrame(({ gl }) => {
    const now = performance.now();
    if (!sample.current.time) sample.current.time = now;
    sample.current.frames++;
    if (now - sample.current.time > 3000) {
      gl.domElement.dataset.sceneStats = JSON.stringify({
        fps: sample.current.frames * 1000 / (now - sample.current.time),
        triangles: gl.info.render.triangles,
        calls: gl.info.render.calls,
        textures: gl.info.memory.textures,
        geometries: gl.info.memory.geometries,
      });
      sample.current = { time: 0, frames: 0 };
    }
  }, 2);
  return null;
}

/* ─── Scene fallbacks ────────────────────────────────────────────── */
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

/* ─── Inner scene that reads from GraphicsContext ────────────────── */
function Scene() {
  const { config } = useGraphicsQuality();

  const handleCreated = useCallback(() => {
    console.log("[ASCEND] Three.js canvas created");
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <SceneFallback />
      <Canvas
        shadows={config.shadowsEnabled ? { type: PCFShadowMap } : undefined}
        camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV }}
        style={{ pointerEvents: "auto", cursor: "grab" }}
        gl={{
          antialias: true,
          alpha: true,
          outputColorSpace: SRGBColorSpace,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        dpr={config.dprMax}
        onCreated={handleCreated}
      >
        <SceneLighting />
        {process.env.NODE_ENV === "development" && <SceneStats />}

        {config.realisticSky ? (
          <Suspense fallback={<AtmosphericSky />}>
            <RealisticSky />
            <SkyLighting
              resolution={config.skyEnvResolution}
              frames={1}
              environmentIntensity={config.skyEnvIntensity}
            >
              <RealisticSky capture />
            </SkyLighting>
          </Suspense>
        ) : (
          <AtmosphericSky />
        )}

        <fogExp2 attach="fog" args={["#687f91", 0.022]} />

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

        {config.contactShadows && (
          <ContactShadows
            position={[0, -1.08, 0]}
            opacity={0.42}
            scale={3.8}
            blur={2.4}
            far={2.6}
            resolution={256}
            color="#05070b"
          />
        )}

        <SceneContent />
        <SceneEffects />
      </Canvas>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-16"
        style={{ background: "linear-gradient(#080c14b3, transparent)" }}
      />
    </div>
  );
}

/* ─── Dev performance debug panel ────────────────────────────────── */
function DevStats() {
  const { preset, config, isAuto, deviceProfile } = useGraphicsQuality();
  const [stats, setStats] = useState<{ fps: number; triangles: number; calls: number; textures: number } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const el = document.querySelector("[data-scene-stats]");
      if (el) {
        try { setStats(JSON.parse(el.getAttribute("data-scene-stats") ?? "null")); } catch { /* ignore */ }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div
      className="pointer-events-none absolute bottom-24 left-3 z-30 rounded p-2 text-[9px] leading-tight text-white/50"
      style={{
        background: "rgba(0,0,0,0.6)",
        font: "monospace",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div>Preset: {preset} {isAuto ? "(auto)" : "(manual)"}</div>
      <div>GPU tier: {deviceProfile.gpuTier} | Cores: {deviceProfile.cores} | Mem: {deviceProfile.memory ?? "?"}GB</div>
      <div>DPR: {config.dprMax} | Shadows: {config.shadowsEnabled ? `${config.shadowMapSize[0]}px` : "off"}</div>
      {stats && (
        <>
          <div>FPS: {stats.fps.toFixed(0)} | Triangles: {(stats.triangles / 1000).toFixed(1)}k</div>
          <div>Draw calls: {stats.calls} | Textures: {stats.textures}</div>
        </>
      )}
    </div>
  );
}

import { useState } from "react";

/* ─── Main export ────────────────────────────────────────────────── */
export default function GameScene() {
  return (
    <GraphicsProvider>
      <Scene />
      <DevStats />
      <div className="pointer-events-auto absolute right-3 top-14 z-30">
        <GraphicsSettings />
      </div>
    </GraphicsProvider>
  );
}
