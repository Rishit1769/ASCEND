# ASCEND World Building and Progression Pass

## Delivery Status

This is the architecture and Forgotten Shore phase described in section 108 of the brief. It is not seven finished environments. The shore has five playable checkpoint positions, movement, camera follow, idle/walk crossfades, and a shared world map. Six subsequent regions have canonical progression data and explicit asset requirements. They display an asset-pending state, not substitute geometry.

The repository currently renders `mockPlayer`. Its quest, character, forge, journey, profile and settings buttons do not have backing feature implementations. There are no authentication routes, database client, quest mutations or authenticated XP source in `src`. No account backend was removed or replaced. Real task completion must eventually supply the provider's `level` prop from an authenticated player response; frontend preview state is not an authority for rewards.

## A. Architecture

Created:

- `src/lib/world.ts`: all seven regions, the 31 named checkpoints, level ranges, world/map coordinates, camera offsets, character stages, atmospheric settings, material layer selections, asset requirements and future ascension metadata.
- `src/components/game/WorldProgress.tsx`: common effective-level context, current-location label and development-only, non-persistent preview selector.
- `src/components/game/ProgressionHero.tsx`: Catmull-Rom travel through the current region's checkpoints, terrain sampling, heading interpolation, restrained camera follow, reduced-motion handling and development telemetry.
- `src/components/game/terrainDetail.ts`: original procedural triplanar material detail.
- `src/components/dashboard/WorldMap.tsx` and `world-map.css`: lightweight cartography and accessible interactive markers.
- This report.

Modified:

- `Dashboard.tsx`: provides the existing mock level and connects the map and HUD to shared progression.
- `SideNavigation.tsx`: adds Map and gives Journey a separate book icon.
- `GameScene.tsx`: resolves active-region availability, uses moving hero, binds OrbitControls as the default controls, applies configured fog and supplies inexpensive fallback environment lighting.
- `Environment.tsx`: uses the canonical region identifiers.
- `Hero.tsx`: fixes default idle and action crossfades.
- `SceneLighting.tsx`: reads sun intensity from region data.
- `EnvironmentAsset.tsx`: adds original detail shading and preset anisotropy limits.
- `src/lib/progression.ts` and `src/types/game.ts`: correct boundaries and expose all seven regions without a second progression table.
- `scripts/test-grounding.mjs`: adds canonical boundary, checkpoint, dry-route and animation contact checks.

Only the available current region is mounted. Shore assets are not mounted for an unfinished region. Shared useGLTF caches remain intact; cloned materials retain their existing disposal cleanup. No blanket disposal of shared textures or meshes was introduced. GPU texture eviction and actual next-region asset streaming are deferred until there are next-region assets.

Level changes inside the shore do not key or reload its environment. Upward changes traverse a Catmull-Rom path; multi-level jumps include intervening checkpoints. Returning to an earlier development preview snaps immediately. Reduced-motion users also skip travel. Checkpoint positions for later regions are provisional layout contracts and must be authored against their eventual terrain.

## B. Animation

`FIGHTIDLE_Root` is now the default animation. `WALK_player_Root` is explicitly selected while the hero translates and idle resumes after arrival. Both use `THREE.LoopRepeat`. A 0.35-second crossfade preserves the outgoing action instead of stopping it immediately in effect cleanup. Mixer actions are released when the model unmounts.

The original skeleton, animation clips, skeleton cloning and sole-grounding logic remain. Browser telemetry confirmed a nonzero walk blend during translation and an idle weight of 1 after arrival. Walking speed is currently 1.6 world units/second; animation stride matching still needs final art review.

## C. Region Status

| Region | Levels | Status |
| --- | --- | --- |
| The Forgotten Shore | 1-5 | Five positioned checkpoints, existing scanned coastal scene, sanctuary and progression movement |
| Forest of Resolve | 6-10 | Data/map complete; environment assets required |
| Mountains of Trial | 11-15 | Data/map complete; environment assets required |
| Temple of Knowledge | 16-20 | Data/map complete; environment assets required |
| Realm of Ascension | 21-25 | Data/map complete; environment assets required |
| The Celestial Heights | 26-30 | Data/map complete; environment assets required |
| The Summit | 31+ | Data/map complete; summit environment required |

The shore progresses from water in the foreground at the Landing to the sanctuary filling the First Gate composition. The landing was moved slightly inland after terrain sampling found the initial coordinate too close to a gap in the scan. The existing ruin, plant, rock, lantern and sanctuary assets are retained.

Pending region states fade in with their names and themes. A completed walk-to-exit/fog/stream/arrival sequence cannot be accepted without the destination terrain and gate assets; it is not implemented as a fake transition. Levels above 31 resolve to the same summit checkpoint. Per-level endgame movement and prestige remain future work.

## D. Terrain

- Existing scan base color, normal, roughness and AO maps remain in use. Natural stone stays nonmetallic.
- An original three-projection noise layer blends according to the world-space surface normal. This applies detail across cliffs without stretching the procedural layer. Existing atlas maps retain authored UVs; they are not incorrectly treated as tileable textures.
- Macro mineral variation, meso soil/moss blending and micro grain augment the scans. Slope suppresses soil and moss on steep faces. Shore-height wetness retains selective darkening and reduced roughness.
- Medium, High and Ultra use a derivative-based micro normal perturbation with distance fade. Low retains original normal maps and procedural color detail; Potato omits the new detail layer.
- Anisotropy is capped by both GPU capability and preset: Ultra 16, High 8, Medium 4, Low 2, Potato 1.
- Existing asset LOD and instanced ferns/rocks remain. No whole-world geometry density increase was introduced.
- The fixed contact-shadow plane at the old hero origin was removed because it cannot represent the moving hero's contact. Existing directional shadow casting remains.
- No POM, terrain displacement, height-map material blending, snow shader, new terrain chunk system or new KTX2 pipeline was added. Region material layer lists are preparation, not fully implemented nine-material PBR blending. New tileable PBR sets are still required for that stage.

