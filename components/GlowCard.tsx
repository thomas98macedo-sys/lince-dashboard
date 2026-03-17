"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

interface GlowCardProps {
  title: string;
  value: number;
  format?: (val: number) => string;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
  delay?: number;
  accent?: string;
}

export default function GlowCard({ title, value, format, icon, trend, delay = 0, accent = "#ff0088" }: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glow-card p-5 relative group"
    >
      <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: 0.6 }} />
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg" style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-mono px-2 py-1 rounded ${trend.positive ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
            {trend.positive ? "+" : ""}{trend.value.toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-1">{title}</p>
      <AnimatedCounter
        value={value}
        format={format}
        className="text-2xl font-display font-bold"
        duration={1.5}
      />
      <div className="absolute bottom-0 left-0 w-full h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${accent}44, transparent)` }} />
    </motion.div>
  );
}
