"use client";
// components/charts/ThemeChart.tsx
// Horizontal bar chart for top themes by count

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ThemeChartProps {
  data: Array<{ name: string; count: number; color: string }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border rounded-lg shadow-card px-3 py-2 text-sm">
        <p className="font-medium text-text-primary">{label}</p>
        <p className="text-accent">{payload[0].value} feedback items</p>
      </div>
    );
  }
  return null;
};

export function ThemeChart({ data }: ThemeChartProps) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Top Themes</h3>
      <ResponsiveContainer width="100%" height={Math.max(180, data.length * 36)}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: "#6B7280" }}
            tickLine={false}
            axisLine={false}
            width={90}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F3F4F6" }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
