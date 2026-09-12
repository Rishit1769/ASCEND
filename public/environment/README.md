# Forgotten Shore Environment Assets

Powered by Poly Haven: https://polyhaven.com

All seven source models and their textures are licensed CC0-1.0.
License: https://polyhaven.com/license
CC0 deed: https://creativecommons.org/publicdomain/zero/1.0/
Original assets are not copied from any commercial game.
The existing hero is separate and retains its existing provenance.

| Source asset | Detailed triangles | Distant triangles | Detailed texture resolution |
| --- | ---: | ---: | --- |
| [Coastal Cliff 02](https://polyhaven.com/a/coastal_cliff_02) | 69,995 | 17,495 | 2048 |
| [Coast Rocks 01](https://polyhaven.com/a/coast_rocks_01) | 44,984 | 11,243 | 2048 |
| [Modular Fort 01](https://polyhaven.com/a/modular_fort_01) | 28,218 | 10,037 | 1024 |
| [Fern 02](https://polyhaven.com/a/fern_02) | 5,996 | 1,990 | 1024 |
| [Tree Small 02](https://polyhaven.com/a/tree_small_02) | 18,649 | 4,745 | 1024 |
| [Rock Moss Set 01](https://polyhaven.com/a/rock_moss_set_01) | 18,338 | 5,044 | 2048 |
| [Wooden Lantern 01](https://polyhaven.com/a/wooden_lantern_01) | 6,010 | 1,537 | 512 |

Counts above refer to each complete asset file, including all modular parts or
plant/rock variants. Only selected fort modules are placed in the scene.
Exact generated bounds, texture names, and source counts are in manifest.json.

## Materials and Compression

Base color, tangent-space normal, and packed roughness/metalness maps are
preserved. The source ARM red channel is connected as ambient occlusion at
strength 0.65 on the scans, architecture, and vegetation. Foliage retains
alpha masking. Lantern materials preserve their glass and metal channels.

GLB geometry uses Meshopt compression and quantization. Texture images use
WebP; this compresses transfer size, not GPU texture memory. No KTX2/Basis
transcoder was introduced. Detailed rock maps are 2K, architecture/foliage
1K, lantern maps 512px. Distant maps are at most 1K.

The full generated set is approximately 21 MiB; the app fetches only the
versions it references, and reuses loaded GLBs through Drei's cache.

## Rendering Strategy

- Near cliffs use the detailed scan; a Three.js LOD switches to the smaller
  mesh beyond 28 world units with hysteresis. Far cliffs use the distant file.
- Four fern variants repeat as 24 instanced sets; rock variants repeat as
  four instanced sets. Each source mesh/material uses one instanced draw.
- Other placements share their loaded geometry and materials.
- The ground is a coastal scan, supported by a textured ground bed covering
  gaps. Its center is raycast to meet the existing hero's floor height.
- A single 1024px directional shadow map renders the hero's existing casters.
  Imported environment meshes receive that shadow. The existing 256px
  contact shadow remains.
- Sky cloud cover is a slow four-octave shader on an enclosing background
  shell. Existing soft alpha mist, exponential fog and 96 ambient particles
  remain. Reduced-motion freezes the cloud and mist movement.
- Environment loading is independently suspended so the hero and HUD can
  appear while assets load. Failures have a readable fallback.
- In development, canvas data-scene-stats reports sampled frame cadence,
  renderer triangles, draw calls and texture counts.

## Visual Verification and Limits

Verified at 1440x900 and 2560x1440 desktop and 390x844 mobile, including an orbit drag
showing parallax. The desktop sample reported about 620,314 rendered
triangles, 85 main-pass draw calls and 120 frames/sec on this test machine.
This is a short development-mode observation, not a cross-device or GPU
benchmark. Additional shadow/contact passes are not included in main-pass
draw calls. Device performance will vary.

An initial all-2K texture version lost its WebGL context during hot reload.
Background and small-object maps were reduced before the final successful
reloads. The current version is considerably heavier than the old primitive
scene and still needs broader device testing.

## Rebuilding

Run npm run assets:fetch, then npm run assets:build.
Optional asset IDs can be passed after -- to process selected assets.
Downloads are checksum-verified against the source metadata and stored in
the ignored .asset-cache/environment directory, outside public.
Only optimized GLBs, manifest.json and this attribution file ship.
The running application never calls Poly Haven's API.

## Integration Files

Created: EnvironmentAsset.tsx, AtmosphericSky.tsx, scripts/fetch-environment.mjs,
scripts/optimize-environment.mjs, and public/environment assets/manifest.

Replaced primitive content: DistantMountain.tsx, Terrain.tsx, Ruins.tsx,
DistantFires.tsx.

Updated: GameScene.tsx (loading, sky, fog, shadows and development metrics),
SceneLighting.tsx (bounded shadow map), Dashboard.tsx (empty HUD space passes
orbit drags through), package.json/package-lock.json (development tooling),
and .gitignore (source asset cache).

The region dispatcher in Environment.tsx remains the entry point for future
regions. The hero model, animation logic and HUD visuals were not redesigned.
