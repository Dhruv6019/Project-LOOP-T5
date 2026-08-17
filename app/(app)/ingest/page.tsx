"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { VALID_CHANNELS } from "@/lib/validations";
import { getChannelLabel } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Channel } from "@/types";
import {
  Inbox,
  FileSpreadsheet,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Layers,
  MessageSquare,
  Shield,
  Clock,
  ChevronRight
} from "lucide-react";

const PRESET_SCENARIOS: Array<{ title: string; channel: Channel; customer: string; text: string }> = [
  {
    title: "Mobile Latency Friction",
    channel: "app_store",
    customer: "Mobile Enterprise User",
    text: "The mobile app takes over 8 seconds to load our team reports on iOS. It crashes whenever I filter by date range. Please fix this blocker ASAP!",
  },
  {
    title: "Enterprise SSO Demand",
    channel: "sales_call",
    customer: "Fortune 500 Prospect",
    text: "We are evaluating Project LOOP for 400 seats, but SAML SSO with Okta is a mandatory hard requirement for our IT security review.",
  },
  {
    title: "High Praise / Workflow Transformation",
    channel: "community",
    customer: "Growth Lead @ ScaleCo",
    text: "Project LOOP replaced three separate tools for our product team. The automated sentiment analysis and VoC report exports are chef's kiss!",
  },
  {
    title: "Billing Invoice Confusion",
    channel: "support_ticket",
    customer: "Finance Dept #49",
    text: "We were charged twice for our extra seat licenses this month. The invoice breakdown is confusing and lacks VAT tax IDs.",
  },
];

