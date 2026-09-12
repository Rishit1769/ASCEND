# ASCEND Realism Pass

Verified September 12, 2026. This pass preserves the existing scene, hero, clips, sanctuary, OrbitControls, HUD and application features. It is not a scene rebuild or a claim of AAA production parity.

## 1. Hero Clipping Root Cause

The hero used a fixed world Y of -0.1. Neither terrain variation beneath animated feet nor the rig's changing pose was accounted for. At the current spawn, regression playback measured old minimum foot clearances of -0.0571 (fight idle), -0.1245 (sneak), -0.1539 (run), and -0.1588 (walk) world units.

## 2. Grounding and Animation

A shared downward-ray sampler intersects collision-only copies of the two actual coastal terrain scans. Water, hero, vegetation and architecture are excluded. The real seabed is the fallback. Cached BVHs accelerate sampling without modifying rendered geometry.

The hero's world wrapper is separate from its animated, scaled rig. Ten skinned sole probes sample terrain after an explicitly owned AnimationMixer updates the cloned skeleton. Corrections are immediate upward and smoothed downward, with a configurable 0.035 sole margin. The explicit mixer also resolves stale bindings encountered while testing the cloned rig. Original animation tracks are unchanged.

Per-foot contacts remain available for future IK. This is root-height correction, not independent foot planting; it cannot remove every foot slide or adapt each ankle to arbitrary slopes.

## 3. GLB Bounds

`snapToTerrain` uses transformed bounds and actual bottom-vertex footprints rather than GLB origins or canopy centers. It handles asset scale, parent transforms, rotated-parent normal alignment, base offsets and burial. Rocks and ruins use footprint support sampling; final base-vertex checks remove positive base gaps. Contact metadata records terrain source, burial and contact gap.

## 4. Environment Objects

GroundedAsset is applied to individual foreground rocks, trees, lanterns and wall remnants, plus the small sanctuary tree and fern. Instanced vegetation uses the same terrain and dry-ground sampling. Rocks use approximately 8% nominal burial with restrained normal alignment; tree trunks and plant roots are slightly embedded. Lantern lights move with their grounded assets.

Dry-ground search avoids placing land vegetation on the seabed. The large left tree's requested (-8, -13) position was over water; it now settles near (-4.8, -18.54) on the island. Major architecture and authored support geology remain in place. Five actual prop regression cases verify terrain contact, including both large foreground rocks, a tree, lantern and wall fragment. Uneven surfaces can require more local intersection than nominal burial; broad undercut rock shapes remain visible above their supporting rubble.

## 5. Water Rendering

New shallow coastal water uses a custom shader on Three.js Reflector. Sea level is -1.62 and the physical gravel seabed is -3.1. A 256-square terrain-derived bathymetry map drives absorption, shallow/deep color and shoreline response. Colors use #496c68 and #162b2f. Depth-dependent alpha reveals the seabed; this is not true refracted scene-color sampling.

## 6. Water Normals and Reflections

A 1024-square normal texture is sampled twice with different world scales, directions and speeds. Schlick Fresnel uses F0=0.02, increasing reflections at grazing angles. Selective planar reflection captures sky, cliffs, vegetation and buildings; five texture taps soften the reflected image. Roughness varies gently, wet rock bands darken and become less rough, and foam is confined to shallow boundaries.

Reflection tiers: High 1024-square at up to 60 Hz; Medium 512-square at 24 Hz; Low 128-square at 8 Hz. Camera movement refreshes reflections immediately, with a guard against duplicate captures within a frame. Reflection targets and owned texture copies are disposed on replacement. This is one planar view, not six cube renders per frame.

## 7. Sky

Drei Sky supplies Rayleigh/Mie atmospheric scattering: turbidity 8, Rayleigh 1.2, Mie coefficient 0.006 and directional G 0.82. The physical sky owns the horizon rather than a flat gradient. Existing blue-gray distance fog and low mist retain depth between foreground, sanctuary and distant cliffs.

## 8. Clouds

Real photographed HDR cumulus detail overlays the atmosphere, with horizon masking and subtle bounded motion. Bright and shaded cloud regions provide natural readability without repeating billboard sprites. These are photographic, volumetric-looking clouds, not raymarched volumetric clouds. Existing mist softens mountain edges; the HDR layer itself cannot physically pass between individual mountains.

## 9. Environment Lighting and Licensing

The outdoor Kloofendal 48d Partly Cloudy 2K HDRI by Greg Zaal / Poly Haven supplies the cloud imagery. The composed sky is captured once for image-based lighting at intensity 0.65 (256-square High, 128 other tiers). The directional key follows the same rotated HDR sun direction. Display radiance is restrained to preserve cloud highlight detail.

