"use client";

import { motion } from "framer-motion";
import type { PlayerData } from "@/types/game";
import { getRegionForLevel } from "@/lib/progression";

interface PlayerProgressProps {
  player: PlayerData;
}

export default function PlayerProgress({ player }: PlayerProgressProps) {
  const xpPercent = Math.round((player.xp / player.xpRequired) * 100);
  const region = getRegionForLevel(player.level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
      className="pointer-events-auto absolute bottom-4 left-1/2 z-20 w-[min(380px,85vw)] -translate-x-1/2 sm:bottom-6 md:bottom-10 md:w-[min(420px,70vw)]"
    >
      <div className="hud-panel rounded border border-white/[0.06] px-4 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4">
        {/* ─── Level + Region row ──────────────────────── */}
        <div className="mb-2.5 flex items-baseline justify-between sm:mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-ash/50 sm:text-[10px]">
              Level
            </span>
            <motion.span
              key={player.level}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="animate-level-pulse text-xl font-black tabular-nums text-gold sm:text-2xl"
            >
              {player.level}
            </motion.span>
          </div>
          <span className="text-[9px] font-medium tracking-wider text-ash/50 sm:text-[10px]">
            {region.name}
          </span>
        </div>

        {/* ─── XP Bar ──────────────────────────────────── */}
        <div className="relative mb-2 h-2 w-full overflow-hidden rounded-full xp-track sm:h-2.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 rounded-full xp-shimmer"
          />
          {/* Top highlight line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
        </div>

        {/* ─── XP numeric row ──────────────────────────── */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] tabular-nums text-ash/50 sm:text-[10px]">
            {player.xp.toLocaleString()} / {player.xpRequired.toLocaleString()} XP
          </span>
          <span className="text-[9px] tabular-nums text-ash/40 sm:text-[10px]">
            {xpPercent}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}
