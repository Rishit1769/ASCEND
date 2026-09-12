# Realms

## Realm System Overview

Realms are the primary progression divisions in ASCEND. Each realm is a distinct 3D environment with unique terrain, atmosphere, lighting, and visual identity.

### How Realms Work

1. Each realm has a level range (e.g., Forgotten Shore: levels 1–5)
2. The player's level determines which realm is active
3. When the level crosses a realm boundary, the 3D scene remounts with a new region key
4. The hero walks along a path to the new checkpoint
5. The environment, terrain, water, and lighting all change

### Source Files

| File | Purpose |
|------|---------|
| `src/lib/world.ts` | Region definitions, checkpoints, `resolveWorld()` |
| `src/components/game/Environment.tsx` | Region dispatcher |
| `src/components/game/GameScene.tsx` | Scene mounting with region key |
| `src/components/game/WorldProgress.tsx` | Level context for region resolution |

### Region Data Structure

```typescript
interface WorldRegion {
  id: RegionSlug;
  name: string;
  levelStart: number;
  levelEnd: number;
  theme: string;
  landmark: string;
  characterStage: string;
  status: "available" | "assets-required";
  terrainLayers: TerrainLayer[];
  atmosphere: { fog: string; density: number; sunIntensity: number };
  checkpoints: Checkpoint[];
}
```

---

## The Forgotten Shore

### Purpose

The Forgotten Shore is the player's first experience with ASCEND. It represents the beginning of the journey — isolation, discovery, and the first steps of building discipline.

### Visual Identity

