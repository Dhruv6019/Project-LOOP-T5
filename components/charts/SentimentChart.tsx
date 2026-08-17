"use client";
// components/charts/SentimentChart.tsx
// Card 4: Precision Donut Chart with Interactive Center Hub & Clear Multi-Slice Labeling

import { useState } from "react";

export interface ThemeSlice {
  id?: string;
  name: string;
  count: number;
  percent: number;
  color?: string;
  isPrimary?: boolean;
}

export interface SentimentChartProps {
  data?: ThemeSlice[];
  totalCount?: number;
  title?: string;
  totalLabel?: string;
  totalValue?: string;
  unitLabel?: string;
}

// Generates an annular sector path with smooth rounded corner caps
function describeRoundedAnnularSector(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngleDeg: number,
  endAngleDeg: number,
  cornerRadius: number = 7
): string {
  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const startRad = toRad(startAngleDeg);
  const endRad = toRad(endAngleDeg);
  const totalAngle = endRad - startRad;

  const outerCornerAngle = Math.min(cornerRadius / rOuter, totalAngle / 2.2);
  const innerCornerAngle = Math.min(cornerRadius / rInner, totalAngle / 2.2);

  const pOuterStart = {
    x: cx + rOuter * Math.cos(startRad + outerCornerAngle),
    y: cy + rOuter * Math.sin(startRad + outerCornerAngle),
  };
  const pOuterEnd = {
    x: cx + rOuter * Math.cos(endRad - outerCornerAngle),
    y: cy + rOuter * Math.sin(endRad - outerCornerAngle),
  };
  const pOuterEndCorner = {
    x: cx + (rOuter - cornerRadius) * Math.cos(endRad),
    y: cy + (rOuter - cornerRadius) * Math.sin(endRad),
  };

  const pInnerEndCorner = {
    x: cx + (rInner + cornerRadius) * Math.cos(endRad),
    y: cy + (rInner + cornerRadius) * Math.sin(endRad),
  };
  const pInnerEnd = {
    x: cx + rInner * Math.cos(endRad - innerCornerAngle),
    y: cy + rInner * Math.sin(endRad - innerCornerAngle),
  };
  const pInnerStart = {
    x: cx + rInner * Math.cos(startRad + innerCornerAngle),
    y: cy + rInner * Math.sin(startRad + innerCornerAngle),
  };
  const pInnerStartCorner = {
    x: cx + (rInner + cornerRadius) * Math.cos(startRad),
    y: cy + (rInner + cornerRadius) * Math.sin(startRad),
  };
  const pOuterStartCorner = {
    x: cx + (rOuter - cornerRadius) * Math.cos(startRad),
    y: cy + (rOuter - cornerRadius) * Math.sin(startRad),
  };

  const largeArcOuter = endAngleDeg - startAngleDeg > 180 ? 1 : 0;
  const largeArcInner = endAngleDeg - startAngleDeg > 180 ? 1 : 0;

  return [
    `M ${pOuterStart.x} ${pOuterStart.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArcOuter} 1 ${pOuterEnd.x} ${pOuterEnd.y}`,
    `Q ${cx + rOuter * Math.cos(endRad)} ${cy + rOuter * Math.sin(endRad)} ${pOuterEndCorner.x} ${pOuterEndCorner.y}`,
    `L ${pInnerEndCorner.x} ${pInnerEndCorner.y}`,
    `Q ${cx + rInner * Math.cos(endRad)} ${cy + rInner * Math.sin(endRad)} ${pInnerEnd.x} ${pInnerEnd.y}`,
    `A ${rInner} ${rInner} 0 ${largeArcInner} 0 ${pInnerStart.x} ${pInnerStart.y}`,
    `Q ${cx + rInner * Math.cos(startRad)} ${cy + rInner * Math.sin(startRad)} ${pInnerStartCorner.x} ${pInnerStartCorner.y}`,
    `L ${pOuterStartCorner.x} ${pOuterStartCorner.y}`,
    `Q ${cx + rOuter * Math.cos(startRad)} ${cy + rOuter * Math.sin(startRad)} ${pOuterStart.x} ${pOuterStart.y}`,
    `Z`,
  ].join(" ");
}

