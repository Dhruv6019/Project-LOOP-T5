"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { TrendingUp, Clock, DollarSign, Users, Award, ArrowUpRight } from "lucide-react";
import confetti from "canvas-confetti";

export default function RoiCalculator() {
  const [monthlyFeedback, setMonthlyFeedback] = useState<number>(3500);
  const [teamSize, setTeamSize] = useState<number>(8);

  const hoursSavedRef = useRef<HTMLSpanElement>(null);
  const dollarSavedRef = useRef<HTMLSpanElement>(null);
  const speedGainRef = useRef<HTMLSpanElement>(null);

  // Math:
  // Manual triage: ~4 minutes per customer feedback item = (monthlyFeedback * 4) / 60 hours
  // With LOOP: ~90% reduction in manual triage time
  const manualHours = (monthlyFeedback * 4) / 60;
  const hoursSaved = Math.round(manualHours * 0.9);
  // Avg PM/Analyst cost ~$75/hr
  const dollarsSaved = Math.round(hoursSaved * 75);
  const speedMultiplier = 12; // 12x faster feedback to roadmap action

  useEffect(() => {
    // Animate numbers smoothly
    if (hoursSavedRef.current) {
      gsap.fromTo(
        hoursSavedRef.current,
        { innerText: 0 },
        {
          innerText: hoursSaved,
          duration: 0.6,
          snap: { innerText: 1 },
          ease: "power2.out",
        }
      );
    }

    if (dollarSavedRef.current) {
      gsap.fromTo(
        dollarSavedRef.current,
        { innerText: 0 },
        {
          innerText: dollarsSaved,
          duration: 0.6,
          snap: { innerText: 1 },
          ease: "power2.out",
        }
      );
    }
  }, [monthlyFeedback, teamSize, hoursSaved, dollarsSaved]);

  const fireCelebration = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ["#6366F1", "#F59E0B", "#10B981", "#38BDF8"],
    });
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/80 text-white rounded-2xl sm:rounded-[36px] p-4 sm:p-8 lg:p-14 border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
        
        {/* Left Column: Sliders */}
        <div className="lg:col-span-6 space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>ROI & Engineering Efficiency</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Calculate your team&apos;s time & cost savings
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Replace manual spreadsheets and delayed sprint meetings with instant auto-categorization and AI sentiment clustering.
            </p>
          </div>

          {/* Slider 1: Feedback Volume */}
          <div className="space-y-3 p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Monthly Customer Feedback Volume
              </label>
              <span className="text-sm font-extrabold font-mono text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-500/30">
                {monthlyFeedback.toLocaleString()} signals
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="25000"
              step="250"
              value={monthlyFeedback}
              onChange={(e) => setMonthlyFeedback(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>500 (Early Stage)</span>
              <span>10,000 (Growth)</span>
              <span>25,000+ (Enterprise)</span>
            </div>
          </div>

          {/* Slider 2: Team Members */}
          <div className="space-y-3 p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                Product & Engineering Team Size
              </label>
              <span className="text-sm font-extrabold font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                {teamSize} members
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="50"
              step="1"
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>2 PMs</span>
              <span>25 members</span>
              <span>50+ enterprise org</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Output Cards */}
        <div className="lg:col-span-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Card 1: Hours Saved */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 relative overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Hours Saved / Mo</p>
              <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono my-2 flex items-baseline gap-1">
                <span ref={hoursSavedRef}>{hoursSaved}</span>
                <span className="text-sm font-bold text-indigo-300 font-sans">hrs</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Eliminates manual tagging and spreadsheet sorting across all feedback channels.
              </p>
            </div>

            {/* Card 2: Estimated Value */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/30 relative overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Value Reclaimed</p>
              <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono my-2 flex items-baseline gap-1">
                <span className="text-2xl text-emerald-400">$</span>
                <span ref={dollarSavedRef}>{dollarsSaved.toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Engineering & PM capacity redirected from data entry into shipping high-impact features.
              </p>
            </div>

          </div>

          {/* Full Width Speedup Banner */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-extrabold text-xl shrink-0">
                12x
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Sprint Velocity Multiplier</h4>
                <p className="text-xs text-slate-400">
                  Discover critical regressions and feature surges weeks before standard quarterly surveys.
                </p>
              </div>
            </div>

            <button
              onClick={fireCelebration}
              className="px-5 py-3 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs shrink-0 inline-flex items-center gap-2 transition-transform active:scale-95 shadow-md"
            >
              <span>Unlock ROI</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
