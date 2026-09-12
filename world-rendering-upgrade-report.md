# ASCEND World Rendering Upgrade Report

## Scope

This pass upgrades the existing Forgotten Shore rendering without replacing the scene, hero, HUD, OrbitControls, or asset layout. The water, shoreline, terrain material response, and preset scalability were the main targets.

## Water Technique

- The water still uses the existing Three.js `Reflector` path for coherent sky/scene reflection on capable presets.
- The surface now uses a subdivided water mesh per preset so the water has real vertex wave movement instead of reading as a flat plane.
- Reflection resolution and mesh subdivision scale independently through the graphics presets.
- Potato keeps a readable animated water shader but disables live reflection updates.

## Wave Technique

- Added four layered shader waves with different direction, wavelength, amplitude, and speed.
- Large swell is slow and subtle; medium cross-waves add directional variation; smaller waves add surface agitation.
- Horizontal displacement adds mild coastal chop without turning the shoreline into storm water.

## Fresnel Implementation

- Fresnel is computed from view angle and the animated water normal.
- Grazing angles mix toward reflection; downward views keep more depth color and transparency.

## Depth Color Implementation

- Bathymetry remains generated from terrain sampling.
- The shader blends shallow, mid, and deep tones:
  - shallow: blue-green coastal water
  - mid: darker blue-green
  - deep: dark teal
- Shallow areas remain more transparent so the seabed reads through the water.

## Normal Layers

- The water now combines three moving normal samples from the same normal texture at different scales, rotations, and speeds.
- This breaks up the scrolling-texture look and adds micro-ripple movement over the vertex waves.

## Foam Technique

- Foam is selective, not everywhere.
- Foam appears from a mix of shallow shoreline depth and wave crest threshold.
- The result is subtle gray-green shoreline foam rather than thick white cartoon foam.

## Shoreline Technique

- Terrain and rock shaders now darken and reduce roughness near low wet areas.
- The ground bed blends gravel, silt, moss, dampness, and path wear procedurally in world space.
- Rock assets received more strata, fine grain, moss tint, and damp darkening.

## Sky and Clouds

- Existing physical sky and HDR cloud dome remain in place.
- Water reflection uses the same live scene reflection path where enabled, so sky, clouds, rocks, castle, and water stay visually coherent.
- Potato falls back to a sky-tinted reflection approximation.

## Terrain Material Layering

- Ground bed color is no longer a single flat tint.
- Procedural material layers now include gravel, silt, moss, damp lowland, and worn path variation.
- Rock materials gain procedural strata and fine mineral breakup over the existing GLB materials.

## Triplanar Mapping

- Full triplanar texture projection was not added in this pass because the current terrain is primarily scanned GLB material data plus procedural shader variation. The upgrade uses world-space procedural breakup to reduce stretched/flat reads without replacing the asset pipeline.

## Wetness Implementation

- Wetness is based on world height near the waterline.
- Low terrain and rocks darken and become less rough, while higher dry stone stays rough.
- This avoids making the whole scene glossy.

## Grounding and Floating Assets

- The existing grounding system was preserved.
- `npm run test:grounding` passes for the static props and hero clips.
- Verified clips include `FIGHTIDLE_Root`, `Player_Sneak_Root`, `run_player_Root`, and `WALK_player_Root`.

## Lighting

- Sun direction remains unified through `SUN_DIRECTION`.
- Water glints use the same sun vector as the physical sky and scene lighting.
- Existing ACES tone mapping, fog, HDR IBL, shadows, AO, and bloom remain active through the current graphics system.

## Preset-Specific Changes

- Ultra: 160 water segments, strongest waves/normals/refraction, 1024 reflection.
- High: 128 water segments, premium waves/normals/refraction, 1024 reflection.
- Medium: 80 water segments, reduced waves/normals/refraction, 512 reflection.
- Low: 36 water segments, lighter waves/normals/refraction, 256 reflection.
- Potato: 12 water segments, very cheap movement, 128 texture target, no live reflection updates.

## Validation

- `npm run lint`: passed.
- `npm run build -- --webpack`: passed.
- `npm run test:grounding`: passed.
- Browser High/Auto: no runtime error overlay; water state advanced with 128 segments and 1024 reflection.
- Browser Ultra: rendered at 160 water segments.
- Browser Low: no errors; 36 water segments, 256 reflection.
- Browser Potato: no errors; 12 water segments, live reflection disabled.
- Known warning: Three/Drei still emits the existing `THREE.Clock` deprecation warning.

## Inspiration Source

- User-supplied discussion: https://www.reddit.com/r/playstation/comments/180c34a/what_game_has_the_best_water_physics/
- Used only as visual/technical inspiration: layered waves, convincing motion, view-dependent reflections, and shader-based approximations rather than full fluid simulation.

## Files Modified

- `src/components/game/TidalWater.tsx`
- `src/components/game/GraphicsQuality.tsx`
- `src/components/game/Terrain.tsx`
- `src/components/game/EnvironmentAsset.tsx`
- `src/components/game/FogLayers.tsx`
- `src/components/game/GameScene.tsx`
- `world-rendering-upgrade-report.md`
