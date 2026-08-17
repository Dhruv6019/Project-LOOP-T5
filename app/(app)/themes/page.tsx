"use client";
// app/(app)/themes/page.tsx
// Themes & Trends — Topic clusters and volume spike detection

import { useEffect, useState } from "react";
import { TrendSparkline } from "@/components/charts/TrendSparkline";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import type { ThemeTrendData } from "@/types";

export default function ThemesPage() {
  const [trends, setTrends] = useState<ThemeTrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");
  const [newThemeDesc, setNewThemeDesc] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/themes/trends?period=30");
      const json = await res.json();
      if (json.data) setTrends(json.data);
    } catch (err) {
      console.error("Failed to fetch trends:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  const handleCreateTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThemeName) return;

    setCreateLoading(true);
    try {
      const res = await fetch("/api/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newThemeName, description: newThemeDesc }),
      });

      if (res.ok) {
        setNewThemeName("");
        setNewThemeDesc("");
        setShowCreateModal(false);
        fetchTrends();
      }
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Themes & Trends</h1>
          <p className="text-xs text-text-muted mt-0.5">
            AI-extracted feedback topics and weekly volume trendlines
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          id="create-theme-btn"
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          New Theme
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 h-44 animate-pulse bg-border-subtle" />
          ))}
        </div>
      ) : trends.length === 0 ? (
        <EmptyState
          title="No themes generated yet"
          description="Themes will automatically be extracted as feedback is classified by Claude AI."
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trends.map((item) => (
            <div
              key={item.theme.id}
              className="card card-hover p-5 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.theme.color }}
                    />
                    <h3 className="text-sm font-semibold text-text-primary">{item.theme.name}</h3>
                  </div>

                  {item.isSpiking && (
                    <span className="badge bg-negative-light text-negative font-semibold flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Spike (+{item.changePercent}%)
                    </span>
                  )}
                </div>

                {item.theme.description && (
                  <p className="text-xs text-text-secondary mt-2 line-clamp-2 leading-relaxed">
                    {item.theme.description}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xl font-bold text-text-primary">{item.currentCount}</span>
                  <span className={`text-xs font-medium ${item.changePercent >= 0 ? "text-positive" : "text-negative"}`}>
                    {item.changePercent >= 0 ? `+${item.changePercent}%` : `${item.changePercent}%`} vs prev period
                  </span>
                </div>

                {/* Trendline */}
                <TrendSparkline data={item.weeklyData} color={item.theme.color} isSpiking={item.isSpiking} />
              </div>

              <div className="pt-2 border-t border-border-subtle flex justify-end">
                <Link
                  href={`/inbox?themeIds=${item.theme.id}`}
                  className="text-xs font-semibold text-accent hover:text-accent-hover flex items-center gap-1"
                >
                  View feedback ({item.currentCount})
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for manual theme creation */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-md space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-text-primary">Create Custom Theme</h3>

            <form onSubmit={handleCreateTheme} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">Theme Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Export Functionality"
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="What kind of feedback belongs to this theme?"
                  value={newThemeDesc}
                  onChange={(e) => setNewThemeDesc(e.target.value)}
                  className="input-base resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setShowCreateModal(false)} type="button">
                  Cancel
                </Button>
                <Button type="submit" loading={createLoading} id="save-theme-btn">
                  Save Theme
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
