# Water System

## Overview

ASCEND uses a single shared water component (`TidalWater.tsx`) across all three realms with realm-specific configuration. The water system includes planar reflections, multi-layer wave animation, animated normal maps, depth-based coloring, foam, and Fresnel effects.

## Architecture

### Source Files

| File | Purpose |
|------|---------|
| `src/components/game/TidalWater.tsx` | Core water renderer (shared) |
| `src/components/game/ForestOfResolve/ForestWater.tsx` | Forest wrapper + waterfall |
| `src/components/game/RealmOfAscension/AscensionWater.tsx` | Realm wrapper + fallback pools |
| `src/components/game/GraphicsQuality.tsx` | Global water config per preset |
| `src/components/game/ForestOfResolve/forestConfig.ts` | Forest reflection overrides |
| `src/components/game/RealmOfAscension/realmConfig.ts` | Realm quality overrides |
| `public/environment/waternormals.jpg` | Tangent-space normal map |

### Water Bodies

| # | Name | Realm | Component | Technique |
|---|------|-------|-----------|-----------|
| 1 | Shallow Coastal Water | Forgotten Shore | `TidalWater` (default) | Reflector / ShaderMaterial |
| 2 | Forest Stream | Forest of Resolve | `TidalWater forest` | Reflector / ShaderMaterial |
| 3 | Cliff-fed Waterfall | Forest of Resolve | `ForestWater` (inline shader) | ShaderMaterial |
| 4 | Waterfall Impact Mist | Forest of Resolve | `ForestWater` (points) | Points + ShaderMaterial |
| 5 | Ascension Courtyard | Realm of Ascension | `TidalWater realm` | Reflector / ShaderMaterial |
| 6 | Mountain Waterfalls (×3) | Mountains of Trial | `MountainWaterfalls` | ShaderMaterial |

## Shared Water Component

### Rendering Modes

`TidalWater.tsx` operates in two modes based on `waterReflectionEnabled`:

1. **With reflections** (Ultra/High/Medium): Uses Three.js `Reflector` for planar reflections with a custom fragment shader
2. **Without reflections** (Low/Potato): Uses a plain `ShaderMaterial` with flat sky-tint color

### Geometry

```
Coastal/Forest: PlaneGeometry(160, 160, segments, segments)
Realm:          PlaneGeometry(36, 32, segments, segments)
```

Segments vary by preset: 12 (Potato) → 160 (Ultra).

### Positioning

| Realm | Y Position | Rotation |
|-------|-----------|----------|
| Forgotten Shore | SEA_LEVEL (-1.62) | -π/2 (horizontal) |
| Forest of Resolve | -0.48 | -π/2 |
| Realm of Ascension | -0.12 | -π/2 |

### Transparency

All water uses:
- `transparent: true`
- `depthWrite: false`

Alpha is computed in the fragment shader:
```glsl
float alpha = clamp(baseAlpha + absorption*0.6 + fresnel*0.5*reflectivity + shore*0.04, 0, 0.96);
```

## Shader System

### Vertex Shader

- 5 directional sine wave layers (conditionally included by `waterWaveLayers`)
- Each layer: wavelength, speed, amplitude, direction
- Displaces vertex Z position
- Computes `waveCrest` for foam masking

### Fragment Shader

- 3 animated normal map flow layers (conditionally included by `waterNormalLayers`)
- Fresnel: Schlick approximation `0.02 + 0.98 * pow(1 - max(dot(view,n),0), 5)`
- Reflection: 5-tap blur sampling from Reflector texture (or flat sky tint)
- Depth-based color: 3-tier exponential absorption (shallow → mid → deep)
- Lambert shading with sun direction
- Specular glint (sun highlight)
- Foam: shoreline + wave crest
- Fog integration

### Normal Map Animation

Three flow layers at different scales and speeds:

| Flow | UV Transform | Speed |
|------|-------------|-------|
| A | `worldPoint.xz * 0.115` | `(time*0.018, time*0.006)` |
| B | Rotated matrix × `worldPoint.xz * 0.255` | `(-time*0.011, time*0.017)` |
| C | `worldPoint.zx * 0.62` | `(time*0.031, -time*0.021)` |