export default function IngestPage() {
  const router = useRouter();

  // Tab state: "manual" | "csv" | "channel" | "sandbox"
  const [tab, setTab] = useState<"channel" | "manual" | "csv" | "sandbox">("channel");

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    content: "",
    channel: "support_ticket",
    customerLabel: "",
    sourceRef: "",
  });
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualSuccess, setManualSuccess] = useState(false);
  const [manualError, setManualError] = useState("");

  // CSV State
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvResult, setCsvResult] = useState<{ imported: number; failed: number; errors: any[] } | null>(null);
  const [csvError, setCsvError] = useState("");

  // Channel Live Sync State
  const [channelLoading, setChannelLoading] = useState<string | null>(null);
  const [channelResult, setChannelResult] = useState<string | null>(null);
  const [syncedRecords, setSyncedRecords] = useState<any[]>([]);

  // Sandbox Seeder State
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  // Submit Manual Form
  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    setManualError("");
    setManualSuccess(false);
    setManualSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manualForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setManualError(data.error ?? "Failed to save feedback");
        return;
      }

      setManualSuccess(true);
      setManualForm({ content: "", channel: "support_ticket", customerLabel: "", sourceRef: "" });
    } catch {
      setManualError("Something went wrong");
    } finally {
      setManualSubmitting(false);
    }
  }

  // Submit CSV Upload
  async function handleCsvSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setCsvError("");
    setCsvResult(null);
    setCsvUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/feedback/csv", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        setCsvError(json.error ?? "Failed to upload CSV");
        return;
      }

      setCsvResult(json.data);
      setFile(null);
    } catch {
      setCsvError("An error occurred during upload");
    } finally {
      setCsvUploading(false);
    }
  }

  // Trigger Real-Time Channel Pull
  async function handleChannelPull(channelName: string) {
    setChannelLoading(channelName);
    setChannelResult(null);

    try {
      const res = await fetch("/api/feedback/channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: channelName }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setChannelResult(json.data.message);
        if (json.data.records) {
          setSyncedRecords(json.data.records);
        }
      } else {
        setChannelResult(json.error || "Failed to pull from channel");
      }
    } catch (err: any) {
      setChannelResult("Failed to pull from channel: " + err.message);
    } finally {
      setChannelLoading(null);
    }
  }

  // Quick Seed All Channels
  async function handleQuickSeed() {
    setSeedLoading(true);
    setSeedSuccess(false);

    try {
      for (const ch of ["support_ticket", "app_store", "community", "nps_survey", "sales_call", "portal"]) {
        await fetch("/api/feedback/channel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel: ch }),
        });
      }
      setSeedSuccess(true);
    } catch {
      console.error("Failed to seed channels");
    } finally {
      setSeedLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      
      {/* Top Header Card */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
              Ingest Customer Feedback
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Real-Time NLP Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Connect live feedback streams, upload bulk CSV archives, or run simulated multi-channel ingestion with Claude AI sentiment analysis.
          </p>
        </div>

        <Link
          href="/inbox"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all shrink-0 self-start sm:self-auto"
        >
          <span>Open Inbox</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setTab("channel")}
          id="tab-channel"
          className={`pb-3.5 text-xs font-extrabold transition-all border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
            tab === "channel"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Live Integration Pull</span>
        </button>

        <button
          onClick={() => setTab("manual")}
          id="tab-manual"
          className={`pb-3.5 text-xs font-extrabold transition-all border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
            tab === "manual"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Manual Entry</span>
        </button>

        <button
          onClick={() => setTab("sandbox")}
          id="tab-sandbox"
          className={`pb-3.5 text-xs font-extrabold transition-all border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
            tab === "sandbox"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Preset Scenarios</span>
        </button>

        <button
          onClick={() => setTab("csv")}
          id="tab-csv"
          className={`pb-3.5 text-xs font-extrabold transition-all border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
            tab === "csv"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>CSV Import</span>
        </button>
      </div>

      {/* Tab 1: Live Channel Pull */}
      {tab === "channel" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-950 tracking-tight">
                Live Channel Ingestion & Real-Time AI Auto-Classification
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click <strong>"Pull Sync"</strong> on any channel to pull live feedback signals directly into your database. Claude NLP instantly classifies sentiment and assigns thematic tags.
              </p>
            </div>

            {channelResult && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center justify-between gap-3 animate-fade-in shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{channelResult}</span>
                </div>
                <Link
                  href="/inbox"
                  className="text-indigo-600 hover:text-indigo-800 underline font-extrabold shrink-0"
                >
                  View in Inbox →
                </Link>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: "support_ticket",
                  name: "Zendesk & Intercom",
                  icon: "🎫",
                  desc: "Pull support tickets & resolution ratings",
                  badge: "Customer Support",
                  color: "border-amber-200 bg-amber-50/40 text-amber-900",
                },
                {
                  id: "app_store",
                  name: "App Store & Google Play",
                  icon: "📱",
                  desc: "Pull mobile reviews and star ratings",
                  badge: "Mobile Stores",
                  color: "border-sky-200 bg-sky-50/40 text-sky-900",
                },
                {
                  id: "community",
                  name: "Discord & Slack Community",
                  icon: "💬",
                  desc: "Sync discussions and feature threads",
                  badge: "Community",
                  color: "border-purple-200 bg-purple-50/40 text-purple-900",
                },
                {
                  id: "nps_survey",
                  name: "Delighted & In-App NPS",
                  icon: "⭐",
                  desc: "Ingest survey responses and promoter scores",
                  badge: "Surveys & NPS",
                  color: "border-emerald-200 bg-emerald-50/40 text-emerald-900",
                },
              ].map((ch) => (
                <div
                  key={ch.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <span className="text-2xl">{ch.icon}</span>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">{ch.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{ch.desc}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {ch.badge}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      loading={channelLoading === ch.id}
                      onClick={() => handleChannelPull(ch.id)}
                      className="rounded-full px-5 text-xs font-bold border-slate-200 hover:bg-slate-100 text-slate-900"
                    >
                      Pull Sync
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Synced Signals Stream */}
          {syncedRecords.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider">
                    Newly Ingested & AI Classified Signals
                  </h3>
                  <p className="text-xs text-slate-500">Live database records generated in real time</p>
                </div>
                <Link
                  href="/inbox"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>Explore in Inbox</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {syncedRecords.map((item) => (
                  <div key={item.id} className="py-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-[11px] font-bold text-slate-400">
                        {item.customerLabel || item.sourceRef}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.sentiment && (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.sentiment === "POS"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : item.sentiment === "NEG"
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {item.sentiment === "POS" ? "Positive" : item.sentiment === "NEG" ? "Negative" : "Neutral"}
                          </span>
                        )}
                        {item.featureArea && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {item.featureArea}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      "{item.content}"
                    </p>

                    {item.rationale && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <strong className="text-slate-700 not-italic font-bold">AI Rationale:</strong> {item.rationale}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Manual Entry */}
      {tab === "manual" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-950 tracking-tight">Manual Feedback Ingestion</h3>
            <p className="text-xs text-slate-500 mt-0.5">Submit customer feedback directly for real-time Claude NLP classification.</p>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label htmlFor="content" className="block text-xs font-bold text-slate-800 mb-1.5">
                Feedback Content *
              </label>
              <textarea
                id="content"
                required
                rows={5}
                value={manualForm.content}
                onChange={(e) => setManualForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Paste customer feedback, review text, or support notes..."
                className="input-base text-xs resize-y"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="channel-select" className="block text-xs font-bold text-slate-800 mb-1.5">
                  Source Channel
                </label>
                <select
                  id="channel-select"
                  value={manualForm.channel}
                  onChange={(e) => setManualForm((f) => ({ ...f, channel: e.target.value }))}
                  className="input-base text-xs"
                >
                  {VALID_CHANNELS.map((ch) => (
                    <option key={ch} value={ch}>
                      {getChannelLabel(ch)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="customer-label" className="block text-xs font-bold text-slate-800 mb-1.5">
                  Customer ID / Name (Optional)
                </label>
                <input
                  id="customer-label"
                  type="text"
                  value={manualForm.customerLabel}
                  onChange={(e) => setManualForm((f) => ({ ...f, customerLabel: e.target.value }))}
                  placeholder="e.g. Acme Corp / User #12"
                  className="input-base text-xs"
                />
              </div>

              <div>
                <label htmlFor="source-ref" className="block text-xs font-bold text-slate-800 mb-1.5">
                  Source Reference / Ticket ID (Optional)
                </label>
                <input
                  id="source-ref"
                  type="text"
                  value={manualForm.sourceRef}
                  onChange={(e) => setManualForm((f) => ({ ...f, sourceRef: e.target.value }))}
                  placeholder="e.g. TICKET-9921"
                  className="input-base text-xs"
                />
              </div>
            </div>

            {manualError && <p className="text-xs font-bold text-rose-600">{manualError}</p>}
            {manualSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center justify-between">
                <span>✓ Feedback saved and auto-classified in database!</span>
                <Link href="/inbox" className="underline font-bold text-emerald-900">
                  View in Inbox →
                </Link>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="submit" loading={manualSubmitting} id="submit-feedback-btn" className="rounded-full px-6 text-xs font-bold">
                Ingest & AI Classify
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Live Scenario Sandbox */}
      {tab === "sandbox" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10 p-6 rounded-3xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-950">1-Click Live Dataset Seeder</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulate complete multi-channel feedback ingestion across all 6 integrations with real-time Claude NLP classification.
              </p>
            </div>
            <Button onClick={handleQuickSeed} loading={seedLoading} id="seed-all-btn" className="rounded-full text-xs font-bold shrink-0">
              {seedSuccess ? "✓ Seeded Complete Dataset" : "Seed All 6 Channels"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRESET_SCENARIOS.map((sc, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all space-y-3 cursor-pointer group"
                onClick={() => {
                  setManualForm({
                    content: sc.text,
                    channel: sc.channel,
                    customerLabel: sc.customer,
                    sourceRef: `DEMO-${i + 1}`,
                  });
                  setTab("manual");
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-950 group-hover:text-indigo-600 transition-colors">
                    {sc.title}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {getChannelLabel(sc.channel)}
                  </span>
                </div>
                <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed italic bg-slate-50 p-3 rounded-2xl border border-slate-100 font-medium">
                  "{sc.text}"
                </p>
                <div className="text-[11px] font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Load into Form & Run AI Classifier →
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: CSV Import */}
      {tab === "csv" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-950 tracking-tight">Bulk CSV Dataset Ingestion</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload any customer feedback spreadsheet. Column names like <code>content</code>, <code>feedback</code>, <code>review</code>, <code>comment</code>, or <code>text</code> are automatically detected.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const sampleCsv = `content,channel,customer,date\n"The mobile app takes 8s to load on iOS and crashes on filter change",app_store,iOS User #102,2026-08-17\n"Password reset emails take 20 minutes to arrive in inbox",support_ticket,Support Ticket #49102,2026-08-17\n"Love the new Ask LOOP Copilot! Answers executive questions instantly",community,@alex_growth,2026-08-17\n"Score 10/10 — Replaced three separate VoC tools for leadership",nps_survey,NPS Respondent #8821,2026-08-17`;
                const blob = new Blob([sampleCsv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "project-loop-sample-template.csv";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-full transition-colors self-start sm:self-auto shrink-0"
            >
              📥 Download Sample Template
            </button>
          </div>

          <form onSubmit={handleCsvSubmit} className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  const droppedFile = e.dataTransfer.files[0];
                  if (droppedFile.name.toLowerCase().endsWith(".csv") || droppedFile.type.includes("csv") || droppedFile.type.includes("text")) {
                    setFile(droppedFile);
                    setCsvError("");
                  } else {
                    setCsvError("Please drop a valid .csv file.");
                  }
                }
              }}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all cursor-pointer relative ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50/70 scale-[1.01] shadow-lg ring-4 ring-indigo-500/10"
                  : file
                  ? "border-emerald-300 bg-emerald-50/30"
                  : "border-slate-300 bg-slate-50/60 hover:bg-slate-50 hover:border-indigo-400"
              }`}
            >
              <input
                type="file"
                accept=".csv,text/csv,application/vnd.ms-excel,text/plain"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setCsvError("");
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="space-y-3 pointer-events-none">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100/70 text-indigo-700 mx-auto flex items-center justify-center text-xl font-bold">
                  {file ? "✓" : "📄"}
                </div>
                
                {file ? (
                  <div className="space-y-1">
                    <p className="text-sm font-extrabold text-slate-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-emerald-700 font-bold">
                      {(file.size / 1024).toFixed(1)} KB • Ready to Import & Auto-Classify
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">
                      {isDragging ? "Drop your CSV file here!" : "Drag & drop your CSV file here, or click to browse"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Supports any column naming (content, review, feedback, comment, text, date, channel)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {csvError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{csvError}</span>
              </div>
            )}

            {csvResult && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-2 animate-fade-in shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 font-extrabold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Successfully imported {csvResult.imported} customer signals!</span>
                  </div>
                  <Link
                    href="/inbox"
                    className="text-indigo-600 hover:text-indigo-800 underline font-extrabold"
                  >
                    View in Inbox →
                  </Link>
                </div>
                <p className="text-[11px] text-emerald-700">
                  All rows have been stored in the database and submitted for real-time Claude NLP auto-classification.
                </p>
                {csvResult.failed > 0 && (
                  <p className="text-amber-700 text-[11px]">
                    Skipped {csvResult.failed} empty rows.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              {file && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setFile(null);
                    setCsvResult(null);
                    setCsvError("");
                  }}
                  className="rounded-full text-xs font-bold"
                >
                  Clear File
                </Button>
              )}
              <Button
                type="submit"
                loading={csvUploading}
                disabled={!file}
                id="upload-csv-btn"
                className="rounded-full px-7 text-xs font-bold"
              >
                {csvUploading ? "Importing & Parsing..." : `Import ${file ? file.name : "CSV Dataset"}`}
              </Button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
