"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatBRL } from "@/lib/utils";

interface NeonPieChartProps {
  data: { name: string; value: number; color: string }[];
  height?: number;
  showLegend?: boolean;
  innerRadius?: number;
}

const RADIAN = Math.PI / 180;

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="'Share Tech Mono', monospace">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null;
  const { name, value } = payload[0];
  return (
    <div className="glass-panel p-3 border border-matrix-pink/30 text-sm">
      <p className="text-matrix-pink font-display">{name}</p>
      <p className="text-white">{formatBRL(value)}</p>
    </div>
  );
};

export default function NeonPieChart({ data, height = 300, showLegend = true, innerRadius = 60 }: NeonPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <defs>
          <filter id="pie-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={innerRadius + 40}
          paddingAngle={3}
          dataKey="value"
          labelLine={false}
          label={renderLabel}
          stroke="none"
          filter="url(#pie-glow)"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        {showLegend && (
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'Share Tech Mono', monospace" }} />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}
