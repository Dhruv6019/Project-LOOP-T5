"use client";
// app/(app)/inbox/page.tsx
// Feedback Inbox — filtering, pagination, search, status updates, saved views, CSV export

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FeedbackCard } from "@/components/feedback/FeedbackCard";
import { FeedbackFilters as FiltersComponent } from "@/components/feedback/FeedbackFilters";
import { Pagination } from "@/components/ui/Pagination";
import { FeedbackCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { Feedback, FeedbackFilters as FiltersType } from "@/types";

function InboxContent() {
  const searchParams = useSearchParams();
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [themes, setThemes] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  
  // Initialize filters with URL search params if present
  const [filters, setFilters] = useState<FiltersType>(() => {
    const initialThemes = searchParams.getAll("themeIds");
    const initialSentiment = searchParams.getAll("sentiment");
    const initialStatus = searchParams.getAll("status");
    const initialChannel = searchParams.getAll("channel");
    const initialSearch = searchParams.get("search") || undefined;
    const initialPage = Number(searchParams.get("page")) || 1;

    return {
      page: initialPage,
      limit: 20,
      search: initialSearch,
      themeIds: initialThemes.length > 0 ? initialThemes : undefined,
      sentiment: initialSentiment.length > 0 ? (initialSentiment as any) : undefined,
      status: initialStatus.length > 0 ? (initialStatus as any) : undefined,
      channel: initialChannel.length > 0 ? (initialChannel as any) : undefined,
    };
  });

  const [activeSegment, setActiveSegment] = useState<"all" | "negative" | "unreviewed" | "positive">("all");

  // Fetch themes for filter pills
  useEffect(() => {
    fetch("/api/themes")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setThemes(json.data.map((t: any) => ({ id: t.id, name: t.name })));
        }
      })
      .catch(console.error);
  }, []);

  // Fetch feedback items with current filters
  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filters.page) query.set("page", String(filters.page));
      if (filters.limit) query.set("limit", String(filters.limit));
      if (filters.search) query.set("search", filters.search);
      filters.channel?.forEach((c) => query.append("channel", c));
      filters.sentiment?.forEach((s) => query.append("sentiment", s));
      filters.status?.forEach((st) => query.append("status", st));
      filters.themeIds?.forEach((t) => query.append("themeIds", t));

      const res = await fetch(`/api/feedback?${query.toString()}`);
      const json = await res.json();
      if (json.data) {
        setFeedbackList(json.data);
        setMeta(json.meta);
      }
    } catch (err) {
      console.error("Failed to fetch feedback:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleFilterChange = (newFilters: Partial<FiltersType>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleStatusChange = (id: string, newStatus: Feedback["status"]) => {
    setFeedbackList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleClassify = () => {
    fetchFeedback();
  };

  // Quick segment switcher
  const handleSegmentClick = (segment: "all" | "negative" | "unreviewed" | "positive") => {
    setActiveSegment(segment);
    if (segment === "all") {
      setFilters((prev) => ({ ...prev, page: 1, sentiment: undefined, status: undefined }));
    } else if (segment === "negative") {
      setFilters((prev) => ({ ...prev, page: 1, sentiment: ["NEG"], status: undefined }));
    } else if (segment === "unreviewed") {
      setFilters((prev) => ({ ...prev, page: 1, sentiment: undefined, status: ["NEW"] }));
    } else if (segment === "positive") {
      setFilters((prev) => ({ ...prev, page: 1, sentiment: ["POS"], status: undefined }));
    }
  };

  // Export filtered feedback as CSV
  const handleExportCSV = () => {
    if (feedbackList.length === 0) return;
    const headers = ["ID", "Content", "Channel", "Sentiment", "Score", "Feature Area", "Status", "Created At"];
    const rows = feedbackList.map((item) => [
      `"${item.id}"`,
      `"${item.content.replace(/"/g, '""')}"`,
      `"${item.channel}"`,
      `"${item.sentiment ?? ""}"`,
      `"${item.sentimentScore ?? ""}"`,
      `"${item.featureArea ?? ""}"`,
      `"${item.status}"`,
      `"${new Date(item.createdAt).toISOString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `feedback_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[24px] bg-white border border-slate-100/90 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)]">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Feedback Inbox</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Showing {meta.total} feedback items across all customer touchpoints
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            disabled={feedbackList.length === 0}
            id="export-csv-btn"
            leftIcon={
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
          >
            Export CSV
          </Button>
          <Link href="/ingest">
            <button
              id="add-feedback-btn"
              className="inline-flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all duration-150 shadow-sm hover:shadow active:scale-[0.98]"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Feedback
            </button>
          </Link>
        </div>
      </div>

      {/* Quick Segment Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Views:</span>
        {[
          { id: "all", label: "All Feedback" },
          { id: "negative", label: "Negative (Churn Risk)" },
          { id: "unreviewed", label: "Needs Triage (New)" },
          { id: "positive", label: "Praise & Wins" },
        ].map((seg) => (
          <button
            key={seg.id}
            onClick={() => handleSegmentClick(seg.id as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all select-none cursor-pointer ${
              activeSegment === seg.id
                ? "bg-slate-950 text-white shadow-sm scale-102"
                : "bg-white text-slate-600 border border-slate-200/90 hover:border-slate-300 hover:text-slate-900 shadow-2xs"
            }`}
          >
            {seg.label}
          </button>
        ))}
      </div>

      {/* Filter panel */}
      <FiltersComponent
        filters={filters}
        themes={themes}
        onChange={handleFilterChange}
      />

      {/* Feedback Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <FeedbackCardSkeleton key={i} />
          ))}
        </div>
      ) : feedbackList.length === 0 ? (
        <EmptyState
          title="No feedback found"
          description="Try adjusting your filters or search terms."
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbackList.map((item) => (
            <FeedbackCard
              key={item.id}
              feedback={item}
              onStatusChange={handleStatusChange}
              onClassify={handleClassify}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center pt-4">
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          onPageChange={(page) => handleFilterChange({ page })}
        />
      </div>
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-6"><FeedbackCardSkeleton /></div>}>
      <InboxContent />
    </Suspense>
  );
}
