"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/* ─── Preset definitions ─────────────────────────────────────────── */

export type GraphicsPreset = "ultra" | "high" | "medium" | "low" | "potato";

export interface GraphicsConfig {
  /** Device pixel ratio ceiling */
  dprMax: number;
  /** Shadow map size [w, h] */
  shadowMapSize: [number, number];
  /** Enable shadow casting */
  shadowsEnabled: boolean;
  /** Number of fog layers */
  fogLayers: number;
  /** Enable volumetric light shaft */
  fogShaft: boolean;
  /** Enable ambient particles */
  particlesEnabled: boolean;
  /** Particle count */
  particleCount: number;
  /** Enable postprocessing AO */
  aoEnabled: boolean;
  /** Enable bloom */
  bloomEnabled: boolean;
  /** Enable FXAA fallback (when no MSAA) */
  fxaaEnabled: boolean;
  /** Multisampling samples */
  msaaSamples: number;
  /** Water reflection resolution */
  waterResolution: number;
  /** Water reflection update cadence (ms) */
  waterReflectionCadence: number;
  /** Enable water reflection at all */
  waterReflectionEnabled: boolean;
  /** Sky lighting environment map resolution */
  skyEnvResolution: number;
  /** Sky lighting intensity */
  skyEnvIntensity: number;
  /** Enable realistic sky + clouds */
  realisticSky: boolean;
  /** Enable contact shadows fallback */
  contactShadows: boolean;
  /** Shadow camera frustum size */
  shadowCameraSize: number;
  /** Shadow camera far */
  shadowCameraFar: number;
  /** Enable distant fires */
  distantFires: boolean;
}

export const GRAPHICS_PRESETS: Record<GraphicsPreset, GraphicsConfig> = {
  ultra: {
    dprMax: 2,
    shadowMapSize: [2048, 2048],
    shadowsEnabled: true,
    fogLayers: 7,
    fogShaft: true,
    particlesEnabled: true,
    particleCount: 120,
    aoEnabled: true,
    bloomEnabled: true,
    fxaaEnabled: false,
    msaaSamples: 4,
    waterResolution: 1024,
    waterReflectionCadence: 1000 / 60,
    waterReflectionEnabled: true,
    skyEnvResolution: 256,
    skyEnvIntensity: 0.65,
    realisticSky: true,
    contactShadows: false,
    shadowCameraSize: 21,
    shadowCameraFar: 75,
    distantFires: true,
  },
  high: {
    dprMax: 1.5,
    shadowMapSize: [2048, 2048],
    shadowsEnabled: true,
    fogLayers: 7,
    fogShaft: true,
    particlesEnabled: true,
    particleCount: 96,
    aoEnabled: true,
    bloomEnabled: true,
    fxaaEnabled: false,
    msaaSamples: 4,
    waterResolution: 1024,
    waterReflectionCadence: 1000 / 60,
    waterReflectionEnabled: true,
    skyEnvResolution: 256,
    skyEnvIntensity: 0.65,
    realisticSky: true,
    contactShadows: false,
    shadowCameraSize: 21,
    shadowCameraFar: 75,
    distantFires: true,
  },
  medium: {
    dprMax: 1.25,
    shadowMapSize: [1024, 1024],
    shadowsEnabled: true,
    fogLayers: 5,
    fogShaft: false,
    particlesEnabled: true,
    particleCount: 64,
    aoEnabled: true,
    bloomEnabled: false,
    fxaaEnabled: true,
    msaaSamples: 0,
    waterResolution: 512,
    waterReflectionCadence: 1000 / 24,
    waterReflectionEnabled: true,
    skyEnvResolution: 128,
    skyEnvIntensity: 0.65,
    realisticSky: true,
    contactShadows: false,
    shadowCameraSize: 21,
    shadowCameraFar: 60,
    distantFires: true,
  },
  low: {
    dprMax: 1,
    shadowMapSize: [512, 512],
    shadowsEnabled: true,
    fogLayers: 3,
    fogShaft: false,
    particlesEnabled: false,
    particleCount: 0,
    aoEnabled: false,
    bloomEnabled: false,
    fxaaEnabled: true,
    msaaSamples: 0,
    waterResolution: 256,
    waterReflectionCadence: 1000 / 12,
    waterReflectionEnabled: true,
    skyEnvResolution: 128,
    skyEnvIntensity: 0.5,
    realisticSky: true,
    contactShadows: true,
    shadowCameraSize: 21,
    shadowCameraFar: 50,
    distantFires: true,
  },
  potato: {
    dprMax: 0.75,
    shadowMapSize: [256, 256],
    shadowsEnabled: false,
    fogLayers: 2,
    fogShaft: false,
    particlesEnabled: false,
    particleCount: 0,
    aoEnabled: false,
    bloomEnabled: false,
    fxaaEnabled: false,
    msaaSamples: 0,
    waterResolution: 128,
    waterReflectionCadence: 1000 / 6,
    waterReflectionEnabled: false,
    skyEnvResolution: 64,
    skyEnvIntensity: 0.4,
    realisticSky: false,
    contactShadows: true,
    shadowCameraSize: 21,
    shadowCameraFar: 40,
    distantFires: false,
  },
};

