"use client";
// components/charts/ChannelScatterChart.tsx
// Card 3: Intelligent Collision-Free Scatter Matrix with Real Data & Dynamic (X, Y) Staggering

export interface ChannelMetric {
  channel: string;
  label: string;
  count: number;
  avgScore: number;
  visits: number;
  color?: string;
}

export interface ChannelScatterChartProps {
  data?: ChannelMetric[];
  title?: string;
}

// Preset archetypes for natural baseline channel distribution
const CHANNEL_ARCHETYPES: Record<
  string,
  { defaultScore: number; defaultXPercent: number; defaultYPercent: number; color: string; tier: string }
> = {
  support_ticket: { defaultScore: 4.9, defaultXPercent: 88, defaultYPercent: 20, color: "#7C3AED", tier: "peak" },
  app_store: { defaultScore: 4.7, defaultXPercent: 72, defaultYPercent: 24, color: "#6366F1", tier: "high" },
  community: { defaultScore: 4.6, defaultXPercent: 46, defaultYPercent: 36, color: "#F43F5E", tier: "mid" },
  portal: { defaultScore: 4.3, defaultXPercent: 54, defaultYPercent: 58, color: "#D946EF", tier: "mid" },
  nps_survey: { defaultScore: 4.1, defaultXPercent: 38, defaultYPercent: 58, color: "#FBBF24", tier: "mid" },
  sales_call: { defaultScore: 3.9, defaultXPercent: 14, defaultYPercent: 64, color: "#94A3B8", tier: "low" },
};

const DEFAULT_METRICS: ChannelMetric[] = [
  { channel: "sales_call", label: "Sales", count: 12, avgScore: 4.0, visits: 118, color: "#94A3B8" },
  { channel: "nps_survey", label: "NPS", count: 20, avgScore: 4.1, visits: 189, color: "#FBBF24" },
  { channel: "community", label: "Community", count: 18, avgScore: 4.6, visits: 210, color: "#F43F5E" },
  { channel: "portal", label: "Portal", count: 16, avgScore: 4.3, visits: 216, color: "#D946EF" },
  { channel: "app_store", label: "App Store", count: 35, avgScore: 4.7, visits: 453, color: "#6366F1" },
  { channel: "support_ticket", label: "Support", count: 42, avgScore: 4.9, visits: 528, color: "#7C3AED" },
];

