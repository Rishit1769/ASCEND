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
      className="pointer-events-auto absolute left-3 top-1/2 z-20 -translate-y-1/2 sm:left-5 md:left-8"
    >
      <div className="flex flex-col gap-0.5">
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
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              className={`group relative flex items-center gap-3 rounded-r border-l-2 px-3 py-2.5 text-left transition-all duration-200 sm:gap-3.5 sm:px-4 ${
                isActive
                  ? "border-gold/70 bg-gold/[0.07] text-gold nav-active-glow"
                  : "border-transparent bg-transparent text-ash/70 hover:border-stone/40 hover:bg-white/[0.03] hover:text-bone/90"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 transition-colors duration-200 ${
                isActive ? "text-gold" : "text-ash/50 group-hover:text-ash"
              }`} />
              <span className={`hidden text-[11px] font-semibold uppercase tracking-wider transition-colors duration-200 md:inline ${
                isActive ? "text-gold" : ""
              }`}>
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-r border-l-2 border-gold/70 bg-gold/[0.07]"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  style={{ zIndex: -1 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
