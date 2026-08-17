// app/api/themes/route.ts
// GET: list all workspace themes | POST: create theme

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth";
import { CreateThemeSchema } from "@/lib/validations";
import { getThemeColorByIndex } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const workspaceId = session.user.workspaceId;

    const themes = await db.theme.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { feedbackThemes: true } },
      },
    });

    return NextResponse.json({ data: themes });
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to fetch themes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["ADMIN", "ANALYST"]);
    const body = await request.json();
    const parsed = CreateThemeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const workspaceId = session.user.workspaceId;
    const themeCount = await db.theme.count({ where: { workspaceId } });

    const theme = await db.theme.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        color: parsed.data.color ?? getThemeColorByIndex(themeCount),
        workspaceId,
      },
      include: { _count: { select: { feedbackThemes: true } } },
    });

    return NextResponse.json({ data: theme }, { status: 201 });
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to create theme" }, { status: 500 });
  }
}
