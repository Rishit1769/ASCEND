"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AscendSigil from "./AscendSigil";
import { useReducedMotion } from "@/components/game/useReducedMotion";

const REALM_LOADING_CONFIG: Record<
  string,
  { title: string; subtitle: string; accent: string }
> = {
  "forgotten-shore": {
    title: "THE FORGOTTEN SHORE",
    subtitle: "Every journey begins with a choice.",
    accent: "#5E9FB8",
  },
  "forest-of-resolve": {
    title: "FOREST OF RESOLVE",
    subtitle: "Discipline grows where excuses end.",
    accent: "#6F8E52",
  },
  "realm-of-ascension": {
    title: "REALM OF ASCENSION",
    subtitle: "The summit is not the peak — it is the climb.",
    accent: "#d4a543",
  },
};

const DEFAULT_REALM = {
  title: "ASCEND",
  subtitle: "Prepare for your journey.",
  accent: "#d4a543",
};

type Phase = "hidden" | "enter" | "sigil" | "realm" | "progress" | "pulse" | "exit";

interface AscendLoaderProps {
  progress: number;
  visible: boolean;
  realmId?: string | null;
  onComplete?: () => void;
}

export default function AscendLoader({
  progress,
  visible,
  realmId,
  onComplete,
}: AscendLoaderProps) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("hidden");
  const phaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedRef = useRef(false);

  const realm = (realmId && REALM_LOADING_CONFIG[realmId]) || DEFAULT_REALM;

  const clearTimer = useCallback(() => {
    if (phaseTimer.current !== null) {
      clearTimeout(phaseTimer.current);
      phaseTimer.current = null;
    }
  }, []);

  // Transition to a new phase (wrapped in startTransition to satisfy lint)
  const transitionTo = useCallback((next: Phase) => {
    startTransition(() => setPhase(next));
  }, []);

  // Phase sequencer
  useEffect(() => {
    clearTimer();

    if (!visible) {
      transitionTo("hidden");
      completedRef.current = false;
      return;
    }

    if (reduced) {
      transitionTo("realm");
      phaseTimer.current = setTimeout(() => transitionTo("progress"), 200);
      return;
    }

    transitionTo("enter");

    phaseTimer.current = setTimeout(() => {
      transitionTo("sigil");
      phaseTimer.current = setTimeout(() => {
        transitionTo("realm");
        phaseTimer.current = setTimeout(() => {
          transitionTo("progress");
        }, 600);
      }, 1400);
    }, 400);

    return () => clearTimer();
  }, [visible, reduced, clearTimer, transitionTo]);

  // Watch progress to trigger completion
  useEffect(() => {
    if (phase === "progress" && progress >= 100 && !completedRef.current) {
      completedRef.current = true;
      clearTimer();
      transitionTo("pulse");
      phaseTimer.current = setTimeout(() => {
        transitionTo("exit");
        phaseTimer.current = setTimeout(() => {
          onComplete?.();
        }, reduced ? 200 : 500);
      }, reduced ? 100 : 700);
    }
  }, [progress, phase, reduced, onComplete, clearTimer, transitionTo]);

  // Force-complete safety net (max 8 seconds)
  useEffect(() => {
    if (!visible || completedRef.current) return;
    const safety = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        clearTimer();
        transitionTo("exit");
        phaseTimer.current = setTimeout(() => {
          onComplete?.();
        }, reduced ? 200 : 500);
      }
    }, 8000);
    return () => clearTimeout(safety);
  }, [visible, reduced, onComplete, clearTimer, transitionTo]);

  // Cleanup
  useEffect(() => () => clearTimer(), [clearTimer]);

  const show = visible || phase === "exit";
  const showContent = phase !== "hidden";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="ascend-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: showContent ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.15 : 0.4, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-void"
          style={{ isolation: "isolate" }}
        >
          <div className="flex flex-col items-center gap-5 sm:gap-6">
            {/* Sigil */}
            <div
              className={`transition-opacity duration-500 ${
                phase === "enter" || phase === "hidden" ? "opacity-0" : "opacity-100"
              }`}
            >
              <AscendSigil
                animate={phase !== "hidden" && phase !== "exit" && !reduced}
                reduced={reduced}
                accent={realm.accent}
              />
            </div>

            {/* Realm title */}
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 12 }}
              animate={
                phase === "realm" ||
                phase === "progress" ||
                phase === "pulse" ||
                phase === "exit"
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 12 }
              }
              transition={{ duration: reduced ? 0.15 : 0.5, ease: "easeOut" }}
            >
              <h1
                className="text-xs font-semibold tracking-[0.35em] sm:text-sm"
                style={{ color: realm.accent }}
              >
                {realm.title}
              </h1>
              <p className="text-[10px] tracking-widest text-mist sm:text-xs">
                {realm.subtitle}
              </p>
            </motion.div>

            {/* Progress bar */}
            {(phase === "progress" || phase === "pulse" || phase === "exit") && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0.5 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: reduced ? 0.1 : 0.4, ease: "easeOut" }}
                className="flex flex-col items-center gap-3"
              >
                <div
                  className="h-px w-36 overflow-hidden sm:w-48"
                  style={{ background: "rgba(150, 115, 62, 0.15)" }}
                >
                  <motion.div
                    className="h-full origin-left"
                    style={{
                      background: `linear-gradient(90deg, ${realm.accent}cc, ${realm.accent})`,
                      boxShadow: `0 0 8px ${realm.accent}66`,
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: progress / 100 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
                <span
                  className="tabular-nums text-[10px] tracking-wider"
                  style={{ color: `${realm.accent}aa` }}
                >
                  {Math.round(progress)}%
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
