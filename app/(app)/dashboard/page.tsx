"use client";
// app/(app)/dashboard/page.tsx
// High-End Analytics Dashboard with AI-Powered Dynamic Titles, Headings, and 2x2 Chart Grid

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { StatCard } from "@/components/ui/StatCard";
import { StatCardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";
import { VolumeChart } from "@/components/charts/VolumeChart";
import { MultiChannelFlowChart } from "@/components/charts/MultiChannelFlowChart";
import { ChannelScatterChart } from "@/components/charts/ChannelScatterChart";
import { SentimentChart } from "@/components/charts/SentimentChart";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";

interface DashboardData {
  userRole: "ADMIN" | "ANALYST" | "VIEWER";
  workspace?: { id: string; name: string; slug: string; createdAt: string };
  teamMembers?: Array<{ id: string; name: string; email: string; role: string; createdAt: string }>;
  stats: {
    totalFeedback: number;
    negativePercent: number;
    newThisWeek: number;
    activeThemes: number;
  };
  sentiment: Array<{ name: string; value: number; color: string }>;
  areaDistribution?: Array<{ name: string; count: number; percent: number; isPeak?: boolean }>;
  multiPeriodPillars?: Array<{
    period: string;
    label: string;
    total: number;
    support: number;
    app_store: number;
    nps: number;
    sales: number;
    community: number;
  }>;
  channelBubbles?: Array<{
    channel: string;
    label: string;
    count: number;
    avgScore: number;
    visits: number;
  }>;
  topThemes: Array<{ id?: string; name: string; count: number; percent: number; color?: string; isPrimary?: boolean }>;
  aiInsights?: {
    executiveHeadline: string | null;
    executiveSubheadline: string | null;
    chart1: {
      title: string;
      periodLabel: string;
      sublabel: string;
      headline: string;
    };
    chart2: {
      title: string;
      unitLabel: string;
    };
    chart3: {
      title: string;
      unitLabel: string;
    };
    chart4: {
      title: string;
      totalLabel: string;
      totalValue: string;
      unitLabel: string;
    };
  };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const role = session?.user?.role ?? data?.userRole ?? "ANALYST";

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => setData(d.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* HEADER WITH WORKSPACE & QUICK ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Customer Feedback Analytics
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 text-violet-700 tracking-wide">
              {data?.workspace?.name ?? "Acme Inc"}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Live AI synthesis of multi-channel Voice of Customer signals.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-3">
          <Link
            href="/ask"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200/70 transition-all shadow-2xs hover:scale-102"
          >
            <span>💬</span> Ask AI Copilot
          </Link>
          {role !== "VIEWER" && (
            <Link
              href="/ingest"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 transition-all shadow-sm hover:scale-102"
            >
              <span>📥</span> Ingest Feedback
            </Link>
          )}
        </div>
      </div>

      {/* AI EXECUTIVE SUMMARY BANNER — Only with real data */}
      {!loading && data && (
        <>
          {data.aiInsights?.executiveHeadline ? (
            <div className="rounded-[24px] p-5 sm:p-6 bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white shadow-xl shadow-violet-950/10 border border-violet-700/30 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/10 via-transparent to-transparent pointer-events-none" />
              <div className="space-y-1.5 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-500/30 text-violet-200 border border-violet-400/40">
                    ✨ AI Executive Signal
                  </span>
                  <span className="text-[11px] font-medium text-violet-300/80">
                    Live from {data.stats.totalFeedback.toLocaleString()} database signals
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  {data.aiInsights.executiveHeadline}
                </h2>
                <p className="text-xs sm:text-sm text-violet-200/85 max-w-3xl">
                  {data.aiInsights.executiveSubheadline}
                </p>
              </div>

              <Link
                href="/reports"
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-white text-slate-950 hover:bg-violet-50 transition-all shadow-md self-start md:self-center"
              >
                Generate Full Report →
              </Link>
            </div>
          ) : (
            <div className="rounded-[24px] p-5 sm:p-6 bg-gradient-to-r from-slate-900/90 via-indigo-950/90 to-slate-900/90 text-white border border-indigo-700/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-700/50 text-slate-400 border border-slate-600/40">
                    AI Executive Signal
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    Waiting for real feedback data
                  </span>
                </div>
                <h2 className="text-base font-bold tracking-tight text-slate-300">
                  No signals ingested yet — AI insights will appear once you add feedback.
                </h2>
                <p className="text-xs text-slate-500 max-w-2xl">
                  The AI Executive Signal is generated only from your real customer data. Ingest customer feedback through Live Channel Pull, CSV import, or Manual Entry to activate it.
                </p>
              </div>
              <Link
                href="/ingest"
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md self-start md:self-center"
              >
                Add Feedback Now →
              </Link>
            </div>
          )}
        </>
      )}

      {/* TOP KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : data ? (
          <>
            <StatCard
              title="Total Feedback"
              value={data.stats.totalFeedback.toLocaleString()}
              subtitle="All connected channels"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              }
            />
            <StatCard
              title="Negative Friction"
              value={`${data.stats.negativePercent}%`}
              subtitle="Classified churn risks"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              title="New This Week"
              value={data.stats.newThisWeek.toLocaleString()}
              subtitle="Last 7 days volume"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />
            <StatCard
              title="Active Themes"
              value={data.stats.activeThemes.toLocaleString()}
              subtitle="AI topic clusters"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                </svg>
              }
            />
          </>
        ) : null}
      </div>

      {/* 2x2 CHART GRID WITH DYNAMIC AI TITLES & REAL DATA */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton height={280} />
          <ChartSkeleton height={280} />
          <ChartSkeleton height={280} />
          <ChartSkeleton height={280} />
        </div>
      ) : data?.stats.totalFeedback === 0 ? (
        <EmptyState
          title="No feedback collected yet"
          description="Start by adding feedback manually, importing a CSV file, or running a simulated channel pull."
          action={
            role !== "VIEWER" ? (
              <Link
                href="/ingest"
                className="inline-flex items-center gap-2 bg-slate-950 text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-sm"
              >
                Add first feedback
              </Link>
            ) : null
          }
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Top Left - Volume / Area Distribution with Highlight Peak */}
          <VolumeChart
            data={data?.areaDistribution}
            title={data?.aiInsights?.chart1.title || "Feedback volume by feature area"}
            periodLabel={data?.aiInsights?.chart1.periodLabel || "Active Period"}
            sublabel={data?.aiInsights?.chart1.sublabel || "Primary volume driver"}
            cohortHeadline={data?.aiInsights?.chart1.headline}
          />

          {/* Card 2: Top Right - Multi-Channel Flow & Trajectory Pillars */}
          <MultiChannelFlowChart
            data={data?.multiPeriodPillars}
            title={data?.aiInsights?.chart2.title || "Which channels drive customer feedback volume?"}
            unitLabel={data?.aiInsights?.chart2.unitLabel || "Signals"}
          />

          {/* Card 3: Bottom Left - Floating Blocks & Touchpoint Popularity */}
          <ChannelScatterChart
            data={data?.channelBubbles}
            title={data?.aiInsights?.chart3.title || "Customer satisfaction vs interaction volume by channel"}
          />

          {/* Card 4: Bottom Right - Chunky Donut & Prominent Themes */}
          <SentimentChart
            data={data?.topThemes}
            totalCount={data?.stats.totalFeedback}
            title={data?.aiInsights?.chart4.title || "The most popular themes for customer feedback"}
            totalLabel={data?.aiInsights?.chart4.totalLabel || "Total analyzed feedback"}
            totalValue={data?.aiInsights?.chart4.totalValue || `${data?.stats.totalFeedback || 0} signals`}
            unitLabel={data?.aiInsights?.chart4.unitLabel || "Themes"}
          />
        </div>
      )}

      {/* ADMIN EXCLUSIVE PANEL */}
      {role === "ADMIN" && data?.teamMembers && (
        <div className="rounded-[28px] p-6 bg-white border border-slate-100/90 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                Admin Team Management & Permissions
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage members assigned to workspace &ldquo;{data.workspace?.name}&rdquo;
              </p>
            </div>
            <Link
              href="/settings/members"
              className="text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 px-3 py-1.5 rounded-full transition-colors"
            >
              Manage {data.teamMembers.length} Members →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Member Name</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Permissions Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">{member.name}</td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{member.email}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          member.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : member.role === "ANALYST"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {member.role === "ADMIN"
                        ? "Full Access (Read/Write/Delete/Team)"
                        : member.role === "ANALYST"
                        ? "Standard Access (Read/Write/Classify)"
                        : "Read-Only (View Dashboard/Reports)"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
