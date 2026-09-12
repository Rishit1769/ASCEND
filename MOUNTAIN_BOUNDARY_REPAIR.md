# Mountains of Trial boundary repair

## Confirmed causes

1. The perspective camera far plane was 220 while the physical sky and HDR cloud sphere were at 450 and 400. This clipped sky coverage. The terrain ended at x = +/-59, z = -94..32 with no continuous adjoining surface. Transparent rendering also had no mountain-specific CSS fallback. The former claim that CSS alone caused all white areas was not established.
2. Camera height was corrected and then OrbitControls.update was called again. That could undo the correction. The ground sampler returned a seabed value on a miss, and its ray started at a fixed y=60. It did not represent all rendered cliffs and architecture.
3. Cloud meshes had XY geometry but X/Z scaling, creating narrow vertical strips. A separate 125-unit-wide, uniformly translucent rectangle produced a hard white strip. It has been removed and cloud dimensions corrected.
4. Existing distant ridges were mounted, but separated and open-ended. POTATO used eight instances with angles divided by fourteen, leaving a sector uncovered.
5. Terrain slope/material weights used view-space normals with world-space positions. Orbiting therefore changed material classification. They now use world-space normals.

## Coordinates, references, and visibility

No camera/checkpoint local-to-world mismatch was established: region roots currently use identity transforms. Collision copies now bake each rendered mesh's matrixWorld into geometry, so their queries use world coordinates explicitly.

The old fixed-height sampler can miss outside the heightfield and above its ray origin. New camera ground rays start above the rendered ground bounds and handle a miss explicitly. No stale old-region reference was reproduced; the new collider list is rebuilt on mount, level, and preset changes and disposed during cleanup, including Strict Mode effect replay.

No independent frustum-culling defect was demonstrated. The confirmed clipping problem was the far plane. New shell geometry computes both bounding box and sphere; normal frustum culling remains enabled. Camera near/far is now 0.25/1000, sufficient for the existing sky geometry from the supported camera area.

## Camera architecture

MountainCameraSafety owns final validation at frame priority 0, after OrbitControls (-1) and progression (-0.5). It preserves the requested transform separately and restores it before the next controls step. Reset positions pass through the same validator. It does not call controls.update after correction.

Rendered ground is tagged cameraGround. Terrain, bridge, temple, and major cliff/rock groups are tagged cameraObstacle. World-space BVH copies support ground rays, target-to-camera obstruction rays, and closest-triangle clearance with a 0.9-unit radius. Ground clearance is 1.35 units. Clouds, transparent decorations, hero, instanced vegetation, and backgroundMountain meshes are excluded.

The validator clamps X/Z to the playable rectangle inset by two units. A missed ground ray restores the last validated position, or uses an elevated target fallback before initialization. Recovery is eased before validation; resolving an immediate intersection can still produce a sharp correction. This is not a continuous swept-sphere physics solver.

Shared settings: requested zoom 5.5..42 units; polar range 0.42..1.42 radians (about 24..81 degrees); unrestricted azimuth. Obstructions can shorten distance below the requested minimum. Terrain correction can raise the final camera above the requested orbit sphere.

| Level | Authored camera offset from grounded hero | Target offset |
| --- | --- | --- |
| 11 | 0, 3.4, 12.5 | 0, 2.4, 0 |
| 12 | -2, 4.2, 12 | 0, 2.4, 0 |
| 13 | 6, 4, 14 | 0, 2.4, 0 |
| 14 | -3, 9.5, 32 | 0, 2.4, 0 |
| 15 | 0, 8, 38 | 0, 2.4, 0 |

## Surrounding world

MountainWorldShell shares the exact sampled perimeter of each preset's playable terrain. Eight irregular elevation bands extend outward to 220 additional units, creating descending slopes and neighboring ridges, not a flat filler plane. Its material uses macro color and altitude variation, no high-resolution textures, collision, or shadow casting. Existing distant silhouettes remain beyond the playable terrain; POTATO now distributes them around the entire circle. A blue-gray scene/CSS fallback covers loading while the physical sky remains the main sky.

Shell subdivision follows existing terrain presets: ULTRA 180, HIGH 150, MEDIUM 118, LOW 82, POTATO 54 samples per side. The shell adds one draw and respectively 10,080 / 8,400 / 6,608 / 4,592 / 3,024 triangles. Existing cloud counts remain preset-driven. Coverage is retained across presets; there is no camera-distance streaming or texture compression change.

## Verification and limitations

All five levels completed 16-second development sweeps on MEDIUM and HIGH: one full clockwise turn and one counterclockwise turn with varying radius and polar angle. Sampled rear views were inspected. Actual mouse drags, resets at all five levels, and direct checkpoint jumps were exercised. LOW and POTATO received additional level-14 sweeps. Browser error logs were empty. Sampled HIGH performance was approximately 115-120 FPS during sweeps, with roughly 158-177 draws in sampled views; rapid transitions briefly sampled about 106 FPS. These are local development observations, not controlled before/after benchmarks. BVH setup adds CPU/memory cost on region/preset changes.

Debug colors, world bounds, a reproducible orbit sweep, camera/ground-hit attributes, and missing-shell/clipped-sky assertions remain development-only. Debug coloring distinguishes ground and background geometry; it is not a complete per-layer renderer inspector.

Build, lint, and existing grounding regression tests were run. Existing grounding tests do not certify every mountain animation/route. A full archived six-view screenshot matrix, mobile coverage, all-level ULTRA/LOW/POTATO sweeps, and exhaustive walking-transition testing remain unperformed. Nearby architecture or terrain can still obscure the hero from some angles; the current geometry is not an uninterrupted cinematic vista. Do not interpret sampled successful sweeps as a mathematical guarantee for every possible drag, loaded asset, or future layout.

## Files

- GameScene.tsx: clipping range and mountain loading/background fallback.
- ProgressionHero.tsx: mountain target and final-camera ownership.
- MountainCameraSafety.tsx: collision registration, BVHs, desired/final transforms, clearance and no-hit handling.
- MountainWorldShell.tsx: continuous surrounding terrain.
- MountainWorldDiagnostics.tsx: development controls and diagnostics.
- MountainTerrain.tsx: ground tags and world-space normals.
- MountainBridge.tsx / MountainTemple.tsx: obstacle tags.
- MountainCliffs.tsx: full-circle POTATO placement and background tags.
- MountainClouds.tsx: corrected cloud scale and removal of hard rectangular strip.
- MountainsOfTrial/index.tsx: mounts the shared safety, world shell, and development diagnostics.
