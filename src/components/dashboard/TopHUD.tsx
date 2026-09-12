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
      className="pointer-events-auto absolute top-0 left-0 right-0 z-20 flex items-start justify-between px-6 py-4 md:px-10 md:py-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-semibold tracking-[0.3em] text-gold/80 uppercase">
            ASCEND
          </span>
          <span className="text-[10px] tracking-widest text-ash/60">
            YOUR LIFE · YOUR QUEST · YOUR LEVEL
          </span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 rounded border border-stone/40 bg-abyss/60 px-3 py-1.5 backdrop-blur-sm">
          <Flame className="h-3.5 w-3.5 text-crimson" />
          <span className="text-xs font-semibold text-bone">
            {player.streak}
          </span>
          <span className="text-[10px] text-ash">day streak</span>
        </div>

        <div className="flex items-center gap-2 rounded border border-stone/40 bg-abyss/60 px-3 py-1.5 backdrop-blur-sm">
          <Trophy className="h-3.5 w-3.5 text-gold" />
          <span className="text-xs font-semibold text-gold">
            {player.gold}
          </span>
          <span className="text-[10px] text-ash">gold</span>
        </div>

        <button
          aria-label="Profile"
          className="flex h-8 w-8 items-center justify-center rounded border border-stone/40 bg-abyss/60 text-ash transition-colors hover:border-gold/40 hover:text-bone"
        >
          <User className="h-4 w-4" />
        </button>
        <button
          aria-label="Settings"
          className="flex h-8 w-8 items-center justify-center rounded border border-stone/40 bg-abyss/60 text-ash transition-colors hover:border-gold/40 hover:text-bone"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
