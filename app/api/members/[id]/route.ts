// app/api/members/[id]/route.ts
// PATCH: update role | DELETE: remove member

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { UpdateMemberRoleSchema } from "@/lib/validations";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["ADMIN"]);
    const body = await request.json();
    const parsed = UpdateMemberRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    // Ensure target user is in the same workspace
    const target = await db.user.findFirst({
      where: { id: params.id, workspaceId: session.user.workspaceId },
    });
    if (!target) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    // Prevent self-demotion
    if (target.id === session.user.id) {
      return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: params.id },
      data: { role: parsed.data.role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to update member role" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["ADMIN"]);

    const target = await db.user.findFirst({
      where: { id: params.id, workspaceId: session.user.workspaceId },
    });
    if (!target) return NextResponse.json({ error: "Member not found in this workspace" }, { status: 404 });
    if (target.id === session.user.id) {
      return NextResponse.json({ error: "You cannot remove yourself" }, { status: 400 });
    }

    // Delete user record from workspace
    await db.user.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ data: { removed: true } });
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
