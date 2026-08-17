// components/ui/Skeleton.tsx
import { cn } from "@/lib/utils";

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div style={style} className={cn("animate-pulse rounded-lg bg-border-subtle", className)} />
  );
}

export function FeedbackCardSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="ml-auto h-5 w-14" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-1.5 pt-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-28" />
    </div>
  );
}

export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="card p-5">
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton style={{ height }} className="w-full" />
    </div>
  );
}

export function TableRowSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-border">
          <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
          <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
          <td className="py-3 px-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
          <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
        </tr>
      ))}
    </>
  );
}
