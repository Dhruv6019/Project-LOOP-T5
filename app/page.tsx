"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Database,
  Search,
  FileSpreadsheet,
  CheckCircle2,
  ChevronDown,
  Globe,
  TrendingUp,
  Cpu,
  BarChart3,
  Users,
  MessageSquare,
  Lock,
  Compass,
  Headphones,
  Mail,
  Send,
  Star
} from "lucide-react";
import confetti from "canvas-confetti";

import MouseFollower from "@/components/landing/MouseFollower";
import ParticleCanvas from "@/components/landing/ParticleCanvas";
import MagneticButton from "@/components/landing/MagneticButton";
import TiltCard from "@/components/landing/TiltCard";
import InteractiveSimulator from "@/components/landing/InteractiveSimulator";
import RoiCalculator from "@/components/landing/RoiCalculator";
import VoiceOfCustomerShowcase from "@/components/landing/VoiceOfCustomerShowcase";
import LoopLogo from "@/components/ui/LoopLogo";

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    q: "How does Project LOOP classify customer feedback?",
    a: "Project LOOP combines multi-tenant Claude 3.5 Sonnet NLP classification, Voyage AI 1536-dimensional semantic vector embeddings, and rule-based fallback engines. This enables instant sentiment scoring (-1.0 to 1.0), root-cause evidence extraction, feature area tagging, and grounded RAG Q&A with zero downtime.",
    category: "AI Engine",
  },
  {
    q: "Is customer feedback isolated between different workspaces?",
    a: "Yes, 100%. Every workspace operates within strict multi-tenant database boundaries using workspaceId isolation. Your customer records, support tickets, and vector embeddings are never shared or used to train public foundation models.",
    category: "Security",
  },
  {
    q: "Can I test Project LOOP without configuring external API keys?",
    a: "Absolutely! Project LOOP includes built-in rule-based fallback classification, deterministic vector search, and pre-seeded demo workspaces so you can test all 5 core modules out-of-the-box immediately.",
    category: "Getting Started",
  },
  {
    q: "What user roles and governance permissions are supported?",
    a: "Project LOOP supports 3 granular roles: ADMIN (workspace governance, member invites, role management), ANALYST (feedback ingestion, AI re-classification, theme clustering, VoC reports), and VIEWER (read-only dashboards and reports).",
    category: "Governance",
  },
  {
    q: "How does trend spike detection notify product managers?",
    a: "Our clustering algorithm monitors weekly topic velocity. When an emerging issue experiences greater than 30% surge over baseline, LOOP automatically flags it as a Spike Alert and computes an urgency severity score (P0 to P3).",
    category: "Features",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [activeTechIndex, setActiveTechIndex] = useState<number>(1);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("EN");
  const [activeHeroCard, setActiveHeroCard] = useState<string>("files");

  // GSAP hero animation refs
  const heroHeadingRef = useRef<HTMLHeadingElement>(null);
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const heroCardWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data && data.user) {
            router.replace("/dashboard");
          }
        }
      } catch (err) {
        // Not authenticated
      }
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    // GSAP Entrance Timeline
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (heroBadgeRef.current) {
      tl.fromTo(
        heroBadgeRef.current,
        { y: -20, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7 }
      );
    }

    if (heroHeadingRef.current) {
      tl.fromTo(
        heroHeadingRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.4"
      );
    }

    if (heroSubRef.current) {
      tl.fromTo(
        heroSubRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        "-=0.5"
      );
    }

    if (heroCtaRef.current) {
      tl.fromTo(
        heroCtaRef.current,
        { y: 20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6 },
        "-=0.4"
      );
    }

    if (heroCardWrapperRef.current) {
      tl.fromTo(
        heroCardWrapperRef.current,
        { y: 40, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "power2.out" },
        "-=0.3"
      );
    }
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.8 },
        colors: ["#F59E0B", "#6366F1", "#10B981"],
      });
      setTimeout(() => setSubscribed(false), 4000);
      setEmailInput("");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 font-sans selection:bg-amber-200 selection:text-slate-900 relative overflow-x-hidden">
      
      {/* Interactive GSAP Smooth Mouse Follower */}
      <MouseFollower />

      {/* ------------------------------------------------------------- */}
      {/* 1. FULL-WIDTH TOP AMBIENT MESH GRADIENTS & PARTICLE CANVAS    */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute top-0 left-0 right-0 w-full h-[1100px] overflow-hidden pointer-events-none -z-10">
        {/* Dynamic Interactive Particle Mesh */}
        <ParticleCanvas />

        {/* Warm Golden Peach Glow on Left */}
        <div className="absolute -top-36 -left-36 w-[800px] lg:w-[1100px] h-[800px] lg:h-[1100px] bg-gradient-to-br from-amber-200/50 via-orange-100/40 to-transparent rounded-full blur-[140px] opacity-80" />
        {/* Soft Sky Blue / Cyan Glow on Right */}
        <div className="absolute -top-32 -right-36 w-[850px] lg:w-[1150px] h-[850px] lg:h-[1150px] bg-gradient-to-bl from-sky-200/60 via-indigo-100/40 to-transparent rounded-full blur-[140px] opacity-70" />
        {/* Center ambient glow */}
        <div className="absolute top-52 left-1/2 -translate-x-1/2 w-full max-w-[1300px] h-[500px] bg-indigo-100/25 rounded-full blur-[160px]" />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. HIGH-END GLASS NAVBAR FOR GUESTS                           */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-6 sm:px-12 lg:px-20 py-3.5 transition-all">
        <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between">
          
          {/* Brand Logo: LOOP (Custom continuous vector wordmark) */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <LoopLogo size={30} className="text-slate-950 group-hover:text-indigo-600 transition-colors" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 leading-none">
                VoC AI
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#simulator" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <span>Live Simulator</span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold">Interactive</span>
            </a>
            <a href="#showcase" className="hover:text-indigo-600 transition-colors">Modules</a>
            <a href="#roi" className="hover:text-indigo-600 transition-colors">ROI Calculator</a>
            <a href="#technology" className="hover:text-indigo-600 transition-colors">Technology</a>
            <a href="#governance" className="hover:text-indigo-600 transition-colors">Security</a>
            <a href="#faqs" className="hover:text-indigo-600 transition-colors">FAQs</a>
          </nav>

          {/* Auth Actions: Magnetic Login / Get started */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-950 px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>

            <MagneticButton strength={0.25}>
              <Link
                href="/signup"
                className="btn-pill-dark text-xs px-5 sm:px-6 py-2.5 rounded-full font-bold shadow-md hover:shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </MagneticButton>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 3. HERO SECTION WITH GSAP REVEALS & 3D TILT MOCKUP            */}
      {/* ------------------------------------------------------------- */}
      <section className="w-full pt-14 sm:pt-20 pb-20 sm:pb-28 px-6 sm:px-12 lg:px-20 relative">
        <div className="w-full max-w-[1440px] mx-auto text-center space-y-8">
          
          {/* Social Proof Announcement Pill */}
          <div
            ref={heroBadgeRef}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/90 border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-md"
          >
            <div className="flex -space-x-2 overflow-hidden">
              <img
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Member"
              />
              <img
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                alt="Member"
              />
              <img
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                alt="Member"
              />
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Trusted by 500+ fast-moving product teams
            </span>
          </div>

          {/* Main Hero Headline */}
          <h1
            ref={heroHeadingRef}
            className="text-5xl sm:text-7xl lg:text-[84px] font-extrabold tracking-tight text-slate-950 leading-[1.04] max-w-5xl mx-auto text-balance"
          >
            Turn Customer Signals into{" "}
            <span className="text-gradient-radiant">
              Strategic Product Growth.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            ref={heroSubRef}
            className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed text-balance"
          >
            Auto-classify sentiment across Zendesk, Intercom, App Store and CSVs, cluster emerging themes with Claude NLP, and query your feedback with grounded Voyage AI vector precision.
          </p>

          {/* Primary CTA Buttons with GSAP Magnetic Interaction */}
          <div ref={heroCtaRef} className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton strength={0.3}>
              <Link
                href="/login"
                className="btn-pill-dark text-sm px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-indigo-500/25 hover:bg-indigo-600 inline-flex items-center gap-3 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Explore Live Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </MagneticButton>

            <MagneticButton strength={0.3}>
              <Link
                href="/signup"
                className="btn-pill-outline text-sm px-8 py-4 rounded-full font-bold shadow-sm hover:border-slate-400 bg-white"
              >
                Create Free Account
              </Link>
            </MagneticButton>
          </div>

          {/* ----------------------------------------------------------- */}
          {/* 3D TILT HERO APP INTERFACE MOCKUP                          */}
          {/* ----------------------------------------------------------- */}
          <div ref={heroCardWrapperRef} className="pt-10 sm:pt-14 w-full max-w-[1240px] mx-auto">
            <TiltCard
              className="bg-white border border-slate-200/90 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.12)] p-6 sm:p-10 lg:p-12 text-left"
              maxTilt={5}
              glowColor="rgba(99, 102, 241, 0.12)"
            >
              <div className="flex flex-col md:flex-row gap-8 lg:gap-10">
                
                {/* Left Mini Dock */}
                <div className="hidden sm:flex flex-col items-center justify-between py-2 px-1 border-r border-slate-100 pr-6 space-y-8">
                  <div className="space-y-6 text-slate-400">
                    <Link
                      href="/login"
                      className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-indigo-600 hover:text-white transition-all shadow-xs"
                    >
                      +
                    </Link>
                    <Link href="/login" className="w-9 h-9 flex items-center justify-center text-indigo-600 hover:text-slate-950 transition-colors">
                      <BarChart3 className="w-5 h-5" />
                    </Link>
                    <Link href="/login" className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-950 transition-colors">
                      <MessageSquare className="w-5 h-5" />
                    </Link>
                    <Link href="/login" className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-950 transition-colors">
                      <Layers className="w-5 h-5" />
                    </Link>
                    <Link href="/login" className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-950 transition-colors">
                      <Search className="w-5 h-5" />
                    </Link>
                  </div>

                  <div className="space-y-4 pt-10">
                    <Link href="/login" className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-950 transition-colors">
                      <Lock className="w-5 h-5" />
                    </Link>
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 shadow-2xs"
                      alt="User"
                    />
                  </div>
                </div>

                {/* Main Interactive Showcase Panel */}
                <div className="flex-1 space-y-7">
                  
                  {/* Top Greeting with 3D Crystal Orb */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-600 shadow-[0_6px_25px_rgba(56,189,248,0.55)] relative overflow-hidden flex items-center justify-center shrink-0 animate-pulse-glow">
                      <div className="absolute top-1.5 left-3.5 w-5 h-3 bg-white/80 rounded-full blur-[0.6px] transform -rotate-12" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-cursive text-2xl text-amber-500 font-bold leading-none">
                          Welcome back,
                        </span>
                        <h3 className="text-xl font-extrabold text-slate-950 leading-tight">
                          Product Leader
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                        LOOP has synthesized <strong>48 new customer signals</strong> in the last 24 hours.
                      </p>
                    </div>
                  </div>

                  {/* 4 Interactive Feature Tiles Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 pt-1">
                    
                    {/* 1. Bulk Ingestion & CSV */}
                    <div
                      onClick={() => setActiveHeroCard("files")}
                      onMouseEnter={() => setActiveHeroCard("files")}
                      className={`p-5 lg:p-6 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex items-center justify-between ${
                        activeHeroCard === "files"
                          ? "bg-slate-50/95 border-indigo-400 shadow-md scale-[1.01]"
                          : "bg-slate-50/50 border-slate-200/70 hover:bg-slate-50"
                      }`}
                    >
                      <div className="space-y-1.5 max-w-[220px]">
                        <h4 className="text-sm lg:text-base font-bold text-slate-900">Bulk Ingestion & CSV</h4>
                        <p className="text-xs text-slate-500 leading-snug">
                          Ingest feedback from CSV, Zendesk, Intercom, and App Store reviews.
                        </p>
                      </div>
                      <div className="relative w-16 h-14 flex items-center justify-center shrink-0">
                        <div className="absolute -left-1 top-0 w-11 h-14 bg-slate-900 rounded-xl shadow-md transform -rotate-6" />
                        <div className="absolute right-0 top-1 w-11 h-14 bg-white border border-slate-200 rounded-xl shadow-md p-2 space-y-1.5">
                          <div className="w-5 h-1.5 bg-emerald-400 rounded-full" />
                          <div className="w-7 h-1 bg-slate-200 rounded-full" />
                          <div className="w-6 h-1 bg-slate-200 rounded-full" />
                        </div>
                      </div>
                    </div>

                    {/* 2. Sentiment Classifier */}
                    <div
                      onClick={() => setActiveHeroCard("sentiment")}
                      onMouseEnter={() => setActiveHeroCard("sentiment")}
                      className={`p-5 lg:p-6 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex items-center justify-between ${
                        activeHeroCard === "sentiment"
                          ? "bg-slate-50/95 border-indigo-400 shadow-md scale-[1.01]"
                          : "bg-slate-50/50 border-slate-200/70 hover:bg-slate-50"
                      }`}
                    >
                      <div className="space-y-1.5 max-w-[220px]">
                        <h4 className="text-sm lg:text-base font-bold text-slate-900">Sentiment Classifier</h4>
                        <p className="text-xs text-slate-500 leading-snug">
                          Claude NLP scoring (-1.0 to +1.0) with granular evidence rationale.
                        </p>
                      </div>
                      <div className="relative w-16 h-14 flex items-center justify-center shrink-0">
                        <div className="absolute left-0 top-1 w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-sm font-bold shadow-xs">
                          +0.8
                        </div>
                        <div className="absolute right-0 bottom-0 w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center text-xs font-bold shadow-xs">
                          -0.6
                        </div>
                      </div>
                    </div>

                    {/* 3. Ask LOOP Copilot */}
                    <div
                      onClick={() => setActiveHeroCard("ask")}
                      onMouseEnter={() => setActiveHeroCard("ask")}
                      className={`p-5 lg:p-6 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex items-center justify-between ${
                        activeHeroCard === "ask"
                          ? "bg-slate-50/95 border-indigo-400 shadow-md scale-[1.01]"
                          : "bg-slate-50/50 border-slate-200/70 hover:bg-slate-50"
                      }`}
                    >
                      <div className="space-y-1.5 max-w-[220px]">
                        <h4 className="text-sm lg:text-base font-bold text-slate-900">Ask LOOP Copilot</h4>
                        <p className="text-xs text-slate-500 leading-snug">
                          Plain-English semantic search with verbatim customer citations.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                          <Search className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* 4. AI Theme Clustering */}
                    <div
                      onClick={() => setActiveHeroCard("themes")}
                      onMouseEnter={() => setActiveHeroCard("themes")}
                      className={`p-5 lg:p-6 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex items-center justify-between ${
                        activeHeroCard === "themes"
                          ? "bg-slate-50/95 border-indigo-400 shadow-md scale-[1.01]"
                          : "bg-slate-50/50 border-slate-200/70 hover:bg-slate-50"
                      }`}
                    >
                      <div className="space-y-1.5 max-w-[220px]">
                        <h4 className="text-sm lg:text-base font-bold text-slate-900">Themes & Spike Alerts</h4>
                        <p className="text-xs text-slate-500 leading-snug">
                          Automatic clustering with &gt;30% growth surge detection.
                        </p>
                      </div>
                      <div className="relative w-16 h-14 flex items-center justify-center shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 p-1.5 flex flex-col justify-between shadow-xs">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <span className="w-2 h-2 rounded-full bg-indigo-400" />
                          </div>
                          <span className="text-[9px] font-bold text-amber-700">+34% spike</span>
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                          !
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Interactive Prompt Bar */}
                  <div className="pt-2">
                    <Link
                      href="/login"
                      className="w-full bg-slate-100/90 border border-slate-200 rounded-full px-6 py-3.5 flex items-center justify-between text-sm text-slate-600 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-indigo-600 font-extrabold flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" /> Ask LOOP:
                        </span>
                        <span className="text-slate-500 group-hover:text-slate-900 font-medium">
                          &ldquo;What are the top complaints regarding mobile checkout latency?&rdquo;
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-xs group-hover:bg-indigo-600 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  </div>

                </div>
              </div>
            </TiltCard>
          </div>

          {/* ----------------------------------------------------------- */}
          {/* 3 VALUE HIGHLIGHT TILES WITH TILT & SPECULAR GLOW          */}
          {/* ----------------------------------------------------------- */}
          <div id="features" className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[1240px] mx-auto text-left">
            
            {/* Tile 1 */}
            <TiltCard
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm"
              glowColor="rgba(249, 115, 22, 0.15)"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
                  <Database className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-slate-900">Multi-Channel Aggregation</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Synthesize scattered customer signals from Helpdesk, App Store, Discord, and NPS surveys in seconds.
                  </p>
                </div>
              </div>
            </TiltCard>

            {/* Tile 2 */}
            <TiltCard
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm"
              glowColor="rgba(99, 102, 241, 0.15)"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-slate-900">Grounded VoC Precision</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Voyage AI vector embeddings ensure answers are strictly constrained to customer quotes with zero hallucination.
                  </p>
                </div>
              </div>
            </TiltCard>

            {/* Tile 3 */}
            <TiltCard
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm"
              glowColor="rgba(20, 184, 166, 0.15)"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-slate-900">C-Suite VoC Reports</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Generate executive decision digests with period sentiment shifts, theme growth deltas, and roadmap actions.
                  </p>
                </div>
              </div>
            </TiltCard>

          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. SECTION: INTERACTIVE REAL-TIME NLP SIMULATOR LAB           */}
      {/* ------------------------------------------------------------- */}
      <section id="simulator" className="py-20 px-6 sm:px-12 lg:px-20 w-full max-w-[1440px] mx-auto">
        <InteractiveSimulator />
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. SECTION: 5 CORE MODULES INTERACTIVE SHOWCASE               */}
      {/* ------------------------------------------------------------- */}
      <section id="showcase" className="py-20 px-6 sm:px-12 lg:px-20 w-full max-w-[1440px] mx-auto">
        <div className="text-center space-y-4 mb-14">
          <div className="pill-badge mx-auto text-xs px-4 py-1.5">Core Product Modules</div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950">
            Engineered for Modern Product Teams
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Everything your product, engineering, and customer success teams need to convert raw customer feedback into high-velocity roadmap decisions.
          </p>
        </div>

        <VoiceOfCustomerShowcase />
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. SECTION: INTERACTIVE ROI & ENGINEERING TIME CALCULATOR     */}
      {/* ------------------------------------------------------------- */}
      <section id="roi" className="py-20 px-6 sm:px-12 lg:px-20 w-full max-w-[1440px] mx-auto">
        <RoiCalculator />
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. SECTION: TECHNOLOGY & ARCHITECTURE BENTO GRID             */}
      {/* ------------------------------------------------------------- */}
      <section id="technology" className="py-24 sm:py-32 px-6 sm:px-12 lg:px-20 w-full max-w-[1440px] mx-auto">
        <div className="text-center space-y-4 mb-16">
          <div className="pill-badge mx-auto text-xs px-4 py-1.5">Technology & Multi-Tenant Architecture</div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950">
            Lead your Feedback Transformation
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Interactive Feature Selector with Hover Expansion */}
          <div className="md:col-span-6 space-y-4">
            
            {/* Item 0: Multi-Tenant Architecture */}
            <div
              onClick={() => setActiveTechIndex(0)}
              onMouseEnter={() => setActiveTechIndex(0)}
              className={`p-6 sm:p-7 rounded-3xl transition-all duration-300 cursor-pointer border ${
                activeTechIndex === 0
                  ? "bg-[#FEF9C3] border-[#FDE047] shadow-[0_10px_30px_-10px_rgba(250,204,21,0.3)] ring-2 ring-amber-400/20 scale-[1.01]"
                  : "bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/20 text-slate-700 shadow-xs"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 w-full">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                    activeTechIndex === 0 ? "bg-amber-400/30 text-amber-950" : "bg-slate-100 text-slate-700"
                  }`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 w-full">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        activeTechIndex === 0 ? "bg-amber-400/40 text-amber-900" : "bg-slate-100 text-slate-500"
                      }`}>
                        Governance
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-950 leading-snug">
                      Multi-tenant workspace isolation & RBAC
                    </h4>
                    
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        activeTechIndex === 0 ? "grid-rows-[1fr] opacity-100 pt-2" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                          Every database query and vector index is strictly partitioned by <code className="px-1.5 py-0.5 bg-amber-200/60 rounded text-[11px] font-mono">workspaceId</code>. Includes Admin, Analyst, and Viewer permission roles.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <span className={`text-xl font-light shrink-0 transition-transform duration-300 ${
                  activeTechIndex === 0 ? "rotate-45 text-amber-900 font-bold" : "rotate-0 text-slate-400"
                }`}>
                  +
                </span>
              </div>
            </div>

            {/* Item 1: Collaborative Intelligence */}
            <div
              onClick={() => setActiveTechIndex(1)}
              onMouseEnter={() => setActiveTechIndex(1)}
              className={`p-6 sm:p-7 rounded-3xl transition-all duration-300 cursor-pointer border ${
                activeTechIndex === 1
                  ? "bg-[#FEF08A] border-[#FACC15] shadow-[0_10px_30px_-10px_rgba(250,204,21,0.35)] ring-2 ring-amber-400/20 scale-[1.01]"
                  : "bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/20 text-slate-700 shadow-xs"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 w-full">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                    activeTechIndex === 1 ? "bg-amber-400/40 text-amber-950" : "bg-slate-100 text-slate-700"
                  }`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 w-full">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        activeTechIndex === 1 ? "bg-amber-400/50 text-amber-950" : "bg-slate-100 text-slate-500"
                      }`}>
                        AI Teamwork
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-950 leading-snug">
                      Seamlessly collaborates with your team and all channels
                    </h4>
                    
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        activeTechIndex === 1 ? "grid-rows-[1fr] opacity-100 pt-2" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                          Functions like an automated feedback analyst team member, categorizing signals across Zendesk, Intercom, App Store, and Discord while recommending sprint roadmap priorities.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <span className={`text-xl font-light shrink-0 transition-transform duration-300 ${
                  activeTechIndex === 1 ? "rotate-45 text-amber-950 font-bold" : "rotate-0 text-slate-400"
                }`}>
                  +
                </span>
              </div>
            </div>

            {/* Item 2: Voyage AI Semantic Search */}
            <div
              onClick={() => setActiveTechIndex(2)}
              onMouseEnter={() => setActiveTechIndex(2)}
              className={`p-6 sm:p-7 rounded-3xl transition-all duration-300 cursor-pointer border ${
                activeTechIndex === 2
                  ? "bg-[#FEF9C3] border-[#FDE047] shadow-[0_10px_30px_-10px_rgba(250,204,21,0.3)] ring-2 ring-amber-400/20 scale-[1.01]"
                  : "bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/20 text-slate-700 shadow-xs"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 w-full">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                    activeTechIndex === 2 ? "bg-amber-400/30 text-amber-950" : "bg-slate-100 text-slate-700"
                  }`}>
                    <Search className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 w-full">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        activeTechIndex === 2 ? "bg-amber-400/40 text-amber-900" : "bg-slate-100 text-slate-500"
                      }`}>
                        Vectors
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-950 leading-snug">
                      Voyage AI High-Dimensional Vectors
                    </h4>
                    
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        activeTechIndex === 2 ? "grid-rows-[1fr] opacity-100 pt-2" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                          Deterministic cosine similarity vector indexing delivers instant semantic Q&A queries across 100k+ customer records in under 200ms with zero hallucination.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <span className={`text-xl font-light shrink-0 transition-transform duration-300 ${
                  activeTechIndex === 2 ? "rotate-45 text-amber-900 font-bold" : "rotate-0 text-slate-400"
                }`}>
                  +
                </span>
              </div>
            </div>

            {/* Item 3: Automated VoC Reports */}
            <div
              onClick={() => setActiveTechIndex(3)}
              onMouseEnter={() => setActiveTechIndex(3)}
              className={`p-6 sm:p-7 rounded-3xl transition-all duration-300 cursor-pointer border ${
                activeTechIndex === 3
                  ? "bg-[#FEF9C3] border-[#FDE047] shadow-[0_10px_30px_-10px_rgba(250,204,21,0.3)] ring-2 ring-amber-400/20 scale-[1.01]"
                  : "bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/20 text-slate-700 shadow-xs"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 w-full">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                    activeTechIndex === 3 ? "bg-amber-400/30 text-amber-950" : "bg-slate-100 text-slate-700"
                  }`}>
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 w-full">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        activeTechIndex === 3 ? "bg-amber-400/40 text-amber-900" : "bg-slate-100 text-slate-500"
                      }`}>
                        Reporting
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-950 leading-snug">
                      Executive VoC Reports & Trend Spike Alerts
                    </h4>
                    
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        activeTechIndex === 3 ? "grid-rows-[1fr] opacity-100 pt-2" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                          Auto-generate executive PDF reports with period growth deltas, quote selections, and recommended sprint items whenever volume spikes &gt;30%.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <span className={`text-xl font-light shrink-0 transition-transform duration-300 ${
                  activeTechIndex === 3 ? "rotate-45 text-amber-900 font-bold" : "rotate-0 text-slate-400"
                }`}>
                  +
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Live Feed & Multi-Channel Sync */}
          <div className="md:col-span-6">
            <TiltCard className="bg-slate-100/90 rounded-[36px] p-8 sm:p-10 lg:p-12 border border-slate-200 relative shadow-sm">
              
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 shadow-xs">
                  <Mail className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-700 shadow-2xs">
                  {activeTechIndex === 0 && "STATUS: 100% TENANT ISOLATED"}
                  {activeTechIndex === 1 && "STATUS: MULTI-CHANNEL LISTENER ACTIVE"}
                  {activeTechIndex === 2 && "STATUS: VOYAGE VECTORS 1536-DIM"}
                  {activeTechIndex === 3 && "STATUS: EXECUTIVE REPORT READY"}
                </span>
              </div>

              {/* Dynamic Live Signal Thread Cards based on activeTechIndex */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 space-y-4">
                
                {/* Feedback Item 1 */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <span className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-[10px] font-bold">APP STORE</span>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 leading-none">Offline sync fails on checkout</h5>
                      <p className="text-[11px] text-rose-500 font-medium mt-1">Negative (-0.85) • Performance</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">NEW</span>
                </div>

                {/* Feedback Item 2 */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <span className="px-2 py-1 rounded bg-purple-50 text-purple-600 text-[10px] font-bold">ZENDESK</span>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 leading-none">Love the new AI summary feature!</h5>
                      <p className="text-[11px] text-emerald-600 font-medium mt-1">Positive (+0.92) • Analytics</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">REVIEWED</span>
                </div>

                {/* Feedback Item 3 */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between opacity-80">
                  <div className="flex items-center gap-3.5">
                    <span className="px-2 py-1 rounded bg-amber-50 text-amber-600 text-[10px] font-bold">NPS 9/10</span>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 leading-none">Onboarding flow was very smooth</h5>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">Positive (+0.70) • Onboarding</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">ACTIONED</span>
                </div>

              </div>
            </TiltCard>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 8. SECTION: GOVERNANCE & SECURITY                             */}
      {/* ------------------------------------------------------------- */}
      <section id="governance" className="py-20 px-6 sm:px-12 lg:px-20 w-full max-w-[1440px] mx-auto">
        <div className="relative rounded-[40px] overflow-hidden bg-slate-950 text-white min-h-[480px] p-8 sm:p-14 lg:p-16 flex flex-col justify-between shadow-2xl">
          
          {/* Scenic Misty Mountain Background Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80')",
            }}
          />
          {/* Dark gradient filter */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/50" />

          {/* Top Title */}
          <div className="relative z-10 text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-white/10 border border-white/15 text-slate-200 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Enterprise Governance & Privacy</span>
            </div>
            <h3 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Reliable, Safe,<br />
              and Validated
            </h3>
          </div>

          {/* 3 Translucent Frosted Glass Metric Cards */}
          <div className="relative z-10 pt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Stat 1 */}
            <div className="glass-dark rounded-3xl p-7 lg:p-8 text-center space-y-3 hover:border-white/25 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-white">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-mono">99.9%</p>
              <p className="text-xs lg:text-sm text-slate-300 font-medium">Uptime & Tenant Isolation</p>
            </div>

            {/* Stat 2 */}
            <div className="glass-dark rounded-3xl p-7 lg:p-8 text-center space-y-3 hover:border-white/25 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-white">
                <Users className="w-6 h-6 text-sky-400" />
              </div>
              <p className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-mono">500k+</p>
              <p className="text-xs lg:text-sm text-slate-300 font-medium">Customer Signals Classified</p>
            </div>

            {/* Stat 3 */}
            <div className="glass-dark rounded-3xl p-7 lg:p-8 text-center space-y-3 hover:border-white/25 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-white">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-mono">&lt; 0.2s</p>
              <p className="text-xs lg:text-sm text-slate-300 font-medium">Semantic Vector Latency</p>
            </div>

          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 9. SECTION: TESTIMONIALS & AMBIENT SPHERE CTA BANNER          */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 px-6 sm:px-12 lg:px-20 w-full max-w-[1440px] mx-auto">
        <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-b from-amber-50/90 via-amber-100/60 to-orange-100/90 border border-amber-200/70 p-10 sm:p-20 lg:p-24 text-center space-y-12 shadow-sm">
          
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-300/35 rounded-full blur-[120px] pointer-events-none" />

          {/* Center 3D Crystal Sphere Orb with Surrounding Floating Quotes */}
          <div className="relative max-w-3xl mx-auto py-12">
            
            {/* Central Glossy Crystal Sphere */}
            <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-cyan-200 via-sky-400 to-blue-600 shadow-[0_20px_70px_-5px_rgba(56,189,248,0.75)] mx-auto relative overflow-hidden flex items-center justify-center animate-pulse-glow">
              <div className="absolute top-3 left-8 w-20 h-12 bg-white/70 rounded-full blur-[1px] transform -rotate-12" />
              <div className="absolute bottom-5 right-8 w-16 h-8 bg-blue-300/45 rounded-full blur-[2px]" />
            </div>

            {/* Floating Quote 1 */}
            <div className="absolute -top-2 -left-2 sm:left-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-md text-left max-w-[230px] hidden sm:block animate-float">
              <div className="flex items-center gap-2 mb-1.5">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"
                  className="w-6 h-6 rounded-full object-cover"
                  alt="User"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-none">Sarah Jenkins</span>
                  <span className="text-[10px] text-slate-400">VP Product @ Scale</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-snug">
                &ldquo;Our team uses LOOP to synthesize feedback from 20,000 users weekly.&rdquo;
              </p>
            </div>

            {/* Floating Quote 2 */}
            <div className="absolute -top-2 -right-2 sm:right-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-md text-left max-w-[230px] hidden sm:block animate-float-delayed">
              <div className="flex items-center gap-2 mb-1.5">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80"
                  className="w-6 h-6 rounded-full object-cover"
                  alt="User"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-none">Michael Ross</span>
                  <span className="text-[10px] text-slate-400">Head of Engineering</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-snug">
                &ldquo;VoC reports help us prioritize product sprints with 100% confidence.&rdquo;
              </p>
            </div>

            {/* Floating Quote 3 */}
            <div className="absolute -bottom-2 -left-2 sm:left-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-md text-left max-w-[230px] hidden sm:block animate-float-delayed">
              <div className="flex items-center gap-2 mb-1.5">
                <img
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&auto=format&fit=crop&q=80"
                  className="w-6 h-6 rounded-full object-cover"
                  alt="User"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-none">David Cooper</span>
                  <span className="text-[10px] text-slate-400">Lead PM</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-snug">
                &ldquo;Saved 15+ hours weekly on manual feedback triage and tagging.&rdquo;
              </p>
            </div>

            {/* Floating Quote 4 */}
            <div className="absolute -bottom-2 -right-2 sm:right-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-md text-left max-w-[230px] hidden sm:block animate-float">
              <div className="flex items-center gap-2 mb-1.5">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&auto=format&fit=crop&q=80"
                  className="w-6 h-6 rounded-full object-cover"
                  alt="User"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-none">Melanie Jackson</span>
                  <span className="text-[10px] text-slate-400">Founder & CEO</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-snug">
                &ldquo;Ask LOOP copilot gives executives instant evidence-backed answers.&rdquo;
              </p>
            </div>

          </div>

          {/* Heading */}
          <div className="space-y-4 relative z-10">
            <h3 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-tight">
              Join Forward-Thinking<br />
              AI Product Leaders
            </h3>
          </div>

          {/* Email Subscription Bar */}
          <form
            onSubmit={handleSubscribe}
            className="max-w-xl mx-auto relative z-10 flex items-center bg-white rounded-full p-2.5 border border-slate-300 shadow-lg"
          >
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your work email address..."
              required
              className="w-full px-6 py-3 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="btn-pill-dark text-xs px-8 py-3.5 rounded-full font-bold shrink-0 bg-slate-950 hover:bg-indigo-600 transition-colors"
            >
              {subscribed ? "Subscribed! ✓" : "Get Notified"}
            </button>
          </form>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 10. SECTION: INTERACTIVE FAQS                                  */}
      {/* ------------------------------------------------------------- */}
      <section id="faqs" className="py-24 px-6 sm:px-12 lg:px-20 w-full max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column */}
          <div className="md:col-span-5 space-y-5">
            <div className="pill-badge text-xs px-4 py-1.5">Questions & Answers</div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-tight">
              Frequently<br />
              Asked<br />
              Questions
            </h2>
            <p className="text-sm lg:text-base text-slate-600 leading-relaxed max-w-sm">
              Find instant answers regarding Project LOOP multi-channel customer intelligence, data isolation, and API capabilities.
            </p>
            <div className="pt-3">
              <a
                href="#contact"
                className="btn-pill-dark text-xs px-7 py-3.5 rounded-full font-bold shadow-sm"
              >
                Contact Support
              </a>
            </div>
          </div>

          {/* Right Column: Accordion Items with Hover to Expand */}
          <div className="md:col-span-7 space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  onMouseEnter={() => setOpenFaq(index)}
                  className={`rounded-3xl border transition-all duration-300 overflow-hidden bg-white shadow-xs ${
                    isOpen
                      ? "border-indigo-400/80 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.15)] ring-2 ring-indigo-500/10"
                      : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/70"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full text-left p-6 lg:p-7 flex items-center justify-between text-sm lg:text-base font-bold text-slate-950 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full uppercase font-bold transition-colors ${
                        isOpen
                          ? "bg-indigo-600 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {faq.category}
                      </span>
                      <span className="leading-snug">{faq.q}</span>
                    </div>
                    <span className={`text-xl font-light ml-4 transition-transform duration-300 shrink-0 ${
                      isOpen ? "rotate-45 text-indigo-600 font-bold" : "rotate-0 text-slate-400"
                    }`}>
                      +
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="p-6 lg:p-7 pt-0 text-sm leading-relaxed text-slate-600 border-t border-slate-100 bg-slate-50/50">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 11. LUXURY ATMOSPHERIC FOOTER                                 */}
      {/* ------------------------------------------------------------- */}
      <footer id="contact" className="relative w-full bg-gradient-to-b from-[#F8FAFC] via-30%-[#EFF5FE] via-70%-[#D3E3FC] to-[#A8C7F8] text-slate-800 pt-20 sm:pt-28 pb-0 px-6 sm:px-12 lg:px-20 overflow-hidden">
        <div className="w-full max-w-[1440px] mx-auto space-y-16 relative z-10">
          
          {/* Top 3-Column Hero Grid: Left Contact + Center Dot Matrix CTA + Right Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-8 items-center justify-between">
            
            {/* Left Column: Socials, Email & Address */}
            <div className="md:col-span-4 space-y-6">
              {/* Social Icons Row */}
              <div className="flex items-center gap-4 text-slate-800">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full border border-slate-400/60 flex items-center justify-center hover:border-slate-900 hover:text-indigo-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                </a>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-lg border border-slate-400/60 flex items-center justify-center hover:border-slate-900 hover:text-indigo-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.97 0 1.75-.79 1.75-1.76s-.78-1.75-1.75-1.75a1.75 1.75 0 0 0-1.75 1.75c0 .97.78 1.76 1.75 1.76m1.39 9.74v-8.37H5.07v8.37h2.78z" />
                  </svg>
                </a>

                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="w-8 h-8 flex items-center justify-center hover:text-indigo-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>

              {/* Main Email */}
              <a
                href="mailto:support@projectloop.ai"
                className="text-xl sm:text-2xl font-bold text-slate-900 hover:text-indigo-600 transition-colors tracking-tight block"
              >
                support@projectloop.ai
              </a>
            </div>

            {/* Center Column: Interactive CTA Hub with Dot Matrix Grid Wings */}
            <div className="md:col-span-4 flex items-center justify-center">
              <div className="flex items-center gap-0 sm:gap-2">
                {/* Left Dot Matrix Wing */}
                <svg width="140" height="100" viewBox="0 0 140 100" fill="none" className="hidden lg:block overflow-visible opacity-75 select-none pointer-events-none">
                  <g fill="#93C5FD">
                    {Array.from({ length: 5 }).map((_, r) =>
                      Array.from({ length: 6 }).map((_, c) => (
                        <circle
                          key={`l-${r}-${c}`}
                          cx={15 + c * 16}
                          cy={16 + r * 16}
                          r={(r === 2 && c === 4) || (r === 1 && c === 2) ? "2.5" : "1.5"}
                          fill={(r === 2 && c === 4) || (r === 1 && c === 2) ? "#2563EB" : "#93C5FD"}
                          opacity={(r === 2 && c === 4) || (r === 1 && c === 2) ? "0.95" : "0.5"}
                        />
                      ))
                    )}
                  </g>
                  <path
                    d="M 95 16 L 110 16 A 10 10 0 0 1 120 26 L 120 40 A 10 10 0 0 0 130 50 L 140 50"
                    stroke="#93C5FD"
                    strokeWidth="1"
                    strokeDasharray="2.5 2.5"
                  />
                  <path
                    d="M 95 80 L 110 80 A 10 10 0 0 0 120 70 L 120 60 A 10 10 0 0 1 130 50 L 140 50"
                    stroke="#93C5FD"
                    strokeWidth="1"
                    strokeDasharray="2.5 2.5"
                  />
                </svg>

                {/* Center Get Started Pill Button */}
                <Link
                  href="/signup"
                  className="px-6 py-3 rounded-xl bg-slate-950 text-white font-bold text-sm shadow-xl flex items-center gap-2.5 hover:bg-slate-800 hover:scale-105 transition-all group shrink-0 border border-slate-800"
                >
                  <span className="tracking-tight text-white font-bold text-xs sm:text-sm">Get Started</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-slate-800 text-sky-400 border border-sky-400/30 tracking-wider">
                    FREE
                  </span>
                </Link>

                {/* Right Dot Matrix Wing */}
                <svg width="140" height="100" viewBox="0 0 140 100" fill="none" className="hidden lg:block overflow-visible opacity-75 select-none pointer-events-none">
                  <path
                    d="M 0 50 L 10 50 A 10 10 0 0 0 20 40 L 20 26 A 10 10 0 0 1 30 16 L 45 16"
                    stroke="#93C5FD"
                    strokeWidth="1"
                    strokeDasharray="2.5 2.5"
                  />
                  <path
                    d="M 0 50 L 10 50 A 10 10 0 0 1 20 60 L 20 70 A 10 10 0 0 0 30 80 L 45 80"
                    stroke="#93C5FD"
                    strokeWidth="1"
                    strokeDasharray="2.5 2.5"
                  />
                  <g fill="#93C5FD">
                    {Array.from({ length: 5 }).map((_, r) =>
                      Array.from({ length: 6 }).map((_, c) => (
                        <circle
                          key={`r-${r}-${c}`}
                          cx={45 + c * 16}
                          cy={16 + r * 16}
                          r={(r === 1 && c === 4) || (r === 3 && c === 2) ? "2.5" : "1.5"}
                          fill={(r === 1 && c === 4) || (r === 3 && c === 2) ? "#2563EB" : "#93C5FD"}
                          opacity={(r === 1 && c === 4) || (r === 3 && c === 2) ? "0.95" : "0.5"}
                        />
                      ))
                    )}
                  </g>
                </svg>
              </div>
            </div>

            {/* Right Column: Project LOOP Modules & Navigation */}
            <div className="md:col-span-4 flex flex-col items-start md:items-end space-y-3.5">
              <Link href="/dashboard" className="text-base sm:text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                Analytics Dashboard
              </Link>
              <Link href="/ask" className="text-base sm:text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                AI Copilot
              </Link>
              <Link href="/ingest" className="text-base sm:text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                Channel Ingestion
              </Link>
              <Link href="/themes" className="text-base sm:text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                Theme Intelligence
              </Link>
              <Link href="/reports" className="text-base sm:text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                Executive Reports
              </Link>
            </div>

          </div>

          {/* Bottom Row: Legal Terms, Copyright & Privacy Policy */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-600/90 font-medium pt-8 pb-4">
            <Link href="/terms" className="underline hover:text-slate-950 transition-colors">
              Terms and conditions
            </Link>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              © 2026 Project LOOP. All Rights Reserved
            </p>
            <Link href="/privacy" className="underline hover:text-slate-950 transition-colors">
              Privacy Policy
            </Link>
          </div>

        </div>

        {/* Massive Full-Width Architectural Brand Watermark ("loop") */}
        <div className="w-full text-center overflow-hidden leading-none select-none pointer-events-none -mb-8 sm:-mb-14 lg:-mb-24 pt-4">
          <span className="text-[130px] sm:text-[230px] md:text-[310px] lg:text-[390px] font-black tracking-tighter text-white/50 lowercase inline-block select-none">
            loop
          </span>
        </div>
      </footer>

    </div>
  );
}
