"use client";
// app/dev/page.tsx
// Project LOOP — Developer Panel (Light Theme & Multi-AI Hub)
// Password-protected internal tools: Multi-AI Config (Anthropic, OpenAI, Gemini), .env editor, system diagnostics, DB metrics

import { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle, RefreshCw, Key, Server, Database, Sliders, ShieldCheck, Sparkles, LogOut, ArrowUpRight } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface EnvEntry {
  key: string;
  value: string;
  displayValue?: string;
  isComment: boolean;
  comment?: string;
  raw: string;
}

interface StatusCheck {
  status: "ok" | "error" | "warn";
  message: string;
  latencyMs?: number;
}

interface DevStatus {
  overallStatus: "ok" | "error" | "warn";
  checks: Record<string, StatusCheck>;
  timestamp: string;
  version: string;
}

const devFetch = (url: string, token: string, options?: RequestInit) =>
  fetch(url, { ...options, headers: { "x-dev-token": token, "Content-Type": "application/json", ...(options?.headers ?? {}) } });

export default function DevPanel() {
  const [token, setToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<"status" | "ai" | "env" | "db">("ai");

  // Status
  const [status, setStatus] = useState<DevStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Env
  const [envEntries, setEnvEntries] = useState<EnvEntry[]>([]);
  const [envEdits, setEnvEdits] = useState<Record<string, string>>({});
  const [envLoading, setEnvLoading] = useState(false);
  const [envSaving, setEnvSaving] = useState(false);
  const [envMessage, setEnvMessage] = useState("");
  const [envError, setEnvError] = useState("");
  const [envRevealKeys, setEnvRevealKeys] = useState<Set<string>>(new Set());

  // Check saved session token
  useEffect(() => {
    const saved = sessionStorage.getItem("dev-token");
    if (saved) { setToken(saved); setAuthed(true); }
  }, []);

  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/dev/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: tokenInput }),
      });
      const json = await res.json();
      if (res.ok && json.data?.token) {
        sessionStorage.setItem("dev-token", json.data.token);
        setToken(json.data.token);
        setAuthed(true);
      } else {
        setAuthError(json.error || "Invalid developer password. Access denied.");
      }
    } catch {
      setAuthError("Authentication service unreachable.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("dev-token");
    setToken("");
    setAuthed(false);
    setTokenInput("");
  };

  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res = await devFetch("/api/dev/status", token);
      const json = await res.json();
      if (json.data) setStatus(json.data);
    } finally { setStatusLoading(false); }
  }, [token]);

  const loadEnv = useCallback(async () => {
    setEnvLoading(true);
    setEnvError("");
    try {
      const res = await devFetch("/api/dev/env", token);
      const json = await res.json();
      if (json.data) { setEnvEntries(json.data.entries); setEnvEdits({}); }
      if (json.error) setEnvError(json.error);
    } finally { setEnvLoading(false); }
  }, [token]);

  useEffect(() => {
    if (authed) { loadStatus(); loadEnv(); }
  }, [authed, loadStatus, loadEnv]);

  const saveEnv = async () => {
    if (Object.keys(envEdits).length === 0) { setEnvMessage("No changes to save."); return; }
    setEnvSaving(true);
    setEnvMessage("");
    setEnvError("");
    try {
      const res = await devFetch("/api/dev/env", token, {
        method: "POST",
        body: JSON.stringify({ updates: envEdits }),
      });
      const json = await res.json();
      if (json.data?.message) {
        setEnvMessage(json.data.message);
        setEnvEdits({});
        await loadEnv();
        await loadStatus();
      }
      if (json.error) setEnvError(json.error);
    } finally { setEnvSaving(false); }
  };

  const getVal = (key: string, def = "") => envEdits[key] ?? envEntries.find((e) => e.key === key)?.value ?? def;

  const anthropicKey = getVal("ANTHROPIC_API_KEY");
  const openaiKey = getVal("OPENAI_API_KEY");
  const geminiKey = getVal("GEMINI_API_KEY") || getVal("GOOGLE_AI_API_KEY");

  const hasAnthropic = Boolean(anthropicKey && !anthropicKey.includes("dummy") && !anthropicKey.includes("demo-key") && anthropicKey.length > 15);
  const hasOpenAI = Boolean(openaiKey && !openaiKey.includes("dummy") && !openaiKey.includes("demo-key") && openaiKey.length > 15);
  const hasGemini = Boolean(geminiKey && !geminiKey.includes("dummy") && !geminiKey.includes("demo-key") && geminiKey.length > 15);

  const activeAICount = [hasAnthropic, hasOpenAI, hasGemini].filter(Boolean).length;
  const isAIMandatorySatisfied = activeAICount >= 1;

  // ─── LIGHT THEME LOGIN SCREEN ─────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 font-sans">
        <div className="w-full max-w-md">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/20 text-white mb-4">
              <Sparkles className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Project LOOP Developer Hub</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">Internal Configuration, Multi-AI Setup, & Diagnostics</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-8 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.06)] space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Developer Authentication</h2>
                <p className="text-[11px] text-slate-400">Restricted environment for project engineers</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Console Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoFocus
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-70 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loginLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>{loginLoading ? "Verifying Credentials..." : "Unlock Developer Console"}</span>
              </button>
            </form>
          </div>

          <div className="text-center mt-6">
            <a href="/dashboard" className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">
              ← Return to Public Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  let dbStats: Record<string, number> = {};
  try { dbStats = JSON.parse(status?.checks?.dbStats?.message ?? "{}"); } catch {}

  // ─── LIGHT THEME CONSOLE ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <header className="h-16 bg-white border-b border-slate-200/90 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 tracking-tight">LOOP Developer Hub</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100">
                PROD-DEV
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Multi-AI Architecture & System Control</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* AI Requirement Status Pill */}
          <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border ${
            isAIMandatorySatisfied
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}>
            <span className={`w-2 h-2 rounded-full ${isAIMandatorySatisfied ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            <span>{isAIMandatorySatisfied ? `AI Active (${activeAICount} Key${activeAICount > 1 ? "s" : ""})` : "AI Key Required"}</span>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="w-60 bg-white border-r border-slate-200/90 p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              Configuration
            </p>

            {[
              { id: "ai", label: "Multi-AI Provider", icon: Sparkles, badge: isAIMandatorySatisfied ? "Active" : "Required" },
              { id: "status", label: "System Diagnostics", icon: Server },
              { id: "env", label: ".env File Editor", icon: Sliders },
              { id: "db", label: "Database Overview", icon: Database },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-indigo-50 text-indigo-700 shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase ${
                      isAIMandatorySatisfied ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-1">
            <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              App Quick Links
            </p>
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/ingest", label: "Feedback Ingest" },
              { href: "/reports", label: "VoC Reports" },
              { href: "/ask", label: "Ask LOOP Copilot" },
              { href: "/admin", label: "Admin Console" },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <span>{l.label}</span>
                <ArrowUpRight className="w-3 h-3 text-slate-300" />
              </a>
            ))}
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 p-6 sm:p-8 max-w-5xl overflow-y-auto">

          {/* ─── TAB: MULTI-AI SETUP (MAIN FEATURE) ─── */}
          {activeTab === "ai" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Multi-AI Provider Hub</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configure your AI providers. <strong>At least 1 AI API Key is mandatory</strong> for feedback classification, VoC reports, and insights. Additional keys are optional fallbacks.
                    </p>
                  </div>

                  <button
                    onClick={saveEnv}
                    disabled={envSaving || Object.keys(envEdits).length === 0}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
                      Object.keys(envEdits).length > 0
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 cursor-pointer"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {envSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                    <span>{envSaving ? "Saving..." : `Save AI Config (${Object.keys(envEdits).length})`}</span>
                  </button>
                </div>

                {/* Mandatory AI Status Banner */}
                <div className={`mt-4 p-4 rounded-2xl border flex items-start gap-3.5 ${
                  isAIMandatorySatisfied
                    ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                    : "bg-amber-50/90 border-amber-200 text-amber-900"
                }`}>
                  {isAIMandatorySatisfied ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-xs font-bold">
                      {isAIMandatorySatisfied
                        ? `✓ Mandatory AI requirement satisfied (${activeAICount} active provider${activeAICount > 1 ? "s" : ""})`
                        : "⚠️ Action Required: At least 1 AI API Key is mandatory"}
                    </p>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      {isAIMandatorySatisfied
                        ? "Your system is fully operational. If multiple keys are set, LOOP uses automatic fallback if one provider quota exhausts."
                        : "Please enter a valid API key for either Anthropic, OpenAI, or Google Gemini below and click Save."}
                    </p>
                  </div>
                </div>
              </div>

              {envMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{envMessage}</span>
                </div>
              )}

              {/* Primary AI Provider Mode */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Primary AI Routing Strategy
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Select which provider takes primary priority, or choose Auto-Detect to dynamically use any valid key.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    AI_PROVIDER
                  </span>
                </div>

                <select
                  value={getVal("AI_PROVIDER", "auto")}
                  onChange={(e) => setEnvEdits((prev) => ({ ...prev, AI_PROVIDER: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                >
                  <option value="auto">🔄 Auto-Detect & Fallback (Anthropic → OpenAI → Google Gemini)</option>
                  <option value="anthropic">🟣 Anthropic Claude (Direct)</option>
                  <option value="openai">🟢 OpenAI (Direct)</option>
                  <option value="google">🔵 Google Gemini (Direct)</option>
                </select>
              </div>

              {/* Provider 1: Anthropic Claude */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                      🟣
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Anthropic Claude</h3>
                      <p className="text-[11px] text-slate-500">Claude Sonnet 4.6 / Claude 3.5 Sonnet / Haiku</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    hasAnthropic ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                  }`}>
                    {hasAnthropic ? "✓ Configured" : "Optional / Unset"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 font-mono">
                      ANTHROPIC_API_KEY
                    </label>
                    <input
                      type="password"
                      value={getVal("ANTHROPIC_API_KEY")}
                      onChange={(e) => setEnvEdits((prev) => ({ ...prev, ANTHROPIC_API_KEY: e.target.value }))}
                      placeholder="sk-ant-api03-..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 font-mono">
                      ANTHROPIC_MODEL
                    </label>
                    <select
                      value={getVal("ANTHROPIC_MODEL", "claude-sonnet-4-6")}
                      onChange={(e) => setEnvEdits((prev) => ({ ...prev, ANTHROPIC_MODEL: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                    >
                      <option value="claude-sonnet-4-6">claude-sonnet-4-6 (Default)</option>
                      <option value="claude-3-5-sonnet-20241022">claude-3-5-sonnet-20241022</option>
                      <option value="claude-haiku-4-5">claude-haiku-4-5 (Fastest)</option>
                      <option value="claude-opus-4-5">claude-opus-4-5 (Maximum Reasoning)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Provider 2: OpenAI */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      🟢
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">OpenAI</h3>
                      <p className="text-[11px] text-slate-500">GPT-4o / GPT-4o-mini / o3-mini</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    hasOpenAI ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                  }`}>
                    {hasOpenAI ? "✓ Configured" : "Optional / Unset"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 font-mono">
                      OPENAI_API_KEY
                    </label>
                    <input
                      type="password"
                      value={getVal("OPENAI_API_KEY")}
                      onChange={(e) => setEnvEdits((prev) => ({ ...prev, OPENAI_API_KEY: e.target.value }))}
                      placeholder="sk-proj-..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 font-mono">
                      OPENAI_MODEL
                    </label>
                    <select
                      value={getVal("OPENAI_MODEL", "gpt-4o-mini")}
                      onChange={(e) => setEnvEdits((prev) => ({ ...prev, OPENAI_MODEL: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                    >
                      <option value="gpt-4o-mini">gpt-4o-mini (Cost-effective & Fast)</option>
                      <option value="gpt-4o">gpt-4o (Flagship Model)</option>
                      <option value="o3-mini">o3-mini (Reasoning Model)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Provider 3: Google Gemini */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      🔵
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Google Gemini</h3>
                      <p className="text-[11px] text-slate-500">Gemini 2.0 Flash / Gemini 1.5 Pro</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    hasGemini ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                  }`}>
                    {hasGemini ? "✓ Configured" : "Optional / Unset"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 font-mono">
                      GEMINI_API_KEY (or GOOGLE_AI_API_KEY)
                    </label>
                    <input
                      type="password"
                      value={getVal("GEMINI_API_KEY") || getVal("GOOGLE_AI_API_KEY")}
                      onChange={(e) => setEnvEdits((prev) => ({ ...prev, GEMINI_API_KEY: e.target.value, GOOGLE_AI_API_KEY: e.target.value }))}
                      placeholder="AIzaSy..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 font-mono">
                      GEMINI_MODEL
                    </label>
                    <select
                      value={getVal("GEMINI_MODEL", "gemini-2.0-flash")}
                      onChange={(e) => setEnvEdits((prev) => ({ ...prev, GEMINI_MODEL: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                    >
                      <option value="gemini-2.0-flash">gemini-2.0-flash (Recommended)</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro (High Reasoning)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB: SYSTEM DIAGNOSTICS ─── */}
          {activeTab === "status" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">System Diagnostics</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Live connectivity checks across PostgreSQL, AI providers, and SMTP</p>
                </div>

                <button
                  onClick={loadStatus}
                  disabled={statusLoading}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-indigo-600 flex items-center gap-2 shadow-2xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${statusLoading ? "animate-spin" : ""}`} />
                  <span>{statusLoading ? "Running Checks..." : "Re-test Systems"}</span>
                </button>
              </div>

              {status && (
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(status.checks).map(([key, check]) => {
                    if (key === "dbStats" || key === "env") return null;
                    const isOk = check.status === "ok";
                    const isWarn = check.status === "warn";
                    return (
                      <div
                        key={key}
                        className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
                          isOk ? "bg-emerald-50/50 border-emerald-200" : isWarn ? "bg-amber-50/50 border-amber-200" : "bg-rose-50/50 border-rose-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                            isOk ? "bg-emerald-500" : isWarn ? "bg-amber-500" : "bg-rose-500"
                          }`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                {key === "database" ? "PostgreSQL (Neon)" : key === "anthropic" ? "Anthropic Claude" : key === "openai" ? "OpenAI" : key === "google" ? "Google Gemini" : "SMTP Server"}
                              </h4>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                                isOk ? "bg-emerald-100 text-emerald-800" : isWarn ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                              }`}>
                                {check.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-mono mt-1 break-all">{check.message}</p>
                          </div>
                        </div>
                        {check.latencyMs && (
                          <span className="text-[11px] font-bold text-slate-400 shrink-0 font-mono">
                            {check.latencyMs}ms
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: FULL .ENV FILE EDITOR ─── */}
          {activeTab === "env" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">.env File Editor</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Directly view and edit environment parameters</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={loadEnv}
                    disabled={envLoading}
                    className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600"
                  >
                    Reload
                  </button>
                  <button
                    onClick={saveEnv}
                    disabled={envSaving || Object.keys(envEdits).length === 0}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all ${
                      Object.keys(envEdits).length > 0 ? "bg-indigo-600 hover:bg-indigo-700 cursor-pointer" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {envSaving ? "Saving..." : `Save Changes (${Object.keys(envEdits).length})`}
                  </button>
                </div>
              </div>

              {envMessage && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">{envMessage}</div>}
              {envError && <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800">{envError}</div>}

              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
                {envEntries.map((entry, idx) => {
                  if (entry.isComment) {
                    return (
                      <div key={idx} className="p-2.5 bg-slate-50/70 text-[11px] font-mono text-slate-400 italic">
                        {entry.comment}
                      </div>
                    );
                  }
                  const curVal = envEdits[entry.key] ?? entry.value;
                  const isModified = envEdits[entry.key] !== undefined;
                  const isSensitive = ["PASSWORD", "SECRET", "KEY", "TOKEN", "DATABASE_URL", "DIRECT_URL"].some((k) => entry.key.toUpperCase().includes(k));
                  const isRevealed = envRevealKeys.has(entry.key);

                  return (
                    <div key={idx} className={`p-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center ${isModified ? "bg-indigo-50/40" : ""}`}>
                      <div className="sm:col-span-4 font-mono text-xs font-bold text-slate-700 truncate">
                        {entry.key}
                      </div>
                      <div className="sm:col-span-7 relative">
                        <input
                          type={isSensitive && !isRevealed ? "password" : "text"}
                          value={curVal}
                          onChange={(e) => setEnvEdits((prev) => ({ ...prev, [entry.key]: e.target.value }))}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <div className="sm:col-span-1 text-right">
                        {isSensitive && (
                          <button
                            type="button"
                            onClick={() => setEnvRevealKeys((prev) => {
                              const n = new Set(prev);
                              n.has(entry.key) ? n.delete(entry.key) : n.add(entry.key);
                              return n;
                            })}
                            className="text-[10px] font-bold text-slate-400 hover:text-slate-600"
                          >
                            {isRevealed ? "Hide" : "Show"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── TAB: DATABASE METRICS ─── */}
          {activeTab === "db" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Database Metrics</h2>
                <p className="text-xs text-slate-500 mt-0.5">Real-time table record counts from Neon PostgreSQL</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {[
                  { label: "Feedback Signals", count: dbStats.feedbackCount ?? 0, color: "text-indigo-600" },
                  { label: "Workspaces", count: dbStats.workspaceCount ?? 0, color: "text-violet-600" },
                  { label: "Team Users", count: dbStats.userCount ?? 0, color: "text-blue-600" },
                  { label: "VoC Reports", count: dbStats.reportCount ?? 0, color: "text-emerald-600" },
                  { label: "Thematic Clusters", count: dbStats.themeCount ?? 0, color: "text-amber-600" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs text-center">
                    <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
