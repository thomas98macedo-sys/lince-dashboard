"use client";

import { motion } from "framer-motion";
import { RefreshCw, Download, Clock } from "lucide-react";

interface HeaderProps {
  isRefreshing: boolean;
  lastRefresh: Date;
  onRefresh: () => void;
  onExport: () => void;
}

export default function Header({ isRefreshing, lastRefresh, onRefresh, onExport }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-matrix-pink/10 px-6 py-3 flex items-center justify-between"
      style={{ background: "linear-gradient(90deg, rgba(5,0,15,0.95), rgba(10,2,20,0.95))", backdropFilter: "blur(12px)" }}
    >
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-display text-lg font-bold tracking-[0.2em] text-neon"
        >
          DATA MATRIX CONTROL CENTER
        </motion.h1>
        <p className="text-xs text-gray-600 font-mono mt-0.5">LINCE PERFORMANCE // REAL-TIME ANALYTICS</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-mono">
          <Clock size={12} />
          <span>{lastRefresh.toLocaleTimeString("pt-BR")}</span>
          {isRefreshing && (
            <span className="text-matrix-pink animate-pulse">SYNCING...</span>
          )}
        </div>

        <button
          onClick={onRefresh}
          className="p-2 rounded-lg border border-matrix-pink/20 text-gray-500 hover:text-matrix-pink hover:border-matrix-pink/40 hover:bg-matrix-pink/5 transition-all"
          title="Refresh data"
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
        </button>

        <button
          onClick={onExport}
          className="p-2 rounded-lg border border-matrix-pink/20 text-gray-500 hover:text-matrix-pink hover:border-matrix-pink/40 hover:bg-matrix-pink/5 transition-all"
          title="Export CSV"
        >
          <Download size={14} />
        </button>
      </div>
    </header>
  );
}
