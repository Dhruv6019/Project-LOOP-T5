// components/ui/Badge.tsx
// Modern pill badges with soft tints, clean borders, and dot indicators

import { cn, getChannelLabel, getSentimentLabel, getStatusLabel } from "@/lib/utils";
import type { Sentiment, Channel, FeedbackStatus } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "positive" | "negative" | "neutral" | "outline" | "blue" | "purple";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  const variantClasses = {
    default: "bg-indigo-50/90 text-indigo-700 border border-indigo-200/70",
    positive: "bg-emerald-50/90 text-emerald-700 border border-emerald-200/70",
    negative: "bg-rose-50/90 text-rose-700 border border-rose-200/70",
    neutral: "bg-amber-50/90 text-amber-800 border border-amber-200/70",
    outline: "bg-white text-slate-700 border border-slate-200/90",
    blue: "bg-blue-50/90 text-blue-700 border border-blue-200/70",
    purple: "bg-violet-50/90 text-violet-700 border border-violet-200/70",
  };

  return (
    <span className={cn("badge", variantClasses[variant], className)}>
      {children}
    </span>
  );
}

export function SentimentBadge({ sentiment }: { sentiment: Sentiment | null }) {
  if (!sentiment) {
    return (
      <Badge variant="outline">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        Unclassified
      </Badge>
    );
  }

  const configs: Record<Sentiment, { variant: "positive" | "negative" | "neutral"; dot: string }> = {
    POS: { variant: "positive", dot: "bg-emerald-500" },
    NEU: { variant: "neutral", dot: "bg-amber-500" },
    NEG: { variant: "negative", dot: "bg-rose-500" },
  };

  const config = configs[sentiment];

  return (
    <Badge variant={config.variant}>
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)} />
      {getSentimentLabel(sentiment)}
    </Badge>
  );
}

export function ChannelBadge({ channel }: { channel: Channel }) {
  const channelIcons: Record<Channel, string> = {
    support_ticket: "🎧",
    app_store: "📱",
    nps_survey: "⭐",
    sales_call: "💼",
    community: "💬",
    portal: "🌐",
    other: "📌",
  };

  return (
    <Badge variant="outline" className="text-slate-700 font-medium">
      <span className="text-[10px]">{channelIcons[channel] || "📌"}</span>
      {getChannelLabel(channel)}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: FeedbackStatus }) {
  const styles: Record<FeedbackStatus, { className: string; dot: string }> = {
    NEW: {
      className: "bg-violet-50/90 text-violet-700 border border-violet-200/80",
      dot: "bg-violet-500",
    },
    REVIEWED: {
      className: "bg-emerald-50/90 text-emerald-700 border border-emerald-200/80",
      dot: "bg-emerald-500",
    },
    ACTIONED: {
      className: "bg-slate-100 text-slate-500 border border-slate-200/80",
      dot: "bg-slate-400",
    },
  };

  const config = styles[status] || styles.NEW;

  return (
    <span className={cn("badge", config.className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)} />
      {getStatusLabel(status)}
    </span>
  );
}
