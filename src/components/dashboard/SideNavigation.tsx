"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ScrollText,
  Swords,
  Hammer,
  Map,
} from "lucide-react";
import type { NavItem } from "@/types/game";

const NAV_ITEMS: { id: NavItem; label: string; icon: typeof ScrollText }[] = [
  { id: "quests", label: "Quests", icon: ScrollText },
  { id: "character", label: "Character", icon: Swords },
  { id: "forge", label: "Forge", icon: Hammer },
  { id: "journey", label: "Journey", icon: Map },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function SideNavigation() {
  const [active, setActive] = useState<NavItem>("quests");

  return (
    <motion.nav
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label="Main navigation"
      className="pointer-events-auto absolute left-4 top-1/2 z-20 -translate-y-1/2 md:left-8"
    >
      <div className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          return (
            <motion.button
              key={item.id}
              variants={itemVariants}
              onClick={() => setActive(item.id)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={`group flex items-center gap-3 rounded border px-3 py-2.5 text-left transition-all duration-200 ${
                isActive
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-transparent bg-transparent text-ash hover:border-stone/40 hover:bg-abyss/40 hover:text-bone"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden text-xs font-semibold uppercase tracking-wider md:inline">
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
