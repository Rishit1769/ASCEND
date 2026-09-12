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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
      className="pointer-events-auto absolute bottom-4 left-1/2 z-20 w-[min(380px,85vw)] -translate-x-1/2 sm:bottom-6 md:bottom-10 md:w-[min(420px,70vw)]"
    >
      <div
        className="forge-panel px-4 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4"
        style={{
          clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
        }}
      >
        {/* ─── Level + Region row ──────────────────────── */}
        <div className="mb-2.5 flex items-baseline justify-between sm:mb-3">
          <div className="flex items-baseline gap-1.5">
            <span
              style={{
                fontSize: "9px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "var(--color-forge-text)",
                opacity: 0.5,
              }}
            >
              Level
            </span>
            <motion.span
              key={player.level}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="animate-level-pulse tabular-nums"
              style={{
                fontSize: "1.5rem",
                fontWeight: 900,
                lineHeight: 1,
                color: "var(--color-forge-text-active)",
                textShadow: "0 1px 3px rgba(0,0,0,0.5)",
              }}
            >
              {player.level}
            </motion.span>
          </div>
          <span
            style={{
              fontSize: "9px",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-forge-text)",
              opacity: 0.4,
            }}
          >
            {region.name}
          </span>
        </div>

        {/* ─── XP Bar ──────────────────────────────────── */}
        <div className="xp-track relative mb-2 h-2 w-full overflow-hidden sm:h-2.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 xp-shimmer"
          />
          {/* Top highlight */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
            }}
          />
        </div>

        {/* ─── XP numeric row ──────────────────────────── */}
        <div className="flex items-center justify-between">
          <span
            className="tabular-nums"
            style={{ fontSize: "9px", color: "var(--color-forge-text)", opacity: 0.45 }}
          >
            {player.xp.toLocaleString()} / {player.xpRequired.toLocaleString()} XP
          </span>
          <span
            className="tabular-nums"
            style={{ fontSize: "9px", color: "var(--color-forge-text)", opacity: 0.35 }}
          >
            {xpPercent}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}
