# Loading System

## Overview

ASCEND uses a custom loading screen system that appears during initial app load and realm transitions. It features an animated SVG sigil, realm-specific branding, and real-time progress tracking from the R3F asset loading pipeline.

## Architecture

### Components

| Component | File | Purpose |
|-----------|------|---------|
| `AscendLoader` | `src/components/ui/AscendLoader.tsx` | Main loading screen with phased animation |
| `AscendSigil` | `src/components/ui/AscendSigil.tsx` | SVG sigil with line-drawing animation |
| `AscendLoaderContext` | `src/components/ui/AscendLoaderContext.tsx` | DOM event bridge for R3F → HTML communication |
| `ProgressTracker` | `src/components/game/GameScene.tsx` | R3F-side progress emitter |

### Communication Pattern

```
R3F Canvas Tree                    DOM Tree
─────────────────                  ─────────
ProgressTracker                    AppLoader
  → useProgress()                    → onLoaderProgress()
  → emitLoaderProgress()             → setProgress()
  → emitLoaderReady()              → AscendLoader
                                      → displays progress
```

DOM CustomEvents bridge the two React trees because R3F's Canvas creates a separate reconciler where React Context from the main tree is not available.

## Loading Sequence

### Animation Phases

```
hidden → enter → sigil → realm → progress → pulse → exit
```

| Phase | Duration | What Happens |
|-------|----------|-------------|
| `hidden` | — | Loader not visible |
| `enter` | 400ms | Dark background fades in |
| `sigil` | 1400ms | SVG paths draw with gold stroke animation |
| `realm` | 600ms | Realm name + subtitle fade upward |
| `progress` | Until 100% | Progress bar fills with real loading data |
| `pulse` | 700ms | Sigil pulses once (completion signal) |
| `exit` | 500ms | Everything fades out |

### Reduced Motion

When `prefers-reduced-motion: reduce` is active:
- Drawing animations are skipped
- Goes straight to `realm` phase with 200ms delay
- Exit is faster (200ms)

### Safety Net

Maximum 8-second timeout forces completion even if progress never reaches 100%.

## Realm Configuration

```typescript
const REALM_LOADING_CONFIG = {
  "forgotten-shore": {
    title: "THE FORGOTTEN SHORE",
    subtitle: "Every journey begins with a choice.",
    accent: "#5E9FB8",  // Cyan
  },
  "forest-of-resolve": {
    title: "FOREST OF RESOLVE",
    subtitle: "Discipline grows where excuses end.",
    accent: "#6F8E52",  // Green
  },
  "realm-of-ascension": {
    title: "REALM OF ASCENSION",
    subtitle: "The summit is not the peak — it is the climb.",
    accent: "#d4a543",  // Gold
  },
};
```

## Progress Tracking

### How Progress Is Measured

1. `ProgressTracker` inside the R3F Canvas uses drei's `useProgress()`
2. `useProgress` tracks all Suspense-loaded assets (GLTF, textures, HDR)
3. Progress is emitted via DOM CustomEvent: `ascend-loader-progress`
4. `AppLoader` in `page.tsx` listens and updates the progress bar

### Progress Events

```typescript
// Emitted from inside Canvas
emitLoaderProgress(progress: number)  // 0–100
emitLoaderReady(realmId?: string)     // scene fully loaded

// Listened from DOM tree
onLoaderProgress(callback)  // returns cleanup function
onLoaderReady(callback)     // returns cleanup function
```

### Completion Detection

```typescript
useEffect(() => {
  if (progress >= 100 && !active && !readyEmitted.current) {
    readyEmitted.current = true;
    emitLoaderReady(regionKey);
  }
}, [progress, active, regionKey]);
```

## Sigil Animation

### SVG Structure

The sigil consists of 6 SVG paths drawn sequentially:

1. Outer diamond
2. Inner diamond
3. Vertical cross line
4. Horizontal cross line
5. Diagonal (top-left to bottom-right)
6. Diagonal (top-right to bottom-left)

Plus a central dot that appears after 70% of the draw animation.

### Animation Technique

Uses Framer Motion's `pathLength` property for stroke-drawing effect:

```tsx
<motion.path
  d={path}
  initial={{ pathLength: 0, opacity: 0 }}
  animate={{ pathLength: 1, opacity: 1 }}
  transition={{
    pathLength: { delay: stagger, duration: segmentDuration },
    opacity: { delay: stagger, duration: 0.1 },
  }}
/>
```

### Golden Glow

A radial gradient behind the sigil scales from 0.3 to 1.6 with opacity animation, creating a warm expanding glow effect.

## Integration Points

### Initial Load

```typescript
// page.tsx
const Dashboard = dynamic(() => import("Dashboard"), { ssr: false });

function AppLoader() {
  // Shows AscendLoader until sceneReady && progress >= 100
  return (
    <>
      {dashboardReady && <Dashboard />}
      <AscendLoader progress={progress} visible={showLoader} />
    </>
  );
}
```

### Realm Transition

When the region key changes in `GameScene.tsx`:
1. The old region unmounts (cleanup runs)
2. The new region mounts and assets load
3. `ProgressTracker` detects progress 100% + active=false
4. Emits `ascend-loader-ready`
5. `AppLoader` receives the signal
6. `AscendLoader` completes its exit animation