## Reflection System

### Reflector Configuration

```typescript
new Reflector(geometry, {
  textureWidth: resolution,    // 512–1024 based on preset
  textureHeight: resolution,
  clipBias: 0.003,
  multisample: 0,
})
```

### Reflection Throttling

The `reflectionUpdater` function throttles reflection rendering:

```
Ultra:  ~16.7ms cadence (60 Hz)
High:   ~16.7ms cadence (60 Hz)
Medium: ~41.7ms cadence (24 Hz)
Low:    ~83.3ms cadence (12 Hz) — but reflections disabled
Potato: ~166.7ms cadence (6 Hz) — but reflections disabled
```

### Realm-Specific Reflection Overrides

| Realm | Ultra | High | Medium |
|-------|-------|------|--------|
| Coastal | 1024px @ 60Hz | 1024px @ 60Hz | 512px @ 24Hz |
| Forest | 512px @ 24Hz | Disabled | Disabled |
| Ascension | 512px @ 50Hz | 384px @ 50Hz | Disabled |

## Depth System

### Bathymetry

A 256×256 `DataTexture` (RedFormat) stores pre-computed depth:

- Each pixel: world-space height sampled from terrain via BVH raycasting
- Mapped to 0–255 range: `(height - SEABED_Y) / 8`
- Used in fragment shader for depth-based coloring

### Depth Colors

| Realm | Shallow | Mid | Deep |
|-------|---------|-----|------|
| Coastal | #496c68 | #315d61 | #162b2f |
| Forest | #587365 | #314e43 | #182e29 |
| Ascension | #4DB5C8 | #178FA8 | #0B5E78 |

### Absorption

```glsl
float absorption = 1.0 - exp(-depth * depthAbsorb);
```

- Coastal/Forest: `depthAbsorb = 1.22`
- Ascension: `depthAbsorb = 2.6` (higher absorption, more opaque)

## Water Preset Matrix

| Setting | Ultra | High | Medium | Low | Potato |
|---------|-------|------|--------|-----|--------|
| Resolution | 1024 | 1024 | 512 | 256 | 128 |
| Reflections | Yes | Yes | Yes | No | No |
| Segments | 160 | 128 | 80 | 36 | 12 |
| Wave Strength | 1.0 | 0.9 | 0.62 | 0.32 | 0.16 |
| Normal Strength | 1.0 | 0.92 | 0.72 | 0.46 | 0.22 |
| Refraction | 1.0 | 0.85 | 0.38 | 0.12 | 0 |
| Wave Layers | 5 | 4 | 3 | 1 | 0 |
| Normal Layers | 3 | 3 | 2 | 1 | 0 |
| Foam | Yes | Yes | Yes | No | No |
| Detail Enabled | Yes | Yes | Yes | No | No |

## Realm-Specific Behavior

### Forest of Resolve

- Wave strength multiplied by 0.18 (gentler)
- Reflections only on Ultra (512px, 24Hz)
- Fragment discard for out-of-bounds: `|x| > 43 || z < -63 || z > 23`
- Green-tinted depth colors

### Realm of Ascension

- Wave strength multiplied by 0.08 (near-flat)
- Normal strength multiplied by 0.35
- Reflections on Ultra (512px) and High (384px)
- Foam always disabled
- Fragment discard for central walkway and temple base
- Different sun direction: `(35, 65, 48).normalize()`

## Reduced Motion

When `prefers-reduced-motion: reduce` is active:
- Water `time` uniform is NOT advanced
- Water appears frozen (no wave animation, no normal flow)
- Reflections still update (if enabled)

## Memory Management

- Normal map cloned per water instance, disposed on cleanup
- Reflector render target disposed on cleanup
- Geometry disposed on cleanup
- Bathymetry DataTexture disposed on cleanup
- `THREE.UniformsUtils.clone(THREE.UniformsLib.fog)` for fog integration
