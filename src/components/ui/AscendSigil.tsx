"use client";

import { motion } from "framer-motion";

const DRAW_DURATION = 1.6;
const GLOW_DELAY = 1.2;

const sigilPaths = [
  // Outer diamond
  "M 30 4 L 56 30 L 30 56 L 4 30 Z",
  // Inner diamond
  "M 30 14 L 46 30 L 30 46 L 14 30 Z",
  // Cross
  "M 30 8 L 30 52",
  "M 8 30 L 52 30",
  // Diagonals
  "M 16 16 L 44 44",
  "M 44 16 L 16 44",
];

const reducedDuration = 0.3;

interface AscendSigilProps {
  animate?: boolean;
  reduced?: boolean;
  accent?: string;
}

export default function AscendSigil({
  animate = true,
  reduced = false,
  accent = "#d4a543",
}: AscendSigilProps) {
  const d = reduced ? reducedDuration : DRAW_DURATION;
  const glowD = reduced ? 0.2 : 1.0;

  return (
    <div className="relative h-16 w-16 sm:h-20 sm:w-20">
      {/* Golden glow behind sigil */}
      <motion.div
        className="absolute inset-0 -m-8 rounded-full"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={
          animate
            ? { opacity: [0, 0.35, 0.2], scale: [0.3, 1.6, 1.4] }
            : { opacity: 0 }
        }
        transition={{
          delay: reduced ? 0.1 : GLOW_DELAY,
          duration: glowD,
          ease: "easeOut",
        }}
        style={{
          background: `radial-gradient(circle, ${accent}44 0%, ${accent}18 40%, transparent 70%)`,
        }}
      />

      {/* SVG Sigil */}
      <svg
        viewBox="0 0 60 60"
        className="relative h-full w-full"
        aria-hidden="true"
      >
        {sigilPaths.map((path, i) => (
          <motion.path
            key={i}
            d={path}
            fill="none"
            stroke={accent}
            strokeWidth={i < 2 ? 1.5 : 1}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={animate ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
            animate={animate ? { pathLength: 1, opacity: 1 } : undefined}
            transition={
              animate
                ? {
                    pathLength: {
                      delay: (i / sigilPaths.length) * d,
                      duration: d / sigilPaths.length + 0.15,
                      ease: "easeInOut",
                    },
                    opacity: {
                      delay: (i / sigilPaths.length) * d,
                      duration: 0.1,
                    },
                  }
                : undefined
            }
          />
        ))}

        {/* Central dot */}
        <motion.circle
          cx="30"
          cy="30"
          r="2"
          fill={accent}
          initial={animate ? { opacity: 0, scale: 0 } : { opacity: 1 }}
          animate={animate ? { opacity: 1, scale: 1 } : undefined}
          transition={{
            delay: reduced ? 0.2 : d * 0.7,
            duration: 0.4,
            ease: "easeOut",
          }}
        />
      </svg>
    </div>
  );
}
