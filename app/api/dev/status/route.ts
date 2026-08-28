import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";
import nodemailer from "nodemailer";
import { verifyDevSession } from "@/lib/dev-auth";

function checkAuth(request: NextRequest): boolean {
  const token = request.headers.get("x-dev-token");
  return verifyDevSession(token);
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, { status: "ok" | "error" | "warn"; message: string; latencyMs?: number }> = {};

  // 1. Database check
  try {
    const t0 = Date.now();
    const [feedbackCount, workspaceCount, userCount, reportCount, themeCount] = await Promise.all([
      db.feedback.count(),
      db.workspace.count(),
      db.user.count(),
      db.report.count(),
      db.theme.count(),
    ]);
    results.database = {
      status: "ok",
      latencyMs: Date.now() - t0,
      message: `Connected. ${feedbackCount} feedback, ${workspaceCount} workspace(s), ${userCount} user(s), ${reportCount} report(s), ${themeCount} theme(s).`,
    };
    results.dbStats = {
      status: "ok",
      message: JSON.stringify({ feedbackCount, workspaceCount, userCount, reportCount, themeCount }),
    };
  } catch (err: any) {
    results.database = { status: "error", message: `DB error: ${err.message}` };
  }

  // 2. Anthropic AI check
  const anthropicKey = process.env.ANTHROPIC_API_KEY || "";
  if (!anthropicKey || anthropicKey.includes("dummy") || anthropicKey.includes("demo-key") || anthropicKey.length < 20) {
    results.anthropic = { status: "warn", message: "ANTHROPIC_API_KEY not configured or placeholder." };
  } else {
    try {
      const t0 = Date.now();
      const client = new Anthropic({ apiKey: anthropicKey });
      const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
      const msg = await client.messages.create({
        model,
        max_tokens: 10,
        messages: [{ role: "user", content: "ping" }],
      });
      results.anthropic = {
        status: "ok",
        latencyMs: Date.now() - t0,
        message: `Connected. Model: ${model}. Stop reason: ${msg.stop_reason}.`,
      };
    } catch (err: any) {
      const isQuota = err?.message?.includes("credit balance") || err?.status === 429;
      results.anthropic = {
        status: isQuota ? "warn" : "error",
        message: isQuota ? "Anthropic reachable but quota/credits exhausted." : `Anthropic error: ${err.message}`,
      };
    }
  }

  // 3. OpenAI check
  const openaiKey = process.env.OPENAI_API_KEY || "";
  if (!openaiKey || openaiKey.includes("dummy") || openaiKey.includes("demo-key") || openaiKey.length < 15) {
    results.openai = { status: "warn", message: "OPENAI_API_KEY not configured." };
  } else {
    try {
      const t0 = Date.now();
      const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
      const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
        body: JSON.stringify({ model, messages: [{ role: "user", content: "ping" }], max_tokens: 5 }),
      });
      if (res.ok) {
        results.openai = {
          status: "ok",
          latencyMs: Date.now() - t0,
          message: `Connected. Model: ${model}. Status: 200 OK.`,
        };
      } else {
        const errData = await res.json().catch(() => ({}));
        const msg = errData?.error?.message || `Status ${res.status}`;
        results.openai = {
          status: res.status === 429 ? "warn" : "error",
          message: `OpenAI: ${msg}`,
        };
      }
    } catch (err: any) {
      results.openai = { status: "error", message: `OpenAI connection failed: ${err.message}` };
    }
  }

  // 4. Google Gemini check
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";
  if (!geminiKey || geminiKey.includes("dummy") || geminiKey.includes("demo-key") || geminiKey.length < 15) {
    results.google = { status: "warn", message: "GEMINI_API_KEY / GOOGLE_AI_API_KEY not configured." };
  } else {
    try {
      const t0 = Date.now();
      const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: "ping" }] }], generationConfig: { maxOutputTokens: 5 } }),
      });
      if (res.ok) {
        results.google = {
          status: "ok",
          latencyMs: Date.now() - t0,
          message: `Connected. Model: ${model}. Status: 200 OK.`,
        };
      } else {
        const errData = await res.json().catch(() => ({}));
        const msg = errData?.error?.message || `Status ${res.status}`;
        results.google = {
          status: res.status === 429 ? "warn" : "error",
          message: `Google Gemini: ${msg}`,
        };
      }
    } catch (err: any) {
      results.google = { status: "error", message: `Google Gemini connection failed: ${err.message}` };
    }
  }

  // 5. SMTP check
  try {
    const smtpHost = process.env.SMTP_HOST;
    if (!smtpHost) {
      results.smtp = { status: "warn", message: "SMTP_HOST not configured. Email features disabled." };
    } else {
      const t0 = Date.now();
      const transport = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
      });
      await transport.verify();
      results.smtp = {
        status: "ok",
        latencyMs: Date.now() - t0,
        message: `SMTP verified. Host: ${smtpHost}:${process.env.SMTP_PORT}. From: ${process.env.SMTP_FROM}`,
      };
    }
  } catch (err: any) {
    results.smtp = { status: "error", message: `SMTP error: ${err.message}` };
  }

  // 6. Environment config summary
  const envSummary: Record<string, string> = {
    NODE_ENV: process.env.NODE_ENV ?? "development",
    AI_PROVIDER: process.env.AI_PROVIDER ?? "auto",
    ANTHROPIC_KEY: isKeySet(anthropicKey) ? "Configured" : "Missing",
    OPENAI_KEY: isKeySet(openaiKey) ? "Configured" : "Missing",
    GEMINI_KEY: isKeySet(geminiKey) ? "Configured" : "Missing",
    ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
    OPENAI_MODEL: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    GEMINI_MODEL: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "https://projectloop.vercel.app",
    DATABASE_URL: process.env.DATABASE_URL ? (process.env.DATABASE_URL.includes("neon") ? "Neon PostgreSQL" : "Configured") : "Not set",
    SMTP_HOST: process.env.SMTP_HOST ?? "Not set",
    DEV_PANEL_PASSWORD: process.env.DEV_PANEL_PASSWORD ? "Set (custom)" : "Default (dev-loop-2026)",
  };

  results.env = { status: "ok", message: JSON.stringify(envSummary) };

  const overallStatus = Object.values(results).some((r) => r.status === "error") ? "error"
    : Object.values(results).some((r) => r.status === "warn") ? "warn" : "ok";

  return NextResponse.json({
    data: {
      overallStatus,
      checks: results,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "1.0.0",
    },
  });
}

function isKeySet(k: string): boolean {
  return Boolean(k && !k.includes("dummy") && !k.includes("demo-key") && k.length > 15);
}
