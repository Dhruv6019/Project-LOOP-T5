// lib/utils.ts
// Shared utility functions

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Channel, Sentiment, FeedbackStatus } from "@/types";

// ---- Tailwind class merging ----
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---- Date formatting ----
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(d);
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getDateRangeFromPeriod(days: number): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  from.setHours(0, 0, 0, 0);
  return { from, to };
}

// ---- Text utilities ----
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ---- Label helpers ----
export function getChannelLabel(channel: Channel): string {
  const labels: Record<Channel, string> = {
    support_ticket: "Support Ticket",
    app_store: "App Store",
    nps_survey: "NPS Survey",
    sales_call: "Sales Call",
    community: "Community",
    portal: "Customer Portal",
    other: "Other",
  };
  return labels[channel] ?? channel;
}

export function getSentimentLabel(sentiment: Sentiment | null): string {
  if (!sentiment) return "Unclassified";
  const labels: Record<Sentiment, string> = {
    POS: "Positive",
    NEU: "Neutral",
    NEG: "Negative",
  };
  return labels[sentiment];
}

export function getStatusLabel(status: FeedbackStatus): string {
  const labels: Record<FeedbackStatus, string> = {
    NEW: "New",
    REVIEWED: "Reviewed",
    ACTIONED: "Actioned",
  };
  return labels[status];
}

// ---- Sentiment colors ----
export function getSentimentColor(sentiment: Sentiment | null): string {
  if (!sentiment) return "#9CA3AF";
  const colors: Record<Sentiment, string> = {
    POS: "#10B981",
    NEU: "#F59E0B",
    NEG: "#EF4444",
  };
  return colors[sentiment];
}

export function getSentimentBgColor(sentiment: Sentiment | null): string {
  if (!sentiment) return "#F3F4F6";
  const colors: Record<Sentiment, string> = {
    POS: "#ECFDF5",
    NEU: "#FFFBEB",
    NEG: "#FEF2F2",
  };
  return colors[sentiment];
}

// ---- Channel colors ----
export function getChannelColor(channel: Channel): string {
  const colors: Record<Channel, string> = {
    support_ticket: "#3B82F6",
    app_store: "#8B5CF6",
    nps_survey: "#06B6D4",
    sales_call: "#F97316",
    community: "#84CC16",
    portal: "#D946EF",
    other: "#6B7280",
  };
  return colors[channel] ?? "#6B7280";
}

// ---- Theme colors palette ----
export const THEME_COLORS = [
  "#6366F1", "#8B5CF6", "#EC4899", "#EF4444",
  "#F97316", "#F59E0B", "#84CC16", "#10B981",
  "#06B6D4", "#3B82F6", "#A78BFA", "#FB7185",
];

export function getThemeColorByIndex(index: number): string {
  return THEME_COLORS[index % THEME_COLORS.length];
}

// ---- Number formatting ----
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

// ---- Status cycle ----
export function getNextStatus(current: FeedbackStatus): FeedbackStatus {
  const cycle: Record<FeedbackStatus, FeedbackStatus> = {
    NEW: "REVIEWED",
    REVIEWED: "ACTIONED",
    ACTIONED: "NEW",
  };
  return cycle[current];
}
