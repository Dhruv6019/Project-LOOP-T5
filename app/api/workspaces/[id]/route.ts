// app/api/workspaces/[id]/route.ts
// Switch or Delete past Workspace / Workbook (Admin Only)

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isAdmin } from "@/lib/auth";

// PATCH /api/workspaces/[id] — Switch user's active workspace to [id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();

    if (!isAdmin(session.user.role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const targetWorkspaceId = params.id;

    const workspace = await db.workspace.findUnique({
      where: { id: targetWorkspaceId },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Target workspace not found" }, { status: 404 });
    }

    // Switch current user's workspace
    await db.user.update({
      where: { id: session.user.id },
      data: { workspaceId: targetWorkspaceId },
    });

    return NextResponse.json({
      success: true,
      message: `Active workspace switched to "${workspace.name}"`,
      data: workspace,
      activeWorkspaceId: targetWorkspaceId,
    });
  } catch (error: any) {
    console.error("PATCH Switch Workspace error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to switch workspace" },
      { status: error?.status || 500 }
    );
  }
}

// DELETE /api/workspaces/[id] — Delete past workspace (Admin Only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();

    if (!isAdmin(session.user.role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const targetWorkspaceId = params.id;

    // Check total workspaces
    const totalWorkspaces = await db.workspace.count();
    if (totalWorkspaces <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the only remaining workbook/workspace in the system." },
        { status: 400 }
      );
    }

    const workspace = await db.workspace.findUnique({
      where: { id: targetWorkspaceId },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // If deleting currently active workspace, find another workspace to switch to
    if (session.user.workspaceId === targetWorkspaceId) {
      const fallbackWorkspace = await db.workspace.findFirst({
        where: { id: { not: targetWorkspaceId } },
      });

      if (fallbackWorkspace) {
        await db.user.update({
          where: { id: session.user.id },
          data: { workspaceId: fallbackWorkspace.id },
        });
      }
    }

    // Delete workspace with cascade in DB
    await db.workspace.delete({
      where: { id: targetWorkspaceId },
    });

    return NextResponse.json({
      success: true,
      message: `Workbook "${workspace.name}" and all its records have been permanently deleted.`,
    });
  } catch (error: any) {
    console.error("DELETE Workspace error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete workspace" },
      { status: error?.status || 500 }
    );
  }
}
