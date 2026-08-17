// app/api/reports/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth";
import { generateReport } from "@/lib/ai";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const isShare = searchParams.get("share") === "true";

    // Allow share links without auth check on workspaceId
    const report = isShare
      ? await db.report.findUnique({
          where: { id: params.id },
          include: { generatedBy: { select: { name: true, email: true } } },
        })
      : await db.report.findFirst({
          where: { id: params.id, workspaceId: session.user.workspaceId },
          include: { generatedBy: { select: { name: true, email: true } } },
        });

    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    return NextResponse.json({ data: report });
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["ADMIN", "ANALYST"]);
    const report = await db.report.findFirst({
      where: { id: params.id, workspaceId: session.user.workspaceId },
    });
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    await db.report.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { deleted: true } });
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}

// PATCH: edit title, manual content override, or AI-regenerate from real DB data
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(["ADMIN", "ANALYST"]);
    const workspaceId = session.user.workspaceId;
    const body = await request.json();
    const { title, regenerate, manualEdits } = body;

    const report = await db.report.findFirst({
      where: { id: params.id, workspaceId },
    });
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    let newContent = report.contentJson as any;

    // Manual edits: patch specific fields in contentJson
    if (manualEdits) {
      newContent = { ...newContent, ...manualEdits };
    }

    // AI regenerate: pull fresh data from DB and call Claude again
    if (regenerate) {
      const existingContent = report.contentJson as any;
      const start = new Date(report.periodStart);
      const end = new Date(report.periodEnd);
      const prevStart = new Date(start.getTime() - (end.getTime() - start.getTime()));

      const [feedback, prevFeedback, themes] = await Promise.all([
        db.feedback.findMany({
          where: { workspaceId, createdAt: { gte: start, lte: end } },
          include: { themes: { include: { theme: true } } },
        }),
        db.feedback.findMany({
          where: { workspaceId, createdAt: { gte: prevStart, lt: start } },
          select: { sentiment: true },
        }),
        db.theme.findMany({
          where: { workspaceId },
          include: {
            feedbackThemes: {
              where: { feedback: { createdAt: { gte: start, lte: end } } },
              include: { feedback: { select: { id: true } } },
            },
          },
        }),
      ]);

      const sentimentCounts = { POS: 0, NEU: 0, NEG: 0 };
      const prevSentimentCounts = { POS: 0, NEU: 0, NEG: 0 };
      feedback.forEach((f) => { if (f.sentiment) sentimentCounts[f.sentiment as keyof typeof sentimentCounts]++; });
      prevFeedback.forEach((f) => { if (f.sentiment) prevSentimentCounts[f.sentiment as keyof typeof prevSentimentCounts]++; });

      const prevThemeQuery = await db.feedbackTheme.groupBy({
        by: ["themeId"],
        where: { feedback: { workspaceId, createdAt: { gte: prevStart, lt: start } } },
        _count: { themeId: true },
      });
      const prevThemeMap = new Map(prevThemeQuery.map((t) => [t.themeId, t._count.themeId]));

      const topThemes = themes
        .map((theme) => ({
          name: theme.name,
          count: theme.feedbackThemes.length,
          delta: (() => {
            const prev = prevThemeMap.get(theme.id) ?? 0;
            if (prev === 0) return theme.feedbackThemes.length > 0 ? 100 : 0;
            return Math.round(((theme.feedbackThemes.length - prev) / prev) * 100);
          })(),
        }))
        .filter((t) => t.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const notableQuotes = feedback
        .filter((f) => f.sentimentScore != null && f.sentiment && f.content.length > 30)
        .sort((a, b) => Math.abs(b.sentimentScore!) - Math.abs(a.sentimentScore!))
        .slice(0, 5)
        .map((f) => ({ content: f.content.slice(0, 200), channel: f.channel as any, sentiment: f.sentiment as any }));

      const periodLabel = existingContent?.periodLabel ?? report.title;

      newContent = await generateReport({
        totalItems: feedback.length,
        periodLabel,
        topThemes,
        sentimentCounts,
        prevSentimentCounts,
        notableQuotes,
      });
    }

    const updated = await db.report.update({
      where: { id: params.id },
      data: {
        ...(title ? { title } : {}),
        contentJson: newContent,
      },
      include: { generatedBy: { select: { name: true, email: true } } },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}
