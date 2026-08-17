"use client";
// app/(auth)/signup/page.tsx
// Custom workspace signup page with Google OAuth (captures Workspace Name) & Credentials

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    workspaceName: "",
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignUp() {
    setError("");

    // Validate workspace name before Google OAuth sign up
    const trimmedWorkspace = form.workspaceName.trim();
    if (!trimmedWorkspace) {
      setError("Please enter your Company / Workspace name above to continue with Google.");
      const inputEl = document.getElementById("workspaceName");
      if (inputEl) {
        inputEl.focus();
      }
      return;
    }

    setGoogleLoading(true);
    try {
      // Store pending workspace name in cookie for NextAuth callback
      document.cookie = `pending_workspace_name=${encodeURIComponent(trimmedWorkspace)}; path=/; max-age=600; SameSite=Lax`;
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setError("Failed to initialize Google signup. Please try again.");
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Create workspace & admin user account
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create account");
        return;
      }

      // Auto sign in after signup
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created! Please sign in.");
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-10 animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">Create your workspace</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Start turning customer feedback into roadmap confidence
        </p>
      </div>

      {/* Workspace Information Field (Required for both Google & Credentials) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="workspaceName" className="block text-xs font-bold text-slate-800">
            Company / Workspace name <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] font-semibold text-slate-400">Step 1</span>
        </div>
        <input
          id="workspaceName"
          type="text"
          required
          value={form.workspaceName}
          onChange={(e) => setForm((f) => ({ ...f, workspaceName: e.target.value }))}
          className="input-base text-xs rounded-xl"
          placeholder="e.g. Acme Corp or Growth Team"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          Used to organize customer intelligence, feedback, and team members.
        </p>
      </div>

      {/* Google OAuth Signup Button */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 text-xs font-bold shadow-2xs transition-all disabled:opacity-60"
      >
        <GoogleIcon className="w-4 h-4 shrink-0" />
        <span>{googleLoading ? "Connecting with Google…" : "Sign up with Google"}</span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          or sign up with email
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs font-bold text-slate-800 mb-1.5">
            Your name
          </label>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input-base text-xs rounded-xl"
            placeholder="Alex Smith"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-bold text-slate-800 mb-1.5">
            Work email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="input-base text-xs rounded-xl"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-bold text-slate-800 mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="input-base text-xs rounded-xl"
            placeholder="Min. 8 characters, 1 uppercase, 1 number"
          />
        </div>

        {error && (
          <div className="px-3.5 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-semibold animate-fade-in">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || googleLoading}
          id="signup-submit"
          className="btn-pill-dark w-full py-3 text-xs rounded-full font-bold shadow-sm hover:shadow-md transition-all"
        >
          {loading ? "Creating workspace…" : "Create Free Workspace"}
        </button>
      </form>

      <p className="text-xs text-slate-400 text-center font-medium">
        Already have an account?{" "}
        <Link href="/login" className="text-slate-950 hover:underline font-bold">
          Sign in
        </Link>
      </p>
    </div>
  );
}
