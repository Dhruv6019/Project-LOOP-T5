// app/api/chats/[id]/route.ts
// GET: get single chat with cited feedback | POST: send message & run AI copilot | DELETE: delete chat

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { answerQuestion } from "@/lib/ai";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    const chat = await db.chatSession.findFirst({
      where: { id: params.id, workspaceId: session.user.workspaceId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Collect all cited feedback IDs across messages
    const allCitedIds: string[] = Array.from(
      new Set(chat.messages.flatMap((m: { citedIds?: string[] }) => m.citedIds || []))
    );

    const citedItems = allCitedIds.length > 0
      ? await db.feedback.findMany({
          where: { id: { in: allCitedIds }, workspaceId: session.user.workspaceId },
          include: {
            themes: { include: { theme: { select: { id: true, name: true, color: true } } } },
          },
        })
      : [];

    const citedMap = new Map(citedItems.map((item: { id: string }) => [item.id, item]));

    const enrichedMessages = chat.messages.map((m: { citedIds?: string[]; [key: string]: any }) => ({
      ...m,
      citedItems: (m.citedIds || []).map((id: string) => citedMap.get(id)).filter(Boolean),
    }));

    return NextResponse.json(
      {
        data: {
          ...chat,
          messages: enrichedMessages,
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to fetch chat" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const chat = await db.chatSession.findFirst({
      where: { id: params.id, workspaceId: session.user.workspaceId },
      include: { messages: true },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // 1. Save user question message
    await db.chatMessage.create({
      data: {
        sessionId: chat.id,
        role: "user",
        content: question.trim(),
        citedIds: [],
      },
    });

    // 2. Query workspace feedback context
    const contextItems = await db.feedback.findMany({
      where: { workspaceId: session.user.workspaceId },
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        themes: { include: { theme: { select: { id: true, name: true, color: true } } } },
      },
    });

    // 3. Generate AI Answer
    const { answer, citedIds } = await answerQuestion(question, contextItems);

    // 4. Save AI response message in database
    const assistantMessage = await db.chatMessage.create({
      data: {
        sessionId: chat.id,
        role: "assistant",
        content: answer,
        citedIds: citedIds || [],
      },
    });

    // 5. Update session title if first message
    const newTitle = chat.title === "New Exploration"
      ? question.slice(0, 36) + (question.length > 36 ? "..." : "")
      : chat.title;

    await db.chatSession.update({
      where: { id: chat.id },
      data: { title: newTitle, updatedAt: new Date() },
    });

    const citedFeedback = citedIds.length > 0
      ? await db.feedback.findMany({
          where: { id: { in: citedIds } },
          include: {
            themes: { include: { theme: { select: { id: true, name: true, color: true } } } },
          },
        })
      : [];

    return NextResponse.json({
      data: {
        answer,
        citedItems: citedFeedback,
        messageId: assistantMessage.id,
        title: newTitle,
      },
    });
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    const chat = await db.chatSession.findFirst({
      where: { id: params.id, workspaceId: session.user.workspaceId },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    await db.chatSession.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ data: { deleted: true } });
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}
