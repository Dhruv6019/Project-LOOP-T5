"use client";
// app/(auth)/login/page.tsx
// Custom sign-in page with Google OAuth, Email/Password, and 1-Click Demo Accounts

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      setError("Failed to initialize Google login. Please try again.");
      setGoogleLoading(false);
    }
  }

  async function handleLogin(emailToUse?: string, passwordToUse?: string) {
    setError("");
    setLoading(true);

    const targetEmail = emailToUse ?? form.email;
    const targetPassword = passwordToUse ?? form.password;

    try {
      const result = await signIn("credentials", {
        email: targetEmail,
        password: targetPassword,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl p-5 sm:p-8 md:p-10 animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">Welcome back</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Sign in to your LOOP customer intelligence workspace</p>
      </div>

      {/* Google OAuth Login */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 text-xs font-bold shadow-2xs transition-all disabled:opacity-60"
      >
        <GoogleIcon className="w-4 h-4 shrink-0" />
        <span>{googleLoading ? "Connecting with Google…" : "Continue with Google"}</span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          or continue with email
        </span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="email" className="block text-xs font-bold text-slate-800 mb-1.5">
            Email Address
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
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="input-base text-xs rounded-xl"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="px-3.5 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-semibold">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || googleLoading}
          id="login-submit"
          className="btn-pill-dark w-full py-3 text-xs rounded-full font-bold shadow-sm hover:shadow-md transition-all"
        >
          {loading ? "Signing in…" : "Sign in to Workspace"}
        </button>
      </form>

      {/* 1-Click Quick Demo Account Logins */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
          Quick Demo Accounts (1-Click Login)
        </p>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleLogin("admin@acme.com", "Demo1234!")}
            className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-700 text-[11px] font-bold transition-all text-center shadow-2xs"
          >
            Admin Role
          </button>
          <button
            type="button"
            onClick={() => handleLogin("analyst@acme.com", "Demo1234!")}
            className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-all text-center shadow-2xs"
          >
            Analyst Role
          </button>
          <button
            type="button"
            onClick={() => handleLogin("viewer@acme.com", "Demo1234!")}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition-all text-center shadow-2xs"
          >
            Viewer Role
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center font-medium">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-slate-950 hover:underline font-bold">
          Create workspace
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-white rounded-3xl p-8 animate-pulse text-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
