"use client";
// components/charts/TrendSparkline.tsx
// Tiny sparkline for theme trend cards

import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

interface TrendSparklineProps {
  data: Array<{ week: string; count: number }>;
  color?: string;
  isSpiking?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-surface border border-border rounded-lg shadow-card px-2 py-1 text-xs">
        <p className="text-text-muted">{label}</p>
        <p className="font-semibold text-text-primary">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export function TrendSparkline({ data, color = "#6366F1", isSpiking }: TrendSparklineProps) {
  return (
    <ResponsiveContainer width="100%" height={48}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="count"
          stroke={isSpiking ? "#EF4444" : color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, fill: isSpiking ? "#EF4444" : color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
