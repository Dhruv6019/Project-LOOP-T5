// app/api/auth/signup/route.ts
// Create a new user and workspace

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { SignUpSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = SignUpSchema.safeParse(body);

    if (!parsed.success) {
      // Log for Vercel function diagnostics — safe: logs field names and error, not values
      console.warn(
        "[signup] Zod validation failed. Received fields:",
        Object.keys(body ?? {}),
        "Errors:",
        JSON.stringify(parsed.error.flatten()),
      );
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, email, password, workspaceName } = parsed.data;

    // Check if email already exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    // Create workspace + admin user in a transaction
    const slug = slugify(workspaceName);
    const uniqueSlug = `${slug}-${Date.now()}`;

    const result = await db.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: { name: workspaceName, slug: uniqueSlug },
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash: await hashPassword(password),
          role: "ADMIN",
          workspaceId: workspace.id,
        },
        select: { id: true, name: true, email: true, role: true, workspaceId: true },
      });

      return { workspace, user };
    });

    return NextResponse.json(
      { data: result, message: "Account created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
