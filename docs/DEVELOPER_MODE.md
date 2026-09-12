# Developer Mode

## Overview

Developer Mode is a testing tool available only in development (`NODE_ENV === "development"`). It allows developers to manually switch between the two MVP maps and select specific levels without affecting normal player progression.

## Access

Developer Mode appears as a "DEV MODE" button in the bottom-right corner of the screen (on mobile) or bottom-left (on desktop).

## Features

### Map Selector

Two map buttons:

| Button | Loads Level | Region |
|--------|------------|--------|
| The Forgotten Shore | Level 1 | Forgotten Shore |
| Forest of Resolve | Level 6 | Forest of Resolve |

### Level Selector

Dropdown with levels 1–10, showing the region name:

```
1 — The Forgotten Shore
2 — The Forgotten Shore
3 — The Forgotten Shore
4 — The Forgotten Shore
5 — The Forgotten Shore
6 — Forest of Resolve
7 — Forest of Resolve
8 — Forest of Resolve
9 — Forest of Resolve
10 — Forest of Resolve
```

### Animation Selector

Switch between hero animations:
- `FIGHTIDLE_Root` (default idle)
- `WALK_player_Root` (walking)

### Graphics Preset Selector

Switch between: AUTO, ULTRA, HIGH, MEDIUM, LOW, POTATO

### Utility Buttons

- **Reload region**: Forces the current region to remount
- **Reset camera**: Resets OrbitControls to default position
- **Exit preview**: Returns to the actual player level

## How It Works

### Source File

`src/components/game/WorldProgress.tsx`

### State Override

```typescript
const effective = process.env.NODE_ENV === "development" && previewLevel !== null
  ? previewLevel      // Dev preview overrides
  : normalizeLevel(level);  // Actual player level
```

When `previewLevel` is set:
- The `WorldContext` provides the preview level as `level`
- `resolveWorld()` resolves the region from the preview level
- The 3D scene loads the corresponding region
- Normal player data in localStorage is NOT modified

### Progression Safety

- `setPreviewLevel()` only modifies local React state
- `exitPreview()` resets preview to `null`, restoring actual player level
- No localStorage writes occur during preview
- Player XP, gold, streak, and quests remain unchanged

## Implementation Details

### DEV_REALMS Configuration

```typescript
const DEV_REALMS = [
  { id: "forgotten-shore" as const, name: "The Forgotten Shore" },
  { id: "forest-of-resolve" as const, name: "Forest of Resolve" },
];
```

Only the two MVP realms are included. Future realms are excluded from the selector.

### Rendering

The `WorldPreviewPanel` component renders inside `WorldProgressProvider`, which is only mounted when `process.env.NODE_ENV === "development"`:

```typescript
{process.env.NODE_ENV === "development" && <WorldPreviewPanel />}
```

In production builds, the entire Developer Mode panel is tree-shaken away.

## UI Layout

```
┌──────────────────────────┐
│ DEV MODE           ACTIVE│  ← Toggle button + preview badge
├──────────────────────────┤
│ Developer Mode   {region}│  ← Header with current region
│                          │
│ SELECT MAP               │
│ ┌──────────────────────┐ │
│ │ The Forgotten Shore   │ │  ← Map button (highlighted if active)
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ Forest of Resolve     │ │  ← Map button
│ └──────────────────────┘ │
│                          │
│ Level                    │
│ ┌──────────────────────┐ │
│ │ 6 — Forest of Resolve│ │  ← Level dropdown
│ └──────────────────────┘ │
│                          │
│ Animation    [FIGHTIDLE] │
│ Graphics     [AUTO    ▾] │
│                          │
│ [Reload] [Reset camera]  │
│                          │
│ [Exit preview]           │  ← Only shown when previewing
└──────────────────────────┘
```

## Mobile Behavior

- Button positioned at `right-3 bottom-20` (above XP bar)
- On `sm+`: positioned at `right-3 bottom-3`
- Panel width: `min(330px, calc(100vw - 24px))`
- Scrollable with `max-h-[72vh]`
