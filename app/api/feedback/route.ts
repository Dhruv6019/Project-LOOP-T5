// app/api/feedback/route.ts
// GET: List feedback with filters + pagination
// POST: Create single feedback item

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth";
import { CreateFeedbackSchema, FeedbackFiltersSchema } from "@/lib/validations";
import { classifyFeedback, getWorkspaceThemeNames } from "@/lib/ai";
import { storeEmbedding } from "@/lib/embeddings";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);

    const filters = FeedbackFiltersSchema.parse({
      search: searchParams.get("search") ?? undefined,
      channel: searchParams.getAll("channel"),
      sentiment: searchParams.getAll("sentiment"),
      themeIds: searchParams.getAll("themeIds"),
      status: searchParams.getAll("status"),
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
    });

    const { page, limit, search, channel, sentiment, themeIds, status, dateFrom, dateTo } = filters;
    const skip = (page - 1) * limit;
    const workspaceId = session.user.workspaceId;

    const where: Prisma.FeedbackWhereInput = {
      workspaceId,
      ...(search && {
        content: { contains: search, mode: "insensitive" },
      }),
      ...(channel && channel.length > 0 && { channel: { in: channel as any } }),
      ...(sentiment && sentiment.length > 0 && { sentiment: { in: sentiment as any } }),
      ...(status && status.length > 0 && { status: { in: status as any } }),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo) }),
            },
          }
        : {}),
      ...(themeIds && themeIds.length > 0
        ? {
            themes: {
              some: { themeId: { in: themeIds } },
            },
          }
        : {}),
    };

    const [feedback, total] = await Promise.all([
      db.feedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          themes: {
            include: {
              theme: { select: { id: true, name: true, color: true } },
            },
          },
        },
      }),
      db.feedback.count({ where }),
    ]);

    return NextResponse.json({
      data: feedback,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /api/feedback error:", error);
    if (error.status) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["ADMIN", "ANALYST"]);
    const body = await request.json();
    const parsed = CreateFeedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { content, channel, sourceRef, customerLabel } = parsed.data;
    const workspaceId = session.user.workspaceId;

    // Create feedback record first
    const feedback = await db.feedback.create({
      data: { content, channel, sourceRef, customerLabel, workspaceId },
    });

    // Async: classify and embed (don't block the response)
    classifyAndStore(feedback.id, content, workspaceId).catch((err) =>
      console.error(`Classification failed for ${feedback.id}:`, err),
    );

    return NextResponse.json({ data: feedback }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/feedback error:", error);
    if (error.status) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to create feedback" }, { status: 500 });
  }
}

// Helper: classify + store results + embed
async function classifyAndStore(feedbackId: string, content: string, workspaceId: string) {
  try {
    const themeNames = await getWorkspaceThemeNames(workspaceId);
    const result = await classifyFeedback(content, themeNames);

    // Resolve or create themes
    const themeIds: string[] = [];
    for (const themeName of result.themes) {
      let theme = await db.theme.findFirst({
        where: { workspaceId, name: { equals: themeName, mode: "insensitive" } },
      });
      if (!theme) {
        theme = await db.theme.create({
          data: {
            name: themeName,
            workspaceId,
            color: "#6366F1",
          },
        });
      }
      themeIds.push(theme.id);
    }

    // Update feedback with classification
    await db.feedback.update({
      where: { id: feedbackId },
      data: {
        sentiment: result.sentiment,
        sentimentScore: result.sentimentScore,
        featureArea: result.featureArea,
        rationale: result.rationale,
        classified: true,
        themes: {
          createMany: {
            data: themeIds.map((themeId) => ({
              themeId,
              confidence: 0.9,
            })),
            skipDuplicates: true,
          },
        },
      },
    });

    // Store embedding
    await storeEmbedding(feedbackId, content);
  } catch (err) {
    console.error("classifyAndStore error:", err);
    // Mark as needing manual review
    await db.feedback.update({
      where: { id: feedbackId },
      data: { classified: false },
    });
  }
}
