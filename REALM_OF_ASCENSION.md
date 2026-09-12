# Realm of Ascension sanctuary

## Enter and test

Run `npm run dev`, open http://localhost:3000, then choose **Preview World > Realm of Ascension**.
Levels 11-15 follow the arrival circle, water court, staircase, upper landing, and temple entrance.
Preview jumps do not write player progress. Reset Camera restores each checkpoint's composition.
The environment stays mounted between Realm checkpoints; existing progression movement follows the central route.

## Architecture and files

Created inside `src/components/game/RealmOfAscension/`:

- `RealmMeshes.tsx`: shared geometry/material ownership and instanced batches; procedural stone grain.
- `AscensionPath.tsx`: 10-unit arrival circle, emblem, gold inlay, 6-unit walkway, 24 stairs, pillars and structural foundations.
- `AscensionTemple.tsx`: permanent temple, open beveled arch, stacked towers, luminous doorway and subtle beam.
- `AscensionGardens.tsx`: side terraces, planting, benches, small ornamental pools, and emblem banners.
- `AscensionWater.tsx`: detailed courtyard water or simple low-tier pools.
- `AscensionAtmosphere.tsx`: animated sky and one shadow-casting sun.
- `FloatingIslands.tsx`: 3-6 distant islands, simplified towers, cloud banks, and up to four animated waterfall sheets.
- `RealmCameraGuard.tsx`: camera ground clearance and architectural line-of-sight collision.

Modified:

- Realm `index.tsx`, `realmConfig.ts`, `RealmSurface.tsx`: modular composition, palette/quality configuration and matching ground sampler.
- `src/lib/world.ts`: Realm checkpoint placement, cameras and fog only; existing level ranges retained.
- `src/components/game/GameScene.tsx`: Realm lighting, sky capture, FOV and orbit range.
- `src/components/game/ProgressionHero.tsx`: checkpoint-dependent Realm camera target height.
- `src/components/game/TidalWater.tsx`: optional bounded Realm water mode; existing forest/coast defaults retained.
- `scripts/test-grounding.mjs`: Realm checkpoint and complete stair-route regression checks.

## Graphics and performance

AUTO uses the existing resolved preset. One scene scales through the central REALM_QUALITY table.

| Preset | Plants | Islands | Cloud banks | Main pool |
| --- | ---: | ---: | ---: | --- |
| Ultra | 150 | 6 | 12 | Existing shader, 512px reflection, 48 subdivisions |
| High | 100 | 5 | 10 | Existing shader, 384px reflection, 32 subdivisions |
| Medium | 60 | 4 | 8 | Existing shader, sky tint/Fresnel, 24 subdivisions, no reflection render |
| Low | 25 | 3 | 5 | Static standard material, no reflection/refraction |
| Potato | 8 | 3 | 3 | Basic transparent material, no reflection/refraction |

High/Ultra share one reflection target for both main pools, capped at 20 updates/second, independent of screen DPR.
Small terrace pools are static standard materials. Detailed water reuses the existing water-normal texture, wave layers and Fresnel shader at restrained amplitude.
No fluid simulation, shadow-casting lamps, extra postprocessing, or decorative physics.
Shared geometries/materials and per-instance buffers are disposed on unmount. Reflection resources are released when leaving detailed tiers.

Observed desktop samples on this machine, not guarantees for other hardware:

- Medium: approximately 87k triangles / 74 draw calls, around 120 FPS.
- High: approximately 117k triangles / 98 draw calls, around 120 FPS.
- Ultra: approximately 152k triangles / 94 draw calls, around 120 FPS.
- Low: approximately 71k triangles / 60 draw calls, around 120 FPS.
- Potato at 390x844: approximately 40k triangles / 49 draw calls, around 120 FPS.

Counts vary by camera, shadows and reflection cadence. Tested preset changes, arrival/final screenshots, all checkpoint jumps, mobile framing, and camera obstruction at the temple.
Canvas pixel samples were nonblank; water time and reflection counters advanced. No application errors were captured.

## Verification and limits

Production webpack build, TypeScript, lint and grounding tests pass.
Grounding tests include the existing Shore/Forest and hero animation checks plus the complete Realm route.

No new downloaded assets are required. Existing hero and water normals are reused.
Architecture and distant foliage are procedural, with restrained detail rather than photogrammetry.
Banners and vegetation are static; the sky, water and waterfalls animate. Medium approximates sky reflection and does not reflect temple geometry.
The project uses checkpoint travel, not a free-roaming WASD controller; that gameplay system was not added.
Side terrace pools are ornamental surfaces, not recessed simulated basins.
Camera collision may pull the view close to the hero in the narrow entrance.
There is no audio engine: named integration points are reserved in REALM_AUDIO_HOOKS; no audio is loaded.
Optional future assets include custom weathered-stone PBR maps and authored statues; neither is required to run the scene.
