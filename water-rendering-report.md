# ASCEND Water Rendering Pass

The existing system was a `Reflector` plane with a custom shader, one repeating water-normal texture, a generated bathymetry `DataTexture`, four directional sine wave layers, Fresnel reflection, depth color, refraction distortion and shoreline/crest foam. It was already integrated with the adaptive graphics config, but LOW still allocated a reflector and every preset compiled the full multi-layer path.

## Changes

Modified:

- `src/components/game/GraphicsQuality.tsx`: added centralized water detail, wave-layer, normal-layer and foam settings. LOW now disables reflection; POTATO disables reflection and all detail effects.
- `src/components/game/TidalWater.tsx`: creates a reflector only for MEDIUM/HIGH/ULTRA. LOW/POTATO use a lightweight shader mesh with no reflection render target. Shader variants are generated from preset settings so the cheap path does not sample unused normal or reflection layers.

The existing water material remains a custom shader rather than a second scene or refraction pass. The reflector is used as the practical environment/sky reflection for the detailed presets. Refraction remains a small projected distortion of the reflector texture on HIGH/ULTRA and a reduced approximation on MEDIUM. LOW/POTATO use a sky-tint body color and Fresnel-style angle response without a render pass.

## Preset Matrix

| Preset | Geometry | Normals | Waves | Foam | Reflection target | Refraction |
| --- | ---: | ---: | ---: | --- | --- | --- |
| Ultra | 160 segments | 3 | 5 | shore + crest | 1024px reflector | subtle projected distortion |
| High | 128 segments | 3 | 4 | shore + crest | 1024px reflector | subtle projected distortion |
| Medium | 80 segments | 2 | 3 | shoreline | 512px reflector | reduced projected distortion |
| Low | 36 segments | 1 | 1 small wave | off | none | off |
| Potato | 12 segments | none | none | off | none | off |

MEDIUM+ retains layered directional waves with different wavelengths, speeds and directions. Large movement comes from the first two swell layers, medium shape from the next layers, and surface detail from animated normal samples. The existing depth texture drives shallow, mid and deep color absorption; the shader uses cool blue-green coastal colors that agree with the current gray-blue sky. Fresnel makes grazing angles more reflective while downward views retain the depth body color.

Foam is masked by depth and normal noise at the shoreline, with crest foam only on detailed presets. It is blended into the water body rather than applied as a full-surface overlay. Existing terrain wetness and moss shading remain responsible for the ground side of the shoreline transition.

The animation `useFrame` path only advances the existing time uniform and frame counter. It does not allocate vectors, colors, matrices, arrays or materials per frame. Water quality changes recreate only the water object and its preset-sized geometry/material variant; LOW/POTATO do not retain a reflector target.

## Verification

Webpack production build, TypeScript, ESLint and `git diff --check` passed. Existing grounding tests passed. Browser checks produced no new errors and reported:

- Ultra: 1024px reflection, 160 segments, 3 normal layers, 5 wave layers, foam enabled.
- Medium: 512px reflection, 80 segments, 2 normal layers, 3 wave layers, foam enabled.
- Low: no reflection target, 36 segments, 1 normal layer, 1 wave layer, foam disabled.
- Potato: no reflection target, 12 segments, no normal layers, no wave layers, foam disabled.

The existing THREE.Clock deprecation warning is unrelated to water. Actual GPU VRAM bytes were not exposed by the current telemetry, so performance observations use renderer draw calls, triangles, texture objects and FPS. Planar reflection remains the largest water cost for ULTRA/HIGH; its resolution and update cadence are already capped by preset. The system does not yet have region-specific water palette values for future Forest, Mountain, Temple, Ascension or Celestial water bodies because those region renderers and water placements are not yet implemented.
