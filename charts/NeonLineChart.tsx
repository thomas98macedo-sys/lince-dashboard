"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatBRL } from "@/lib/utils";

interface NeonLineChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  lines: { key: string; color: string; name: string }[];
  height?: number;
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

export default function NeonLineChart({ data, xKey, lines, height = 300 }: NeonLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
        <defs>
          {lines.map((line) => (
            <filter key={`glow-${line.key}`} id={`glow-${line.key}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,0,136,0.06)" />
        <XAxis dataKey={xKey} stroke="#555" tick={{ fill: "#888", fontSize: 11 }} />
        <YAxis stroke="#555" tick={{ fill: "#888", fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, fontFamily: "'Share Tech Mono', monospace" }} />
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            stroke={line.color}
            strokeWidth={2}
            name={line.name}
            dot={{ fill: line.color, r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: line.color, stroke: "#000", strokeWidth: 2 }}
            filter={`url(#glow-${line.key})`}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