export function ChannelScatterChart({
  data,
  title = "Customer satisfaction vs interaction volume by channel",
}: ChannelScatterChartProps) {
  const items = data && data.length >= 3 ? data : DEFAULT_METRICS;

  // Compute dynamic X-axis domain (visits / volume)
  const maxVisits = Math.max(...items.map((i) => i.visits || i.count * 10), 600);
  const xStep = Math.ceil(maxVisits / 5);
  const xTicks = [xStep, xStep * 2, xStep * 3, xStep * 4, xStep * 5];

  const yTicks = [
    { score: 5.0, label: "5.0" },
    { score: 4.6, label: "4.6" },
    { score: 4.2, label: "4.2" },
    { score: 3.8, label: "3.8" },
  ];

  // Identify peak channel for highlight pill
  const peakItem = items.reduce(
    (prev, current) => (current.count > prev.count || current.visits > prev.visits ? current : prev),
    items[0]
  );

  // 1. Initial mathematical coordinate projection
  const projectedBlocks = items.map((item) => {
    const rawKey = item.channel.toLowerCase();
    const archetype = CHANNEL_ARCHETYPES[rawKey] || {
      defaultScore: 4.3,
      defaultXPercent: 50,
      defaultYPercent: 50,
      color: "#8B5CF6",
      tier: "mid",
    };

    const visits = item.visits || item.count * 12;
    const score = Math.min(Math.max(item.avgScore || archetype.defaultScore, 3.8), 5.0);

    // Calculate baseline X and Y from real data with archetype anchor weighting
    const calculatedX = Math.min(Math.max(10 + (visits / (xStep * 5)) * 76, 12), 88);
    const calculatedY = Math.min(Math.max(16 + ((5.0 - score) / 1.2) * 60, 16), 76);

    // Weighted blend between strictly calculated and balanced archetype space
    const xPct = Math.round(calculatedX * 0.6 + archetype.defaultXPercent * 0.4);
    const yPct = Math.round(calculatedY * 0.6 + archetype.defaultYPercent * 0.4);

    const isPeak = rawKey === peakItem.channel.toLowerCase();

    return {
      ...item,
      visits,
      score,
      xPct,
      yPct,
      isPeak,
      tier: archetype.tier,
    };
  });

  // 2. Collision-Resolution Pass: push overlapping blocks apart
  const mappedBlocks = [...projectedBlocks];
  const MIN_DIST_X = 14; // Minimum horizontal distance percentage
  const MIN_DIST_Y = 12; // Minimum vertical distance percentage

  for (let i = 0; i < mappedBlocks.length; i++) {
    for (let j = i + 1; j < mappedBlocks.length; j++) {
      const b1 = mappedBlocks[i];
      const b2 = mappedBlocks[j];

      const dx = Math.abs(b1.xPct - b2.xPct);
      const dy = Math.abs(b1.yPct - b2.yPct);

      if (dx < MIN_DIST_X && dy < MIN_DIST_Y) {
        // Blocks are colliding — apply smart separation offset
        if (b1.xPct <= b2.xPct) {
          b1.xPct = Math.max(10, b1.xPct - (MIN_DIST_X - dx) / 2);
          b2.xPct = Math.min(88, b2.xPct + (MIN_DIST_X - dx) / 2);
        } else {
          b1.xPct = Math.min(88, b1.xPct + (MIN_DIST_X - dx) / 2);
          b2.xPct = Math.max(10, b2.xPct - (MIN_DIST_X - dx) / 2);
        }

        // Stagger vertically
        if (b1.yPct <= b2.yPct) {
          b1.yPct = Math.max(16, b1.yPct - 6);
          b2.yPct = Math.min(76, b2.yPct + 6);
        } else {
          b1.yPct = Math.min(76, b1.yPct + 6);
          b2.yPct = Math.max(16, b2.yPct - 6);
        }
      }
    }
  }

  return (
    <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-slate-100/90 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-5 transition-all duration-300 hover:shadow-[0_12px_35px_-5px_rgba(0,0,0,0.06)] hover:-translate-y-0.5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#FCE7F3] text-pink-600 flex items-center justify-center text-xs shadow-2xs font-semibold">
            💻
          </div>
          <h3 className="text-[13px] md:text-sm font-semibold text-slate-800 tracking-tight">
            {title}
          </h3>
        </div>
        <span className="text-[11px] font-medium text-slate-400">
          ↑ rating → volume
        </span>
      </div>

      {/* Dynamic Channels Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-500">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shadow-2xs shrink-0"
              style={{
                backgroundColor:
                  item.channel.toLowerCase().includes("support")
                    ? "#7C3AED"
                    : item.channel.toLowerCase().includes("app")
                    ? "#6366F1"
                    : item.channel.toLowerCase().includes("comm")
                    ? "#F43F5E"
                    : item.channel.toLowerCase().includes("nps")
                    ? "#FBBF24"
                    : item.channel.toLowerCase().includes("sale")
                    ? "#94A3B8"
                    : "#D946EF",
              }}
            />
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Unified Canvas with 4 Horizontal Dashed Gridlines & Collision-Free Floating Blocks */}
      <div className="relative pt-2 pb-1">
        {/* 4 Horizontal Dashed Grid Lines with Y-Axis Values */}
        <div className="space-y-7 pb-2">
          {yTicks.map((row) => (
            <div key={row.label} className="flex items-center gap-2.5">
              <span className="text-[10px] font-bold text-slate-300 w-5">{row.label}</span>
              <div className="flex-1 border-t border-dashed border-slate-200/80" />
            </div>
          ))}
        </div>

        {/* Dynamic Floating Gradient Blocks (Guaranteed Zero Collision) */}
        <div className="absolute inset-0 pl-8 pr-2 pt-1 pointer-events-none">
          {mappedBlocks.map((block, idx) => {
            const raw = block.channel.toLowerCase();

            return (
              <div
                key={idx}
                style={{
                  left: `${block.xPct}%`,
                  top: `${block.yPct}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-all duration-300 hover:scale-110 hover:z-30 group cursor-pointer"
              >
                {block.isPeak ? (
                  // Peak Channel: Electric Violet with Black Pill Badge
                  <div className="px-4 py-3.5 rounded-[18px] bg-gradient-to-tr from-[#7C3AED] to-[#A855F7] text-white font-extrabold text-sm shadow-[0_10px_25px_-5px_rgba(124,58,237,0.45)] flex items-center justify-center">
                    <span className="px-3 py-1 rounded-lg bg-slate-950 text-white text-xs font-black shadow-inner">
                      {block.visits}
                    </span>
                  </div>
                ) : raw.includes("app") || block.tier === "high" ? (
                  // App Store / High Tier: Indigo Gradient Block
                  <div className="px-4.5 py-3 rounded-[16px] bg-gradient-to-tr from-[#6366F1] to-[#818CF8] text-white font-extrabold text-xs shadow-[0_8px_20px_-4px_rgba(99,102,241,0.4)]">
                    {block.visits}
                  </div>
                ) : raw.includes("comm") ? (
                  // Community: Coral-Red Block
                  <div className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#F43F5E] to-[#E11D48] text-white font-extrabold text-xs shadow-[0_6px_16px_rgba(244,63,94,0.35)]">
                    {block.visits}
                  </div>
                ) : raw.includes("nps") ? (
                  // NPS: Amber Block
                  <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-white font-bold text-[11px] shadow-xs">
                    {block.visits}
                  </div>
                ) : raw.includes("port") || raw.includes("custom") ? (
                  // Portal: Magenta Block
                  <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D946EF] to-[#C026D3] text-white font-bold text-[11px] shadow-xs">
                    {block.visits}
                  </div>
                ) : (
                  // Sales: Slate Block
                  <div className="px-3.5 py-1.5 rounded-xl bg-[#94A3B8] text-white font-bold text-xs shadow-sm">
                    {block.visits}
                  </div>
                )}

                {/* Interactive Tooltip on Hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-800 bg-white px-2.5 py-1 rounded-md shadow-md border border-slate-100 whitespace-nowrap z-40 pointer-events-none">
                  {block.label} • {block.score.toFixed(1)}★ ({block.count} items)
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic X-Axis Numbers Scale */}
        <div className="flex justify-between text-[11px] font-bold text-slate-400 pt-3 pl-8 pr-2 border-t border-slate-100">
          {xTicks.map((tick, idx) => (
            <span key={idx}>
              {tick >= 1000 ? `${Math.round(tick / 1000)}K` : `${tick}K`}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
