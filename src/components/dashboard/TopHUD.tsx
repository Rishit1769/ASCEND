"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Flame, User, Settings } from "lucide-react";
import { usePlayer } from "@/lib/playerStore";
import { getRegionForLevel } from "@/lib/progression";

export default function TopHUD() {
  const { streak, gold, level, totalXp, isMaxLevel } = usePlayer();
  const [profileOpen, setProfileOpen] = useState(false);
  const region = getRegionForLevel(level);

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="pointer-events-auto absolute top-0 left-0 right-0 z-20 flex items-start justify-between px-4 py-3 sm:px-6 sm:py-4 md:px-10 md:py-5"
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))", paddingLeft: "max(1rem, env(safe-area-inset-left))", paddingRight: "max(1rem, env(safe-area-inset-right))" }}
    >
      {/* ─── Left: Branding ─────────────────────────────── */}
      <div className="flex flex-col">
        <span
          className="text-[11px] font-bold uppercase sm:text-xs"
          style={{ color: "var(--color-forge-text-active)", letterSpacing: "0.3em", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
        >
          ASCEND
        </span>
        <span className="hidden sm:inline" style={{ fontSize: "10px", letterSpacing: "0.18em", color: "var(--color-forge-text)", opacity: 0.45 }}>
          YOUR LIFE · YOUR QUEST · YOUR LEVEL
        </span>
      </div>

      {/* ─── Right: Stats & Controls ────────────────────── */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <div className="forge-counter flex items-center gap-1.5 px-2.5 py-1.5 sm:gap-2 sm:px-3" style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))" }}>
          <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5" style={{ color: "#8b3a1a" }} />
          <span className="text-[11px] font-bold tabular-nums sm:text-xs" style={{ color: "var(--color-forge-text-hover)" }}>{streak}</span>
          <span className="hidden sm:inline" style={{ fontSize: "10px", color: "var(--color-forge-text)", opacity: 0.5 }}>streak</span>
        </div>

        <div className="forge-counter flex items-center gap-1.5 px-2.5 py-1.5 sm:gap-2 sm:px-3" style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))" }}>
          <Trophy className="h-3 w-3 sm:h-3.5 sm:w-3.5" style={{ color: "var(--color-forge-text-active)" }} />
          <span className="text-[11px] font-bold tabular-nums sm:text-xs" style={{ color: "var(--color-forge-text-active)" }}>{gold.toLocaleString()}</span>
          <span className="hidden sm:inline" style={{ fontSize: "10px", color: "var(--color-forge-text)", opacity: 0.5 }}>gold</span>
        </div>

        <div className="forge-divider mx-0.5 hidden h-5 w-px sm:block" />

        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setProfileOpen(v => !v)}
            aria-label="Profile"
            aria-expanded={profileOpen}
            className="forge-icon-btn flex h-11 w-11 items-center justify-center"
            style={{ color: "var(--color-forge-text)", opacity: 0.75, clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))" }}
          >
            <User className="h-3.5 w-3.5" />
          </motion.button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="forge-panel absolute right-0 top-full mt-2 w-56 p-3 text-left"
                style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}
              >
                <p className="text-sm font-semibold text-[var(--color-forge-text-hover)]">Wanderer</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-[var(--color-forge-text)] opacity-60">
                  {region.name}
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-[var(--color-forge-text)]">
                  <div><dt className="opacity-50">Level</dt><dd className="text-sm font-bold text-[var(--color-forge-text-active)]">{level}</dd></div>
                  <div><dt className="opacity-50">Lifetime XP</dt><dd className="text-sm font-bold text-[var(--color-forge-text-hover)]">{totalXp.toLocaleString()}</dd></div>
                  <div><dt className="opacity-50">Gold</dt><dd className="font-semibold text-[var(--color-forge-text-active)]">{gold.toLocaleString()}</dd></div>
                  <div><dt className="opacity-50">Streak</dt><dd className="font-semibold text-[var(--color-forge-text-hover)]">{streak} day{streak === 1 ? "" : "s"}</dd></div>
                </dl>
                {isMaxLevel && (
                  <p className="mt-3 border-t border-white/10 pt-2 text-[10px] text-[var(--color-forge-text)] opacity-60">
                    MVP complete — future realms coming soon.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => window.dispatchEvent(new Event("ascend-open-graphics"))}
          aria-label="Graphics settings"
          className="forge-icon-btn flex h-11 w-11 items-center justify-center"
          style={{ color: "var(--color-forge-text)", opacity: 0.75, clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))" }}
        >
          <Settings className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
