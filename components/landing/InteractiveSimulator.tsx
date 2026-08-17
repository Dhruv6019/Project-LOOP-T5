"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  RefreshCw,
  Cpu,
  BarChart3,
  Search,
  Sliders
} from "lucide-react";

interface PresetFeedback {
  text: string;
  source: string;
  sentiment: number;
  sentimentLabel: "Positive" | "Negative" | "Neutral";
  category: string;
  urgency: "P0 Critical" | "P1 High" | "P2 Medium" | "P3 Low";
  rationale: string;
  action: string;
  vectorSimilarity: number;
}

const PRESETS: PresetFeedback[] = [
  {
    text: "App crashes every time I try to complete checkout on iOS 18 with Apple Pay. Lost my cart items twice!",
    source: "App Store Review ★☆☆☆☆",
    sentiment: -0.88,
    sentimentLabel: "Negative",
    category: "Mobile Checkout",
    urgency: "P0 Critical",
    rationale: "Customer experiences repeated transactional failure & data loss on iOS 18 payment tokenization.",
    action: "Patch ApplePay delegate callback and add optimistic cart persistence in v4.2.1",
    vectorSimilarity: 0.94,
  },
  {
    text: "The new Claude AI summary digest is incredible! It cut our sprint feedback triage from 6 hours to 15 mins.",
    source: "Zendesk Ticket #8921",
    sentiment: 0.95,
    sentimentLabel: "Positive",
    category: "AI Analytics & VoC",
    urgency: "P3 Low",
    rationale: "High customer delight with automated feedback synthesis; massive measurable time savings.",
    action: "Add to customer spotlight & expand multi-workspace export digests.",
    vectorSimilarity: 0.98,
  },
  {
    text: "Can we get automated CSV exports scheduled to Slack or S3 bucket? Otherwise loving the UI.",
    source: "Intercom Conversation",
    sentiment: 0.35,
    sentimentLabel: "Neutral",
    category: "Integrations & API",
    urgency: "P2 Medium",
    rationale: "Constructive feature enhancement request for automated reporting pipeline.",
    action: "Prioritize webhook & webhook-triggered S3/Slack sync in Q3 roadmap.",
    vectorSimilarity: 0.89,
  },
  {
    text: "Vector search latency is sluggish (>1.8s) when filtering across 50,000 feedback records simultaneously.",
    source: "Discord Community",
    sentiment: -0.65,
    sentimentLabel: "Negative",
    category: "Vector Search Engine",
    urgency: "P1 High",
    rationale: "Performance degradation during high-dimensional semantic search over large dataset collections.",
    action: "Implement HNSW vector quantization & warm cosine index caching.",
    vectorSimilarity: 0.91,
  },
];

