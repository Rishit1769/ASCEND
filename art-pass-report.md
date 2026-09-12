# The Forgotten Shore: Final Environment Art Pass

## Largest visible improvements

1. **A readable journey instead of foreground clutter.** Smaller foreground rocks frame the hero. Individually selected stone variants and irregular plant clusters border a softly lighter, winding route to the stairs. The hero's original model and animations remain intact.
2. **A sanctuary anchored in the landscape.** The taller offset tower, smaller secondary tower, stepped walls, buried retaining masonry, and mossy rock shoulders replace the symmetrical, exposed fortress base. The gate and stairs remain the focal opening. The foundation was revised against screenshots to eliminate a visible unsupported gap.
3. **Separated depth layers.** Cool distant cliff silhouettes sit behind more detailed middle-distance rock. Moving valley mist, sanctuary-base mist, and a layered cloud opening separate these layers from the sharper, warmer foreground.
4. **More convincing surface response.** Sky-derived environment illumination reveals the bronze armor, while roughness floors prevent dry stone from appearing plastic. World-space weathering and individual model variants make repetition less conspicuous.

## Before audit

The starting render was inspected before editing. Its strongest limitations were:

- Repeated orientations of the same cliff scan and a recognizable repeated rock-set layout.
- The scatter helper ignored its requested width/height and instantiated every mesh in a set together.
- Ferns followed evenly spaced alternating rows and used a fixed ground height.
- A near-symmetrical fortress had an exposed horizontal foundation and little overlap with nature.
- Bright local entrance lighting, largely uniform cool fill, and weak atmospheric separation flattened the scene.
- Important imported textures had no explicit anisotropy treatment.
- The support plane tiled a scanned texture atlas as though it were a seamless ground material.
- Existing contact shadows alone did not ground the environment's intersections.

The imported PBR maps were already present. This pass preserved those assets instead of replacing them or upscaling their textures.

## Renderer, lighting, and color

- Retained sRGB output and ACES filmic tone mapping; exposure is now 1.1.
- ACES runs at the end of the postprocessing chain, rather than tone-mapping the scene twice.
- High uses 4-sample composer MSAA. Medium/Low use FXAA. DPR caps are 1.5, 1.25, and 1 respectively.
- Added a one-time 128px sky cubemap capture for roughness-filtered environment illumination. It uses the procedural sky, not a new downloaded HDRI or per-frame cubemap capture.
- Warm directional light now complements cool sky/hemisphere fill. Existing hero rim lights are retained. The sanctuary's amber entrance light is softer and less clipped, with a restrained violet accent.
- Shadow color separation comes from lighting and materials, not a heavy full-screen tint or LUT. Natural stone/green midtones and bronze armor remain visible.
- One directional shadow map covers the hero, selected nearby rocks, a major tree, and key architecture. Background cliffs do not cast dynamic shadows. Presets allocate 2048/1024/512 maps; bias, normal bias, and filtering radius are explicitly set.
- Shadow lights and compositor targets are recreated on preset changes so resolution changes actually take effect.

## Materials and textures

- Kept imported base-color, normal, roughness, and AO maps and their existing color-space assignments.
- Rock and masonry use zero metalness, 1.12x their original normal strength, and AO-map intensity 0.8.
- Dry stone has a minimum roughness of 0.86. Only patchy low-lying areas can fall toward 0.48; the original roughness map can keep those areas rougher.
- Subtle world-space mineral/weathering variation breaks identical surface response without changing geological identity. Instance colors add restrained variation.
- Important rock, terrain, and masonry maps use anisotropy capped at `min(8, hardware maximum)`. Tiny foliage/lantern textures are not indiscriminately raised to that setting.
- No texture upscaling: existing 2K rock surfaces, 1K architecture/foliage, and 512px lantern textures remain. Meshopt, WebP, shared geometry, and cached GLBs are retained. No KTX2 conversion was introduced.
- Replaced the atlas-tiled support plane with matte procedural mineral/gravel variation. These exposed dark areas are treated as damp ground, not a new water surface. No water simulation or cliff-reflection system is claimed.

## AO and postprocessing

