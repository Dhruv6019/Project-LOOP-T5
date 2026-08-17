// app/api/feedback/classify/route.ts
// POST: Manually re-classify a feedback item

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { z } from "zod";
import { classifyFeedback, getWorkspaceThemeNames } from "@/lib/ai";
import { storeEmbedding } from "@/lib/embeddings";

const Schema = z.object({ feedbackId: z.string() });

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["ADMIN", "ANALYST"]);
    const body = await request.json();
    const parsed = Schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "feedbackId is required" }, { status: 400 });
    }

    const { feedbackId } = parsed.data;
    const workspaceId = session.user.workspaceId;

    const feedback = await db.feedback.findFirst({
      where: { id: feedbackId, workspaceId },
    });

    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    const themeNames = await getWorkspaceThemeNames(workspaceId);
    const result = await classifyFeedback(feedback.content, themeNames);

    // Resolve or create themes
    const themeIds: string[] = [];
    for (const themeName of result.themes) {
      let theme = await db.theme.findFirst({
        where: { workspaceId, name: { equals: themeName, mode: "insensitive" } },
      });
      if (!theme) {
        theme = await db.theme.create({
          data: { name: themeName, workspaceId, color: "#6366F1" },
        });
      }
      themeIds.push(theme.id);
    }

    // Remove old theme associations, add new ones
    await db.feedbackTheme.deleteMany({ where: { feedbackId } });

    const updated = await db.feedback.update({
      where: { id: feedbackId },
      data: {
        sentiment: result.sentiment,
        sentimentScore: result.sentimentScore,
        featureArea: result.featureArea,
        rationale: result.rationale,
        classified: true,
        themes: {
          createMany: {
            data: themeIds.map((themeId) => ({ themeId, confidence: 0.9 })),
            skipDuplicates: true,
          },
        },
      },
      include: {
        themes: { include: { theme: { select: { id: true, name: true, color: true } } } },
      },
    });

    // Re-embed
    await storeEmbedding(feedbackId, feedback.content);

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    console.error("Classify error:", error);
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Classification failed" }, { status: 500 });
  }
}
