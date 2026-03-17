"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { formatBRL } from "@/lib/utils";

interface NeonBarChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  bars: { key: string; color: string; name: string }[];
  height?: number;
  stacked?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-panel p-3 border border-matrix-pink/30 text-sm">
      <p className="text-matrix-pink font-display mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" ? formatBRL(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function NeonBarChart({ data, xKey, bars, height = 300, stacked = false }: NeonBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
        <defs>
          {bars.map((bar) => (
            <linearGradient key={`grad-${bar.key}`} id={`grad-${bar.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={bar.color} stopOpacity={0.9} />
              <stop offset="100%" stopColor={bar.color} stopOpacity={0.3} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,0,136,0.06)" />
        <XAxis dataKey={xKey} stroke="#555" tick={{ fill: "#888", fontSize: 11 }} />
        <YAxis stroke="#555" tick={{ fill: "#888", fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, fontFamily: "'Share Tech Mono', monospace" }} />
        {bars.map((bar) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            fill={`url(#grad-${bar.key})`}
            name={bar.name}
            stackId={stacked ? "stack" : undefined}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
