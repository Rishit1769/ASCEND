# Future Scope

## Overview

This document describes features and content that are **intentionally deferred** after the MVP. These should NOT be implemented until the two MVP realms pass all production readiness criteria.

## Realms

### Realm of Ascension (Levels 11–15)

**Status**: Partially implemented

The environment exists in `src/components/game/RealmOfAscension/` with:
- Procedural terrain
- Temple architecture
- Floating islands
- Water courtyard
- Camera guard
- Atmosphere

**Still needed**:
- Integration with level progression (currently unreachable in MVP)
- Asset polish and optimization
- Quest content for levels 11–15
- Camera tuning for full playthrough

### Mountains of Trial

**Status**: Partially implemented

The environment exists in `src/components/game/MountainsOfTrial/` with:
- Mountain terrain
- Cliff system
- Bridge
- Waterfalls (3)
- Clouds
- Vegetation
- Wind system
- Camera safety
- World diagnostics

**Still needed**:
- Level range assignment
- Integration with progression
- Quest content
- Visual polish

### Temple of Knowledge (Levels 16–20)

**Status**: Data only

Defined in `world.ts` with:
- Theme: "Learning. Intellect. Mastery."
- Landmark: "Great Archive"
- Status: `assets-required`

**Required assets**:
- Archive architecture, courtyard and stairs
- Scholar statues, rune stones and fountain
- Weathered paving PBR set

### The Celestial Heights (Levels 21–25)

**Status**: Data only

**Required assets**:
- Alpine pass and summit stair terrain
- Celestial ruins and summit gate
- Snow and ice PBR set

### The Summit (Level 26+)

**Status**: Data only

**Required assets**:
- Summit sanctuary and panoramic terrain
- Ascension throne and journey monuments

## Gameplay Systems

### Character Attributes

Defined in `src/types/game.ts` but not used:

```typescript
interface PlayerAttributes {
  strength: number;
  intellect: number;
  focus: number;
  vitality: number;
  discipline: number;
}
```

**Planned**: Attributes affect gameplay mechanics, unlock abilities, influence quest rewards.

### Forge / Equipment System

The "Forge" nav item exists but is disabled. **Planned**: Equipment crafting, upgrades, visual character customization.

### Journey Timeline

The "Journey" nav item exists but is disabled. **Planned**: Visual timeline of player progression, milestones, achievements.

### Audio System

No audio is implemented. **Planned**:
- Ambient soundscapes per realm
- Footstep sounds
- UI interaction sounds
- Quest completion jingles
- Background music

### Daily Quest Refresh

Currently quests are static. **Planned**: Daily rotating quest pool, streak-based quest difficulty.

### Onboarding Tutorial

No tutorial exists. **Planned**: Guided first experience explaining controls, quests, and progression.

## Technical

### Cloud Save / Sync

Currently localStorage-only. **Planned**: Account system, cloud save, cross-device sync.

### Social Features

**Planned**: Friend lists, shared progress, competitive leaderboards, cooperative quests.

### Notifications

**Planned**: Push notifications for streak reminders, quest suggestions, daily rewards.

### Internationalization

Currently English-only. **Planned**: Multi-language support.

### Accessibility

**Planned**:
- Screen reader support
- Keyboard navigation
- Color-blind modes
- Audio descriptions

### Analytics

**Planned**: Usage tracking, A/B testing, funnel analysis.

### Monetization

**Planned**: Premium realms, cosmetic items, battle pass system.

## Scope Protection

**Rule**: Do not begin any future scope work until:

1. The two MVP realms pass all Definition of Done items (see `MVP_SCOPE.md`)
2. Mobile performance is verified on target devices
3. The gameplay loop is confirmed satisfying by testers
4. All critical and gameplay bugs are resolved

The codebase intentionally contains partial implementations of future realms. These exist for development reference but are NOT MVP deliverables.
