// app/api/feedback/[id]/route.ts
// GET: single feedback | PATCH: status update | DELETE: remove

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth";
import { UpdateFeedbackStatusSchema } from "@/lib/validations";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    const feedback = await db.feedback.findFirst({
      where: { id: params.id, workspaceId: session.user.workspaceId },
      include: {
        themes: {
          include: { theme: { select: { id: true, name: true, color: true } } },
        },
      },
    });

    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    return NextResponse.json({ data: feedback });
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["ADMIN", "ANALYST"]);
    const body = await request.json();
    const parsed = UpdateFeedbackStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    // Ensure item belongs to user's workspace
    const existing = await db.feedback.findFirst({
      where: { id: params.id, workspaceId: session.user.workspaceId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    const updated = await db.feedback.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
      include: {
        themes: { include: { theme: { select: { id: true, name: true, color: true } } } },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["ADMIN", "ANALYST"]);

    const existing = await db.feedback.findFirst({
      where: { id: params.id, workspaceId: session.user.workspaceId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    await db.feedback.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { deleted: true } });
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to delete feedback" }, { status: 500 });
  }
}
