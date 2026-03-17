"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatBRL } from "@/lib/utils";

interface NeonAreaChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  areas: { key: string; color: string; name: string }[];
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

export default function NeonAreaChart({ data, xKey, areas, height = 300 }: NeonAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
        <defs>
          {areas.map((area) => (
            <linearGradient key={`areaGrad-${area.key}`} id={`areaGrad-${area.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={area.color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={area.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
          {areas.map((area) => (
            <filter key={`areaGlow-${area.key}`} id={`areaGlow-${area.key}`}>
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
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
        {areas.map((area) => (
          <Area
            key={area.key}
            type="monotone"
            dataKey={area.key}
            stroke={area.color}
            strokeWidth={2}
            fill={`url(#areaGrad-${area.key})`}
            name={area.name}
            filter={`url(#areaGlow-${area.key})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