The HDRI is CC0; the pinned Three.js r186 water normal asset is covered by its MIT distribution notice. Source URLs and license text are in `public/environment/REALISM-LICENSES.md`. `scripts/fetch-realism-assets.mjs` reproduces downloads and verifies the HDR checksum. No new GLBs were introduced.

## 10. Ambient Occlusion

The existing quality-tier N8AO pipeline is retained for restrained crevice, vegetation and contact depth. Low retains its cheaper contact treatment. The water does not write depth, avoiding an opaque AO plane over submerged geometry.

## 11. Shadows

The sun-aligned key uses PCF shadows, map resolutions 2048/1024/512 by tier, bias -0.0002, normalBias 0.02 and radius 2. Reducing the old 0.045 normal bias improves attachment. Grounded feet and prop bases now agree with their shadow positions more closely.

## 12. PBR Materials

Environment base-color and emissive maps are explicitly sRGB; normal, roughness, metalness and AO maps are non-color. AO UV channel and transform are matched to the imported roughness mapping where required, including the tree branch UV mismatch. Out-of-range imported specular colors are clamped.

Rock normal strength is 1.18; dry roughness remains high. The wetness rule now actually lowers roughness instead of being cancelled by a maximum against the dry source value. Existing moss/weather variation remains. Leaf/fern materials use double-sided alpha testing, alpha-to-coverage and depth writing instead of blended sorting. A restrained backside diffuse adjustment avoids dead-black leaves without emission; subtle GPU foliage motion respects reduced-motion preferences. Hero source materials remain preserved.

## 13. Output

ACES filmic output, exposure 1.1 and sRGB output are retained. Existing restrained Bloom and tiered postprocessing remain; no heavy DOF or new extreme grading was added.

## 14. Validation and Performance

- `npm run test:grounding`: passed. Two cycles each of FIGHTIDLE_Root, Player_Sneak_Root, run_player_Root and WALK_player_Root at 60 Hz; ten sole probes per frame. All maintained the 0.035 probe margin.
- All 379 foot/toe-weighted vertices were also sampled at 15 Hz. Minimum clearances: fight idle 0.01754, sneak 0.01100, run 0.00185, walk 0.00658. No penetration in those samples; this does not prove every vertex at every instant or every terrain location.
- Transformed-parent, off-origin geometry, normal-alignment and five real-prop grounding regressions passed.
- Browser checks covered all four clips, feet at default/nearby orbit angles, rock/tree bases, lanterns, sanctuary foundations, shoreline, water reflections and mountain/sky edges.
- Screenshots and canvas diagnostics confirmed nonblank output at 390x844, 1440x900 and 2560x1440. Water time/reflection counters advanced. High/Medium/Low switches worked. Interface remained legible and usable in inspected views.
- Final development-browser sample: High at 2560x1440 approximately 88 FPS; Medium at that size approximately 120 FPS; Low at 390x844 approximately 120 FPS. These are short local samples, not controlled before/after benchmarks or mobile-hardware guarantees. Canvas checks reported nine distinct sampled colors.
- Source assets add 6,729,610 bytes (about 6.73 MB decimal). Planar reflection adds scene rendering work; normal layers and bathymetry add fragment work. BVH reuse, static instancing, one-time environment capture and tiered reflection targets constrain cost.
- ESLint and webpack production build passed. The default Turbopack build could not be validated because its helper-port operation hit the execution sandbox; the default package build command was not changed.
- No new rendering errors observed. The existing THREE.Clock deprecation warning remains. Headless tests also emit module-format and transitive Three CommonJS deprecation warnings.

## 15. Files Involved

Rendering and placement: `src/components/game/grounding.ts`, `terrainSurface.ts`, `heroGrounding.ts`, `Hero.tsx`, `EnvironmentAsset.tsx`, `Ruins.tsx`, `DistantFires.tsx`, `DistantMountain.tsx`, `Terrain.tsx`, `Environment.tsx`, `TidalWater.tsx`, `RealisticSky.tsx`, `skyConfig.ts`, `SceneLighting.tsx`, `GameScene.tsx`.

Assets and tooling: `public/environment/kloofendal_48d_partly_cloudy_2k.hdr`, `public/environment/waternormals.jpg`, `public/environment/REALISM-LICENSES.md`, `scripts/fetch-realism-assets.mjs`, `scripts/test-grounding.mjs`, `package.json`, `package-lock.json`, and this report. Some rendering changes were already committed during the ongoing work; this list describes the full realism implementation, not only the final uncommitted diff.
