# Gameplay System

## Gameplay Loop

```
Quest → Action → Completion → XP + Gold → Level Up → New Area
```

The core loop is:

1. Player sees available quests in the Quest Panel
2. Player completes a real-life task corresponding to a quest
3. Player marks the quest as complete in the UI
4. System awards XP and gold
5. XP accumulates toward the next level threshold
6. When XP threshold is reached, the character walks to the next checkpoint
7. At level 6, the environment transitions from Forgotten Shore to Forest of Resolve
8. At level 10, the Journey Teaser appears showing future content

## Quest System

### Source Files

| File | Purpose |
|------|---------|
| `src/lib/quests.ts` | Quest types, difficulty rewards, seed data |
| `src/lib/playerStore.tsx` | Quest completion, custom creation, persistence |
| `src/components/dashboard/QuestPanel.tsx` | Quest list UI |
| `src/components/dashboard/QuickActions.tsx` | Quest creation UI |

### Quest Data Model

```typescript
interface Quest {
  id: string;              // Unique identifier
  title: string;           // Display name
  description: string;     // Flavor text
  xpReward: number;        // XP awarded on completion
  goldReward: number;      // Gold awarded on completion
  realm: RegionSlug;       // Which realm this quest belongs to
  difficulty: "easy" | "standard" | "hard";
  completed: boolean;      // Completion flag
  custom?: boolean;        // True for player-created quests
  createdAt: number;       // Timestamp
}
```

### Difficulty Rewards

| Difficulty | XP | Gold |
|-----------|-----|------|
| Easy | 80 | 20 |
| Standard | 150 | 40 |
| Hard | 260 | 70 |

### Seed Quests

8 starter quests are provided, 4 per realm:

**Forgotten Shore:**
- First Light (easy, 130 XP) — Complete one meaningful task
- Steady Breath (standard, 170 XP) — Focus for 25 minutes
- Clear the Path (easy, 140 XP) — Tidy three small tasks
- The Long Road (standard, 210 XP) — Complete three tasks

**Forest of Resolve:**
- Deep Work (hard, 260 XP) — Two hours of focused work
- Resolve (hard, 230 XP) — Finish the hardest task
- Rootbound (standard, 200 XP) — Keep a streak alive for 3 days
- Guardian of the Grove (standard, 170 XP) — Plan tomorrow tonight

Total seed XP: 1,510 (sufficient to reach level 6).

### Quest Completion Flow

1. User clicks the check button in `QuestPanel`
2. `completeQuest(id)` is called on the player store
3. Guard: if quest is already completed and is NOT custom, return current state
4. Streak logic evaluates (consecutive days with completions)
5. Quest's `completed` flag is set to `true` (or remains `false` if custom — custom quests are repeatable)
6. XP and gold are added to totals
7. State persists to localStorage

### Custom Quests

Players can create custom quests via the "Forge a Quest" modal:

- Title is required (max 80 characters)
- Difficulty selection determines XP/gold rewards
- Custom quests are always assigned to `"forgotten-shore"` realm
- Custom quests are repeatable (completion does not permanently mark them)
- Custom quests are prepended to the quest list (newest first)

## XP System

### Source Files

| File | Purpose |
|------|---------|
| `src/lib/progression.ts` | XP calculations, level derivation |
| `src/lib/playerStore.tsx` | XP storage and persistence |

### XP Formula

```typescript
// XP required to advance from level L to level L+1
xpForLevel(level) = 100 + level × 50

// Cumulative XP to reach level L (level 1 = 0 XP)
totalXpForLevel(level) = sum of xpForLevel(l) for l = 1 to level-1

// Derive level from total accumulated XP
levelForTotalXp(totalXp) = highest level where totalXp >= totalXpForLevel(level)
```

### XP Thresholds

| Level | XP to Next Level | Cumulative XP |
|-------|-----------------|---------------|
| 1 | 150 | 0 |
| 2 | 200 | 150 |
| 3 | 250 | 350 |
| 4 | 300 | 600 |
| 5 | 350 | 900 |
| 6 | 400 | 1,300 |
| 7 | 450 | 1,750 |
| 8 | 500 | 2,250 |
| 9 | 550 | 2,800 |
| 10 | (max) | 3,350 |

### XP Display

