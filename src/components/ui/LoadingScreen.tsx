"use client";

import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-void">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-6"
      >
        <span className="text-sm font-semibold tracking-[0.4em] text-gold/80 uppercase">
          ASCEND
        </span>

        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-gold/40 animate-pulse-gold" />
          <div className="h-1.5 w-1.5 rounded-full bg-gold/60 animate-pulse-gold" style={{ animationDelay: "0.2s" }} />
          <div className="h-1 w-1 rounded-full bg-gold/40 animate-pulse-gold" style={{ animationDelay: "0.4s" }} />
        </div>

        <span className="text-[10px] tracking-widest text-mist">
          Preparing your journey...
        </span>
      </motion.div>
    </div>
  );
}
