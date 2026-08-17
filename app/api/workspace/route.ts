// app/api/workspace/route.ts
// Database-connected workspace settings management for Admins

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isAdmin } from "@/lib/auth";
import { z } from "zod";

const UpdateWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name cannot be empty").max(100, "Workspace name is too long"),
});

// GET /api/workspace — Get current workspace information
export async function GET() {
  try {
    const session = await requireAuth();
    const workspaceId = session.user.workspaceId;

    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        _count: {
          select: {
            users: true,
            feedback: true,
            themes: true,
            reports: true,
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    return NextResponse.json({ data: workspace });
  } catch (error: any) {
    console.error("GET Workspace error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch workspace details" },
      { status: error?.status || 500 }
    );
  }
}

// PATCH /api/workspace — Update workspace name (Admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();

    if (!isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: "Forbidden: Only workspace ADMINs can update workspace settings" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = UpdateWorkspaceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updatedWorkspace = await db.workspace.update({
      where: { id: session.user.workspaceId },
      data: { name: parsed.data.name.trim() },
    });

    return NextResponse.json({
      data: updatedWorkspace,
      message: "Workspace updated successfully in database",
    });
  } catch (error: any) {
    console.error("PATCH Workspace error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update workspace" },
      { status: error?.status || 500 }
    );
  }
}
