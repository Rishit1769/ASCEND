# MVP Scope

## Purpose

The MVP was reduced to two realms to create a **finished vertical slice** rather than a large unfinished game. The goal is to prove the core gameplay loop works end-to-end with polished presentation.

## Included in MVP

### Playable Realms
- **The Forgotten Shore** (Levels 1–5) — Complete environment, terrain, water, vegetation, lighting
- **Forest of Resolve** (Levels 6–10) — Complete environment with procedural terrain, instanced vegetation, waterfall, stream

### Gameplay Systems
- Quest creation and completion
- XP rewards and level progression (levels 1–10)
- Gold rewards
- Streak tracking (consecutive days)
- Custom quest creation ("Forge a Quest")
- Duplicate completion prevention
- Save persistence via localStorage

### Technical Systems
- 3D rendering with React Three Fiber
- 5 graphics presets (Potato → Ultra) with auto-adaptation
- Water rendering with reflections, waves, foam, depth-based coloring
- Post-processing (ambient occlusion, bloom, FXAA, tone mapping)
- Animated character with walk/idle animations
- Terrain grounding via BVH raycasting
- Camera following with orbit controls
- Loading screen with animated sigil and progress tracking
- Developer mode with map selector
- World map with pinch-zoom
- Mobile-responsive HUD with safe-area support

### Assets
- 9 environment models (Poly Haven CC0) with LOD variants
- Hero character model (armored_king.glb)
- HDR sky environment (Kloofendal)
- Water normal map texture
- Forest floor textures (diffuse, normal, roughness)

## Excluded from MVP (Future Scope)

### Realms
- Mountains of Trial (environment partially implemented)
- Realm of Ascension (environment partially implemented)
- Temple of Knowledge
- The Celestial Heights
- The Summit

### Systems
- Character attribute system (strength, intellect, focus, vitality, discipline)
- Forge / equipment system
- Journey timeline
- Audio system
- Social features
- Daily quest refresh
- Quest deletion
- Multiple save slots
- Cloud sync
- Notifications
- Onboarding tutorial

### Content
- NPC interactions
- Dialogue system
- Cutscenes
- Voice acting
- Music

## Playable Realms

### The Forgotten Shore

| Property | Value |
|----------|-------|
| Levels | 1–5 |
| Theme | Beginning. Isolation. Discovery. |
| Landmark | Ancient Sanctuary |
| Character Stage | Wanderer |
| Terrain | Rock, sand, gravel, moss, wet rock |
| Water | Reflective ocean (Ultra–Medium), planar reflection |
| Vegetation | Ferns, dead trees, rock formations |
| Atmosphere | Coastal fog (#687f91), density 0.022 |
| Lighting | Directional sun + 4 point lights |

### Forest of Resolve

| Property | Value |
|----------|-------|
| Levels | 6–10 |
| Theme | Discipline. Consistency. Persistence. |
| Landmark | Guardian Tree and Gate |
| Character Stage | Warrior |
| Terrain | Procedural heightmap (160×160 segments) |
| Water | Stream + waterfall, reflections on Ultra only |
| Vegetation | 65–170 trees, 75–650 ferns, 22–95 rocks (preset-dependent) |
| Atmosphere | Forest fog (#526963), density 0.023 |
| Lighting | Hemisphere + directional sun + fill + warm point |

## Level Range

| Level | XP Required (cumulative) | Region |
|-------|-------------------------|--------|
| 1 | 0 | Forgotten Shore |
| 2 | 150 | Forgotten Shore |
| 3 | 350 | Forgotten Shore |
| 4 | 600 | Forgotten Shore |
| 5 | 900 | Forgotten Shore |
| 6 | 1,300 | Forest of Resolve |
| 7 | 1,750 | Forest of Resolve |
| 8 | 2,250 | Forest of Resolve |
| 9 | 2,800 | Forest of Resolve |
| 10 | 3,350 | Forest of Resolve (max) |

XP formula: `xpForLevel(level) = 100 + level × 50`

Total seed quest XP: 1,510 (sufficient to reach level 6 from level 1).

## Definition of Done

### Gameplay
- [ ] Levels 1–10 work without errors
- [ ] Quests start, progress, and complete correctly
- [ ] XP is awarded exactly once per quest
- [ ] Level increases at correct thresholds
- [ ] UI updates immediately on state change
- [ ] Reload preserves all progress
- [ ] Realm transition does not corrupt state

### Forgotten Shore
- [ ] Environment renders completely
- [ ] Water is stable across all presets
- [ ] Camera follows hero without clipping
- [ ] Terrain grounding works at all checkpoints
- [ ] Performance is stable (30+ FPS on mid-range mobile)

### Forest of Resolve
- [ ] Procedural terrain renders correctly
- [ ] Vegetation is performant (instanced rendering)
- [ ] Stream and waterfall render without artifacts
- [ ] Camera guard prevents tree clipping
- [ ] Forest atmosphere is visually distinct from Shore

### Desktop
- [ ] Responsive HUD at all viewport sizes
- [ ] Smooth orbit controls
- [ ] Stable FPS across all presets

### Mobile
- [ ] Touch camera works (rotate + zoom)
- [ ] HUD fits without overflow
- [ ] Touch targets are ≥ 44px
- [ ] Safe areas are respected
- [ ] Graphics scale appropriately
- [ ] No browser scroll/zoom conflicts

### Technical
- [ ] No critical console errors
- [ ] No memory leaks on realm switching
- [ ] No render-target recreation loops
- [ ] No quality-preset oscillation
- [ ] Loading screen works on initial load and transitions

## Release Gate

Before MVP release, the following must pass:

1. All Definition of Done items checked
2. Tested on: iPhone (Safari), Android (Chrome), Desktop (Chrome, Firefox)
3. Graphics presets verified: Potato, Low, Medium, High, Ultra
4. Auto mode verified: no quality thrashing over 2+ minutes
5. Save data verified: survives refresh, back-button, and tab close
6. Loading screen verified: appears on initial load and realm transitions

## Non-Goals

During MVP polishing, the following should NOT be expanded:

- New realm environments
- New gameplay mechanics beyond quests/XP/levels
- New UI screens beyond existing HUD
- Audio system
- Multiplayer or social features
- Advanced character customization
- Monetization
- Analytics
- Internationalization

## Scope Protection

Future realm work (Mountains of Trial, Realm of Ascension, etc.) should not be started until:

1. The two MVP realms pass all Definition of Done items
2. Mobile performance is verified on target devices
3. The gameplay loop is confirmed satisfying by testers

The codebase contains partial implementations of future realms. These exist in the code but are NOT part of the MVP deliverable.
