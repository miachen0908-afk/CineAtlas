"use client";

import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--bg-deep)]">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.span
          className="text-3xl text-[var(--cloud)]"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✦
        </motion.span>
        <p className="text-sm tracking-widest text-white/55">载入影迹 CineAtlas</p>
      </motion.div>
    </div>
  );
}
