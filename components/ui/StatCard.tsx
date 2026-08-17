// components/ui/StatCard.tsx
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: number;
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, className }: StatCardProps) {
  const isPositiveTrend = trend !== undefined && trend >= 0;
  const isNegativeTrend = trend !== undefined && trend < 0;

  return (
    <div className={cn("stat-card group hover:border-indigo-200/80 transition-all duration-200", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1.5 tracking-tight">{value}</p>
          {subtitle && <p className="text-[11px] text-slate-500 font-medium mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div
              className={cn(
                "inline-flex items-center gap-1 mt-2.5 px-2 py-0.5 rounded-full text-[11px] font-semibold",
                isPositiveTrend ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100",
              )}
            >
              <svg
                className={cn("w-3 h-3", isNegativeTrend && "rotate-180")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {Math.abs(trend)}% vs last period
            </div>
          )}
        </div>
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-indigo-50/80 border border-indigo-100/60 flex items-center justify-center shrink-0 text-indigo-600 group-hover:scale-105 transition-transform duration-200">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
