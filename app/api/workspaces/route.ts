// app/api/workspaces/route.ts
// Workspace / Workbook Management API for Admins

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const CreateWorkspaceSchema = z.object({
  name: z.string().min(2, "Workbook / Workspace name must be at least 2 characters").max(60),
  seedDemoData: z.boolean().optional(),
});

// GET /api/workspaces — List all workspaces
export async function GET() {
  try {
    const session = await requireAuth();

    const workspaces = await db.workspace.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    const activeWorkspace = workspaces.find((w) => w.id === session.user.workspaceId) || null;

    return NextResponse.json({
      data: workspaces,
      activeWorkspaceId: session.user.workspaceId,
      activeWorkspace,
    });
  } catch (error: any) {
    console.error("GET Workspaces error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch workbooks" },
      { status: error?.status || 500 }
    );
  }
}

// POST /api/workspaces — Create a new Workspace / Workbook (Admin Only)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    if (!isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: "Forbidden: Only ADMINs can create a new workspace / workbook" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = CreateWorkspaceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, seedDemoData } = parsed.data;
    const slug = slugify(name);
    const uniqueSlug = `${slug}-${Date.now().toString().slice(-6)}`;

    // Create new workspace and switch admin into it
    const newWorkspace = await db.$transaction(async (tx) => {
      const ws = await tx.workspace.create({
        data: {
          name,
          slug: uniqueSlug,
        },
      });

      // Switch current admin's active workspace
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          workspaceId: ws.id,
          role: "ADMIN",
        },
      });

      // Optional Seed Demo Feedback
      if (seedDemoData) {
        const seedItems = [
          {
            content: "Love the new dashboard search speed! Customer sentiment queries return instantly.",
            channel: "portal" as any,
            sentiment: "POS" as any,
            sentimentScore: 0.85,
            featureArea: "Performance",
            rationale: "Customer praises instantaneous search speed and satisfaction.",
            classified: true,
          },
          {
            content: "The CSV export failed when our team uploaded 10,000 feedback rows. Needs bigger batching.",
            channel: "support_ticket" as any,
            sentiment: "NEG" as any,
            sentimentScore: -0.65,
            featureArea: "Integrations",
            rationale: "Report of batch size export failure on large dataset.",
            classified: true,
          },
          {
            content: "Could we have a dark mode option for the dashboard analytics view?",
            channel: "community" as any,
            sentiment: "NEU" as any,
            sentimentScore: 0.1,
            featureArea: "UI/UX",
            rationale: "Neutral aesthetic feature request for dark mode theme.",
            classified: true,
          },
        ];

        for (const item of seedItems) {
          await tx.feedback.create({
            data: {
              ...item,
              workspaceId: ws.id,
            },
          });
        }

        // Create initial Theme
        await tx.theme.create({
          data: {
            name: "Performance & Reliability",
            description: "System latency, search responsiveness, and bulk stability",
            color: "#10B981",
            workspaceId: ws.id,
          },
        });
      }

      return ws;
    });

    return NextResponse.json({
      success: true,
      message: `Workbook "${name}" created successfully! Switched to new active workspace.`,
      data: newWorkspace,
    });
  } catch (error: any) {
    console.error("POST Create Workspace error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create workbook" },
      { status: error?.status || 500 }
    );
  }
}
