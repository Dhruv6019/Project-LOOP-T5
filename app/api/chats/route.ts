// app/api/chats/route.ts
// GET: list workspace chat sessions | POST: create new chat session in database

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { answerQuestion } from "@/lib/ai";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const chats = await db.chatSession.findMany({
      where: { workspaceId: session.user.workspaceId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(
      { data: chats },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to fetch chat sessions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { title, question } = body;

    const sessionTitle =
      title || (question ? question.slice(0, 36) + (question.length > 36 ? "..." : "") : "New Exploration");

    const chat = await db.chatSession.create({
      data: {
        title: sessionTitle,
        workspaceId: session.user.workspaceId,
        userId: session.user.id,
      },
      include: {
        messages: true,
      },
    });

    // If initial question provided, generate first answer atomically in single roundtrip!
    if (question && typeof question === "string" && question.trim()) {
      const q = question.trim();

      // 1. Save user message
      await db.chatMessage.create({
        data: {
          sessionId: chat.id,
          role: "user",
          content: q,
          citedIds: [],
        },
      });

      // 2. Fetch context items
      const contextItems = await db.feedback.findMany({
        where: { workspaceId: session.user.workspaceId },
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          themes: { include: { theme: { select: { id: true, name: true, color: true } } } },
        },
      });

      // 3. Generate answer
      const { answer, citedIds } = await answerQuestion(q, contextItems);

      // 4. Save assistant response
      const assistantMessage = await db.chatMessage.create({
        data: {
          sessionId: chat.id,
          role: "assistant",
          content: answer,
          citedIds: citedIds || [],
        },
      });

      const citedFeedback =
        citedIds.length > 0
          ? await db.feedback.findMany({
              where: { id: { in: citedIds } },
              include: {
                themes: { include: { theme: { select: { id: true, name: true, color: true } } } },
              },
            })
          : [];

      return NextResponse.json(
        {
          data: {
            ...chat,
            messages: [
              { id: "msg-user-" + Date.now(), role: "user", content: q },
              {
                id: assistantMessage.id,
                role: "assistant",
                content: answer,
                citedItems: citedFeedback,
              },
            ],
            answer,
            citedItems: citedFeedback,
            messageId: assistantMessage.id,
          },
        },
        { status: 201 }
      );
    }

    return NextResponse.json({ data: chat }, { status: 201 });
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to create chat session" }, { status: 500 });
  }
}