const DEFAULT_REAL_SLICES: ThemeSlice[] = [
  { name: "Mobile UX & Crashes", count: 46, percent: 38.0, isPrimary: true, color: "#F43F5E" },
  { name: "Billing & Pricing Tiers", count: 24, percent: 10.9, color: "#FDE68A" },
  { name: "Performance & Latency", count: 18, percent: 7.4, color: "#F5D0FE" },
  { name: "Onboarding Flow", count: 12, percent: 4.1, color: "#EDE9FE" },
  { name: "Integrations & Webhooks", count: 8, percent: 2.7, color: "#EEF2FF" },
];

const PASTEL_PALETTE = [
  "#F43F5E", // Dominant Coral
  "#FDE68A", // Peach / Warm Yellow
  "#F5D0FE", // Lilac
  "#EDE9FE", // Lavender
  "#EEF2FF", // Ice Lilac
  "#93C5FD", // Soft Sky
];

export function SentimentChart({
  data,
  totalCount,
  title = "The most popular themes for customer feedback",
  totalLabel = "Total analyzed feedback",
  totalValue = "64 M",
  unitLabel = "M, areas",
}: SentimentChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Use incoming real data or default real-life dataset
  const slices = data && data.length > 0 ? data.slice(0, 5) : DEFAULT_REAL_SLICES;
  const displayTotal = totalCount !== undefined ? `${totalCount}` : totalValue;

  // Normalized sum for angle calculations
  const totalPercentSum = slices.reduce((acc, s) => acc + (s.percent || 1), 0) || 100;

  // Canvas Geometry
  const cx = 130;
  const cy = 130;
  const rOuter = 110;
  const rInner = 68; // Chunky ring thickness (42px)
  const cr = 7;
  const gapDeg = slices.length > 1 ? 4 : 0;

  const totalUsableDegrees = 360 - slices.length * gapDeg;

  // Compute exact slice geometry and centered text coordinates
  let currentStartAngle = 10;
  const computedSlices = slices.map((slice, idx) => {
    const rawDegrees = (slice.percent / totalPercentSum) * totalUsableDegrees;
    const sliceDegrees = Math.max(rawDegrees, 14); // Visible arc
    const startAngle = currentStartAngle;
    const endAngle = startAngle + sliceDegrees;
    currentStartAngle = endAngle + gapDeg;

    // Mathematical center of the slice
    const midAngleDeg = startAngle + sliceDegrees / 2;
    const midAngleRad = ((midAngleDeg - 90) * Math.PI) / 180;
    const rMid = (rInner + rOuter) / 2;
    const posX = cx + rMid * Math.cos(midAngleRad);
    const posY = cy + rMid * Math.sin(midAngleRad);

    // Callout coordinates for narrow slices
    const rCallout = rOuter + 14;
    const calloutX = cx + rCallout * Math.cos(midAngleRad);
    const calloutY = cy + rCallout * Math.sin(midAngleRad);

    const pathData = describeRoundedAnnularSector(cx, cy, rInner, rOuter, startAngle, endAngle, cr);
    const isPrimary = slice.isPrimary ?? idx === 0;
    const fillColor = isPrimary ? "url(#coralArcFull)" : PASTEL_PALETTE[idx % PASTEL_PALETTE.length];

    const formattedPercent = Math.round(slice.percent);
    const isWideSlice = sliceDegrees >= 28;

    return {
      ...slice,
      idx,
      startAngle,
      endAngle,
      sliceDegrees,
      midAngleDeg,
      posX,
      posY,
      calloutX,
      calloutY,
      pathData,
      isPrimary,
      fillColor,
      isWideSlice,
      formattedPercent,
      displayLabel: `${formattedPercent}%`,
    };
  });

  const activeItem = hoveredIdx !== null ? computedSlices[hoveredIdx] : null;
  const primarySlice = computedSlices.find((s) => s.isPrimary) || computedSlices[0];

  return (
    <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-slate-100/90 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-5 transition-all duration-300 hover:shadow-[0_12px_35px_-5px_rgba(0,0,0,0.06)] hover:-translate-y-0.5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#FFE4E6] text-rose-600 flex items-center justify-center text-xs shadow-2xs font-semibold">
            📍
          </div>
          <h3 className="text-[13px] md:text-sm font-semibold text-slate-800 tracking-tight">
            {title}
          </h3>
        </div>
        <span className="text-[11px] font-medium text-slate-400">
          {unitLabel}
        </span>
      </div>

      {/* Subheader Callout Stat */}
      <div>
        <p className="text-[11px] font-medium text-slate-400 tracking-tight">
          {totalLabel}
        </p>
        <p className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
          {displayTotal} {totalCount !== undefined ? "signals" : ""}
        </p>
      </div>

      {/* Two Column Layout: Left Dynamic Themes Legend List + Right High-Precision Donut */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center pt-1">
        {/* Left Side: Real Dynamic Themes Legend with Interactive Hover */}
        <div className="sm:col-span-5 space-y-2.5">
          {computedSlices.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`flex items-center justify-between gap-2 p-1.5 -mx-1.5 rounded-xl transition-all cursor-pointer ${
                  isHovered ? "bg-slate-50 ring-1 ring-slate-200/60" : "hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs transition-transform"
                    style={{
                      backgroundColor: item.isPrimary ? "#E11D48" : item.fillColor.startsWith("url") ? "#F43F5E" : item.fillColor,
                      transform: isHovered ? "scale(1.3)" : "scale(1)",
                    }}
                  />
                  <span className={`text-xs truncate transition-colors ${
                    isHovered ? "font-bold text-slate-950" : "font-semibold text-slate-600"
                  }`}>
                    {item.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-800 shrink-0 tabular-nums">
                  {item.displayLabel}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Side: High-Resolution Donut with Clean Center Hub */}
        <div className="sm:col-span-7 h-[220px] relative flex items-center justify-center">
          <svg
            className="w-full h-full max-w-[240px] max-h-[220px] overflow-visible select-none"
            viewBox="0 0 260 260"
          >
            <defs>
              {/* Rich warm coral to red gradient */}
              <linearGradient id="coralArcFull" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FB7185" />
                <stop offset="50%" stopColor="#F43F5E" />
                <stop offset="100%" stopColor="#E11D48" />
              </linearGradient>

              {/* Luminous ambient drop shadow for the dominant arc */}
              <filter id="coralArcGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#F43F5E" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Central summary inside donut hole */}
            <g transform={`translate(${cx}, ${cy})`} className="pointer-events-none transition-all duration-200">
              <circle r={rInner - 6} fill="#F8FAFC" className="transition-all" />
              
              {activeItem ? (
                <>
                  <text
                    x="0"
                    y="-5"
                    textAnchor="middle"
                    fill="#0F172A"
                    fontSize="17"
                    fontWeight="800"
                    letterSpacing="-0.03em"
                  >
                    {activeItem.displayLabel}
                  </text>
                  <text
                    x="0"
                    y="11"
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="9"
                    fontWeight="700"
                    letterSpacing="0.02em"
                  >
                    {activeItem.count} SIGNALS
                  </text>
                </>
              ) : (
                <>
                  <text
                    x="0"
                    y="-5"
                    textAnchor="middle"
                    fill="#0F172A"
                    fontSize="17"
                    fontWeight="800"
                    letterSpacing="-0.03em"
                  >
                    {displayTotal}
                  </text>
                  <text
                    x="0"
                    y="11"
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="9"
                    fontWeight="700"
                    letterSpacing="0.04em"
                  >
                    TOTAL SIGNALS
                  </text>
                </>
              )}
            </g>

            {/* ========================================================================= */}
            {/* RENDER ALL REAL CALCULATED ANNULAR SLICES                                 */}
            {/* ========================================================================= */}
            {computedSlices.map((item, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <path
                  key={idx}
                  d={item.pathData}
                  fill={item.fillColor}
                  filter={item.isPrimary ? "url(#coralArcGlow)" : undefined}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="transition-all duration-200 cursor-pointer"
                  style={{
                    opacity: hoveredIdx !== null && !isHovered ? 0.45 : 1,
                    transform: isHovered ? "scale(1.025)" : "scale(1)",
                    transformOrigin: `${cx}px ${cy}px`,
                  }}
                >
                  <title>{`${item.name}: ${item.displayLabel} (${item.count} signals)`}</title>
                </path>
              );
            })}

            {/* ========================================================================= */}
            {/* RENDER INLINE LABELS ONLY FOR WIDE SLICES TO PREVENT ANY OVERLAPPING     */}
            {/* ========================================================================= */}
            {computedSlices.map((item, idx) => {
              if (!item.isWideSlice) return null;

              return (
                <text
                  key={idx}
                  x={item.posX}
                  y={item.posY + 4}
                  textAnchor="middle"
                  fill={item.isPrimary ? "#FFFFFF" : "#1E293B"}
                  fontSize="11.5"
                  fontWeight="800"
                  className="pointer-events-none select-none"
                  style={{ textShadow: item.isPrimary ? "0 1px 2px rgba(0,0,0,0.25)" : "none" }}
                >
                  {item.displayLabel}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
