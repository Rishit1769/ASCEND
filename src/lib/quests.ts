import type { RegionSlug } from "@/types/game";

export type QuestDifficulty = "easy" | "standard" | "hard";

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  goldReward: number;
  realm: RegionSlug;
  difficulty: QuestDifficulty;
  completed: boolean;
  custom?: boolean;
  createdAt: number;
}

export const DIFFICULTY_REWARDS: Record<QuestDifficulty, { xp: number; gold: number; label: string }> = {
  easy: { xp: 80, gold: 20, label: "Easy" },
  standard: { xp: 150, gold: 40, label: "Standard" },
  hard: { xp: 260, gold: 70, label: "Hard" },
};

const now = Date.now();

/**
 * Starter quests for the MVP vertical slice (Forgotten Shore + Forest of Resolve).
 * Completing all of them grants enough XP to reach Forest of Resolve (level 6),
 * proving the full QUEST → XP → LEVEL → NEW AREA loop.
 */
export const SEED_QUESTS: Quest[] = [
  { id: "seed-first-light", title: "First Light", description: "Complete one meaningful task to begin your ascent.", xpReward: 130, goldReward: 30, realm: "forgotten-shore", difficulty: "easy", completed: false, createdAt: now },
  { id: "seed-steady-breath", title: "Steady Breath", description: "Focus for 25 uninterrupted minutes.", xpReward: 170, goldReward: 45, realm: "forgotten-shore", difficulty: "standard", completed: false, createdAt: now },
  { id: "seed-clear-the-path", title: "Clear the Path", description: "Tidy three small lingering tasks.", xpReward: 140, goldReward: 35, realm: "forgotten-shore", difficulty: "easy", completed: false, createdAt: now },
  { id: "seed-the-long-road", title: "The Long Road", description: "Complete three tasks before the day ends.", xpReward: 210, goldReward: 55, realm: "forgotten-shore", difficulty: "standard", completed: false, createdAt: now },
  { id: "seed-deep-work", title: "Deep Work", description: "Two hours of focused, undistracted work.", xpReward: 260, goldReward: 70, realm: "forest-of-resolve", difficulty: "hard", completed: false, createdAt: now },
  { id: "seed-resolve", title: "Resolve", description: "Finish the hardest task on your list.", xpReward: 230, goldReward: 60, realm: "forest-of-resolve", difficulty: "hard", completed: false, createdAt: now },
  { id: "seed-rootbound", title: "Rootbound", description: "Keep a habit streak alive for three days.", xpReward: 200, goldReward: 50, realm: "forest-of-resolve", difficulty: "standard", completed: false, createdAt: now },
  { id: "seed-guardian", title: "Guardian of the Grove", description: "Plan tomorrow before you rest tonight.", xpReward: 170, goldReward: 45, realm: "forest-of-resolve", difficulty: "standard", completed: false, createdAt: now },
];
