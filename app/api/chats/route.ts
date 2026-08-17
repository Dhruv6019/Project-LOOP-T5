// app/api/chats/route.ts
// GET: list workspace chat sessions | POST: create new chat session in database

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

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

    return NextResponse.json({ data: chats });
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to fetch chat sessions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { title = "New Exploration" } = body;

    const chat = await db.chatSession.create({
      data: {
        title,
        workspaceId: session.user.workspaceId,
        userId: session.user.id,
      },
      include: {
        messages: true,
      },
    });

    return NextResponse.json({ data: chat }, { status: 201 });
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to create chat session" }, { status: 500 });
  }
}
