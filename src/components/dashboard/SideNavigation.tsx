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
    transition: { staggerChildren: 0.07, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
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
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              className={`group relative flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-[180ms] sm:gap-3.5 sm:px-4 ${
                isActive
                  ? "text-[var(--color-forge-text-active)]"
                  : "text-[var(--color-forge-text)] hover:text-[var(--color-forge-text-hover)]"
              }`}
              style={{
                background: isActive
                  ? "rgba(30, 34, 30, 0.72)"
                  : "rgba(18, 20, 18, 0.55)",
                border: "1px solid",
                borderColor: isActive
                  ? "rgba(210, 165, 85, 0.55)"
                  : "rgba(150, 115, 62, 0.18)",
                clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                boxShadow: isActive
                  ? "inset 0 1px 0 rgba(255,255,255,0.04), inset 0 0 12px rgba(210,165,85,0.06), 0 2px 6px rgba(0,0,0,0.4)"
                  : "inset 0 1px 0 rgba(255,255,255,0.02), 0 1px 4px rgba(0,0,0,0.3)",
              }}
            >
              {/* Active indicator — thin bronze vertical line */}
              {isActive && (
                <motion.div
                  layoutId="nav-active-line"
                  className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full"
                  style={{ background: "linear-gradient(180deg, rgba(210,165,85,0.8), rgba(180,140,70,0.4))" }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <Icon
                className={`h-4 w-4 shrink-0 transition-colors duration-[180ms] ${
                  isActive
                    ? "text-[var(--color-forge-text-active)]"
                    : "text-[var(--color-forge-text)] opacity-50 group-hover:opacity-80"
                }`}
              />
              <span
                className={`hidden text-[11px] font-medium uppercase transition-colors duration-[180ms] md:inline ${
                  isActive ? "tracking-[0.14em]" : "tracking-[0.12em]"
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
