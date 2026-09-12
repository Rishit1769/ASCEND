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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.7, ease: "easeOut" }}
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setShowModal(true)}
        aria-label="Create new quest"
        className="pointer-events-auto absolute bottom-4 right-4 z-20 flex items-center gap-2 px-3 py-2 sm:bottom-6 sm:right-6 sm:px-4 sm:py-2.5 md:bottom-10 md:right-10"
        style={{
          background: "rgba(18, 20, 18, 0.7)",
          border: "1px solid rgba(180, 140, 70, 0.35)",
          color: "var(--color-forge-text-active)",
          clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 6px rgba(0,0,0,0.4)",
        }}
      >
        <Plus className="h-3.5 w-3.5" />
        <span
          className="text-[10px] font-semibold uppercase sm:text-[11px]"
          style={{ letterSpacing: "0.14em" }}
        >
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
            className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(8, 8, 16, 0.85)" }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="forge-panel relative w-[min(380px,90vw)] p-5 sm:p-6"
              style={{
                clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                aria-label="Close"
                className="absolute top-3 right-3 transition-colors"
                style={{ color: "var(--color-forge-text)", opacity: 0.4 }}
              >
                <X className="h-4 w-4" />
              </button>
              <h3
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "var(--color-forge-text-active)",
                  marginBottom: "6px",
                }}
              >
                New Quest
              </h3>
              <p
                style={{
                  fontSize: "12px",
                  lineHeight: 1.6,
                  color: "var(--color-forge-text)",
                  opacity: 0.55,
                }}
              >
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