- **Color Palette**: Cool coastal blues and greys with warm fire accents
- **Atmosphere**: Dense coastal fog (#687f91), mysterious and inviting
- **Lighting**: Warm directional sun with cool fill, 4 accent point lights
- **Water**: Reflective ocean with multi-octave waves, foam, depth-based coloring

### Environment Components

| Component | File | Description |
|-----------|------|-------------|
| Terrain | `Terrain.tsx` | Ground bed with procedural gravel/silt/moss shader |
| Water | `TidalWater.tsx` | Reflective ocean (160×160 plane) |
| Mountains | `DistantMountain.tsx` | Background cliffs + fortress architecture |
| Ruins | `Ruins.tsx` | Foreground ruins, vegetation, rocks |
| Fog | `FogLayers.tsx` | 7 animated billboard layers + light shaft |
| Particles | `AmbientParticles.tsx` | 0–120 floating dust motes |
| Fires | `DistantFires.tsx` | 2 lantern point lights with flicker |

### Terrain

- **Geometry**: 160×160 PlaneGeometry with scanned rock meshes
- **Ground bed**: Custom shader with procedural grain, mineral, pebble, damp, moss, and path texturing
- **Surface sampling**: BVH-accelerated raycasting via `three-mesh-bvh`
- **Collision**: Hero grounding via sole-probe vertex detection

### Water

- **Type**: Custom ShaderMaterial with Three.js Reflector for planar reflections
- **Geometry**: 160×160 plane, segments vary by preset (12–160)
- **Features**: 5-layer wave animation, 3-layer normal map flow, Fresnel, depth-based coloring, foam, specular glint
- **Reflections**: Ultra/High/Medium (1024/1024/512px), cadence varies

### Spawn

- Hero starts at world position `[0, 0, 6.5]`
- Camera offset: `[0, 2.8, 8.2]` relative to hero
- Facing direction: `Math.PI` (toward camera)

### Checkpoints

| Level | Name | World Position |
|-------|------|---------------|
| 1 | The Landing | [0, 0, 6.5] |
| 2 | The Drowned Path | [0.5, 0, 4] |
| 3 | The Forgotten Ruins | [-0.5, 0, -2] |
| 4 | The Sanctuary Approach | [0, 0, -10] |
| 5 | The First Gate | [0, 0, -21] |

### Performance Considerations

- Terrain BVH is built once on mount
- Water reflections update at cadence (60Hz Ultra, 24Hz Medium)
- Fog layers use billboard sprites (GPU-friendly)
- Ambient particles use CPU position mutation (120 max on Ultra)
- Point lights: 4 total (2 distant fires + 2 in ruins)

### Important Source Files

- `src/components/game/Environment.tsx` — Region dispatcher
- `src/components/game/Terrain.tsx` — Ground bed mesh
- `src/components/game/TidalWater.tsx` — Water renderer
- `src/components/game/DistantMountain.tsx` — Background architecture
- `src/components/game/Ruins.tsx` — Foreground props
- `src/components/game/FogLayers.tsx` — Atmospheric fog
- `src/components/game/SceneLighting.tsx` — Lighting rig
- `src/components/game/terrainSurface.ts` — Surface sampler provider

---

## Forest of Resolve

### Purpose

Forest of Resolve should feel like a clear visual and gameplay upgrade from the Forgotten Shore. It represents consistency — the discipline of showing up day after day.

### Visual Identity

- **Color Palette**: Rich greens, deep earth tones, warm lantern accents
- **Atmosphere**: Forest fog (#526963), denser and more enclosed
- **Lighting**: Hemisphere + directional sun + cool fill + warm point lights
- **Water**: Stream with waterfall, reflections on Ultra only

### Environment Components

| Component | File | Description |
|-----------|------|-------------|
| Terrain | `ForestTerrain.tsx` | Procedural heightmap (160×160) |
| Trees | `ForestTrees.tsx` | Instanced trees, ferns, rocks (65–170 trees) |
| Ruins | `ForestRuins.tsx` | Sanctuary architecture + lanterns |
| Water | `ForestWater.tsx` | Stream + waterfall + mist particles |
| Atmosphere | `ForestAtmosphere.tsx` | GPU-animated falling leaves |
| Camera Guard | `ForestCameraGuard.tsx` | Prevents camera through tree trunks |
| Wind | `ForestWind.tsx` | Shared wind time uniform |
| Horizon | `ForestHorizon.tsx` | Background sky sphere |

### Terrain

- **Geometry**: Procedural heightmap via `forestHeight()` function
- **Features**: Stream channels, pools, waterfall run, hill system, path system
- **Segments**: Scale per preset (48–160)
- **Textures**: Tiled forest floor (diffuse, normal, roughness) with trail, moss patches, wet areas

### Vegetation

| Preset | Trees | Ferns | Rocks | Leaves | Anisotropy |
|--------|-------|-------|-------|--------|------------|
| Ultra | 170 | 650 | 95 | 90 | 16 |
| High | 145 | 480 | 75 | 64 | 8 |
| Medium | 115 | 300 | 55 | 32 | 4 |
| Low | 85 | 140 | 35 | 0 | 2 |
| Potato | 65 | 75 | 22 | 0 | 1 |

- All vegetation uses **InstancedMesh** for performance
- Wind animation applied via `onBeforeCompile` shader injection
- Placement uses seeded PRNG with rejection sampling (avoids path/stream areas)

### Water

- **Type**: Same `TidalWater` component as Forgotten Shore (with `forest` prop)
- **Reflections**: Ultra only (512px, 24Hz)
- **Colors**: Green-tinted (shallow: #587365, mid: #314e43, deep: #182e29)
- **Waterfall**: Custom shader sheet with animated streaks
- **Mist**: 32-point particle system at waterfall base

### Camera Guard

- Scans scene for bark-material meshes
- Uses ray-based nearest-obstacle test
- Prevents camera from passing through tree trunks
- Runs on mount (not per-render) for performance

### Checkpoints

| Level | Name | World Position |
|-------|------|---------------|
| 6 | Forest Threshold | [sin(8×0.19)×1.65, 0, 8] |
| 7 | Rootbound Trail | [sin(-1×0.19)×1.65, 0, -1] |
| 8 | Shrine of Resolve | [sin(-12×0.19)×1.65, 0, -12] |
| 9 | The Deep Grove | [sin(-23×0.19)×1.65, 0, -23] |
| 10 | The Guardian Clearing | [sin(-34×0.19)×1.65, 0, -34] |

### Performance Considerations

- Instanced rendering for all vegetation (single draw call per mesh type)
- Forest terrain segments scale per preset
- Water reflections disabled below Ultra
- Leaves and mist particles gated on `waterDetailEnabled`
- ForestCameraGuard only re-scans on mount, not per-frame

### Important Source Files

- `src/components/game/ForestOfResolve/index.tsx` — Scene composition
- `src/components/game/ForestOfResolve/forestConfig.ts` — Terrain + quality config
- `src/components/game/ForestOfResolve/ForestTerrain.tsx` — Procedural terrain
- `src/components/game/ForestOfResolve/ForestTrees.tsx` — Instanced vegetation
- `src/components/game/ForestOfResolve/ForestWater.tsx` — Stream + waterfall
- `src/components/game/ForestOfResolve/ForestCameraGuard.tsx` — Camera safety
- `src/components/game/ForestOfResolve/ForestWind.tsx` — Wind context

---

## Realm Transition

### How Transition Works

1. Player level crosses a boundary (e.g., 5 → 6)
2. `resolveWorld(level)` returns the new region
3. `GameScene.tsx` re-renders with new region ID
4. `<group key={region.id + reloadCounter}>` forces full remount
5. Old region unmounts (cleanup effects run, resources disposed)
6. New region mounts (assets load via Suspense)
7. `ProgressionHero` detects level change, generates walk path
8. Hero walks from old position to new checkpoint
9. Camera follows via OrbitControls target tracking

### Visual Behavior

- The transition is a **hard remount** — no cross-fade between regions
- The loading screen appears during asset loading
- The hero physically walks through the world during transition
- Region-specific lighting, fog, and atmosphere change instantly on mount

---

## Realm Lifecycle

```
Level changes
  → resolveWorld() returns new region
  → Region key changes
  → Old region unmounts
    → Cleanup effects run
    → Resources disposed
  → New region mounts
    → Terrain loads (Suspense)
    → Environment loads (Suspense)
    → Hero loads (Suspense)
    → Lighting + atmosphere applied
  → ProgressionHero generates walk path
  → Hero walks to new checkpoint
  → Camera follows
  → Region fully loaded
```

---

## Future Realms

The following realms exist in the codebase but are NOT part of the MVP:

| Realm | Levels | Status | Notes |
|-------|--------|--------|-------|
| Realm of Ascension | 11–15 | Partially implemented | Environment exists, has own camera config |
| Mountains of Trial | — | Partially implemented | Environment exists, not in level range |
| Temple of Knowledge | 16–20 | Data only | Marked `assets-required` |
| The Celestial Heights | 21–25 | Data only | Marked `assets-required` |
| The Summit | 26+ | Data only | Marked `assets-required` |

These are **future scope** and should not be presented as MVP content.
