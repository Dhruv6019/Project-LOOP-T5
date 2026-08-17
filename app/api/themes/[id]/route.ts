// app/api/themes/[id]/route.ts
// GET | PATCH | DELETE for single theme

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth";
import { UpdateThemeSchema } from "@/lib/validations";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    const theme = await db.theme.findFirst({
      where: { id: params.id, workspaceId: session.user.workspaceId },
      include: {
        _count: { select: { feedbackThemes: true } },
        feedbackThemes: {
          take: 5,
          include: { feedback: { select: { id: true, content: true, sentiment: true, channel: true } } },
        },
      },
    });

    if (!theme) return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    return NextResponse.json({ data: theme });
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to fetch theme" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["ADMIN", "ANALYST"]);
    const body = await request.json();
    const parsed = UpdateThemeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await db.theme.findFirst({
      where: { id: params.id, workspaceId: session.user.workspaceId },
    });
    if (!existing) return NextResponse.json({ error: "Theme not found" }, { status: 404 });

    const updated = await db.theme.update({
      where: { id: params.id },
      data: parsed.data,
      include: { _count: { select: { feedbackThemes: true } } },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to update theme" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["ADMIN"]);
    const existing = await db.theme.findFirst({
      where: { id: params.id, workspaceId: session.user.workspaceId },
    });
    if (!existing) return NextResponse.json({ error: "Theme not found" }, { status: 404 });

    await db.theme.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { deleted: true } });
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to delete theme" }, { status: 500 });
  }
}
