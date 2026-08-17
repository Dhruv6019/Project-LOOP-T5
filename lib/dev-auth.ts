// lib/dev-auth.ts
// Cryptographically secure authentication and session management for Developer Hub

import crypto from "crypto";
import fs from "fs";
import path from "path";

const ENV_PATH = path.resolve(process.cwd(), ".env");

/**
 * Dynamically gets the active DEV_PANEL_PASSWORD from process.env or .env file
 */
export function getDevPassword(): string {
  if (process.env.DEV_PANEL_PASSWORD) {
    return process.env.DEV_PANEL_PASSWORD;
  }

  try {
    if (fs.existsSync(ENV_PATH)) {
      const content = fs.readFileSync(ENV_PATH, "utf-8");
      const match = content.match(/^DEV_PANEL_PASSWORD=["']?([^"'\r\n]+)["']?/m);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  } catch {}

  return "dev-loop-2026";
}

const AUTH_SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "loop-dev-secret-salt-key-2026";

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function safeEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  if (bufA.length !== bufB.length) {
    // Prevent short-circuiting timing leaks
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verifies developer password safely
 */
export function verifyDevPassword(inputPassword: string): boolean {
  const currentPassword = getDevPassword();
  return safeEqual(inputPassword.trim(), currentPassword.trim());
}

/**
 * Generates a signed, time-limited cryptographic session token (Valid for 12 hours)
 */
export function generateDevSessionToken(): string {
  const payload = {
    role: "DEVELOPER_ADMIN",
    issuedAt: Date.now(),
    expiresAt: Date.now() + 12 * 60 * 60 * 1000, // 12 hours
    nonce: crypto.randomBytes(16).toString("hex"),
  };

  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(`${data}.${getDevPassword()}`)
    .digest("base64url");

  return `${data}.${signature}`;
}

/**
 * Verifies a developer session token or direct password token
 */
export function verifyDevSession(token: string | null): boolean {
  if (!token) return false;

  // Direct password match fallback
  if (verifyDevPassword(token)) return true;

  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;

    const [data, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(`${data}.${getDevPassword()}`)
      .digest("base64url");

    if (!safeEqual(signature, expectedSig)) return false;

    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return false; // Expired
    }

    return payload.role === "DEVELOPER_ADMIN";
  } catch {
    return false;
  }
}
