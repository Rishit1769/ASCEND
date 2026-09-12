"use client";

import { motion } from "framer-motion";
import { Check, X, Zap, Coins, ScrollText } from "lucide-react";
import { usePlayer } from "@/lib/playerStore";
import { getRegionForLevel } from "@/lib/progression";

export default function QuestPanel({ onClose }: { onClose: () => void }) {
  const { quests, completeQuest, level, xp, xpRequired, isMaxLevel } = usePlayer();
  const region = getRegionForLevel(level);

  const active = quests.filter(q => !q.completed).sort((a, b) => b.createdAt - a.createdAt);
  const done = quests.filter(q => q.completed);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="pointer-events-auto fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(8, 8, 16, 0.86)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Quests"
        className="forge-panel relative flex max-h-[88dvh] w-full max-w-[560px] flex-col sm:max-h-[80dvh]"
        style={{
          clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2">
            <ScrollText className="h-4 w-4" style={{ color: "var(--color-forge-text-active)" }} />
            <h2
              className="text-[11px] font-bold uppercase sm:text-xs"
              style={{ letterSpacing: "0.2em", color: "var(--color-forge-text-active)" }}
            >
              Quests
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close quests"
            className="flex h-11 w-11 items-center justify-center rounded border border-white/10 text-[var(--color-forge-text)] transition-colors hover:text-[var(--color-forge-text-hover)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Level summary */}
        <div className="border-b border-white/10 px-4 py-3 sm:px-6">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--color-forge-text)] opacity-60">
              Level {level} · {region.name}
            </span>
            <span className="text-[10px] tabular-nums text-[var(--color-forge-text)] opacity-50">
              {isMaxLevel ? "Finale" : `${xp.toLocaleString()} / ${xpRequired.toLocaleString()} XP`}
            </span>
          </div>
        </div>

        {/* Quest list */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
          {active.length === 0 && (
            <p className="px-2 py-8 text-center text-xs text-[var(--color-forge-text)] opacity-60">
              All quests complete. Forge a new one to continue your ascent.
            </p>
          )}

          <ul className="flex flex-col gap-2">
            {active.map(quest => (
              <li
                key={quest.id}
                className="flex items-start gap-3 rounded border border-white/10 bg-white/[0.02] p-3"
              >
                <button
                  onClick={() => completeQuest(quest.id)}
                  aria-label={`Complete quest: ${quest.title}`}
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[var(--color-forge-border-active)] text-[var(--color-forge-text-active)] transition-colors hover:bg-[rgba(210,165,85,0.14)]"
                  style={{ minWidth: 44, minHeight: 44 }}
                >
                  <Check className="h-4 w-4" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--color-forge-text-hover)]">{quest.title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-[var(--color-forge-text)] opacity-65">{quest.description}</p>
                  <div className="mt-1.5 flex items-center gap-3 text-[10px] text-[var(--color-forge-text)] opacity-70">
                    <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{quest.xpReward} XP</span>
                    <span className="flex items-center gap-1"><Coins className="h-3 w-3" />{quest.goldReward}</span>
                    <span className="uppercase tracking-wider opacity-60">{quest.difficulty}</span>
                    {quest.custom && <span className="uppercase tracking-wider opacity-60">Repeatable</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {done.length > 0 && (
            <>
              <p className="mb-2 mt-5 px-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-forge-text)] opacity-40">
                Completed
              </p>
              <ul className="flex flex-col gap-1.5">
                {done.map(quest => (
                  <li key={quest.id} className="flex items-center gap-2 rounded border border-white/[0.06] px-3 py-2 opacity-50">
                    <Check className="h-3.5 w-3.5" style={{ color: "var(--color-forge-text-active)" }} />
                    <span className="truncate text-xs text-[var(--color-forge-text)] line-through">{quest.title}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