/* ─── GPU / device detection ─────────────────────────────────────── */

interface DeviceProfile {
  gpuTier: 0 | 1 | 2 | 3;
  cores: number;
  memory: number | null;
  isMobile: boolean;
  maxTextureSize: number;
  webgl2: boolean;
}

function detectDevice(): DeviceProfile {
  if (typeof window === "undefined") {
    return { gpuTier: 2, cores: 4, memory: null, isMobile: false, maxTextureSize: 4096, webgl2: true };
  }

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Record<string, unknown>).deviceMemory as number | undefined;
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const dpr = window.devicePixelRatio || 1;
  const width = screen.width;
  const height = screen.height;
  const totalPixels = width * height;

  // WebGL capabilities
  let maxTextureSize = 2048;
  let webgl2 = false;
  let gpuTier: 0 | 1 | 2 | 3 = 2;

  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (gl) {
      webgl2 = !!canvas.getContext("webgl2");
      maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

      // Try to get GPU renderer string for tier estimation
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
        // Heuristic tier classification from known GPU strings
        if (/apple m[1-4]|rtx\s*(30|40|50)|rx\s*7[0-9]{3}|arc\s*a[0-9]/i.test(renderer)) {
          gpuTier = 3;
        } else if (/gtx\s*(16|20|30)|rx\s*(5|6)[0-9]{3}|intel.*iris|apple m0|radeon.*pro/i.test(renderer)) {
          gpuTier = 2;
        } else if (/intel.*uhd|intel.*hd|radeon.*vega|adreno\s*(6|7)[0-9]{2}/i.test(renderer)) {
          gpuTier = 1;
        } else if (/swiftshader|microsoft.*basic|llvmpipe|soft|mesa/i.test(renderer)) {
          gpuTier = 0;
        }
      }

      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    // WebGL not available — stay at defaults
  }

  // Override tier based on additional heuristics
  if (isMobile && gpuTier > 1) gpuTier = Math.min(gpuTier, 2) as 0 | 1 | 2 | 3;
  if (dpr > 2 && gpuTier < 3) gpuTier = Math.min(gpuTier, 2) as 0 | 1 | 2 | 3;
  if (cores <= 2 && memory != null && memory <= 4) gpuTier = Math.min(gpuTier, 1) as 0 | 1 | 2 | 3;
  if (cores <= 2 && totalPixels < 1920 * 1080) gpuTier = Math.min(gpuTier, 1) as 0 | 1 | 2 | 3;
  if (memory != null && memory <= 2) gpuTier = 0;

  return { gpuTier, cores, memory, isMobile, maxTextureSize, webgl2 };
}

/** Map device profile → initial preset */
function profileToPreset(profile: DeviceProfile): GraphicsPreset {
  if (profile.gpuTier >= 3 && profile.cores >= 6) return "ultra";
  if (profile.gpuTier >= 2 && profile.cores >= 4) return "high";
  if (profile.gpuTier >= 1) return "medium";
  if (profile.gpuTier === 0) return "low";
  return "potato";
}

/* ─── FPS Monitor ────────────────────────────────────────────────── */

const FPS_SAMPLE_WINDOW = 5000; // ms — evaluate over 5 seconds
const FPS_COOLDOWN = 30000; // ms — 30 seconds between auto changes
const FPS_DOWNGRADE_THRESHOLD = 22; // FPS below this → downgrade
const FPS_AGGRESSIVE_DOWNGRADE = 15; // FPS below this → skip a level
const FPS_UPGRADE_THRESHOLD = 55; // FPS above this for sustained → upgrade

