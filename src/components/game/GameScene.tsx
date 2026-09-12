"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ACESFilmicToneMapping, BackSide, PCFShadowMap, SRGBColorSpace } from "three";
import { applyProps, Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment as SkyLighting, Html, OrbitControls } from "@react-three/drei";
import ProgressionHero from "./ProgressionHero";
import { useWorldProgress } from "./WorldProgress";
import { resolveWorld } from "@/lib/world";
import SceneLighting from "./SceneLighting";
import SceneFallback from "./SceneFallback";
import ErrorBoundary from "./ErrorBoundary";
import Environment from "./Environment";
import AtmosphericSky from "./AtmosphericSky";
import { GraphicsProvider, useGraphicsQuality } from "./GraphicsQuality";
import GraphicsSettings from "./GraphicsSettings";
import SceneEffects from "./SceneEffects";
import RealisticSky from "./RealisticSky";
import { CoastalTerrainProvider } from "./terrainSurface";
import { ForestSurface } from "./ForestOfResolve/ForestSurface";
import ForestLighting from "./ForestOfResolve/ForestLighting";
import { MountainSurface } from "./MountainsOfTrial/MountainSurface";

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
  const { preset } = useGraphicsQuality();
  const pixels = useMemo(() => new Uint8Array(16 * 16 * 4), []);
  useEffect(() => {
    const previous = gl.info.autoReset;
    applyProps(gl.info, { autoReset: false });
    return () => { applyProps(gl.info, { autoReset: previous }); };
  }, [gl]);
  useFrame(() => gl.info.reset(), -100);
  const sample = useRef({ time: 0, frames: 0, triangles: 0, calls: 0 });
  useEffect(() => {
    sample.current = { time: 0, frames: 0, triangles: 0, calls: 0 };
    gl.domElement.removeAttribute("data-measured-preset");
  }, [preset, gl]);
  useFrame(({ gl }) => {
    const now = performance.now();
    if (!sample.current.time) sample.current.time = now;
    sample.current.frames++;
    sample.current.triangles += gl.info.render.triangles;
    sample.current.calls += gl.info.render.calls;
    if (now - sample.current.time > 3000) {
      const context = gl.getContext();
      context.readPixels(Math.max(0, Math.floor(context.drawingBufferWidth / 2) - 8), Math.max(0, Math.floor(context.drawingBufferHeight / 2) - 8), 16, 16, context.RGBA, context.UNSIGNED_BYTE, pixels);
      let minimum = 255, maximum = 0;
      for (let i = 0; i < pixels.length; i++) if (i % 4 !== 3) { minimum = Math.min(minimum, pixels[i]); maximum = Math.max(maximum, pixels[i]); }
      gl.domElement.dataset.sceneStats = JSON.stringify({
        preset,
        fps: sample.current.frames * 1000 / (now - sample.current.time),
        triangles: Math.round(sample.current.triangles / sample.current.frames),
        calls: Math.round(sample.current.calls / sample.current.frames),
        textures: gl.info.memory.textures,
        geometries: gl.info.memory.geometries,
        canvasPixelRange: [minimum, maximum],
      });
      gl.domElement.dataset.measuredPreset = preset;
      sample.current = { time: 0, frames: 0, triangles: 0, calls: 0 };
    }
  }, 2);
  return null;
}

function RegionReady({ onReady, regionKey }: { onReady: (key: string) => void; regionKey: string }) {
  useEffect(() => { onReady(regionKey); console.info("[RegionManager] Ready:", regionKey); }, [onReady, regionKey]);
  return null;
}

