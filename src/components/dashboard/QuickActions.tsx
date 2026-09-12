"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";

export default function QuickActions() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowModal(true)}
        aria-label="Create new quest"
        className="pointer-events-auto absolute bottom-6 right-6 z-20 flex items-center gap-2 rounded border border-gold/30 bg-gold/10 px-4 py-2.5 text-gold backdrop-blur-sm transition-colors hover:border-gold/60 hover:bg-gold/20 md:bottom-10 md:right-10"
      >
        <Plus className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          New Quest
        </span>
      </motion.button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-[min(400px,90vw)] rounded border border-stone/40 bg-abyss p-6"
            >
              <button
                onClick={() => setShowModal(false)}
                aria-label="Close"
                className="absolute top-3 right-3 text-ash hover:text-bone"
              >
                <X className="h-4 w-4" />
              </button>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gold">
                New Quest
              </h3>
              <p className="text-xs leading-relaxed text-ash">
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
