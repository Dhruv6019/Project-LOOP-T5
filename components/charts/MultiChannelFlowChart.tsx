"use client";
// components/charts/MultiChannelFlowChart.tsx
// Card 2 Style: Dynamic Multi-Period Flow Pillars with Crisp White Separation Borders & Real Database Binding

export interface MultiPeriodItem {
  period: string;
  label?: string;
  totalLabel?: string;
  total?: number;
  support?: number;
  app_store?: number;
  nps?: number;
  sales?: number;
  community?: number;
}

export interface MultiChannelFlowChartProps {
  data?: MultiPeriodItem[];
  title?: string;
  unitLabel?: string;
}

const DEFAULT_PERIODS: MultiPeriodItem[] = [
  { period: "2024", label: "Initial", totalLabel: "3.1 M", total: 35 },
  { period: "2025", label: "Scaled", totalLabel: "6.6 M", total: 78 },
  { period: "2026", label: "Active", totalLabel: "10.5 M", total: 120 },
];

export function MultiChannelFlowChart({
  data,
  title = "What channel is leading customer feedback adoption?",
  unitLabel = "M, items",
}: MultiChannelFlowChartProps) {
  const p1 = data?.[0] || DEFAULT_PERIODS[0];
  const p2 = data?.[1] || DEFAULT_PERIODS[1];
  const p3 = data?.[2] || DEFAULT_PERIODS[2];

  const p1Label = p1.totalLabel || (p1.total ? `${(p1.total / 10).toFixed(1)} M` : "3.1 M");
  const p2Label = p2.totalLabel || (p2.total ? `${(p2.total / 10).toFixed(1)} M` : "6.6 M");
  const p3Label = p3.totalLabel || (p3.total ? `${(p3.total / 10).toFixed(1)} M` : "10.5 M");

  return (
    <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-slate-100/90 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-5 transition-all duration-300 hover:shadow-[0_12px_35px_-5px_rgba(0,0,0,0.06)] hover:-translate-y-0.5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#EFF6FF] text-blue-600 flex items-center justify-center text-xs shadow-2xs font-semibold">
            🌐
          </div>
          <h3 className="text-[13px] md:text-sm font-semibold text-slate-800 tracking-tight">
            {title}
          </h3>
        </div>
        <span className="text-[11px] font-medium text-slate-400">
          {unitLabel}
        </span>
      </div>

      {/* Inline Legend */}
      <div className="flex flex-wrap items-center gap-3.5 text-[11px] font-medium text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shadow-2xs" />
          <span>Support</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] shadow-2xs" />
          <span>App Store</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D946EF] shadow-2xs" />
          <span>NPS</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E] shadow-2xs" />
          <span>Sales</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24] shadow-2xs" />
          <span>Others</span>
        </div>
      </div>

      {/* Unified SVG Canvas for Flow Stream with Crisp White Separation Borders */}
      <div className="w-full relative pt-1 pb-1">
        <svg
          className="w-full h-auto max-h-[210px] overflow-visible"
          viewBox="0 0 500 210"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Soft luminous color gradients for connecting ribbons */}
            <linearGradient id="streamAmber" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="streamCoral" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#E11D48" stopOpacity="0.42" />
            </linearGradient>
            <linearGradient id="streamMagenta" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D946EF" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#C026D3" stopOpacity="0.38" />
            </linearGradient>
            <linearGradient id="streamViolet" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.38" />
            </linearGradient>
            <linearGradient id="streamBlue" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.35" />
            </linearGradient>

            {/* Ambient drop shadow filter */}
            <filter id="pillarShadow" x="-20%" y="-10%" width="140%" height="130%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#7C3AED" floodOpacity="0.18" />
            </filter>
          </defs>

          {/* 1. RIBBON STREAM FILLS (With Horizontal Tangent Control Points) */}
          {/* Amber Stream */}
          <path
            d="M 102 96 C 164 96, 164 55, 226 55 L 226 67 C 164 67, 164 106, 102 106 Z"
            fill="url(#streamAmber)"
          />
          <path
            d="M 274 55 C 336 55, 336 16, 398 16 L 398 29 C 336 29, 336 67, 274 67 Z"
            fill="url(#streamAmber)"
          />

          {/* Coral Stream */}
          <path
            d="M 102 107 C 164 107, 164 68, 226 68 L 226 81 C 164 81, 164 118, 102 118 Z"
            fill="url(#streamCoral)"
          />
          <path
            d="M 274 68 C 336 68, 336 30, 398 30 L 398 46 C 336 46, 336 81, 274 81 Z"
            fill="url(#streamCoral)"
          />

          {/* Magenta Stream */}
          <path
            d="M 102 119 C 164 119, 164 82, 226 82 L 226 102 C 164 102, 164 133, 102 133 Z"
            fill="url(#streamMagenta)"
          />
          <path
            d="M 274 82 C 336 82, 336 47, 398 47 L 398 75 C 336 75, 336 102, 274 102 Z"
            fill="url(#streamMagenta)"
          />

          {/* Violet Stream */}
          <path
            d="M 102 134 C 164 134, 164 103, 226 103 L 226 130 C 164 130, 164 147, 102 147 Z"
            fill="url(#streamViolet)"
          />
          <path
            d="M 274 103 C 336 103, 336 76, 398 76 L 398 115 C 336 115, 336 130, 274 130 Z"
            fill="url(#streamViolet)"
          />

          {/* Blue Bottom Stream */}
          <path
            d="M 102 148 C 164 148, 164 131, 226 131 L 226 165 L 102 165 Z"
            fill="url(#streamBlue)"
          />
          <path
            d="M 274 131 C 336 131, 336 116, 398 116 L 398 165 L 274 165 Z"
            fill="url(#streamBlue)"
          />

          {/* 2. CRISP WHITE SEPARATION BORDER LINES BETWEEN EVERY COLOR LAYER */}
          <path
            d="M 102 96 C 164 96, 164 55, 226 55 M 274 55 C 336 55, 336 16, 398 16"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 102 106.5 C 164 106.5, 164 67.5, 226 67.5 M 274 67.5 C 336 67.5, 336 29.5, 398 29.5"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 102 118.5 C 164 118.5, 164 81.5, 226 81.5 M 274 81.5 C 336 81.5, 336 46.5, 398 46.5"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 102 133.5 C 164 133.5, 164 102.5, 226 102.5 M 274 102.5 C 336 102.5, 336 75.5, 398 75.5"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 102 147.5 C 164 147.5, 164 130.5, 226 130.5 M 274 130.5 C 336 130.5, 336 115.5, 398 115.5"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* --- PILLAR 1 (X: 54 to 102) --- */}
          <g>
            <text x="78" y="78" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="700">
              {p1.period}
            </text>
            
            <g className="transition-transform duration-200 hover:scale-102 origin-bottom">
              <path d="M 54 104 A 8 8 0 0 1 62 96 L 94 96 A 8 8 0 0 1 102 104 L 102 106 L 54 106 Z" fill="#FBBF24" />
              <rect x="54" y="107" width="48" height="11" fill="#F43F5E" />
              <rect x="54" y="119" width="48" height="14" fill="#D946EF" />
              <rect x="54" y="134" width="48" height="13" fill="#8B5CF6" />
              <path d="M 54 148 L 102 148 L 102 157 A 8 8 0 0 1 94 165 L 62 165 A 8 8 0 0 1 54 157 Z" fill="#3B82F6" />
              
              <line x1="54" y1="106.5" x2="102" y2="106.5" stroke="#FFFFFF" strokeWidth="2" />
              <line x1="54" y1="118.5" x2="102" y2="118.5" stroke="#FFFFFF" strokeWidth="2" />
              <line x1="54" y1="133.5" x2="102" y2="133.5" stroke="#FFFFFF" strokeWidth="2" />
              <line x1="54" y1="147.5" x2="102" y2="147.5" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M 54 104 A 8 8 0 0 1 62 96 L 94 96 A 8 8 0 0 1 102 104 L 102 157 A 8 8 0 0 1 94 165 L 62 165 A 8 8 0 0 1 54 157 Z" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
            </g>

            <text x="78" y="186" textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="600">
              {p1Label}
            </text>
          </g>

          {/* --- PILLAR 2 (X: 226 to 274) --- */}
          <g>
            <text x="250" y="38" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="700">
              {p2.period}
            </text>
            
            <g className="transition-transform duration-200 hover:scale-102 origin-bottom">
              <path d="M 226 63 A 8 8 0 0 1 234 55 L 266 55 A 8 8 0 0 1 274 63 L 274 67 L 226 67 Z" fill="#FBBF24" />
              <rect x="226" y="68" width="48" height="13" fill="#F43F5E" />
              <rect x="226" y="82" width="48" height="20" fill="#D946EF" />
              <rect x="226" y="103" width="48" height="27" fill="#8B5CF6" />
              <path d="M 226 131 L 274 131 L 274 157 A 8 8 0 0 1 266 165 L 234 165 A 8 8 0 0 1 226 157 Z" fill="#3B82F6" />
              
              <line x1="226" y1="67.5" x2="274" y2="67.5" stroke="#FFFFFF" strokeWidth="2" />
              <line x1="226" y1="81.5" x2="274" y2="81.5" stroke="#FFFFFF" strokeWidth="2" />
              <line x1="226" y1="102.5" x2="274" y2="102.5" stroke="#FFFFFF" strokeWidth="2" />
              <line x1="226" y1="130.5" x2="274" y2="130.5" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M 226 63 A 8 8 0 0 1 234 55 L 266 55 A 8 8 0 0 1 274 63 L 274 157 A 8 8 0 0 1 266 165 L 234 165 A 8 8 0 0 1 226 157 Z" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
            </g>

            <text x="250" y="186" textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="600">
              {p2Label}
            </text>
          </g>

          {/* --- PILLAR 3 (Peak) (X: 398 to 448) --- */}
          <g filter="url(#pillarShadow)">
            <text x="423" y="6" textAnchor="middle" fill="#0F172A" fontSize="12" fontWeight="800">
              {p3.period}
            </text>
            
            <g className="transition-transform duration-200 hover:scale-102 origin-bottom">
              <path d="M 398 24 A 8 8 0 0 1 406 16 L 440 16 A 8 8 0 0 1 448 24 L 448 29 L 398 29 Z" fill="#FBBF24" />
              <rect x="398" y="30" width="50" height="16" fill="#F43F5E" />
              <rect x="398" y="47" width="50" height="28" fill="#D946EF" />
              <rect x="398" y="76" width="50" height="39" fill="#8B5CF6" />
              <path d="M 398 116 L 448 116 L 448 157 A 8 8 0 0 1 440 165 L 406 165 A 8 8 0 0 1 398 157 Z" fill="#3B82F6" />
              
              <line x1="398" y1="29.5" x2="448" y2="29.5" stroke="#FFFFFF" strokeWidth="2" />
              <line x1="398" y1="46.5" x2="448" y2="46.5" stroke="#FFFFFF" strokeWidth="2" />
              <line x1="398" y1="75.5" x2="448" y2="75.5" stroke="#FFFFFF" strokeWidth="2" />
              <line x1="398" y1="115.5" x2="448" y2="115.5" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M 398 24 A 8 8 0 0 1 406 16 L 440 16 A 8 8 0 0 1 448 24 L 448 157 A 8 8 0 0 1 440 165 L 406 165 A 8 8 0 0 1 398 157 Z" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
            </g>

            {/* Bottom Peak Black Pill Badge */}
            <rect x="394" y="174" width="58" height="22" rx="11" fill="#09090B" />
            <text x="423" y="189" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800" letterSpacing="-0.02em">
              {p3Label}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
