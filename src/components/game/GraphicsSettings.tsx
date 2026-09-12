"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, ChevronDown } from "lucide-react";
import { useGraphicsQuality, type GraphicsPreset } from "./GraphicsQuality";

const PRESET_LABELS: Record<GraphicsPreset, string> = {
  ultra: "Ultra",
  high: "High",
  medium: "Medium",
  low: "Low",
  potato: "Potato",
};

const PRESET_ORDER: GraphicsPreset[] = ["ultra", "high", "medium", "low", "potato"];

export default function GraphicsSettings() {
  const { preset, isAuto, setPreset, resumeAuto } = useGraphicsQuality();
  const [open, setOpen] = useState(false);

  // Allow the TopHUD settings button to open this menu.
  useEffect(() => {
    const openMenu = () => setOpen(true);
    window.addEventListener("ascend-open-graphics", openMenu);
    return () => window.removeEventListener("ascend-open-graphics", openMenu);
  }, []);

  const handleSelect = (value: string) => {
    if (value === "auto") {
      resumeAuto();
    } else if (PRESET_ORDER.includes(value as GraphicsPreset)) {
      setPreset(value as GraphicsPreset);
    }
    setOpen(false);
  };

  return (
    <div className="pointer-events-auto relative z-30">
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(!open)}
        aria-label="Graphics settings"
        aria-expanded={open}
        className="forge-icon-btn flex items-center gap-1.5 px-2.5 py-1.5"
        style={{
          color: "var(--color-forge-text)",
          opacity: 0.7,
          clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))",
        }}
      >
        <Monitor className="h-3 w-3" />
        <span className="text-[10px] font-medium uppercase" style={{ letterSpacing: "0.1em" }}>
          {isAuto ? "Auto" : PRESET_LABELS[preset]}
        </span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="forge-panel absolute right-0 top-full mt-1 min-w-[140px] overflow-hidden"
            style={{
              clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))",
            }}
          >
            <button
              onClick={() => handleSelect("auto")}
              className={`w-full px-3 py-2 text-left text-[11px] font-medium uppercase transition-colors duration-150 ${
                isAuto
                  ? "bg-[rgba(210,165,85,0.12)] text-[var(--color-forge-text-active)]"
                  : "text-[var(--color-forge-text)] hover:bg-[rgba(30,34,30,0.6)] hover:text-[var(--color-forge-text-hover)]"
              }`}
              style={{ letterSpacing: "0.12em" }}
            >
              Auto
            </button>
            {PRESET_ORDER.map((p) => (
              <button
                key={p}
                onClick={() => handleSelect(p)}
                className={`w-full px-3 py-2 text-left text-[11px] font-medium uppercase transition-colors duration-150 ${
                  !isAuto && preset === p
                    ? "bg-[rgba(210,165,85,0.12)] text-[var(--color-forge-text-active)]"
                    : "text-[var(--color-forge-text)] hover:bg-[rgba(30,34,30,0.6)] hover:text-[var(--color-forge-text-hover)]"
                }`}
                style={{ letterSpacing: "0.12em" }}
              >
                {PRESET_LABELS[p]}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