export default function InteractiveSimulator() {
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [customText, setCustomText] = useState(PRESETS[0].text);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const needleRef = useRef<HTMLDivElement>(null);
  const scoreBadgeRef = useRef<HTMLDivElement>(null);
  const outputCardRef = useRef<HTMLDivElement>(null);

  const current = PRESETS[selectedPreset];

  const triggerAnalysis = (presetIndex: number) => {
    setSelectedPreset(presetIndex);
    setCustomText(PRESETS[presetIndex].text);
    setIsAnalyzing(true);

    const target = PRESETS[presetIndex];

    // GSAP Animate needle angle from -90deg (super negative) to +90deg (super positive)
    // Sentiment is -1.0 to +1.0 -> maps to -85deg to +85deg
    const targetAngle = target.sentiment * 85;

    if (needleRef.current) {
      gsap.to(needleRef.current, {
        rotate: targetAngle,
        duration: 1.1,
        ease: "elastic.out(1, 0.45)",
      });
    }

    if (scoreBadgeRef.current) {
      gsap.fromTo(
        scoreBadgeRef.current,
        { scale: 0.7, opacity: 0.5 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }
      );
    }

    if (outputCardRef.current) {
      gsap.fromTo(
        outputCardRef.current,
        { y: 10, opacity: 0.6 },
        { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" }
      );
    }

    setTimeout(() => {
      setIsAnalyzing(false);
    }, 400);
  };

  useEffect(() => {
    // Initial needle position
    if (needleRef.current) {
      gsap.set(needleRef.current, { rotate: current.sentiment * 85 });
    }
  }, []);

  const sentimentColor =
    current.sentiment > 0.3
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : current.sentiment < -0.2
      ? "text-rose-600 bg-rose-50 border-rose-200"
      : "text-amber-600 bg-amber-50 border-amber-200";

  const gaugeBg =
    current.sentiment > 0.3
      ? "from-emerald-500/20 to-emerald-500/5"
      : current.sentiment < -0.2
      ? "from-rose-500/20 to-rose-500/5"
      : "from-amber-500/20 to-amber-500/5";

  return (
    <div className="w-full bg-slate-950 text-white rounded-[36px] p-6 sm:p-10 lg:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Background glow meshes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-8 relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span>Interactive NLP Laboratory</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Real-Time Claude NLP & Vector Embeddings
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Select a live customer signal or test how Project LOOP instantly categorizes, scores sentiment, and formulates engineering actions.
          </p>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-3 self-start sm:self-center px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-mono text-slate-300">Model: Claude 3.5 Sonnet + Voyage-3</span>
        </div>
      </div>

      {/* Preset Selector Chips */}
      <div className="space-y-3 mb-8 relative z-10">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Choose a sample signal to test:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => triggerAnalysis(idx)}
              className={`p-3.5 text-left rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-2.5 ${
                selectedPreset === idx
                  ? "bg-indigo-600/20 border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.25)] text-white"
                  : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="truncate max-w-[130px] text-slate-300">{preset.source}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    preset.sentiment > 0.3
                      ? "bg-emerald-500/20 text-emerald-300"
                      : preset.sentiment < -0.2
                      ? "bg-rose-500/20 text-rose-300"
                      : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {preset.sentiment > 0 ? `+${preset.sentiment}` : preset.sentiment}
                </span>
              </div>
              <p className="text-xs font-medium line-clamp-2 text-slate-200">{preset.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
        {/* Left Column: Signal Input & Vector Match (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6 bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" /> Ingested Feedback Text
              </span>
              <span className="text-[11px] font-mono text-slate-400">{current.source}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 text-sm sm:text-base font-medium text-slate-100 leading-relaxed min-h-[90px] flex items-center">
              &ldquo;{current.text}&rdquo;
            </div>
          </div>

          {/* Real-time AI Rationale & Action Extracted */}
          <div ref={outputCardRef} className="space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5" /> AI Evidence & Rationale:
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {current.rationale}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5" /> Recommended Roadmap Action:
              </div>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
                {current.action}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Feature Cluster</span>
              <p className="text-xs sm:text-sm font-bold text-white truncate">{current.category}</p>
            </div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Priority Tier</span>
              <p
                className={`text-xs sm:text-sm font-bold truncate ${
                  current.urgency.includes("Critical")
                    ? "text-rose-400"
                    : current.urgency.includes("High")
                    ? "text-orange-400"
                    : "text-slate-300"
                }`}
              >
                {current.urgency}
              </p>
            </div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Cosine Match</span>
              <p className="text-xs sm:text-sm font-bold text-indigo-300 font-mono">
                {(current.vectorSimilarity * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Sentiment Dial Gauge & Radar (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900/90 to-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col items-center justify-between space-y-6 text-center">
          <div className="w-full flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Sentiment Calibration</span>
            <span className="font-mono text-indigo-400">Voyage Cosine 1536-dim</span>
          </div>

          {/* Semi-Circular Dial Meter */}
          <div className="relative w-56 h-32 mt-4 flex items-end justify-center">
            {/* Dial Arc Background */}
            <div className="w-56 h-28 rounded-t-full border-8 border-b-0 border-slate-700/60 relative overflow-hidden bg-slate-900/50">
              {/* Colored zone indicators */}
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 via-amber-500/20 to-emerald-500/20 pointer-events-none" />
            </div>

            {/* Pivot Point & Rotating Needle */}
            <div
              ref={needleRef}
              className="absolute bottom-0 left-1/2 w-1.5 h-24 bg-gradient-to-t from-white via-indigo-400 to-indigo-500 rounded-full origin-bottom shadow-[0_0_12px_rgba(99,102,241,0.9)] -translate-x-1/2"
              style={{ transform: "rotate(0deg)" }}
            >
              <div className="w-3 h-3 rounded-full bg-white absolute -top-1 left-1/2 -translate-x-1/2 shadow-md" />
            </div>

            {/* Pivot Center Cap */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-8 rounded-full bg-slate-900 border-2 border-indigo-400 flex items-center justify-center shadow-lg z-20">
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          {/* Scale Markers */}
          <div className="w-full flex justify-between px-6 text-[11px] font-bold text-slate-400 -mt-2">
            <span className="text-rose-400">-1.0 (Critical)</span>
            <span className="text-amber-400">0.0 (Neutral)</span>
            <span className="text-emerald-400">+1.0 (Delight)</span>
          </div>

          {/* Big Live Calculated Score Pill */}
          <div
            ref={scoreBadgeRef}
            className={`px-6 py-3 rounded-2xl border text-center space-y-0.5 ${
              current.sentiment > 0.3
                ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-300"
                : current.sentiment < -0.2
                ? "bg-rose-950/50 border-rose-500/50 text-rose-300"
                : "bg-amber-950/50 border-amber-500/50 text-amber-300"
            }`}
          >
            <div className="text-xs uppercase font-extrabold tracking-widest">
              {current.sentimentLabel} Sentiment
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono">
              {current.sentiment > 0 ? `+${current.sentiment.toFixed(2)}` : current.sentiment.toFixed(2)}
            </div>
          </div>

          {/* Instant Re-run Action */}
          <button
            onClick={() => triggerAnalysis((selectedPreset + 1) % PRESETS.length)}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 group shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
            <span>Cycle Next Signal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
