"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface NeonRadarChartProps {
  data: Record<string, string | number>[];
  nameKey: string;
  radars: { key: string; color: string; name: string }[];
  height?: number;
}

export default function NeonRadarChart({ data, nameKey, radars, height = 300 }: NeonRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,0,136,0.15)" />
        <PolarAngleAxis dataKey={nameKey} tick={{ fill: "#888", fontSize: 10 }} />
        <PolarRadiusAxis tick={{ fill: "#555", fontSize: 9 }} />
        {radars.map((radar) => (
          <Radar
            key={radar.key}
            name={radar.name}
            dataKey={radar.key}
            stroke={radar.color}
            fill={radar.color}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        ))}
        <Tooltip
          contentStyle={{
            background: "rgba(10,10,30,0.9)",
            border: "1px solid rgba(255,0,136,0.3)",
            borderRadius: 8,
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'Share Tech Mono', monospace" }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
