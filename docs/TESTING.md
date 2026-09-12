# Testing

## Testing Overview

ASCEND currently has limited automated testing. The testing strategy relies on:

1. **TypeScript** (static type checking)
2. **ESLint** (code quality)
3. **Custom grounding regression test** (headless Three.js)
4. **Playwright E2E persistence check** (browser automation)
5. **Manual QA** (visual and interaction testing)

## Type Checking

```bash
npx tsc --noEmit
```

TypeScript strict mode is enabled. All source files must compile without errors.

## Linting

```bash
npm run lint
```

Uses ESLint v9 with flat config:
- `eslint-config-next/core-web-vitals`
- `eslint-config-next/typescript`

Custom rules:
- `react-hooks/set-state-in-effect`: Warns against setState in effects
- `react-hooks/immutability`: Warns against modifying hook arguments

## Grounding Regression Test

### Command

```bash
npm run test:grounding
```

### What It Tests

The `scripts/test-grounding.mjs` script (170 lines) runs headlessly with Node.js:

1. Loads all GLB assets (hero + environment)
2. Strips images for faster loading
3. Validates hero grounding across all animation clips at all checkpoints
4. Verifies forest terrain sampling
5. Verifies realm terrain sampling
6. Tests prop snap-to-terrain
7. Tests normal alignment

### Requirements

- Node.js with `three` and `meshoptimizer` packages (already in devDependencies)
- All assets must be fetched first (`npm run assets:fetch && npm run assets:build`)

## Playwright E2E Check

### File

`.persist-check.mjs`

### What It Tests

1. Launches headless Chromium with SwiftShader
2. Navigates to `localhost:3000`
3. Opens quest panel and completes all quests
4. Records XP before reload
5. Reloads the page
6. Records XP after reload
7. Verifies XP persisted (localStorage survived reload)
8. Verifies "Forest of Resolve" label is visible (progression worked)

### Requirements

- Playwright installed (`npx playwright install`)
- Dev server running on port 3000

## Manual QA Checklist

### Visual Testing

- [ ] Forgotten Shore renders completely (terrain, water, sky, fog, ruins)
- [ ] Forest of Resolve renders completely (terrain, trees, stream, waterfall)
- [ ] Water is stable across all presets (no flickering)
- [ ] Character model loads and animates correctly
- [ ] Character stays grounded on terrain at all checkpoints
- [ ] Camera follows hero without clipping through geometry
- [ ] Post-processing effects render correctly per preset

### Interaction Testing

- [ ] Quest completion awards XP exactly once
- [ ] Level increases at correct thresholds
- [ ] Region transition occurs at level 5→6
- [ ] Hero walks to new checkpoint on level change
- [ ] OrbitControls work (rotate, zoom)
- [ ] Quest panel opens/closes correctly
- [ ] World map opens/closes with pinch-zoom
- [ ] QuickActions modal opens/closes
- [ ] Profile dropdown opens/closes

### Persistence Testing

- [ ] Progress survives page refresh
- [ ] Progress survives tab close and reopen
- [ ] Custom quests persist
- [ ] Streak persists
- [ ] Gold persists

### Mobile Testing

- [ ] HUD fits without overflow on 390×844
- [ ] Touch targets are ≥ 44px
- [ ] Safe areas are respected (notch, home indicator)
- [ ] Camera rotates with single-finger drag
- [ ] Camera zooms with pinch
- [ ] No browser scroll/zoom conflicts
- [ ] Quest panel is usable on mobile
- [ ] World map is usable on mobile

### Graphics Preset Testing

Test each preset on both MVP realms:

| Preset | Forgotten Shore | Forest of Resolve |
|--------|----------------|-------------------|
| Potato | | |
| Low | | |
| Medium | | |
| High | | |
| Ultra | | |
| Auto | | |

For each, verify:
- [ ] No console errors
- [ ] Water renders correctly
- [ ] Vegetation renders at correct density
- [ ] Shadows work (or are disabled on Potato)
- [ ] Post-processing matches preset config
- [ ] FPS is acceptable (30+ on mobile, 60 on desktop)

### Developer Mode Testing

- [ ] DEV MODE button appears in development only
- [ ] Clicking "The Forgotten Shore" loads level 1
- [ ] Clicking "Forest of Resolve" loads level 6
- [ ] Level dropdown works for levels 1–10
- [ ] Preview does not modify localStorage
- [ ] Exit preview restores actual player level
- [ ] Reload region works
- [ ] Reset camera works

### Loading System Testing

- [ ] Loading screen appears on initial load
- [ ] Sigil animation plays (or skips with reduced motion)
- [ ] Realm name and subtitle appear
- [ ] Progress bar fills with real data
- [ ] Loading screen fades out when complete
- [ ] Loading screen works on realm transitions
- [ ] 8-second safety timeout works

## Performance Testing

### Tools

- Chrome DevTools Performance tab
- `SceneStats` component (dev mode): FPS, triangles, draw calls
- `DevStats` panel (dev mode): GPU tier, DPR, preset info
- `data-water-state` attribute: water render info

### Metrics to Monitor

| Metric | Target | Concern Level |
|--------|--------|---------------|
| FPS (desktop Ultra) | 60 | < 45 |
| FPS (desktop Medium) | 60 | < 30 |
| FPS (mobile Auto) | 30–60 | < 24 |
| FPS (mobile Low) | 30 | < 20 |
| Draw calls | < 100 | > 200 |
| Triangles | < 500k | > 1M |
| Textures | < 50 | > 100 |

## Known Testing Gaps

1. **No unit tests**: No Jest, Vitest, or similar test runner
2. **No component tests**: No React Testing Library
3. **No visual regression tests**: No screenshot comparison
4. **No load testing**: No automated performance benchmarks
5. **No accessibility tests**: No automated a11y checking
6. **Grounding test is offline-only**: Cannot test in browser context
