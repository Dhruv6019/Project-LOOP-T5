"use client";
// components/feedback/FeedbackCard.tsx
// High-End Feedback Card with Modern Pill Badges & Elevated Typography

import { useState } from "react";
import { SentimentBadge, ChannelBadge, StatusBadge } from "@/components/ui/Badge";
import { cn, formatRelativeDate, truncate } from "@/lib/utils";
import type { Feedback } from "@/types";

interface FeedbackCardProps {
  feedback: Feedback;
  onStatusChange?: (id: string, status: Feedback["status"]) => void;
  onClassify?: (id: string) => void;
  expanded?: boolean;
}

export function FeedbackCard({ feedback, onStatusChange, onClassify, expanded = false }: FeedbackCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [statusLoading, setStatusLoading] = useState(false);
  const [classifyLoading, setClassifyLoading] = useState(false);

  const nextStatus: Record<Feedback["status"], Feedback["status"]> = {
    NEW: "REVIEWED",
    REVIEWED: "ACTIONED",
    ACTIONED: "NEW",
  };

  async function handleStatusChange(e: React.MouseEvent) {
    e.stopPropagation();
    if (!onStatusChange) return;
    setStatusLoading(true);
    try {
      const next = nextStatus[feedback.status];
      const res = await fetch(`/api/feedback/${feedback.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) onStatusChange(feedback.id, next);
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleClassify(e: React.MouseEvent) {
    e.stopPropagation();
    if (!onClassify) return;
    setClassifyLoading(true);
    try {
      const res = await fetch("/api/feedback/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackId: feedback.id }),
      });
      if (res.ok) onClassify(feedback.id);
    } finally {
      setClassifyLoading(false);
    }
  }

  const themes = feedback.themes ?? [];
  const contentPreview = isExpanded ? feedback.content : truncate(feedback.content, 180);

  return (
    <div
      className={cn(
        "bg-white rounded-[22px] p-5 sm:p-6 border border-slate-100/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_-5px_rgba(0,0,0,0.06)] hover:border-slate-200/90 transition-all duration-200 cursor-pointer select-none space-y-3",
        feedback.status === "ACTIONED" && "opacity-70 bg-slate-50/60",
      )}
      onClick={() => setIsExpanded((v) => !v)}
    >
      {/* Top Badges Header */}
      <div className="flex items-center gap-2 flex-wrap justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <ChannelBadge channel={feedback.channel} />
          <SentimentBadge sentiment={feedback.sentiment} />
          <StatusBadge status={feedback.status} />
          {!feedback.classified && (
            <span className="badge bg-amber-50 text-amber-800 border border-amber-200/80">
              <svg className="w-3 h-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pending AI
            </span>
          )}
        </div>

        <span className="text-[11px] font-medium text-slate-400">
          {formatRelativeDate(feedback.createdAt)}
        </span>
      </div>

      {/* Main Feedback Content */}
      <div className="pt-1">
        <p className="text-[13px] font-medium text-slate-800 leading-relaxed">
          {contentPreview}
        </p>
        {feedback.content.length > 180 && (
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded((v) => !v); }}
            className="text-[11px] text-violet-600 hover:text-violet-700 mt-1 font-semibold transition-colors inline-block"
          >
            {isExpanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      {/* Themes Tags (Pills) */}
      {themes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {themes.map((ft) => (
            <span
              key={ft.theme.id}
              className="text-[11px] px-3 py-1 rounded-full font-semibold tracking-tight border shadow-2xs transition-transform hover:scale-102"
              style={{
                backgroundColor: ft.theme.color ? ft.theme.color + "14" : "#F3E8FF",
                color: ft.theme.color || "#7C3AED",
                borderColor: ft.theme.color ? ft.theme.color + "30" : "#E9D5FF",
              }}
            >
              {ft.theme.name}
            </span>
          ))}
        </div>
      )}

      {/* Expanded Accordion Details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 animate-fade-in text-xs">
          {feedback.featureArea && (
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">Feature Area:</span>
              <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{feedback.featureArea}</span>
            </div>
          )}
          {feedback.rationale && (
            <div className="text-slate-600">
              <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider block mb-1">AI Reasoning:</span>
              <p className="text-slate-700 bg-slate-50/80 p-3 rounded-xl border border-slate-100 leading-relaxed">{feedback.rationale}</p>
            </div>
          )}
          {feedback.customerLabel && (
            <div className="text-slate-600 flex items-center gap-1.5">
              <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">Customer:</span>
              <span className="font-medium text-slate-700">{feedback.customerLabel}</span>
            </div>
          )}
          {feedback.sourceRef && (
            <div className="text-slate-600 flex items-center gap-1.5">
              <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">Reference ID:</span>
              <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{feedback.sourceRef}</span>
            </div>
          )}
        </div>
      )}

      {/* Bottom Action Buttons Row */}
      {(onStatusChange || onClassify) && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100/90" onClick={(e) => e.stopPropagation()}>
          {onStatusChange && (
            <button
              onClick={handleStatusChange}
              disabled={statusLoading}
              id={`status-btn-${feedback.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-2xs transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {statusLoading ? (
                <svg className="w-3 h-3 animate-spin text-slate-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              Mark {nextStatus[feedback.status].toLowerCase()}
            </button>
          )}

          {onClassify && !feedback.classified && (
            <button
              onClick={handleClassify}
              disabled={classifyLoading}
              id={`classify-btn-${feedback.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 shadow-2xs transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {classifyLoading ? (
                <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              Classify now
            </button>
          )}
        </div>
      )}
    </div>
  );
}
