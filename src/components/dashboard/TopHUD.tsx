"use client";

import { motion } from "framer-motion";
import { Trophy, Flame, User, Settings } from "lucide-react";
import type { PlayerData } from "@/types/game";

interface TopHUDProps {
  player: PlayerData;
}

export default function TopHUD({ player }: TopHUDProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="pointer-events-auto absolute top-0 left-0 right-0 z-20 flex items-start justify-between px-4 py-3 sm:px-6 sm:py-4 md:px-10 md:py-5"
    >
      {/* ─── Left: Branding ─────────────────────────────── */}
      <div className="flex flex-col">
        <span
          className="text-[11px] font-bold uppercase sm:text-xs"
          style={{
            color: "var(--color-forge-text-active)",
            letterSpacing: "0.3em",
            textShadow: "0 1px 4px rgba(0,0,0,0.6)",
          }}
        >
          ASCEND
        </span>
        <span
          className="hidden sm:inline"
          style={{
            fontSize: "9px",
            letterSpacing: "0.18em",
            color: "var(--color-forge-text)",
            opacity: 0.45,
          }}
        >
          YOUR LIFE · YOUR QUEST · YOUR LEVEL
        </span>
      </div>

      {/* ─── Right: Stats & Controls ────────────────────── */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Streak */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="forge-counter flex items-center gap-1.5 px-2.5 py-1.5 sm:gap-2 sm:px-3"
          style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))" }}
        >
          <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5" style={{ color: "#8b3a1a" }} />
          <span
            className="text-[11px] font-bold tabular-nums sm:text-xs"
            style={{ color: "var(--color-forge-text-hover)" }}
          >
            {player.streak}
          </span>
          <span
            className="hidden sm:inline"
            style={{ fontSize: "9px", color: "var(--color-forge-text)", opacity: 0.5 }}
          >
            streak
          </span>
        </motion.div>

        {/* Gold */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="forge-counter flex items-center gap-1.5 px-2.5 py-1.5 sm:gap-2 sm:px-3"
          style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))" }}
        >
          <Trophy className="h-3 w-3 sm:h-3.5 sm:w-3.5" style={{ color: "var(--color-forge-text-active)" }} />
          <span
            className="text-[11px] font-bold tabular-nums sm:text-xs"
            style={{ color: "var(--color-forge-text-active)" }}
          >
            {player.gold}
          </span>
          <span
            className="hidden sm:inline"
            style={{ fontSize: "9px", color: "var(--color-forge-text)", opacity: 0.5 }}
          >
            gold
          </span>
        </motion.div>

        {/* Divider */}
        <div
          className="forge-divider mx-0.5 hidden h-5 w-px sm:block"
        />

        {/* Profile */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          aria-label="Profile"
          className="forge-icon-btn flex h-8 w-8 items-center justify-center"
          style={{
            color: "var(--color-forge-text)",
            opacity: 0.6,
            clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))",
          }}
        >
          <User className="h-3.5 w-3.5" />
        </motion.button>

        {/* Settings */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          aria-label="Settings"
          className="forge-icon-btn flex h-8 w-8 items-center justify-center"
          style={{
            color: "var(--color-forge-text)",
            opacity: 0.6,
            clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))",
          }}
        >
          <Settings className="h-3.5 w-3.5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
