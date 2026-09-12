"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";

export default function QuickActions() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* ─── New Quest Button ────────────────────────────── */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
        whileHover={{ scale: 1.04, y: -1 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setShowModal(true)}
        aria-label="Create new quest"
        className="pointer-events-auto absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded border border-gold/20 bg-gold/[0.08] px-3 py-2 text-gold/90 backdrop-blur-md transition-colors hover:border-gold/40 hover:bg-gold/[0.14] hover:text-gold sm:bottom-6 sm:right-6 sm:px-4 sm:py-2.5 md:bottom-10 md:right-10"
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="text-[10px] font-semibold uppercase tracking-wider sm:text-[11px]">
          New Quest
        </span>
      </motion.button>

      {/* ─── Quest Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="hud-panel relative w-[min(380px,90vw)] rounded border border-white/[0.08] p-5 sm:p-6"
            >
              <button
                onClick={() => setShowModal(false)}
                aria-label="Close"
                className="absolute top-3 right-3 text-ash/40 transition-colors hover:text-bone"
              >
                <X className="h-4 w-4" />
              </button>
              <h3 className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-gold/80 sm:text-xs">
                New Quest
              </h3>
              <p className="text-[11px] leading-relaxed text-ash/60 sm:text-xs">
                Quest creation coming next. For now, focus on the world around
                you.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
