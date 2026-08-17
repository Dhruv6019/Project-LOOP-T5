// app/api/insights/route.ts
// POST: Ask LOOP — grounded Q&A using semantic search + Claude

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { AskLoopSchema } from "@/lib/validations";
import { findSimilarFeedback } from "@/lib/embeddings";
import { answerQuestion } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = AskLoopSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const { question } = parsed.data;
    let workspaceId = session.user.workspaceId;

    // Step 1: Find most relevant feedback via semantic search / keyword search
    let similarIds = await findSimilarFeedback(workspaceId, question, 10);

    // Step 2: Fetch full feedback items for this workspace
    let contextItems = similarIds.length > 0
      ? await db.feedback.findMany({
          where: { id: { in: similarIds }, workspaceId },
          include: {
            themes: { include: { theme: { select: { id: true, name: true, color: true } } } },
          },
        })
      : [];

    // Fallback 1: Fetch recent items from current workspace
    if (contextItems.length === 0) {
      contextItems = await db.feedback.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          themes: { include: { theme: { select: { id: true, name: true, color: true } } } },
        },
      });
    }

    // Fallback 2: If current workspace is newly created and empty, pull from demo feedback pool
    if (contextItems.length === 0) {
      contextItems = await db.feedback.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          themes: { include: { theme: { select: { id: true, name: true, color: true } } } },
        },
      });
    }

    // Step 3: Get grounded answer from Claude / Decision Copilot
    const { answer, citedIds } = await answerQuestion(question, contextItems as any);

    // Step 4: Return answer with cited feedback items
    let citedItems = contextItems.filter((item: { id: string }) => citedIds.includes(item.id));
    if (citedItems.length === 0) {
      citedItems = contextItems.slice(0, 3);
    }

    return NextResponse.json({
      data: {
        answer,
        citedItems,
        totalContext: contextItems.length,
      },
    });
  } catch (error: any) {
    console.error("Ask LOOP error:", error);
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to process question" }, { status: 500 });
  }
}
