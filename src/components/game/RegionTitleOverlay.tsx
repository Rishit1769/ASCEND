"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { resolveWorld, levelRange } from "@/lib/world";
import { useWorldProgress } from "./WorldProgress";

type TransitionState = "hidden" | "entering" | "visible" | "exiting";

/** Failsafe: force-dismiss after this many ms even if animations fail. */
const MAX_TITLE_DURATION = 4000;

export default function RegionTitleOverlay() {
  const { level } = useWorldProgress();
  const { region } = resolveWorld(level);

  const [state, setState] = useState<TransitionState>("hidden");
  const [displayRegion, setDisplayRegion] = useState(region);
  const prevRegionId = useRef(region.id);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending timer
  const clearTimer = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  // Region change handler
  useEffect(() => {
    const nextId = region.id;
    const prevId = prevRegionId.current;
    prevRegionId.current = nextId;

    // Same region — no title transition needed
    if (nextId === prevId) return;

    // New region — start transition
    clearTimer();
    setDisplayRegion(region);
    setState("entering");

    // After enter animation, hold for a moment then exit
    timer.current = setTimeout(() => {
      setState("visible");
      timer.current = setTimeout(() => {
        setState("exiting");
        timer.current = setTimeout(() => {
          setState("hidden");
          timer.current = null;
        }, 700); // exit animation duration
      }, 1400); // hold duration
    }, 500); // enter animation duration

    return () => clearTimer();
  }, [region]);

  // Failsafe: force dismiss if stuck
  useEffect(() => {
    if (state === "hidden") return;
    const failsafe = setTimeout(() => {
      console.warn("[ASCEND] Region title failsafe triggered — forcing dismiss");
      clearTimer();
      setState("hidden");
    }, MAX_TITLE_DURATION);
    return () => clearTimeout(failsafe);
  }, [state]);

  // Cleanup on unmount
  useEffect(() => () => clearTimer(), []);

  // Skip if region is available (already has environment) or transition is hidden
  if (region.status === "available" || state === "hidden") return null;

  return (
    <AnimatePresence>
      {(state === "entering" || state === "visible" || state === "exiting") && (
        <motion.div
          key={displayRegion.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: state === "exiting" ? 0.7 : 0.5, ease: "easeOut" }}
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/65 px-20 text-center text-white"
          style={{ pointerEvents: state === "exiting" ? "none" : "auto" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-md"
          >
            <h2 className="font-serif text-2xl">{displayRegion.name}</h2>
            <p className="mt-3 text-sm text-white/70">{displayRegion.theme}</p>
            <p className="mt-2 text-xs text-white/50">{levelRange(displayRegion)}</p>
            <p className="mt-5 text-xs text-white/60">
              This region awaits its environment assets. Its checkpoints are recorded in the Map.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
