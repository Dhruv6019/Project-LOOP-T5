"use client";
// components/feedback/FeedbackFilters.tsx
// High-End Filter Bar with Refined Pill Controls & Search

import { useState, useEffect } from "react";
import { VALID_CHANNELS } from "@/lib/validations";
import { getChannelLabel } from "@/lib/utils";
import type { FeedbackFilters } from "@/types";

const SENTIMENTS = [
  { value: "POS", label: "Positive" },
  { value: "NEU", label: "Neutral" },
  { value: "NEG", label: "Negative" },
];
const STATUSES = [
  { value: "NEW", label: "New" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "ACTIONED", label: "Actioned" },
];

interface FeedbackFiltersProps {
  filters: FeedbackFilters;
  themes: Array<{ id: string; name: string }>;
  onChange: (filters: Partial<FeedbackFilters>) => void;
}

export function FeedbackFilters({ filters, themes, onChange }: FeedbackFiltersProps) {
  const [search, setSearch] = useState(filters.search ?? "");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => onChange({ search: search || undefined, page: 1 }), 400);
    return () => clearTimeout(timer);
  }, [search]);

  function toggleArrayFilter<T extends string>(
    key: keyof FeedbackFilters,
    value: T,
  ) {
    const current = (filters[key] as T[]) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ [key]: next.length > 0 ? next : undefined, page: 1 });
  }

  const hasFilters =
    filters.search ||
    (filters.channel && filters.channel.length > 0) ||
    (filters.sentiment && filters.sentiment.length > 0) ||
    (filters.status && filters.status.length > 0) ||
    (filters.themeIds && filters.themeIds.length > 0);

  return (
    <div className="bg-white rounded-[24px] p-5 border border-slate-100/90 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          placeholder="Search customer feedback by keyword, user, or topic…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="feedback-search"
          className="w-full pl-10 pr-4 py-2.5 rounded-full text-xs bg-slate-50/80 border border-slate-200/80 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
        />
      </div>

      {/* Filter Rows */}
      <div className="space-y-2.5 pt-1">
        {/* Channel Row */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-16">Channel:</span>
          {VALID_CHANNELS.map((channel) => {
            const active = filters.channel?.includes(channel);
            return (
              <button
                key={channel}
                onClick={() => toggleArrayFilter("channel", channel)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all duration-150 shadow-2xs cursor-pointer ${
                  active
                    ? "bg-slate-950 text-white shadow-sm scale-102"
                    : "bg-white text-slate-600 border border-slate-200/90 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {getChannelLabel(channel)}
              </button>
            );
          })}
        </div>

        {/* Sentiment & Status Row */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-16">Sentiment:</span>
          {SENTIMENTS.map((s) => {
            const active = filters.sentiment?.includes(s.value as any);
            return (
              <button
                key={s.value}
                onClick={() => toggleArrayFilter("sentiment", s.value)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all duration-150 shadow-2xs cursor-pointer ${
                  active
                    ? "bg-slate-950 text-white shadow-sm scale-102"
                    : "bg-white text-slate-600 border border-slate-200/90 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {s.label}
              </button>
            );
          })}

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Status:</span>
          {STATUSES.map((s) => {
            const active = filters.status?.includes(s.value as any);
            return (
              <button
                key={s.value}
                onClick={() => toggleArrayFilter("status", s.value)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all duration-150 shadow-2xs cursor-pointer ${
                  active
                    ? "bg-slate-950 text-white shadow-sm scale-102"
                    : "bg-white text-slate-600 border border-slate-200/90 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {s.label}
              </button>
            );
          })}

          {hasFilters && (
            <button
              onClick={() => {
                setSearch("");
                onChange({ search: undefined, channel: undefined, sentiment: undefined, status: undefined, themeIds: undefined, page: 1 });
              }}
              id="clear-filters"
              className="ml-auto text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-full transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Themes Filter Row */}
        {themes.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-16">Themes:</span>
            {themes.map((theme) => {
              const active = filters.themeIds?.includes(theme.id);
              return (
                <button
                  key={theme.id}
                  onClick={() => toggleArrayFilter("themeIds", theme.id)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all duration-150 shadow-2xs cursor-pointer ${
                    active
                      ? "bg-purple-700 text-white shadow-sm scale-102"
                      : "bg-white text-slate-600 border border-slate-200/90 hover:border-slate-300 hover:text-slate-900"
                  }`}
                >
                  {theme.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