The supplied terrain discussion was used as an art-quality reference only: https://www.reddit.com/r/reddeadredemption2/comments/1i5oac7/screenshots_of_my_game_with_nigeezs_terrain/ . No game textures, mods, models or proprietary shaders were downloaded.

## E. Map

The Map is a modal SVG/HTML atlas, not a second WebGL scene. It includes an original coastline, forest symbols, mountain range, cloud line and summit. Its route and markers use exactly the same canonical checkpoints as the scene. Completed checkpoints have checks and bronze paths; the current marker has a flag and "You are here" label; future markers are numbered and connected by a dashed path. Distant-region fog remains transparent enough to read names and level ranges.

Selecting a checkpoint shows its title, description, status, required level, region theme and progress. All checkpoints in the selected region are available in the details panel. Current next checkpoint, next region and ultimate destination remain explicit. Selecting a locked marker never changes player level.

Controls: drag to pan, ordinary wheel scroll, Ctrl-wheel or +/- to zoom, touch drag/pinch, Center on Player and Close. Centering also responds to viewport resizing. The map uses a 350ms reveal, disabled for reduced-motion preferences. On narrow screens, the details panel becomes a scrollable bottom sheet. Actual physical touch-device pinch testing remains outstanding.

Native modal behavior provides focus containment and Escape dismissal; focus is restored on close. Markers are real focusable buttons with descriptive accessible labels and pressed state. Status is expressed through text and symbols as well as color. At level 4 the map explicitly identifies Sanctuary Approach, First Gate, Forest of Resolve levels 6-10 and Summit level 31+. Level 7 preview correctly identifies Rootbound Trail in both HUD and map.

## F. Performance and Validation

Passed: ESLint, TypeScript, webpack production build and grounding regression checks. The test now verifies every canonical boundary, level 100 resolving to Summit, all five shore positions on scanned ground, 101 samples per shore route above sea level, and animation sole contact at each checkpoint. These checks do not prove arbitrary orbit positions avoid every cliff or that both feet are planted naturally on every uneven surface.

Browser checks: shore levels 1, 2, 4 and 5; visible movement and arrival idle; desktop map; a 390x844 mobile layout; all subsequent region boundaries resolving to their explicit asset-pending states. No shader/runtime errors appeared in the inspected browser logs. Existing THREE.Clock deprecation warnings remain.

All five manual graphics presets were selected during browser verification. High/Auto observations were roughly 90-120 FPS with about 169-208 calls and 0.81-1.18 million reported triangles depending on checkpoint. Sample observations at the gate: Ultra about 81 FPS / 129 calls / 0.68m triangles; Medium about 120 FPS / 109 calls / 0.55m; Low about 120 FPS / 127 calls / 0.55m; Potato about 120 FPS / 48 calls / 0.29m. These are transient local development samples, not controlled benchmarks: different reflection cadences, LOD, hot reload and other open tabs affect reported values.

DPR limits remain 2 / 1.5 / 1.25 / 1 / 0.75. Observed texture object counts ranged roughly 78-114 before cache/unmount changes. Object counts do not measure VRAM bytes; byte-accurate texture memory was not available. Potato received a 32px one-time environment capture so metal armor remains visible when the costly sky lighting path is disabled. Water shaders were not changed in this pass.

Future environments cannot yet be performance-certified. The asset-pending states load safely, but this is not evidence that unbuilt region art will meet the budget.

## G. Assets

Reused: armored king GLB, coastal scans and cliff LODs, modular fort kit, moss rocks, ferns, small trees, lanterns, existing HDR and water normal image. Existing license and attribution records remain in `public/environment/README.md` and `REALISM-LICENSES.md`. No new third-party assets were added. The map and terrain detail code are original.

Required next:

| Region | Required production-quality assets |
| --- | --- |
| Forest | Monumental root/canopy tree LODs; forest/stream terrain; shrine, old bridge and guardian gate; leaf-litter PBR |
| Mountains | Traversable mountain terrain/collision; broken bridge; temple; waterfall and scree PBR |
| Temple | Archive/courtyard/stairs; statues, rune stones and fountain; cracked paving PBR |
| Ascension | High-altitude terraces; cloud bridge, sanctum and throne; mineral/pale stone PBR |
| Celestial | Alpine pass/stair terrain; celestial ruins and summit gate; snow/ice PBR |
| Summit | Panoramic summit terrain; sanctuary, throne and journey monuments |

Supply licensed GLBs with useful pivots, grounded bases and LOD variants, plus documented texture permissions. The exact requirement lists are also stored per region in `world.ts`.

## H. Remaining Work

The six destination environments, their terrain samplers, authored cameras, asset streaming and cinematic gate transitions are incomplete. The existing repository has no authenticated quest/XP backend to wire into this pass. Journey history and account persistence have not been invented or simulated.

The shore needs a final manual art pass for terrain atlas seams, stair/terrain intersections, checkpoint-specific storytelling props, foot placement on uneven stone and camera/cliff collision beyond the ground-height clamp. Ground detail improves the existing scans but does not create desktop-AAA material parity. The map's illustrated terrain is deliberately lightweight; it could be replaced with a bespoke original raster atlas later without changing progression data.

To integrate the backend, pass authenticated level changes into `WorldProgressProvider`, then add each approved environment with its actual collision/ground sampler and authored checkpoint coordinates. Do not remove the `assets-required` status until that region passes the brief's visual and performance acceptance tests.
