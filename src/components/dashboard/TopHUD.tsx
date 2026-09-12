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
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="pointer-events-auto absolute top-0 left-0 right-0 z-20 flex items-start justify-between px-4 py-3 sm:px-6 sm:py-4 md:px-10 md:py-5"
    >
      {/* ─── Left: Branding ─────────────────────────────── */}
      <div className="flex flex-col">
        <span className="text-[11px] font-bold tracking-[0.35em] text-gold/90 uppercase sm:text-xs">
          ASCEND
        </span>
        <span className="hidden text-[9px] tracking-[0.2em] text-ash/40 sm:inline">
          YOUR LIFE · YOUR QUEST · YOUR LEVEL
        </span>
      </div>

      {/* ─── Right: Stats & Controls ────────────────────── */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="flex items-center gap-1.5 rounded border border-white/[0.06] bg-white/[0.04] px-2.5 py-1.5 backdrop-blur-md sm:gap-2 sm:px-3"
        >
          <Flame className="h-3 w-3 text-crimson sm:h-3.5 sm:w-3.5" />
          <span className="text-[11px] font-bold tabular-nums text-bone sm:text-xs">
            {player.streak}
          </span>
          <span className="hidden text-[9px] text-ash/60 sm:inline">streak</span>
        </motion.div>

        {/* Gold */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="flex items-center gap-1.5 rounded border border-white/[0.06] bg-white/[0.04] px-2.5 py-1.5 backdrop-blur-md sm:gap-2 sm:px-3"
        >
          <Trophy className="h-3 w-3 text-gold sm:h-3.5 sm:w-3.5" />
          <span className="text-[11px] font-bold tabular-nums text-gold sm:text-xs">
            {player.gold}
          </span>
          <span className="hidden text-[9px] text-ash/60 sm:inline">gold</span>
        </motion.div>

        {/* Divider */}
        <div className="mx-1 hidden h-5 w-px bg-white/[0.06] sm:block" />

        {/* Profile */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          aria-label="Profile"
          className="flex h-8 w-8 items-center justify-center rounded border border-white/[0.06] bg-white/[0.04] text-ash/60 transition-colors hover:border-gold/30 hover:text-bone backdrop-blur-md"
        >
          <User className="h-3.5 w-3.5" />
        </motion.button>

        {/* Settings */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          aria-label="Settings"
          className="flex h-8 w-8 items-center justify-center rounded border border-white/[0.06] bg-white/[0.04] text-ash/60 transition-colors hover:border-gold/30 hover:text-bone backdrop-blur-md"
        >
          <Settings className="h-3.5 w-3.5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
