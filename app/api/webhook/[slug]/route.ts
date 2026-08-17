// app/api/webhook/[slug]/route.ts
// Universal Live Ingestion Webhook for External Companies & Custom Apps
// Accepts customer feedback from Zendesk, Intercom, Slack, Shopify, App Store webhooks, or custom APIs

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { classifyFeedback, getWorkspaceThemeNames } from "@/lib/ai";
import { storeEmbedding } from "@/lib/embeddings";

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    // Find workspace by unique slug
    const workspace = await db.workspace.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace webhook not found" }, { status: 404 });
    }

    const body = await request.json();

    // Support standard format, Zendesk webhook format, Intercom format, or raw text
    const content =
      body.content ||
      body.text ||
      body.description ||
      body.comment?.body ||
      body.message ||
      body.review;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing required 'content' or 'text' field in webhook payload" },
        { status: 400 }
      );
    }

    const channel = body.channel || "portal";
    const customerLabel = body.customerLabel || body.customer || body.user?.email || body.author || "Webhook Ingest";
    const sourceRef = body.sourceRef || body.id || `webhook-${Date.now()}`;

    // 1. Create feedback record in database
    const feedback = await db.feedback.create({
      data: {
        content: content.trim(),
        channel: channel as any,
        customerLabel,
        sourceRef,
        workspaceId: workspace.id,
      },
    });

    // 2. Real-time AI classification & vector embeddings
    const existingThemes = await getWorkspaceThemeNames(workspace.id);
    const classification = await classifyFeedback(content.trim(), existingThemes);

    const themeIds: string[] = [];
    if (classification.themes && classification.themes.length > 0) {
      for (const themeName of classification.themes) {
        let theme = await db.theme.findFirst({
          where: { workspaceId: workspace.id, name: { equals: themeName, mode: "insensitive" } },
        });
        if (!theme) {
          theme = await db.theme.create({
            data: {
              name: themeName,
              workspaceId: workspace.id,
              color: "#6366F1",
            },
          });
        }
        themeIds.push(theme.id);
      }
    }

    const updated = await db.feedback.update({
      where: { id: feedback.id },
      data: {
        sentiment: classification.sentiment as any,
        sentimentScore: classification.sentimentScore,
        featureArea: classification.featureArea,
        rationale: classification.rationale,
        classified: true,
        themes: {
          createMany: {
            data: themeIds.map((themeId) => ({
              themeId,
              confidence: 0.95,
            })),
            skipDuplicates: true,
          },
        },
      },
    });

    // 3. Store vector embedding for Ask LOOP
    await storeEmbedding(feedback.id, content.trim());

    return NextResponse.json({
      success: true,
      message: `Feedback ingested and AI-classified for workspace "${workspace.name}"!`,
      data: {
        id: updated.id,
        sentiment: updated.sentiment,
        sentimentScore: updated.sentimentScore,
        featureArea: updated.featureArea,
        themes: classification.themes,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error("Webhook ingestion error:", error);
    return NextResponse.json(
      { error: error?.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}
