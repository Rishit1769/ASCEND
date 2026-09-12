# ASCEND

**Discipline for a Higher You.**

A gamified self-improvement RPG where real-world discipline is represented through fantasy character progression. Build habits, complete quests, earn experience, level up, and ascend through realms — each representing a deeper stage of personal growth.

---

## MVP Scope

The current MVP contains **two playable realms**:

| Realm | Levels | Theme |
|-------|--------|-------|
| **The Forgotten Shore** | 1–5 | Beginning. Isolation. Discovery. |
| **Forest of Resolve** | 6–10 | Discipline. Consistency. Persistence. |

Everything beyond these two realms is **future scope**.

---

## Core Features

- **Quest System** — Complete real-life tasks as in-game quests with XP and gold rewards
- **XP & Level Progression** — Earn XP to level up and unlock new realms
- **Streak Tracking** — Consecutive-day completion streaks
- **Gold Currency** — Earned from quest completion
- **3D Fantasy World** — Immersive Three.js environments with terrain, water, vegetation, and atmospheric effects
- **Animated Character** — GLTF character model with walk/idle animations and terrain grounding
- **Graphics Presets** — 5 quality tiers (Potato → Ultra) with auto-adaptation
- **Mobile Support** — Responsive HUD, touch camera, safe-area handling
- **Developer Mode** — In-development map selector for testing both realms
- **Loading System** — Animated sigil + progress bar during asset loading
- **Persistence** — Player progress saved to localStorage

---

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js (App Router) | 16.3.5 |
| UI Library | React | 19.2.8 |
| Language | TypeScript | 5.x (strict) |
| 3D Engine | Three.js | 0.186.0 |
| 3D React | React Three Fiber | 9.7.0 |
| 3D Helpers | Drei | 10.7.8 |
| Post-processing | @react-three/postprocessing | 3.1.1 |
| UI Animations | Framer Motion | 13.2.0 |
| Icons | Lucide React | 1.45.0 |
| Styling | Tailwind CSS | 4.x (CSS-first) |
| BVH Raycasting | three-mesh-bvh | 0.8.3 |
| Asset Pipeline | glTF Transform | 4.5.0 |

---

## Installation

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm, yarn, or pnpm

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd ASCEND

# Install dependencies
npm install

# Fetch 3D assets (Poly Haven CC0 models, textures, HDRI)
npm run assets:fetch

# Optimize assets for web (LOD, texture compression)
npm run assets:build

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run assets:fetch` | Download CC0 environment assets from Poly Haven |
| `npm run assets:build` | Optimize and compress assets (LOD generation, WebP textures) |
| `npm run assets:realism` | Fetch HDRI sky and water normal textures |
| `npm run test:grounding` | Run hero grounding regression test (headless Three.js) |

### Vercel Deployment

```bash
# Deploy to Vercel
npx vercel

