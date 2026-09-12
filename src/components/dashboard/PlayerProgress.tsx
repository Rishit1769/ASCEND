"use client";

import { motion } from "framer-motion";
import { usePlayer } from "@/lib/playerStore";
import { getRegionForLevel } from "@/lib/progression";

export default function PlayerProgress() {
  const { level, xp, xpRequired, isMaxLevel } = usePlayer();
  const xpPercent = isMaxLevel ? 100 : Math.min(100, Math.round((xp / xpRequired) * 100));
  const region = getRegionForLevel(level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
      className="pointer-events-auto absolute left-1/2 z-20 w-[min(360px,88vw)] -translate-x-1/2 md:w-[min(420px,70vw)]"
      style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div
        className="forge-panel px-4 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4"
        style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
      >
        <div className="mb-2.5 flex items-baseline justify-between sm:mb-3">
          <div className="flex items-baseline gap-1.5">
            <span style={{ fontSize: "9px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-forge-text)", opacity: 0.5 }}>
              Level
            </span>
            <motion.span
              key={level}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="animate-level-pulse tabular-nums"
              style={{ fontSize: "1.5rem", fontWeight: 900, lineHeight: 1, color: "var(--color-forge-text-active)", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
            >
              {level}
            </motion.span>
          </div>
          <span style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-forge-text)", opacity: 0.45 }}>
            {region.name}
          </span>
        </div>

        <div className="xp-track relative mb-2 h-2 w-full overflow-hidden sm:h-2.5" role="progressbar" aria-valuenow={xpPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Experience">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 xp-shimmer"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
        </div>

        <div className="flex items-center justify-between">
          <span className="tabular-nums" style={{ fontSize: "9px", color: "var(--color-forge-text)", opacity: 0.5 }}>
            {isMaxLevel ? "MVP complete — future realms coming soon" : `${xp.toLocaleString()} / ${xpRequired.toLocaleString()} XP`}
          </span>
          {!isMaxLevel && (
            <span className="tabular-nums" style={{ fontSize: "9px", color: "var(--color-forge-text)", opacity: 0.4 }}>{xpPercent}%</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
