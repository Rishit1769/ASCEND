# Bugs and Known Issues

## Critical

*No critical bugs identified in current MVP scope.*

## Gameplay

### Custom Quests Hardcoded to Forgotten Shore

**File**: `src/lib/playerStore.tsx:124`

All custom quests are assigned to `"forgotten-shore"` realm regardless of the player's current level. A level-9 player creating a quest sees it assigned to the Forgotten Shore.

**Impact**: Low — cosmetic inconsistency, no functional issue.
**Fix**: Add realm selection to the quest creation form, or auto-assign based on current level.

### No Quest Deletion

Custom quests cannot be deleted. Once created, they can only be completed (repeatedly) or wiped via full progress reset.

**Impact**: Low — minor UX inconvenience.
**Fix**: Add a delete button to custom quests in the QuestPanel.

### Seed Quest XP Doesn't Match Difficulty Table

Seed quests have custom XP values that don't align with the `DIFFICULTY_REWARDS` table. For example, "First Light" is "easy" but gives 130 XP (easy table says 80).

**Impact**: None — intentional design choice to make total XP work out.
**Note**: This is by design. Custom quests DO use the difficulty table.

### XP Earned After Max Level Has No Visual Feedback

At level 10, completing quests still awards XP but the bar stays at 100% with no indication that XP is being earned.

**Impact**: Low — cosmetic only.
**Fix**: Could show "Overflow XP: X" or similar.

## Visual

### Realms Beyond MVP Exist in Code

The codebase contains complete environment implementations for Mountains of Trial and Realm of Ascension. These are rendered if the player level enters their range (levels 11+).

**Impact**: None in MVP (player caps at level 10), but could confuse developers.
**Fix**: Future scope — not an MVP issue.

### Character Stage Name Always Shows "Wanderer"

The profile dropdown in TopHUD hardcodes the character stage name as "Wanderer" regardless of the player's actual region/level.

**Impact**: Low — cosmetic.
**Fix**: Derive stage name from region (`characterStage` field in world.ts).

### World Map Shows Preview Level in Dev Mode

`WorldMap.tsx` reads from `useWorldProgress()` which could be in preview mode, showing checkpoints for a different level than the player's actual level.

**Impact**: Dev-only.
**Fix**: Read from `usePlayer()` instead.

## Technical

### ForestCameraGuard Scene Traversal

`ForestCameraGuard.tsx` previously traversed the entire scene graph on every React render. This was fixed to only run on mount.

**Status**: Fixed.
**File**: `src/components/game/ForestOfResolve/ForestCameraGuard.tsx`

### THREE.Clock Deprecation Warning

The console shows `THREE.Clock: This module has beend eprecated. Please use THREE.Timer instead.` on every load.

**Impact**: Warning only — no functional issue.
**Cause**: Three.js 0.186.0 deprecates `THREE.Clock` in favor of `THREE.Timer`. R3F or Drei may use `Clock` internally.
**Fix**: Will resolve when R3F/Drei update to use `THREE.Timer`.

### Double Tone Mapping Risk

Both the Canvas `gl` settings (`toneMapping: ACESFilmicToneMapping`) and `SceneEffects` (`<ToneMapping mode={ACES_FILMIC} />`) apply ACES filmic tone mapping. If the postprocessing pass doesn't replace the built-in pass, this could double-apply.

**Impact**: Unknown — needs visual verification.
**Fix**: Remove `toneMapping` from Canvas `gl` when postprocessing is active.

### Production Console Statements

Some `console.warn`/`console.info` calls are not guarded by `NODE_ENV` checks. These appear in production browser consoles.

**Impact**: Minor — noise in production consoles.
**Files**: `EnvironmentAsset.tsx:139`, `Hero.tsx:76`
**Fix**: Guard with `process.env.NODE_ENV === "development"`.

### No Schema Migration

If `SCHEMA_VERSION` in `playerStore.tsx` is incremented, all existing user data is silently wiped. No migration function exists.

**Impact**: Low for MVP (version 1), will matter for future updates.
**Fix**: Implement migration function before incrementing version.

## Performance

### CPU Particle Animation

`AmbientParticles` and forest waterfall mist mutate position attributes on the CPU every frame. This should ideally be done in a vertex shader.

**Impact**: Minor on desktop, potentially significant on low-end mobile.
**Fix**: Move particle animation to GPU via vertex shader.

### Tab Visibility

The 3D canvas continues rendering at full cost when the browser tab is hidden. No throttling is applied.

**Impact**: Battery drain on mobile when tab is in background.
**Fix**: Pause rendering or reduce frame rate when `document.hidden === true`.

### EffectComposer Re-mount on Preset Change

Changing the graphics preset causes the entire `EffectComposer` to re-mount (keyed by preset). This creates a brief hitch.

**Impact**: Visible during preset switching.
**Fix**: Would require refactoring EffectComposer to update props dynamically instead of remounting.

## Mobile

### Portrait Mode Camera

Portrait mode increases FOV by +10° as a simple adaptation. This helps but isn't a dedicated portrait camera system.

**Impact**: Functional but not optimal.
**Fix**: Future scope — dedicated portrait camera framing.

### No Virtual Joystick

Character movement is automatic, so no joystick is needed. If manual movement is added in the future, a virtual joystick would be required.

**Impact**: None in MVP (movement is automatic).
