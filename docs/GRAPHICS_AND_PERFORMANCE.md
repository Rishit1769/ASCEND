# Graphics and Performance

## Graphics Preset System

### Source File

`src/components/game/GraphicsQuality.tsx` (494 lines)

### Presets

| Preset | Target Hardware | DPR | Shadows | Water | Post-FX |
|--------|----------------|-----|---------|-------|---------|
| **Ultra** | High-end desktop (RTX, Apple M1+) | 2.0 | 2048px | 1024px reflections, 160 segments | AO + Bloom + MSAA 4x |
| **High** | Mid-range desktop (GTX 16/20/30) | 1.5 | 2048px | 1024px reflections, 128 segments | AO + Bloom + MSAA 4x |
| **Medium** | Low-end desktop / tablet | 1.25 | 1024px | 512px reflections, 80 segments | AO + FXAA |
| **Low** | Mobile | 1.0 | 512px | No reflections, 36 segments | FXAA only |
| **Potato** | Low-end mobile | 0.75 | 256px | No reflections, 12 segments | None |
| **Auto** | Dynamic | Dynamic | Dynamic | Dynamic | Dynamic |

### Configuration Fields (35+ per preset)

```typescript
interface GraphicsConfig {
  dprMax: number;
  shadowMapSize: [number, number];
  shadowsEnabled: boolean;
  fogLayers: number;
  fogShaft: boolean;
  particlesEnabled: boolean;
  particleCount: number;
  aoEnabled: boolean;
  bloomEnabled: boolean;
  fxaaEnabled: boolean;
  msaaSamples: number;
  waterResolution: number;
  waterReflectionCadence: number;
  waterReflectionEnabled: boolean;
  waterGeometrySegments: number;
  waterWaveStrength: number;
  waterNormalStrength: number;
  waterRefractionStrength: number;
  waterDetailEnabled: boolean;
  waterWaveLayers: number;
  waterNormalLayers: number;
  waterFoamEnabled: boolean;
  skyEnvResolution: number;
  skyEnvIntensity: number;
  realisticSky: boolean;
  contactShadows: boolean;
  shadowCameraSize: number;
  shadowCameraFar: number;
  distantFires: boolean;
}
```

## GPU Detection

### How It Works

1. Creates temporary WebGL canvas
2. Queries `WEBGL_debug_renderer_info` for GPU renderer string
3. Classifies GPU into tier 0–3 via regex matching known GPU names

### Tier Classification

| Tier | GPUs | Example |
|------|------|---------|
| 3 | Apple M1–M4, RTX 30/40/50, RX 7xxx | High-end |
| 2 | GTX 16/20/30, RX 5xxx/6xxx, Intel Iris | Mid-range |
| 1 | Intel UHD/HD, Radeon Vega, Adreno 6xx/7xx | Low-end |
| 0 | SwiftShader, LLVMpipe, software renderers | Minimum |

### Override Rules

- Mobile + tier > 1 → capped to tier 2
- DPR > 2 + tier < 3 → capped to tier 2
- Cores ≤ 2 + memory ≤ 4 → capped to tier 1
- Memory ≤ 2 → forced to tier 0

### Tier → Preset Mapping

```
Tier ≥ 3 + cores ≥ 6 → ultra
Tier ≥ 2 + cores ≥ 4 → high
Tier ≥ 1             → medium
Tier === 0           → low
Fallback             → potato
```

## Auto-Adaptation

### FPS Monitoring

- Samples FPS over 5-second windows using `requestAnimationFrame`
- Evaluates at end of each window

### Adaptation Logic

```
FPS < 15 (aggressive) → skip 2 levels down (max 2 aggressive downgrades)
FPS < 22 (normal)     → skip 1 level down
FPS > 55 (upgrade)    → skip 1 level up (only if previously downgraded)
```

### Hysteresis

- 30-second cooldown between auto changes
- Upgrade only allowed if `autoDowngrades > 0` (never upgrades from initial detection)
- Aggressive downgrade capped at 2 uses total
- Prevents preset oscillation (HIGH → MEDIUM → HIGH → MEDIUM)

### Persistence

- Auto mode saved to `localStorage` key `ascend-graphics-mode`
- Manual preset selection disables auto mode
- Resume restores device-detected preset

