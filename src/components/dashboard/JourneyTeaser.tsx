"use client";

import { motion } from "framer-motion";
import { X, Lock } from "lucide-react";

const FUTURE_REALMS = [
  "Mountains of Trial",
  "Temple of Knowledge",
  "Celestial Heights",
  "The Summit",
];

export default function JourneyTeaser({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="pointer-events-auto fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(20,26,38,0.86), rgba(8,8,16,0.96))" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Your journey continues"
        className="relative w-full max-w-[460px] text-center"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-2 right-0 flex h-10 w-10 items-center justify-center text-white/50 transition-colors hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-[var(--color-forge-text-active)]">
          Ascend
        </p>
        <h2 className="mt-4 font-serif text-2xl text-[var(--color-forge-text-hover)] sm:text-3xl">
          Your journey has only begun.
        </h2>
        <p className="mx-auto mt-3 max-w-[360px] text-sm leading-relaxed text-[var(--color-forge-text)] opacity-70">
          You have climbed through The Forgotten Shore and the Forest of Resolve. The realms beyond
          are still forming.
        </p>

        <ul className="mx-auto mt-7 flex max-w-[320px] flex-col gap-2">
          {FUTURE_REALMS.map(region => (
            <li
              key={region}
              className="flex items-center justify-between rounded border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left"
            >
              <span className="flex items-center gap-2 text-xs text-[var(--color-forge-text)] opacity-70">
                <Lock className="h-3.5 w-3.5" />
                {region}
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--color-forge-text)] opacity-50">
                Coming Soon
              </span>
            </li>
          ))}
        </ul>

        <button
          onClick={onClose}
          className="mt-7 min-h-[46px] rounded border border-[var(--color-forge-border-active)] px-8 text-xs font-bold uppercase tracking-[0.18em] transition-colors"
          style={{ color: "var(--color-forge-text-active)", background: "rgba(210,165,85,0.1)" }}
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}
