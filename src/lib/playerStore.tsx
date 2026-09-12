"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { levelForTotalXp, MVP_MAX_LEVEL, totalXpForLevel } from "./progression";
import { DIFFICULTY_REWARDS, SEED_QUESTS, type Quest, type QuestDifficulty } from "./quests";

const STORAGE_KEY = "ascend-player-v1";
const SCHEMA_VERSION = 1;

interface PersistedState {
  version: number;
  totalXp: number;
  gold: number;
  streak: number;
  lastCompletionDay: string | null;
  quests: Quest[];
}

const DEFAULT_STATE: PersistedState = {
  version: SCHEMA_VERSION,
  totalXp: 0,
  gold: 0,
  streak: 0,
  lastCompletionDay: null,
  quests: SEED_QUESTS,
};

function dayKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function loadState(): PersistedState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (!parsed || parsed.version !== SCHEMA_VERSION) return DEFAULT_STATE;
    return {
      version: SCHEMA_VERSION,
      totalXp: Number.isFinite(parsed.totalXp) ? Math.max(0, parsed.totalXp as number) : 0,
      gold: Number.isFinite(parsed.gold) ? Math.max(0, parsed.gold as number) : 0,
      streak: Number.isFinite(parsed.streak) ? Math.max(0, parsed.streak as number) : 0,
      lastCompletionDay: typeof parsed.lastCompletionDay === "string" ? parsed.lastCompletionDay : null,
      quests: Array.isArray(parsed.quests) && parsed.quests.length ? (parsed.quests as Quest[]) : SEED_QUESTS,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export interface PlayerStore {
  level: number;
  xp: number;
  xpRequired: number;
  totalXp: number;
  gold: number;
  streak: number;
  quests: Quest[];
  isMaxLevel: boolean;
  completeQuest: (id: string) => void;
  addQuest: (input: { title: string; description?: string; difficulty: QuestDifficulty }) => void;
  resetProgress: () => void;
}

const PlayerContext = createContext<PlayerStore | null>(null);

export function usePlayer(): PlayerStore {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within a PlayerProvider");
  return ctx;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadState);

  // Persist on every change.
  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage may be unavailable */ }
  }, [state]);

  const completeQuest = useCallback((id: string) => {
    setState(current => {
      const quest = current.quests.find(q => q.id === id);
      if (!quest || (quest.completed && !quest.custom)) return current; // award exactly once

      const today = dayKey(new Date());
      const yesterday = dayKey(new Date(Date.now() - 86_400_000));
      const streak = current.lastCompletionDay === today
        ? current.streak
        : current.lastCompletionDay === yesterday
          ? current.streak + 1
          : 1;

      // Custom quests recur, so they stay available as repeatable daily actions.
      const quests = current.quests.map(q =>
        q.id === id ? { ...q, completed: !q.custom } : q
      );

      return {
        ...current,
        totalXp: current.totalXp + quest.xpReward,
        gold: current.gold + quest.goldReward,
        streak,
        lastCompletionDay: today,
        quests,
      };
    });
  }, []);

  const addQuest = useCallback((input: { title: string; description?: string; difficulty: QuestDifficulty }) => {
    const title = input.title.trim();
    if (!title) return;
    const reward = DIFFICULTY_REWARDS[input.difficulty];
    setState(current => ({
      ...current,
      quests: [
        {
          id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title,
          description: input.description?.trim() || "A custom quest of your own making.",
          xpReward: reward.xp,
          goldReward: reward.gold,
          realm: "forgotten-shore",
          difficulty: input.difficulty,
          completed: false,
          custom: true,
          createdAt: Date.now(),
        },
        ...current.quests,
      ],
    }));
  }, []);

  const resetProgress = useCallback(() => setState(DEFAULT_STATE), []);

  const store = useMemo<PlayerStore>(() => {
    const level = levelForTotalXp(state.totalXp);
    const base = totalXpForLevel(level);
    const isMaxLevel = level >= MVP_MAX_LEVEL;
    const next = isMaxLevel ? base : totalXpForLevel(level + 1);
    return {
      level,
      xp: Math.max(0, state.totalXp - base),
      xpRequired: Math.max(1, next - base),
      totalXp: state.totalXp,
      gold: state.gold,
      streak: state.streak,
      quests: state.quests,
      isMaxLevel,
      completeQuest,
      addQuest,
      resetProgress,
    };
  }, [state, completeQuest, addQuest, resetProgress]);

  return <PlayerContext.Provider value={store}>{children}</PlayerContext.Provider>;
}
