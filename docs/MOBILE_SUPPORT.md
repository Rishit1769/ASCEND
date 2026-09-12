# Mobile Support

## Overview

ASCEND is designed as mobile-first. Every UI element, camera control, and touch interaction is built for phone screens with touch input.

## Viewport Configuration

```typescript
// src/app/layout.tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,    // Prevents pinch-to-zoom on the page
  viewportFit: "cover", // Enables safe area CSS env() variables
  themeColor: "#080810",
};
```

## CSS Resets for Mobile

```css
/* src/app/globals.css */
html, body {
  overflow: hidden;              // Prevent scroll
  -webkit-tap-highlight-color: transparent;  // Remove tap flash
  -webkit-text-size-adjust: 100%; // Prevent text inflation
  overscroll-behavior: none;     // Prevent pull-to-refresh
}

canvas {
  touch-action: none;  // Disable browser gestures on canvas
}
```

## Safe Area Handling

### TopHUD

```tsx
style={{
  paddingTop: "max(0.75rem, env(safe-area-inset-top))",
  paddingLeft: "max(1rem, env(safe-area-inset-left))",
  paddingRight: "max(1rem, env(safe-area-inset-right))",
}}
```

### PlayerProgress (XP Bar)

```tsx
style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
```

### QuickActions

```tsx
style={{ bottom: "max(7.5rem, calc(env(safe-area-inset-bottom) + 7.5rem))" }}
```

### SideNavigation

```tsx
className="pl-[env(safe-area-inset-left)]"
```

### QuestPanel

```tsx
style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
```

## Touch Targets

All interactive elements meet the 44px minimum:

| Component | Touch Target |
|-----------|-------------|
| TopHUD profile button | 44×44px |
| TopHUD settings button | 44×44px |
| SideNavigation buttons | ≥ 40px height |
| QuestPanel complete button | 44×44px (inline style) |
| QuestPanel close button | 44×44px |
| QuickActions FAB | min-h 44px |
| QuickActions difficulty buttons | min-h 44px |
| QuickActions submit button | min-h 46px |
| JourneyTeaser close button | 44×44px |
| JourneyTeaser continue button | min-h 46px |

## Responsive Layout

### Breakpoints

- `sm:` (640px) — mobile to tablet transition
- `md:` (768px) — tablet to desktop transition

### Width Clamping

```css
PlayerProgress:  w-[min(360px,88vw)] md:w-[min(420px,70vw)]
QuickActions:    w-[min(400px,92vw)]
QuestPanel:      max-w-[560px]
WorldMap:        width: min(1120px, 96vw)
```

### Height

```css
Dashboard: h-[100dvh]  /* Dynamic viewport height */
```

## Camera System

### OrbitControls Configuration

```typescript
enablePan: false,      // No two-finger pan
enableZoom: true,      // Pinch-to-zoom enabled
enableRotate: true,    // Single-finger drag rotates
enableDamping: true,   // Smooth deceleration
dampingFactor: 0.05,
```

### Portrait Mode Adaptation

```typescript
// GameScene.tsx — CameraTuning
const portrait = size.width / size.height < 1;
const fov = baseFov + (portrait ? 10 : 0);
```

When the viewport is taller than wide, FOV increases by 10° to keep the character and path visible.

### Mobile Camera Behavior

- **Single finger drag**: Rotates camera around hero
- **Pinch**: Zooms in/out (minDistance: 5, maxDistance: 11)
- **No pan**: Prevents accidental camera displacement
- **Damping**: Smooth deceleration after finger release

## Character Movement

The character movement is **automatic** — no virtual joystick is needed:

1. When the player level changes, `ProgressionHero` generates a CatmullRomCurve3 path
2. The hero walks along the path with animation
3. Camera follows via OrbitControls target tracking
4. The player only interacts with the camera (rotate/zoom) and UI (quests, map)

This design choice means mobile players don't need on-screen movement controls.

## Mobile HUD Layout

```
┌─────────────────────────────┐
│ [ASCEND]    [🔥 streak] [💰]│  ← TopHUD (safe area aware)
│              [👤] [⚙️]       │
│                             │
│ [📜]                         │  ← SideNavigation (left edge)
│ [⚔️] (disabled)             │
│ [🔨] (disabled)             │
│ [📖] (disabled)             │
│ [🗺️]                        │
│                             │
│                             │
│    ┌───────────────────┐    │
│    │ Level 3 · 720/1000│    │  ← PlayerProgress (bottom center)
│    │ [████████░░░] 72% │    │
│    └───────────────────┘    │
│                     [+ New] │  ← QuickActions (bottom right)
└─────────────────────────────┘
```

## Performance on Mobile

### Graphics Adaptation

- Auto mode caps mobile at tier 2 (High preset max)
- Potato preset: DPR 0.75, no shadows, no particles, no post-FX
- Water reflections disabled below Medium
- Forest vegetation counts scale down significantly

### Mobile FPS Targets

| Preset | Target | Minimum |
|--------|--------|---------|
| Auto (mobile) | 30–60 | 24 |
| Low | 30 | 20 |
| Potato | 30 | 20 |

## Test Viewports

### Portrait Mobile

- iPhone 14 Pro: 393×852
- iPhone 15 Pro Max: 430×932
- Pixel 7: 412×915
- Samsung Galaxy S23: 360×800

### Landscape Mobile

- iPhone 14 Pro: 852×393
- iPhone 15 Pro Max: 932×430
- Pixel 7: 915×412

### Tablet

- iPad: 1024×768
- iPad Mini: 768×1024

## Known Mobile Limitations

1. **No virtual joystick**: Character movement is automatic only
2. **No haptic feedback**: Quest completion has no tactile reward
3. **Portrait mode**: FOV adjustment helps but landscape is preferred
4. **Low-end devices**: May struggle with Medium preset on older phones
5. **Browser chrome**: Mobile Safari address bar can affect 100dvh calculations