- `PlayerProgress.tsx` shows: `currentXP / requiredXP` with a shimmer-animated progress bar
- At max level (10): shows "MVP complete — future realms coming soon" at 100%
- Level number animates with a spring effect on change

## Levels

### Level Derivation

Level is derived from `totalXp` (lifetime accumulated XP) via `levelForTotalXp()`. The level is capped at `MVP_MAX_LEVEL = 10`.

### Level → Region Mapping

```typescript
resolveWorld(level) → { region, checkpoint }
```

- Levels 1–5 → Forgotten Shore
- Levels 6–10 → Forest of Resolve
- Levels 11+ → Realm of Ascension (future scope)

### Level Up Behavior

When XP crosses a level threshold:
1. The `level` derived state updates
2. `resolveWorld(level)` returns the new checkpoint
3. `ProgressionHero` detects the level change
4. A CatmullRomCurve3 path is generated from current position to the new checkpoint
5. The hero walks along the path with animation
6. Camera follows via OrbitControls target tracking

## Streaks

### Implementation

```typescript
const streak =
  lastCompletionDay === today    ? current.streak    // already completed today
  : lastCompletionDay === yesterday ? current.streak + 1  // consecutive day
  : 1;                                             // gap > 1 day, restart
```

- Streaks are based on **consecutive days** with at least one quest completion
- Using local time (not UTC) for day boundary calculation
- Displayed in TopHUD with a flame icon

## Gold

- Earned from quest completion (same formula as XP)
- Displayed in TopHUD with a trophy icon
- Currently cosmetic — no spending mechanic in MVP

## Attributes

Defined in `src/types/game.ts` but **not displayed or used in MVP gameplay**:

```typescript
interface PlayerAttributes {
  strength: number;
  intellect: number;
  focus: number;
  vitality: number;
  discipline: number;
}
```

The `mockPlayer.ts` has sample attribute values, but no UI or system uses them yet.

## Realm Unlocking

Realm transitions are automatic based on level:

- **Level 5 → 6**: Character walks from Forgotten Shore to Forest of Resolve
- **Level 10**: Journey Teaser appears (no further realms in MVP)

There is no explicit "unlock" mechanism — the region simply becomes active when the player's level falls within its range.

## Level 10 Ending

When the player reaches level 10:
1. `isMaxLevel` becomes `true`
2. The `JourneyTeaser` modal appears
3. It shows "Your journey has only begun" with 4 locked future realms
4. Player can dismiss the teaser and continue in Forest of Resolve
5. Completing additional quests still awards XP/gold but the level stays at 10
6. The XP bar shows 100% with "MVP complete" message

## Developer Mode Bypass

Developer mode allows manually selecting levels 1–10 without altering normal progression:

- `WorldProgressProvider` accepts an optional `previewLevel` override
- When active, the effective level is the preview level, not the player's actual level
- Switching maps in dev mode does NOT modify localStorage player data
- Exiting preview mode restores the actual player level

## Save/Persistence

### Storage Mechanism

- **Key**: `ascend-player-v1` in `localStorage`
- **Format**: JSON-serialized `PersistedState`

### Schema

```typescript
interface PersistedState {
  version: number;          // Schema version (currently 1)
  totalXp: number;          // Lifetime accumulated XP
  gold: number;             // Gold currency
  streak: number;           // Consecutive-day streak
  lastCompletionDay: string | null;  // YYYY-MM-DD of last completion
  quests: Quest[];          // All quests (active + completed)
}
```

### Load Behavior

1. On SSR: returns `DEFAULT_STATE` (no localStorage access)
2. On client: reads from localStorage
3. Validates `version === SCHEMA_VERSION` (returns defaults on mismatch)
4. Sanitizes numeric fields with `Number.isFinite()` / `Math.max(0, ...)`
5. Falls back to defaults on any parse error

### Save Behavior

- Writes full state to localStorage on every state change
- Wrapped in try/catch for storage quota errors

## Edge Cases

- **Refresh during completion**: State is saved before UI update; no data loss
- **Duplicate completion**: Seed quests cannot be double-completed; custom quests can be repeated
- **Corrupted save**: Falls back to default state with fresh seed quests
- **Realm transition**: Old region unmounts, new region mounts via key change; no cross-contamination
- **Max level overflow**: XP continues to accumulate but level stays at 10