- Added [N8AO](https://github.com/N8python/n8ao) through [React Postprocessing](https://react-postprocessing.docs.pmnd.rs/).
- High: half-resolution Medium-quality AO. Medium: half-resolution Low-quality AO. Radius 0.45 world units, distance falloff 0.6, intensity 1.15, blue-gray occlusion color.
- High alone adds restrained bloom: intensity 0.12 and luminance threshold 1.3. It is intended for highlights, not to soften the entire image.
- No depth of field, chromatic aberration, heavy vignette, or global blur.
- High/Medium use AO plus actual directional shadows. Low uses the existing contact-shadow fallback without AO. Keeping the transparent contact plane active under AO produced a large dark patch during testing; separating those paths removed it.

## Sky and mist

- The sky uses six-octave, domain-warped cloud noise, a secondary broad cloud layer, blue-gray openings, dark cloud bodies, silver edges, and a selective warm break.
- The sky moves slowly and honors reduced motion. Its environment-lighting capture is intentionally static for performance.
- Exponential scene fog provides continuous atmospheric perspective.
- Seven art-directed mist layers on High occupy valleys, the sanctuary base, and the spaces behind foreground rock. Medium uses five; Low uses three.
- Each layer has moving multi-frequency noise and an alpha falloff that reaches zero before the mesh boundary. There are no visible rectangular panel edges in the tested framing.
- One very faint, soft atmospheric shaft is enabled on High. These are inexpensive noise-masked layers, not a volumetric ray-marching system.

## Vegetation and architecture

- Four fern variants are distributed in six uneven clusters: 90 plants on High, 54 on Medium, 24 on Low.
- Six individual mossy-rock variants provide small path-edge detail: 40 stones on High/Medium, 16 on Low.
- Scatter normalization now honors requested dimensions. Raycasts against the two actual terrain scans place each cluster instance on the surface instead of a fixed Y plane.
- Instancing remains per mesh/material. Trees use asymmetric paired placement, different heights and rotations, with lower-detail background models.
- Existing broken wall fragments and lanterns mark an abandoned processional route; no unrelated prop collection was added.
- The sanctuary keeps the same modular kit, with revised hierarchy, retaining masonry, rock overlap, mossy foundation stones, and localized plants.

## Performance and verification

Browser samples on this machine, not cross-device guarantees:

| View / preset | Sampled frame rate | All-pass triangles | All-pass draw calls |
| --- | ---: | ---: | ---: |
| 2560 x 1440 / High | about 88-91 fps | 850,271 | 167 |
| 2560 x 1440 / Medium | about 120 fps | 796,279 | 145 |

The earlier 1440 x 900 High check also sampled around 120 fps. Low was checked at 390 x 844 and sampled around 120 fps. Frame timing includes browser/device limits and can change with camera position, thermal state, and other activity. These are development-preview measurements, not a GPU benchmark. There was no controlled same-resolution pre/post performance benchmark; the previous report's main-pass counts are not directly comparable with these all-pass counts.

- High adds AO, bloom, an environment cubemap, and more shadow casters. Medium/Low reduce those costs rather than merely changing a label.
- No new GLB or high-resolution texture downloads were added by this pass. The existing optimized environment asset set remains unchanged on disk.
- High is the initial choice for desktop-width devices reporting at least four CPU threads; smaller devices start at Medium. This is a conservative UI heuristic, not GPU capability detection. The selected preset is saved locally.
- Screenshots checked at the original viewport, 1440 x 900, 2560 x 1440, and 390 x 844. The hero remains fully framed in the tested views.
- Nine GPU pixel samples returned nine distinct colors, confirming nonblank output on the tested presets. Browser console checks found no rendering errors.
- Hero animation was visibly advancing; mobile orbit drag changed the view correctly. Preset switching and persistence were checked. Mobile had no horizontal overflow.
- TypeScript and ESLint pass. Production compilation and static generation pass using `npm run build -- --webpack`.
- Default Turbopack production builds were blocked by this environment's helper-port permission error, including the escalated retry. The default build script was not changed.
- The existing Fiber `THREE.Clock` deprecation warning remains. This pass did not change the hero, progression data, quest logic, or navigation behavior.

## Files changed by this pass

- `src/components/game/GameScene.tsx`: renderer, quality control, environment lighting, AO/contact-shadow selection, development counters and pixel checks.
- `src/components/game/GraphicsQuality.tsx`: preset context, initial selection, and saved preference loading.
- `src/components/game/SceneEffects.tsx`: AO, bloom, anti-aliasing, ACES output.
- `src/components/game/SceneLighting.tsx`: directional composition and preset shadow allocation.
- `src/components/game/AtmosphericSky.tsx`: layered cloud shader and environment-capture mode.
- `src/components/game/FogLayers.tsx`: moving mist and subtle shaft.
- `src/components/game/EnvironmentAsset.tsx`: normalized instances, material weathering, anisotropy, selected shadow casters.
- `src/components/game/terrainSurface.ts`: shared normalization and ground-height sampling.
- `src/components/game/Terrain.tsx`: gravel support surface and preserved terrain scans.
- `src/components/game/Ruins.tsx`: clustered vegetation, individual rock variants, foreground composition.
- `src/components/game/DistantMountain.tsx`: depth layers and sanctuary integration.
- `src/components/game/Environment.tsx`: preset-aware particles.
- `package.json`, `package-lock.json`: postprocessing dependencies.
- `art-pass-report.md`: this report.

Concurrent edits to `src/app/globals.css` and `src/components/dashboard/SideNavigation.tsx` were not made or reverted by this art pass.

## Remaining asset constraints

The scene still uses one coastal-cliff scan and one tree model, with reuse less conspicuous through placement, material response, and atmospheric separation. This is an art-direction pass on those assets, not replacement geology or new tree species. The primary framing and a short orbit interaction were verified; the environment has not been authored as a seamless, explorable 360-degree game level.