# Or connect your GitHub repository in the Vercel dashboard
```

**Vercel Settings:**
- Framework: Next.js
- Build Command: `npm run build`
- Node Version: 18+ (auto-detected via `.nvmrc`)
- No environment variables required

---

## Project Structure

```
ASCEND/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout (viewport, metadata)
│   │   ├── page.tsx                # Entry point with loading system
│   │   └── globals.css             # Design tokens, animations, materials
│   ├── components/
│   │   ├── dashboard/              # 2D HUD overlay (9 files)
│   │   │   ├── Dashboard.tsx       # Main shell: providers + layout
│   │   │   ├── TopHUD.tsx          # Branding, streak, gold, profile
│   │   │   ├── SideNavigation.tsx  # Left nav rail
│   │   │   ├── PlayerProgress.tsx  # XP bar at bottom center
│   │   │   ├── QuickActions.tsx    # "New Quest" FAB + creation modal
│   │   │   ├── QuestPanel.tsx      # Quest list modal
│   │   │   ├── WorldMap.tsx        # Atlas map with pinch-zoom
│   │   │   ├── JourneyTeaser.tsx   # Max-level future-content teaser
│   │   │   └── world-map.css       # Map-specific styles
│   │   ├── game/                   # 3D scene components (31+ files)
│   │   │   ├── GameScene.tsx       # Main R3F Canvas + providers
│   │   │   ├── Hero.tsx            # Animated GLTF character
│   │   │   ├── ProgressionHero.tsx # Hero movement + camera follow
│   │   │   ├── Environment.tsx     # Region dispatcher
│   │   │   ├── TidalWater.tsx      # Shared water renderer
│   │   │   ├── GraphicsQuality.tsx # GPU detection + 5 presets
│   │   │   ├── SceneEffects.tsx    # Postprocessing (AO, bloom, FXAA)
│   │   │   ├── grounding.ts        # BVH raycasting + terrain sampler
│   │   │   ├── heroGrounding.ts    # Sole-probe character grounding
│   │   │   ├── terrainSurface.ts   # Terrain surface provider
│   │   │   ├── WorldProgress.tsx   # World level context + dev panel
│   │   │   ├── ForestOfResolve/    # Forest realm (12 files)
│   │   │   ├── MountainsOfTrial/   # Future realm (14 files)
│   │   │   └── RealmOfAscension/   # Future realm (10 files)
│   │   └── ui/                     # Shared UI components
│   │       ├── AscendLoader.tsx    # Production loading screen
│   │       ├── AscendSigil.tsx     # SVG sigil animation
│   │       └── AscendLoaderContext.tsx # DOM event bridge
│   ├── lib/                        # Core logic
│   │   ├── playerStore.tsx         # Player state + localStorage
│   │   ├── progression.ts          # XP/level calculations
│   │   ├── quests.ts               # Quest types + seed data
│   │   └── world.ts                # Region definitions + checkpoints
│   ├── types/
│   │   └── game.ts                 # TypeScript interfaces
│   └── data/
│       └── mockPlayer.ts           # Test player data
├── public/
│   ├── models/armored_king.glb     # Hero character model
│   └── environment/                # 3D assets (9 GLBs + LODs, textures, HDRI)
├── scripts/                        # Asset pipeline (5 scripts)
└── docs/                           # Project documentation
```

---

## Graphics Presets

The game includes 5 manual quality presets plus an auto-adaptive mode:

| Preset | DPR | Shadows | Water Reflections | Post-FX | Target |
|--------|-----|---------|-------------------|---------|--------|
| **Ultra** | 2.0 | 2048px | 1024px @ 60Hz | AO + Bloom + MSAA 4x | High-end desktop |
| **High** | 1.5 | 2048px | 1024px @ 60Hz | AO + Bloom + MSAA 4x | Mid-range desktop |
| **Medium** | 1.25 | 1024px | 512px @ 24Hz | AO + FXAA | Low-end desktop / tablet |
| **Low** | 1.0 | 512px | None | FXAA | Mobile |
| **Potato** | 0.75 | 256px | None | None | Low-end mobile |
| **Auto** | Dynamic | Dynamic | Dynamic | Dynamic | Default — adapts to FPS |

Auto mode monitors FPS over 5-second windows and adjusts quality with hysteresis to prevent oscillation.

---

## Mobile Support

ASCEND is designed as mobile-first:

- Responsive HUD with safe-area-inset support (notch, Dynamic Island, home indicator)
- Touch camera: drag to rotate, pinch to zoom
- Character movement is automatic (no virtual joystick needed)
- Minimum 44px touch targets on all interactive elements
- 100dvh viewport with overflow hidden
- Touch-action: none on canvas to prevent browser gesture conflicts
- Camera FOV increases +10° in portrait mode

---

## Current MVP Status

| System | Status |
|--------|--------|
| Forgotten Shore environment | Complete |
| Forest of Resolve environment | Complete |
| Quest system | Complete |
| XP/level progression | Complete (levels 1–10) |
| Save persistence | Complete (localStorage) |
| Graphics presets | Complete (5 presets + auto) |
| Water rendering | Complete (shared component, preset-responsive) |
| Loading screen | Complete (animated sigil + progress) |
| Mobile layout | Complete |
| Developer mode | Complete (2-map selector, levels 1–10) |
| Character animation | Complete (walk + idle) |
| World map | Complete (atlas with pinch-zoom) |
| Post-processing | Complete (AO, bloom, FXAA, tone mapping) |

---

## Documentation

| Document | Description |
|----------|-------------|
| [Product Overview](docs/PRODUCT_OVERVIEW.md) | Vision, philosophy, target audience |
| [MVP Scope](docs/MVP_SCOPE.md) | Included/excluded features, definition of done |
| [Gameplay System](docs/GAMEPLAY_SYSTEM.md) | Quests, XP, levels, streaks, saves |
| [Realms](docs/REALMS.md) | Detailed realm documentation |
| [Architecture](docs/ARCHITECTURE.md) | System design, component hierarchy, data flow |
| [Graphics & Performance](docs/GRAPHICS_AND_PERFORMANCE.md) | Presets, GPU detection, optimization |
| [Water System](docs/WATER_SYSTEM.md) | Water rendering, reflections, shaders |
| [Mobile Support](docs/MOBILE_SUPPORT.md) | Responsive design, touch, camera |
| [Developer Mode](docs/DEVELOPER_MODE.md) | Dev tools, map selector, testing |
| [Loading System](docs/LOADING_SYSTEM.md) | Asset loading, progress tracking, sigil |
| [Testing](docs/TESTING.md) | Grounding tests, E2E, manual QA |
| [Bugs & Known Issues](docs/BUGS_AND_KNOWN_ISSUES.md) | Known limitations |
| [Deployment](docs/DEPLOYMENT.md) | Build, deploy, environment |
| [Future Scope](docs/FUTURE_SCOPE.md) | Planned realms and features |

---

## Future Scope

The following realms and systems are planned for post-MVP development:

- **Realm of Ascension** (Levels 11–15) — partially implemented
- **Mountains of Trial** — environment implemented, not in MVP
- **Temple of Knowledge** (Levels 16–20)
- **The Celestial Heights** (Levels 21–25)
- **The Summit** (Level 26+)
- Character attribute system
- Forge (equipment/crafting) system
- Journey timeline
- Audio system
- Social features

---

## License

No license file has been specified. All third-party assets are CC0 (Poly Haven) or MIT (Three.js water normals).
