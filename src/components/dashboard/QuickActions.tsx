"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { usePlayer } from "@/lib/playerStore";
import { DIFFICULTY_REWARDS, type QuestDifficulty } from "@/lib/quests";

const DIFFICULTIES: QuestDifficulty[] = ["easy", "standard", "hard"];

export default function QuickActions() {
  const { addQuest } = usePlayer();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<QuestDifficulty>("standard");

  const submit = () => {
    if (!title.trim()) return;
    addQuest({ title, difficulty });
    setTitle("");
    setDifficulty("standard");
    setShowModal(false);
  };

  return (
    <>
      {/* On narrow screens this sits ABOVE the XP bar so the two never overlap. */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.7, ease: "easeOut" }}
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setShowModal(true)}
        aria-label="Create new quest"
        className="pointer-events-auto absolute right-3 bottom-[calc(env(safe-area-inset-bottom)_+_7.5rem)] z-20 flex min-h-[44px] items-center gap-2 px-3 py-2 sm:right-6 sm:bottom-6 sm:px-4 sm:py-2.5 md:bottom-10 md:right-10"
        style={{
          background: "rgba(18, 20, 18, 0.7)",
          border: "1px solid rgba(180, 140, 70, 0.35)",
          color: "var(--color-forge-text-active)",
          clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 6px rgba(0,0,0,0.4)",
        }}
      >
        <Plus className="h-4 w-4" />
        <span className="text-[10px] font-semibold uppercase sm:text-[11px]" style={{ letterSpacing: "0.14em" }}>
          New Quest
        </span>
      </motion.button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(8, 8, 16, 0.85)" }}
            onClick={() => setShowModal(false)}
          >
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={(e) => { e.preventDefault(); submit(); }}
              className="forge-panel relative w-[min(400px,92vw)] p-5 sm:p-6"
              style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
            >
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close"
                className="absolute top-2.5 right-2.5 flex h-9 w-9 items-center justify-center text-[var(--color-forge-text)] opacity-60 transition-opacity hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>

              <h3
                className="mb-4 text-[11px] font-bold uppercase sm:text-xs"
                style={{ letterSpacing: "0.2em", color: "var(--color-forge-text-active)" }}
              >
                Forge a Quest
              </h3>

              <label className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[var(--color-forge-text)] opacity-70">
                What will you accomplish?
              </label>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Finish the report"
                maxLength={80}
                className="mb-4 w-full rounded border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-[var(--color-forge-text-hover)] outline-none placeholder:text-[var(--color-forge-text)]/40 focus:border-[var(--color-forge-border-active)]"
              />

              <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[var(--color-forge-text)] opacity-70">
                Difficulty
              </span>
              <div className="mb-5 grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((d) => {
                  const active = difficulty === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      aria-pressed={active}
                      className="flex min-h-[44px] flex-col items-center justify-center rounded border px-1 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors"
                      style={{
                        borderColor: active ? "var(--color-forge-border-active)" : "rgba(255,255,255,0.12)",
                        background: active ? "rgba(210,165,85,0.14)" : "transparent",
                        color: active ? "var(--color-forge-text-active)" : "var(--color-forge-text)",
                      }}
                    >
                      {DIFFICULTY_REWARDS[d].label}
                      <span className="mt-0.5 opacity-70">{DIFFICULTY_REWARDS[d].xp} XP</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={!title.trim()}
                className="min-h-[46px] w-full rounded border border-[var(--color-forge-border-active)] px-4 text-xs font-bold uppercase tracking-[0.16em] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                style={{ color: "var(--color-forge-text-active)", background: "rgba(210,165,85,0.1)" }}
              >
                Begin Quest
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