function SceneContent({ onReady }: { onReady: (key: string) => void }) {
  const { level, reloadCounter } = useWorldProgress();
  const { region } = resolveWorld(level);
  const Surface = region.id === "forest-of-resolve" ? ForestSurface : region.id === "mountains-of-trial" ? MountainSurface : CoastalTerrainProvider;
  useEffect(() => {
    console.info("[World] Resolved region:", region.id);
    console.info("[RegionManager] Loading:", region.id);
  }, [region.id, region.status]);
  return (
    <group key={`${region.id}-${reloadCounter}`} name={`region-manager-${region.id}`}>
      <ErrorBoundary fallback={<Html center>Region could not load. Reload to retry.</Html>}>
      <Suspense fallback={<Html center>Preparing {region.name}...</Html>}><Surface>
      {region.status !== "available" && <group name="development-placeholder-region"><mesh position={[0, -1, -5]}><cylinderGeometry args={[3.5, 6, 2.5, 8]} /><meshStandardMaterial color="#4f5b5e" roughness={.88} /></mesh><mesh position={[0, .7, -5]}><torusGeometry args={[1.2, .16, 8, 20]} /><meshStandardMaterial color="#c2a464" metalness={.5} roughness={.4} /></mesh></group>}
          {region.status === "available" && <Environment region={region.id} />}
        <ProgressionHero />
      <RegionReady onReady={onReady} regionKey={`${region.id}-${reloadCounter}`} />
      </Surface></Suspense></ErrorBoundary>
    </group>
  );
}

/* ─── Inner scene that reads from GraphicsContext ────────────────── */
function Scene() {
  const { config } = useGraphicsQuality();
  const { level, reloadCounter } = useWorldProgress();
  const { region } = resolveWorld(level);
  const [loadedRegion, setLoadedRegion] = useState("");
  const ready = loadedRegion === `${region.id}-${reloadCounter}`;

  const handleCreated = useCallback(() => {
    console.log("[ASCEND] Three.js canvas created");
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0" data-world-region={region.id} data-world-level={level} data-region-status={ready ? region.status : "loading"}>
      <SceneFallback />
      <Canvas
        shadows={config.shadowsEnabled ? { type: PCFShadowMap } : undefined}
        camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV, near: .25, far: 1000 }}
        style={{ pointerEvents: "auto", cursor: "grab", background: region.id === "mountains-of-trial" ? "#526975" : undefined }}
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
        {region.id === "mountains-of-trial" && <color attach="background" args={["#526975"]} />}
        {region.id === "forest-of-resolve" ? <ForestLighting /> : region.id === "mountains-of-trial" ? null : <SceneLighting />}
        {process.env.NODE_ENV === "development" && <SceneStats />}

        {config.realisticSky ? (
          <Suspense fallback={<AtmosphericSky />}>
            <RealisticSky />
            <SkyLighting
              resolution={config.skyEnvResolution}
              frames={1}
              environmentIntensity={config.skyEnvIntensity * (region.id === "forest-of-resolve" ? .65 : 1)}
            >
              <RealisticSky capture />
            </SkyLighting>
          </Suspense>
        ) : (
          <><AtmosphericSky /><SkyLighting resolution={32} frames={1} environmentIntensity={.65}>
            <mesh><sphereGeometry args={[10, 16, 8]} /><meshBasicMaterial color="#a2b4bf" side={BackSide} /></mesh>
          </SkyLighting></>
        )}

        <fogExp2 attach="fog" args={[region.atmosphere.fog, region.atmosphere.density]} />

        <OrbitControls
          makeDefault
          target={ORBIT_TARGET}
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={region.id === "mountains-of-trial" ? 5.5 : ORBIT_MIN_DISTANCE}
          maxDistance={region.id === "mountains-of-trial" ? 42 : ORBIT_MAX_DISTANCE}
          minPolarAngle={region.id === "mountains-of-trial" ? .42 : ORBIT_MIN_POLAR}
          maxPolarAngle={region.id === "mountains-of-trial" ? 1.42 : Math.min(ORBIT_MAX_POLAR, Math.PI / 2 - .04)}
          enableDamping={true}
          dampingFactor={0.05}
        />

        <SceneContent onReady={setLoadedRegion} />
        <SceneEffects />
      </Canvas>
      {process.env.NODE_ENV === "development" && <div className="pointer-events-none absolute left-3 top-36 z-30 rounded border border-white/20 bg-black/75 px-2 py-1 text-[10px] text-white/75 sm:top-28">REGION: {region.name} · {!ready ? "LOADING" : region.status === "available" ? "READY" : "PLACEHOLDER REGION"}</div>}
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
      className="pointer-events-none absolute bottom-40 left-3 z-30 rounded p-2 text-[9px] leading-tight text-white/50 sm:bottom-24"
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