## Post-Processing Pipeline

### Source File

`src/components/game/SceneEffects.tsx`

### Effects

| Effect | Presets | Configuration |
|--------|---------|---------------|
| N8AO (Ambient Occlusion) | Ultra, High, Medium | Half-res, quality medium/low, radius 0.45 |
| Bloom | Ultra, High | Intensity 0.35, threshold 1.0, mipmap blur |
| FXAA | Medium, Low | Default settings |
| Tone Mapping | All | ACES Filmic |

### MSAA

- Ultra/High: 4x multisampling
- Medium/Low/Potato: 0 (FXAA provides AA on Medium/Low)

### Key Behavior

- `EffectComposer` is keyed by preset — full re-mount on preset change
- Bloom uses `luminanceThreshold: 1.0` (only very bright pixels bloom)
- N8AO uses `halfRes` for performance

## Water Performance

### Reflection Updates

The `reflectionUpdater` throttles the Reflector's `onBeforeRender`:

```
Ultra/High:  ~16.7ms cadence (60 Hz)
Medium:      ~41.7ms cadence (24 Hz)
Low/Potato:  reflections disabled
```

### Water Geometry

| Preset | Segments | Vertices |
|--------|----------|----------|
| Ultra | 160×160 | 25,600 |
| High | 128×128 | 16,384 |
| Medium | 80×80 | 6,400 |
| Low | 36×36 | 1,296 |
| Potato | 12×12 | 144 |

### Wave Layers

| Preset | Vertex Wave Layers | Normal Map Layers |
|--------|-------------------|-------------------|
| Ultra | 5 | 3 |
| High | 4 | 3 |
| Medium | 3 | 2 |
| Low | 1 | 1 |
| Potato | 0 | 0 |

## Vegetation Performance

### Forest of Resolve Instancing

All vegetation uses `InstancedMesh`:
- Single draw call per unique mesh
- Per-instance color variation (slight RGB jitter)
- Placement via seeded PRNG with rejection sampling
- Frustum culling enabled (except leaves/mist particles)

### Counts by Preset

| Preset | Trees | Ferns | Rocks | Leaves |
|--------|-------|-------|-------|--------|
| Ultra | 170 | 650 | 95 | 90 |
| High | 145 | 480 | 75 | 64 |
| Medium | 115 | 300 | 55 | 32 |
| Low | 85 | 140 | 35 | 0 |
| Potato | 65 | 75 | 22 | 0 |

## Shadow Optimization

| Preset | Map Size | Enabled | Camera Far |
|--------|----------|---------|------------|
| Ultra | 2048×2048 | Yes | 75 |
| High | 2048×2048 | Yes | 75 |
| Medium | 1024×1024 | Yes | 60 |
| Low | 512×512 | Yes | 50 |
| Potato | 256×256 | No | 40 |

Shadow frustum is tight around the hero for quality. Distant objects lose shadows.

## Mobile Optimization

### DPR Clamping

- Ultra: max 2.0
- High: max 1.5
- Medium: max 1.25
- Low: max 1.0
- Potato: max 0.75

### Mobile-Specific Reductions

- Portrait mode: FOV increases +10° for better vertical visibility
- Mobile GPU tier capped at 2 (never Ultra in auto mode)
- Forest terrain segments scale per preset
- Water reflections disabled below Ultra on mobile

## Performance Targets

| Platform | Target FPS | Minimum Acceptable |
|----------|-----------|-------------------|
| Desktop (Ultra) | 60 | 45 |
| Desktop (Medium) | 60 | 30 |
| Mobile (Auto) | 30–60 | 24 |
| Mobile (Low) | 30 | 20 |

## Known Performance Considerations

1. **CPU particle animation**: `AmbientParticles` and forest mist mutate position attributes on CPU per frame
2. **ForestCameraGuard scene traversal**: Scans entire scene graph on mount (cached after first scan)
3. **EffectComposer re-mount**: Changing presets causes full postprocessing pipeline rebuild
4. **Water Reflector render target**: Created on mount, disposed on unmount — no recycling
5. **Tab visibility**: Canvas continues rendering at full cost in background tabs (no throttling)
