# Forest of Resolve: Environment Pass

## Root Cause

Forest was explicitly marked `assets-required` in the world registry. GameScene consequently rendered the development cylinder and torus instead of an environment. Hero grounding always sampled the coastal scans, even while previewing another region. The preview also reported readiness before its assets had resolved.

## Implemented

- A persistent forest for levels 6-10, with an extended, shaped ground surface, winding trail, stream trench, shrine pool, stone crossing, ruined gateway, towers and cliff backdrop. No forest cylinder/torus fallback remains.
- ForestSurface supplies a BVH raycast sampler to both the environment and hero. Collision includes the actual normalized bridge mesh. Forest floor rendering and collision are generated from the same heightfield.
- Forest Threshold, Rootbound Trail, Shrine of Resolve, Deep Grove and Guardian Clearing use separate positions in the canonical world registry. Direct preview resets to the checkpoint camera without writing account progress.
- Six large foreground trees, six smaller grove trees, preset-scaled instanced woodland, four fern variants, mossy rocks, scanned roots and fallen trunks. Paths and gate approaches exclude blocking scatter.
- Shared GPU foliage wind, independent instance phases, slow gusts and finer flutter. Trunks stay stable. Sparse GPU falling leaf silhouettes and waterfall impact mist are enabled on MEDIUM+ only; reduced-motion pauses animation.
- Leaf-litter PBR floor with path, moss-patch and height-based dampness blending. Wet roughness is restrained on LOW/POTATO to reduce specular aliasing. Anisotropy follows the preset.
- Cool hemispheric fill, warm directional light and localized lantern accents. Nearby trees cast shadows; the distant instanced woodland does not repeat in the shadow pass. Existing sky and postprocessing remain in use, with a forest-colored horizon blend.
- Basic trunk-proximity camera protection, existing ground clearance, and a larger hidden terrain margin for orbit views.
- Region readiness now waits for the shared Suspense boundary. Essential forest asset failures propagate to the region error boundary. Mobile debug overlays no longer collide with the location label or bottom controls.

## Assets

Reused local `tree_small_02`, `fern_02`, `rock_moss_set_01`, `coastal_cliff_02`, `modular_fort_01`, `wooden_lantern_01`, water normals, and photographic sky assets.

Added original-source CC0 assets from Poly Haven:

- `pine_roots`: 11,976 triangles detailed / 2,992 LOD.
- `dead_tree_trunk`: 9,990 triangles detailed / 2,496 LOD.
- `forest_leaves_02`: 1K diffuse, OpenGL normal and roughness textures.

The forest currently uses the LOD roots and trunk. GLBs are meshopt compressed with WebP textures. Download checksums are verified; source attribution is in `public/environment/manifest.json` and `forest-sources.json`. No proprietary game assets were used.

## Water

Extended the existing TidalWater ShaderMaterial/Reflector implementation rather than replacing it. Forest water uses a calmer blue-green/green palette, reduced wave amplitude, bathymetric shallow edges and existing layered normals/Fresnel/foam. Corrected displacement to the plane's local Z axis, which becomes world Y after rotation. POTATO now has no wave displacement. Fixed cleanup so a plain Mesh is not asked to dispose like a Reflector.

HIGH/MEDIUM use an inexpensive sky-tone reflection approximation. ULTRA uses a 512px planar target capped at approximately 24 updates/second, independent of screen DPR. No extra scene refraction pass was added. Waterfall vertices are placed using actual cliff raycasts, with animated flow shading and MEDIUM+ impact mist.

| Preset | Background tree budget | Fern budget | Falling leaves | Water normals / waves | Forest reflection |
| --- | ---: | ---: | ---: | --- | --- |
| ULTRA | 170 | 650 | 90 | 3 / 5 | 512px planar, up to 24Hz |
| HIGH | 145 | 480 | 64 | 3 / 4 | Sky-tone approximation |
| MEDIUM | 115 | 300 | 32 | 2 / 3 | Sky-tone approximation |
| LOW | 85 | 140 | 0 | 1 / 1 | No render target |
| POTATO | 65 | 75 | 0 | 0 / 0 | No render target |

Twelve authored trees and principal architecture remain across presets. AUTO uses the resolved preset, not a separate water path. It initially resolved to HIGH and later adapted to MEDIUM during the final mobile check.

## Verification and Performance

