// app/api/dev/env/route.ts
// Developer Panel — Read and write .env file
// Protected by signed cryptographic session or DEV_PANEL_PASSWORD

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyDevSession } from "@/lib/dev-auth";

const ENV_PATH = path.resolve(process.cwd(), ".env");

function checkAuth(request: NextRequest): boolean {
  const token = request.headers.get("x-dev-token");
  return verifyDevSession(token);
}

// Parse .env file into key-value pairs, preserving comments
function parseEnv(content: string): Array<{ key: string; value: string; comment?: string; isComment: boolean; raw: string }> {
  return content.split("\n").map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("#") || trimmed === "") {
      return { key: "", value: "", comment: trimmed, isComment: true, raw: line };
    }
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) return { key: "", value: "", comment: line, isComment: true, raw: line };
    const key = line.slice(0, eqIdx).trim();
    const rawVal = line.slice(eqIdx + 1).trim();
    const value = rawVal.replace(/^["']|["']$/g, "");
    return { key, value, isComment: false, raw: line };
  });
}

// Serialize back to .env file format
function serializeEnv(entries: Array<{ key: string; value: string; isComment: boolean; comment?: string; raw: string }>): string {
  return entries
    .map((entry) => {
      if (entry.isComment) return entry.comment ?? "";
      // Preserve quotes if value has spaces or special chars
      const needsQuotes = /[\s#]/.test(entry.value);
      return `${entry.key}=${needsQuotes ? `"${entry.value}"` : entry.value}`;
    })
    .join("\n");
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const content = fs.readFileSync(ENV_PATH, "utf-8");
    const entries = parseEnv(content);
    // Mask sensitive values partially
    const masked = entries.map((e) => {
      if (e.isComment) return e;
      const sensitiveKeys = ["PASSWORD", "SECRET", "KEY", "TOKEN", "DATABASE_URL", "DIRECT_URL"];
      const isSensitive = sensitiveKeys.some((k) => e.key.toUpperCase().includes(k));
      return {
        ...e,
        displayValue: isSensitive && e.value.length > 8
          ? e.value.slice(0, 6) + "••••••" + e.value.slice(-4)
          : e.value,
      };
    });
    return NextResponse.json({ data: { entries: masked, raw: content } });
  } catch (err: any) {
    return NextResponse.json({ error: `Cannot read .env: ${err.message}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { updates } = body as { updates: Record<string, string> };

    const content = fs.readFileSync(ENV_PATH, "utf-8");
    let entries = parseEnv(content);

    // Apply updates
    Object.entries(updates).forEach(([key, value]) => {
      const idx = entries.findIndex((e) => !e.isComment && e.key === key);
      if (idx !== -1) {
        entries[idx] = { ...entries[idx], value, raw: `${key}=${value}` };
      } else {
        // Append new key
        entries.push({ key, value, isComment: false, raw: `${key}=${value}` });
      }
    });

    const newContent = serializeEnv(entries);
    fs.writeFileSync(ENV_PATH, newContent, "utf-8");

    return NextResponse.json({ data: { saved: true, message: `Updated ${Object.keys(updates).length} variable(s). Restart the server for changes to take effect.` } });
  } catch (err: any) {
    return NextResponse.json({ error: `Cannot write .env: ${err.message}` }, { status: 500 });
  }
}
