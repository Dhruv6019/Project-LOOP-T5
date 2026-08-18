"use client";

import React, { useState } from "react";
import {
  Inbox,
  Sparkles,
  Layers,
  Search,
  FileText,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Database,
  Terminal,
  BarChart2
} from "lucide-react";
import TiltCard from "./TiltCard";

export default function VoiceOfCustomerShowcase() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [copilotQuery, setCopilotQuery] = useState("What are customer thoughts on the new checkout flow?");
  const [isCopilotTyping, setIsCopilotTyping] = useState(false);

  const tabs = [
    {
      id: "ingestion",
      title: "1. Omni Ingestion",
      icon: Inbox,
      badge: "Real-time & CSV",
      heading: "Ingest scattered signals from any platform",
      description:
        "Connect Zendesk, Intercom, App Store Reviews, Discord, and bulk CSV files with automatic deduplication, validation, and multi-tenant scoping.",
    },
    {
      id: "nlp",
      title: "2. Claude NLP",
      icon: Sparkles,
      badge: "Calibrated -1.0 to +1.0",
      heading: "Automated Sentiment & Urgency Classification",
      description:
        "Extract grounded sentiment scores, root-cause evidence rationales, feature area tags, and urgency severity tiers with deterministic fallbacks.",
    },
    {
      id: "clustering",
      title: "3. Theme Clustering",
      icon: Layers,
      badge: ">30% Spike Detection",
      heading: "AI Theme Clustering & Trend Spike Detection",
      description:
        "Group thousands of unstructured customer notes into actionable thematic pillars. Detect sudden volume spikes before they impact retention.",
    },
    {
      id: "search",
      title: "4. Semantic Copilot",
      icon: Search,
      badge: "1536-dim Voyage Vectors",
      heading: "Grounded RAG Search with Customer Citations",
      description:
        "Ask plain-English questions and receive synthesized summaries backed by verbatim customer quotes, source metadata, and confidence scores.",
    },
    {
      id: "reports",
      title: "5. Executive VoC",
      icon: FileText,
      badge: "C-Suite PDF Digests",
      heading: "Executive VoC Reports & Sprint Action Digests",
      description:
        "Generate comprehensive VoC intelligence reports highlighting period-over-period sentiment shifts, top negative blockers, and roadmap priorities.",
    },
  ];

  const handleRunCopilot = (q: string) => {
    setCopilotQuery(q);
    setIsCopilotTyping(true);
    setTimeout(() => {
      setIsCopilotTyping(false);
    }, 600);
  };

  return (
    <div className="w-full space-y-8">
      {/* Tab Navigation Pill Bar */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((t, idx) => {
          const Icon = t.icon;
          const isActive = activeTab === idx;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(idx)}
              onMouseEnter={() => setActiveTab(idx)}
              className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 border ${
                isActive
                  ? "bg-slate-950 text-white border-slate-950 shadow-md scale-[1.02]"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-950 hover:border-slate-300"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
              <span>{t.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage Box */}
      <TiltCard
        className="w-full bg-white rounded-2xl sm:rounded-[36px] p-4 sm:p-8 lg:p-12 border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)]"
        glowColor="rgba(99, 102, 241, 0.1)"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Description & Feature Points */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase bg-indigo-50 text-indigo-600 border border-indigo-200/70">
                {tabs[activeTab].badge}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight leading-tight">
                {tabs[activeTab].heading}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {tabs[activeTab].description}
              </p>
            </div>

            {/* Sub-features list */}
            <div className="space-y-3 pt-2 text-xs font-medium text-slate-700">
              {activeTab === 0 && (
                <>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Instant CSV parser with smart column auto-mapping</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Real-time webhook sync from Zendesk & Intercom</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Workspace-level data isolation & customer privacy</span>
                  </div>
                </>
              )}

              {activeTab === 1 && (
                <>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Continuous sentiment scoring from -1.0 (Critical) to +1.0 (Delight)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Multi-label feature area tagging & priority tier classification</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Deterministic rule-based fallback when offline</span>
                  </div>
                </>
              )}

              {activeTab === 2 && (
                <>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Unsupervised semantic theme clustering into actionable topics</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Automated +30% volume spike alarms sent directly to PMs</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Trend momentum and historical volume velocity charts</span>
                  </div>
                </>
              )}

              {activeTab === 3 && (
                <>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>High-dimensional Voyage AI vector embeddings</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Grounded answers with direct links to customer feedback citations</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Zero hallucination constraint across workspace datasets</span>
                  </div>
                </>
              )}

              {activeTab === 4 && (
                <>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>One-click C-suite PDF synthesis and markdown reports</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Period-over-period sentiment distribution changes</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Curated quotes and prioritized roadmap recommendations</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Live Dynamic Visual Representation */}
          <div className="lg:col-span-7 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden shadow-inner">
            
            {/* Visual 0: Ingestion Visual */}
            {activeTab === 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Database className="w-4 h-4 text-indigo-400" />
                    <span>Multi-Channel Ingestion Pipeline</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                    LIVE LISTENER ACTIVE
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-mono text-slate-300">Zendesk Webhook</span>
                      <span className="text-slate-400">#9842 &ldquo;Billing page invoice missing&rdquo;</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400">INGESTED (12ms)</span>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="font-mono text-slate-300">App Store RSS</span>
                      <span className="text-slate-400">5★ &ldquo;Love the clean UI & dark mode&rdquo;</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-400">CLASSIFIED</span>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="font-mono text-slate-300">Bulk CSV Upload</span>
                      <span className="text-slate-400">q3_nps_survey_export.csv (1,450 rows)</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400">100% PARSED</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-300">
                  <span>Workspace boundary: <strong className="text-white">ws_production_prod</strong></span>
                  <span className="font-mono text-indigo-200">100% Isolated</span>
                </div>
              </div>
            )}

            {/* Visual 1: NLP Classifier Visual */}
            {activeTab === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Claude 3.5 Sonnet NLP Engine
                  </span>
                  <span className="font-mono text-slate-400">Confidence: 99.4%</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">Raw Feedback:</span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                      SCORE: -0.74
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-serif italic">
                    &ldquo;The export tool times out every time we select date ranges older than 6 months.&rdquo;
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Extracted Intent</span>
                    <p className="font-bold text-white">Database Query Timeout</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Urgency Severity</span>
                    <p className="font-bold text-rose-400">P1 - High (Core Feature)</p>
                  </div>
                </div>
              </div>
            )}

            {/* Visual 2: Theme Clustering Visual */}
            {activeTab === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Active Thematic Clusters
                  </span>
                  <span className="text-amber-400 text-[10px] font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                    ⚠️ 1 Spike Alert Triggered
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        Mobile Checkout Crashes
                        <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-extrabold">
                          +42% SPIKE
                        </span>
                      </h5>
                      <p className="text-[11px] text-amber-200/80 mt-0.5">84 mentions across iOS 18 devices</p>
                    </div>
                    <span className="text-xs font-extrabold text-rose-400 font-mono">-0.82 Sentiment</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white">AI VoC Digest Satisfaction</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">142 mentions • Steady volume</p>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-400 font-mono">+0.91 Sentiment</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white">Dark Mode & UI Polish</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">63 mentions • Growing trend</p>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-400 font-mono">+0.88 Sentiment</span>
                  </div>
                </div>
              </div>
            )}

            {/* Visual 3: Semantic Copilot Visual */}
            {activeTab === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-400" /> Grounded Copilot RAG
                  </span>
                  <span className="text-[10px] font-mono text-indigo-300">Voyage Cosine Match</span>
                </div>

                {/* Sample Question Chips */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => handleRunCopilot("What are top user requests for billing?")}
                    className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-[10px] font-medium text-slate-300 whitespace-nowrap"
                  >
                    &ldquo;Billing requests?&rdquo;
                  </button>
                  <button
                    onClick={() => handleRunCopilot("Why are users complaining about search latency?")}
                    className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-[10px] font-medium text-slate-300 whitespace-nowrap"
                  >
                    &ldquo;Search latency causes?&rdquo;
                  </button>
                </div>

                {/* Copilot Answer Display */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Synthesized VoC Answer:
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {isCopilotTyping ? (
                      <span className="text-slate-400 animate-pulse">Querying 1536-dimensional vector space...</span>
                    ) : (
                      "Across 89 recent customer signals, 64% of users praise the AI summary speed, while 28% report timeouts when filtering large historical CSV files."
                    )}
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-indigo-400">Verbatim Citation [Ticket #8841]:</div>
                    <p className="italic text-slate-400">&ldquo;Summaries work in 2 seconds, but exporting 50k rows times out.&rdquo;</p>
                  </div>
                </div>
              </div>
            )}

            {/* Visual 4: VoC Reports Visual */}
            {activeTab === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-teal-400" /> Q3 Executive VoC Digest
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Period: Last 30 Days</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Total Signals</span>
                    <p className="text-base font-extrabold text-white font-mono">4,812</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Avg Sentiment</span>
                    <p className="text-base font-extrabold text-emerald-400 font-mono">+0.68</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">P0 Roadblocks</span>
                    <p className="text-base font-extrabold text-rose-400 font-mono">2 Active</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-500/30 text-xs text-slate-200 space-y-1.5">
                  <strong className="text-teal-300">Executive Summary:</strong>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Customer sentiment improved by +18% following the v4 release. Core PM action required is addressing mobile checkout drop-offs to protect conversion.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      </TiltCard>
    </div>
  );
}