- `npm run lint`, `npm run build -- --webpack`, and `npm run test:grounding` pass.
- Geometry tests cover all forest checkpoints, dry stream crossing, and all existing hero animation clips at both shore and forest checkpoints.
- Browser checks covered direct forest entry, levels 6-10, all five manual presets, AUTO, front/side/rear/elevated orbits, and 1440x900 desktop / 390x844 mobile framing.
- Water diagnostic states confirmed zero reflection targets, foam and detailed-water effects on LOW/POTATO, and release of the planar target when leaving ULTRA.
- Wind and water continued advancing during sustained checks longer than 30 seconds. No new shader/runtime errors were observed after the fixes and clean reload. Earlier development logs included a corrected GLSL reserved identifier, missing fog uniforms, and a Fast Refresh hook-order error that cleared on reload.
- Development statistics now average calls/triangles over the sampling window instead of reporting one arbitrary reflection frame. GPU framebuffer samples reported nonuniform canvas pixel ranges on desktop (0-147) and mobile (0-143), supplementing visual screenshot checks. The final clean forest load reported no new browser errors.

Observed whole-scene samples, not isolated water costs:

| Preset | Observed triangles/frame | Observed draw calls | Observed FPS |
| --- | ---: | ---: | --- |
| ULTRA | ~2.4-4.0M during orbit/reflection checks | ~155-329 | ~32-77 |
| HIGH | ~1.53M after distant-shadow removal | ~217 | ~32-90 |
| MEDIUM | ~1.25M after distant-shadow removal | ~201 | ~30; earlier active samples reached 120 |
| LOW | ~0.80-0.82M | ~136-166 | ~31; earlier active samples reached 120 |
| POTATO | ~0.55-0.66M | ~81-98 | up to 120 in active samples |

These observations used the in-app browser on the current machine (reported 15 cores, 16GB, GPU tier 2). They span warmup, orbit and background/active states; the recurrent ~30 FPS readings are consistent with browser scheduling/throttling, but were not independently diagnosed. They are not a controlled cross-preset benchmark or a weak-laptop performance guarantee. ULTRA samples above include measurements before the last shadow reduction.

The renderer reported approximately 84-124 allocated textures during switching, including cached/shared scene resources. Exact GPU VRAM is not exposed by Three.js. The added 1K forest floor and LOD root/trunk maps have an approximate 64 MiB RGBA8-with-mipmaps footprint before loader copies, attachments and driver overhead; this is an estimate, not measured VRAM. The ULTRA water color target is approximately 1 MiB at RGBA8, plus depth/driver overhead. No water target is retained on lower presets.

## Files

- New region modules: `src/components/game/ForestOfResolve/` (configuration, terrain, collision surface, trees, ruins, lighting, water, atmosphere, wind, horizon, camera guard and composition).
- Integration: `GameScene.tsx`, `Environment.tsx`, `EnvironmentAsset.tsx`, `terrainSurface.ts`, `ProgressionHero.tsx`, `WorldProgress.tsx`, `src/lib/world.ts`.
- Existing water: `TidalWater.tsx`.
- Asset pipeline: `scripts/fetch-forest-assets.mjs`, existing fetch/optimize scripts, new local textures/GLBs and provenance manifests.
- Regression coverage: `scripts/test-grounding.mjs`.

## Remaining Limitations

This is a functional original forest pass, not verified AAA-reference parity. The latest attachment supplied detailed written art direction but no inspectable reference image. Main trees still derive from one existing tree species; a bespoke old-growth trunk/canopy set, more understory species, richer shrine/gate dressing and a dedicated broken bridge would improve the art substantially. Scaled scans and low-LOD masonry remain visible at close inspection.

The waterfall is an inexpensive surface effect, not fluid simulation, and still needs broader artistic tuning. Falling leaves use small shader silhouettes rather than photographed leaf cards. Mist is localized particles plus distance fog, not volumetric scattering or true sun shafts. Foliage shadow deformation is approximate. Camera protection is a trunk approximation, not complete architecture/branch collision. No terrain/rock wetness simulation, dynamic moss growth, caustics, or physically accurate refraction was added. Distant trees use a shared low-LOD instanced batch rather than per-instance distance LOD.

Account level, quests, XP, hero model/animations and unrelated region content were not redesigned. Other unfinished regions remain explicitly marked as placeholders.
