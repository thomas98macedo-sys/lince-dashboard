"use client";

import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="relative mb-6">
          <div className="w-16 h-16 border-2 border-matrix-pink/30 rounded-full animate-spin" style={{ borderTopColor: "#ff0088" }} />
          <div className="absolute inset-0 w-16 h-16 border-2 border-transparent rounded-full animate-spin" style={{ borderBottomColor: "#ff008855", animationDuration: "1.5s", animationDirection: "reverse" }} />
        </div>
        <h2 className="font-display text-lg tracking-[0.3em] text-neon mb-2">INITIALIZING</h2>
        <p className="font-mono text-xs text-gray-600 animate-pulse">CONNECTING TO DATA MATRIX...</p>
      </motion.div>
    </div>
  );
}