export function useFpsMonitor(enabled: boolean, onFpsChange: (fps: number) => void) {
  const frames = useRef(0);
  const lastTime = useRef(0);
  const rafId = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    frames.current = 0;
    lastTime.current = performance.now();
    const tick = () => {
      frames.current++;
      const now = performance.now();
      if (now - lastTime.current >= FPS_SAMPLE_WINDOW) {
        const fps = (frames.current * 1000) / (now - lastTime.current);
        onFpsChange(fps);
        frames.current = 0;
        lastTime.current = now;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [enabled, onFpsChange]);
}

/* ─── Context ────────────────────────────────────────────────────── */

export interface GraphicsState {
  preset: GraphicsPreset;
  config: GraphicsConfig;
  isAuto: boolean;
  deviceProfile: DeviceProfile;
  /** Set preset manually (stops auto) */
  setPreset: (preset: GraphicsPreset) => void;
  /** Resume auto-detection */
  resumeAuto: () => void;
}

const GraphicsContext = createContext<GraphicsState | null>(null);

export function useGraphicsQuality(): GraphicsState {
  const ctx = useContext(GraphicsContext);
  if (!ctx) {
    // Fallback for components not wrapped in provider
    return {
      preset: "medium",
      config: GRAPHICS_PRESETS.medium,
      isAuto: false,
      deviceProfile: { gpuTier: 2, cores: 4, memory: null, isMobile: false, maxTextureSize: 4096, webgl2: true },
      setPreset: () => {},
      resumeAuto: () => {},
    };
  }
  return ctx;
}

/* ─── Provider ───────────────────────────────────────────────────── */

const PRESET_ORDER: GraphicsPreset[] = ["ultra", "high", "medium", "low", "potato"];

function presetIndex(p: GraphicsPreset): number {
  return PRESET_ORDER.indexOf(p);
}

function clampPreset(p: GraphicsPreset): GraphicsPreset {
  return PRESET_ORDER[Math.max(0, Math.min(PRESET_ORDER.length - 1, presetIndex(p)))] ?? "medium";
}

function loadSavedPreset(): GraphicsPreset | "auto" {
  if (typeof window === "undefined") return "auto";
  try {
    const saved = localStorage.getItem("ascend-graphics-mode");
    if (saved === "auto" || PRESET_ORDER.includes(saved as GraphicsPreset)) {
      return saved as GraphicsPreset | "auto";
    }
  } catch { /* ignore */ }
  return "auto";
}

export function GraphicsProvider({ children }: { children: React.ReactNode }) {
  const [deviceProfile] = useState<DeviceProfile>(detectDevice);
  const [savedMode] = useState(() => loadSavedPreset());
  const [isAuto, setIsAuto] = useState(savedMode === "auto");
  const [preset, setPresetState] = useState<GraphicsPreset>(
    savedMode === "auto" ? profileToPreset(deviceProfile) : savedMode
  );
  const lastAutoChange = useRef(0);
  const autoDowngrades = useRef(0);

  const setPreset = useCallback((p: GraphicsPreset) => {
    setPresetState(p);
    setIsAuto(false);
    try { localStorage.setItem("ascend-graphics-mode", p); } catch { /* ignore */ }
  }, []);

  const resumeAuto = useCallback(() => {
    setIsAuto(true);
    try { localStorage.setItem("ascend-graphics-mode", "auto"); } catch { /* ignore */ }
    setPresetState(profileToPreset(deviceProfile));
    autoDowngrades.current = 0;
  }, [deviceProfile]);

  // FPS-based auto downgrade/upgrade
  const handleFps = useCallback((fps: number) => {
    if (!isAuto) return;
    const now = performance.now();
    if (now - lastAutoChange.current < FPS_COOLDOWN) return;

    setPresetState(current => {
      if (fps < FPS_AGGRESSIVE_DOWNGRADE && autoDowngrades.current < 2) {
        // Skip a level for very poor performance
        const next = clampPreset(PRESET_ORDER[presetIndex(current) + 2] as GraphicsPreset);
        if (next !== current) {
          lastAutoChange.current = now;
          autoDowngrades.current++;
          console.log(`[ASCEND] Auto quality: ${current} → ${next} (FPS: ${fps.toFixed(1)})`);
          return next;
        }
      }
      if (fps < FPS_DOWNGRADE_THRESHOLD) {
        const next = clampPreset(PRESET_ORDER[presetIndex(current) + 1] as GraphicsPreset);
        if (next !== current) {
          lastAutoChange.current = now;
          autoDowngrades.current++;
          console.log(`[ASCEND] Auto quality: ${current} → ${next} (FPS: ${fps.toFixed(1)})`);
          return next;
        }
      }
      if (fps > FPS_UPGRADE_THRESHOLD && autoDowngrades.current > 0) {
        const next = clampPreset(PRESET_ORDER[presetIndex(current) - 1] as GraphicsPreset);
        if (next !== current) {
          lastAutoChange.current = now;
          autoDowngrades.current--;
          console.log(`[ASCEND] Auto quality: ${current} → ${next} (FPS: ${fps.toFixed(1)})`);
          return next;
        }
      }
      return current;
    });
  }, [isAuto]);

  // Use the FPS monitor hook
  useFpsMonitor(isAuto, handleFps);

  // Tab visibility — reduce load in background
  useEffect(() => {
    const handle = () => {
      if (document.hidden) {
        document.title = "ASCEND (background)";
      } else {
        document.title = "ASCEND — Your Life. Your Quest. Your Level.";
      }
    };
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, []);

  const state: GraphicsState = {
    preset,
    config: GRAPHICS_PRESETS[preset],
    isAuto,
    deviceProfile,
    setPreset,
    resumeAuto,
  };

  return (
    <GraphicsContext.Provider value={state}>
      {children}
    </GraphicsContext.Provider>
  );
}
