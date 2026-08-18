"use client";
// components/charts/VolumeChart.tsx
// Card 1 Style: Perfected Vertical Rounded Bars with Dynamic AI Headings & Real Data Distribution

export interface AreaItem {
  name: string;
  count: number;
  percent: number;
  isPeak?: boolean;
}

export interface VolumeChartProps {
  data?: AreaItem[];
  title?: string;
  periodLabel?: string;
  sublabel?: string;
  cohortHeadline?: string;
}

export function VolumeChart({
  data,
  title = "Feedback volume by feature area?",
  periodLabel = "Active Period",
  sublabel = "Primary volume driver",
  cohortHeadline,
}: VolumeChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const chartData = data;
  const maxPercent = Math.max(...chartData.map((d) => d.percent), 1);
  const peakItem = chartData.find((d) => d.isPeak) || chartData[0];
  const displayHeadline = cohortHeadline || peakItem?.name || "Feature Areas";

  return (
    <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-slate-100/90 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-6 transition-all duration-300 hover:shadow-[0_12px_35px_-5px_rgba(0,0,0,0.06)] hover:-translate-y-0.5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#F3E8FF] text-violet-700 flex items-center justify-center text-xs shadow-2xs font-semibold">
            👥
          </div>
          <h3 className="text-[13px] md:text-sm font-semibold text-slate-800 tracking-tight">
            {title}
          </h3>
        </div>
        <span className="text-[11px] font-medium text-slate-400">
          {periodLabel}
        </span>
      </div>

      {/* Subheader Callout Stat (Dynamic from AI / Data) */}
      <div>
        <p className="text-[11px] font-medium text-slate-400 tracking-tight">
          {sublabel}
        </p>
        <p className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
          {displayHeadline}
        </p>
      </div>

      {/* Vertical Rounded Bars Canvas */}
      <div className="pt-2">
        <div
          className="grid gap-2.5 sm:gap-4 items-end h-[160px] pb-3"
          style={{ gridTemplateColumns: `repeat(${chartData.length}, minmax(0, 1fr))` }}
        >
          {chartData.map((item, idx) => {
            const isPeak = item.isPeak || (item.name === peakItem?.name);
            const barHeight = Math.max(24, Math.round((item.percent / maxPercent) * 100));

            return (
              <div key={idx} className="flex flex-col items-center justify-end h-full group relative">
                {/* Percentage Tag */}
                <span
                  className={`text-xs font-bold mb-2.5 transition-all duration-200 group-hover:-translate-y-0.5 ${
                    isPeak ? "text-slate-950 font-black scale-105" : "text-slate-600"
                  }`}
                >
                  {String(item.percent).replace(".", ",")}%
                </span>

                {/* Rounded Bar Capsule */}
                <div
                  style={{ height: `${barHeight}%` }}
                  className={`w-full max-w-[50px] rounded-[18px] transition-all duration-300 relative overflow-hidden flex flex-col justify-between p-1 ${
                    isPeak
                      ? "bg-gradient-to-t from-[#6D28D9] via-[#7C3AED] to-[#A78BFA] shadow-[0_12px_28px_-4px_rgba(109,40,217,0.45)] group-hover:scale-105"
                      : "bg-gradient-to-t from-[#EDE9FE] to-[#F5F3FF] border border-violet-200/50 hover:bg-[#DDD6FE] group-hover:scale-102"
                  }`}
                >
                  {/* Specular Top Highlight Pill */}
                  <div
                    className={`w-full h-1.5 rounded-full ${
                      isPeak ? "bg-white/40" : "bg-white/70"
                    }`}
                  />
                  <div className="w-full" />
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis Ground Line & Labels */}
        <div
          className="grid gap-2.5 sm:gap-4 pt-3 border-t border-slate-100 items-center"
          style={{ gridTemplateColumns: `repeat(${chartData.length}, minmax(0, 1fr))` }}
        >
          {chartData.map((item, idx) => {
            const isPeak = item.isPeak || (item.name === peakItem?.name);
            return (
              <div key={idx} className="flex justify-center">
                {isPeak ? (
                  <span className="px-3.5 py-1 rounded-full bg-slate-950 text-white text-[11px] font-extrabold tracking-tight shadow-md whitespace-nowrap text-center">
                    {item.name}
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400 text-center truncate max-w-[70px]">
                    {item.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
