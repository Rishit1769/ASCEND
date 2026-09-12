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
      className="pointer-events-auto absolute bottom-6 left-1/2 z-20 w-[min(400px,80vw)] -translate-x-1/2 md:bottom-10"
    >
      <div className="rounded border border-stone/30 bg-abyss/70 px-5 py-4 backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] uppercase tracking-widest text-ash">
              Level
            </span>
            <span className="text-2xl font-bold text-gold">
              {player.level}
            </span>
          </div>
          <span className="text-[10px] tracking-wider text-mist">
            {region.name}
          </span>
        </div>

        <div className="relative mb-2 h-2.5 w-full overflow-hidden rounded-full bg-charcoal">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 rounded-full xp-shimmer"
          />
        </div>

        <div className="flex items-center justify-between text-[10px]">
          <span className="text-mist">
            {player.xp} / {player.xpRequired} XP
          </span>
          <span className="text-mist">{xpPercent}%</span>
        </div>
      </div>
    </motion.div>
  );
}
