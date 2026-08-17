// app/api/dev/login/route.ts
// Developer authentication endpoint with rate limiting & signed session token

import { NextRequest, NextResponse } from "next/server";
import { verifyDevPassword, generateDevSessionToken } from "@/lib/dev-auth";

// Basic in-memory rate-limiter (5 failed attempts per IP per 5 minutes)
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local";
    const now = Date.now();

    const record = loginAttempts.get(ip);
    if (record) {
      if (now < record.resetTime && record.count >= 6) {
        const remainingMinutes = Math.ceil((record.resetTime - now) / 60000);
        return NextResponse.json(
          { error: `Too many failed attempts. Please wait ${remainingMinutes} minute(s).` },
          { status: 429 }
        );
      }
      if (now >= record.resetTime) {
        loginAttempts.delete(ip);
      }
    }

    const body = await request.json();
    const { password } = body as { password?: string };

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const isValid = verifyDevPassword(password);

    if (!isValid) {
      const current = loginAttempts.get(ip) || { count: 0, resetTime: now + 5 * 60 * 1000 };
      loginAttempts.set(ip, { count: current.count + 1, resetTime: current.resetTime });
      return NextResponse.json({ error: "Invalid developer password. Access denied." }, { status: 401 });
    }

    // Reset attempts on successful login
    loginAttempts.delete(ip);

    // Generate signed cryptographic session token
    const token = generateDevSessionToken();

    return NextResponse.json({
      data: {
        token,
        authenticated: true,
        expiresIn: "12 hours",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
