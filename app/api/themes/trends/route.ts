// app/api/themes/trends/route.ts
// GET: theme volume over time + spike detection

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const QuerySchema = z.object({
  period: z.coerce.number().int().positive().default(30),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const workspaceId = session.user.workspaceId;

    const { searchParams } = new URL(request.url);
    const { period } = QuerySchema.parse({ period: searchParams.get("period") ?? 30 });

    const now = new Date();
    const currentStart = new Date(now.getTime() - period * 24 * 60 * 60 * 1000);
    const previousStart = new Date(now.getTime() - period * 2 * 24 * 60 * 60 * 1000);

    // Get all themes
    const themes = await db.theme.findMany({
      where: { workspaceId },
      include: { _count: { select: { feedbackThemes: true } } },
    });

    const trendData = await Promise.all(
      themes.map(async (theme: { id: string; name: string; color: string; description: string | null }) => {
        // Current period count
        const currentCount = await db.feedbackTheme.count({
          where: {
            themeId: theme.id,
            feedback: {
              workspaceId,
              createdAt: { gte: currentStart },
            },
          },
        });

        // Previous period count
        const previousCount = await db.feedbackTheme.count({
          where: {
            themeId: theme.id,
            feedback: {
              workspaceId,
              createdAt: { gte: previousStart, lt: currentStart },
            },
          },
        });

        // Weekly breakdown (last 8 weeks)
        const weeklyData = [];
        for (let w = 7; w >= 0; w--) {
          const weekStart = new Date(now.getTime() - (w + 1) * 7 * 24 * 60 * 60 * 1000);
          const weekEnd = new Date(now.getTime() - w * 7 * 24 * 60 * 60 * 1000);
          const count = await db.feedbackTheme.count({
            where: {
              themeId: theme.id,
              feedback: { workspaceId, createdAt: { gte: weekStart, lt: weekEnd } },
            },
          });
          weeklyData.push({
            week: weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            count,
          });
        }

        const changePercent =
          previousCount > 0
            ? Math.round(((currentCount - previousCount) / previousCount) * 100)
            : currentCount > 0
              ? 100
              : 0;

        return {
          theme: {
            id: theme.id,
            name: theme.name,
            color: theme.color,
            description: theme.description,
          },
          weeklyData,
          currentCount,
          previousCount,
          changePercent,
          isSpiking: changePercent >= 30 && currentCount >= 3,
        };
      }),
    );

    // Sort by current count descending
    trendData.sort((a: { currentCount: number }, b: { currentCount: number }) => b.currentCount - a.currentCount);

    return NextResponse.json({ data: trendData });
  } catch (error: any) {
    console.error("Trends error:", error);
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to fetch trends" }, { status: 500 });
  }
}
