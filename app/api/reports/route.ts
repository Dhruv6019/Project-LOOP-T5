// app/api/reports/route.ts
// GET: list reports | POST: generate new VoC report

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth";
import { GenerateReportSchema } from "@/lib/validations";
import { generateReport } from "@/lib/ai";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const workspaceId = session.user.workspaceId;

    const reports = await db.report.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      include: {
        generatedBy: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({ data: reports });
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["ADMIN", "ANALYST"]);
    const body = await request.json();
    const parsed = GenerateReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const { title, periodStart, periodEnd } = parsed.data;
    const workspaceId = session.user.workspaceId;
    const start = new Date(periodStart);
    const end = new Date(periodEnd);
    const prevStart = new Date(start.getTime() - (end.getTime() - start.getTime()));

    // Pre-compute stats (no AI involved)
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

    // Sentiment counts
    const sentimentCounts = { POS: 0, NEU: 0, NEG: 0 };
    const prevSentimentCounts = { POS: 0, NEU: 0, NEG: 0 };
    feedback.forEach((f) => {
      if (f.sentiment) sentimentCounts[f.sentiment]++;
    });
    prevFeedback.forEach((f) => {
      if (f.sentiment) prevSentimentCounts[f.sentiment]++;
    });

    // Top themes with delta
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

    // Notable quotes (highest magnitude sentimentScore)
    const notableQuotes = feedback
      .filter((f) => f.sentimentScore != null && f.sentiment && f.content.length > 30)
      .sort((a, b) => Math.abs(b.sentimentScore!) - Math.abs(a.sentimentScore!))
      .slice(0, 5)
      .map((f) => ({
        content: f.content.slice(0, 200),
        channel: f.channel as any,
        sentiment: f.sentiment as any,
      }));

    const days = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const periodLabel = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    // Generate narrative via Claude
    const contentJson = await generateReport({
      totalItems: feedback.length,
      periodLabel,
      topThemes,
      sentimentCounts,
      prevSentimentCounts,
      notableQuotes,
    });

    // Save report
    const report = await db.report.create({
      data: {
        title,
        periodStart: start,
        periodEnd: end,
        contentJson: contentJson as any,
        workspaceId,
        generatedById: session.user.id,
      },
      include: { generatedBy: { select: { name: true, email: true } } },
    });

    return NextResponse.json({ data: report }, { status: 201 });
  } catch (error: any) {
    console.error("Report generation error:", error);
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
