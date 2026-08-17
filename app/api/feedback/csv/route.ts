// app/api/feedback/csv/route.ts
// Universal, Resilient CSV Importer with Auto Column Detection, Normalization & Auto-Classification

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { classifyFeedback, getWorkspaceThemeNames } from "@/lib/ai";
import { storeEmbedding } from "@/lib/embeddings";
import Papa from "papaparse";

// Normalizes any channel string to a valid Prisma Channel enum
function normalizeChannel(rawChannel?: string): string {
  if (!rawChannel) return "other";
  const s = rawChannel.toString().toLowerCase().trim();

  if (s.includes("support") || s.includes("ticket") || s.includes("zendesk") || s.includes("intercom") || s.includes("help") || s.includes("desk") || s.includes("email")) {
    return "support_ticket";
  }
  if (s.includes("app") || s.includes("play") || s.includes("store") || s.includes("ios") || s.includes("android") || s.includes("mobile")) {
    return "app_store";
  }
  if (s.includes("nps") || s.includes("survey") || s.includes("delighted") || s.includes("score") || s.includes("csat") || s.includes("rating")) {
    return "nps_survey";
  }
  if (s.includes("community") || s.includes("slack") || s.includes("discord") || s.includes("reddit") || s.includes("forum") || s.includes("twitter") || s.includes("social")) {
    return "community";
  }
  if (s.includes("sales") || s.includes("call") || s.includes("gong") || s.includes("zoom") || s.includes("crm") || s.includes("lead")) {
    return "sales_call";
  }
  if (s.includes("portal") || s.includes("web") || s.includes("in-app") || s.includes("feedback")) {
    return "portal";
  }

  return "other";
}

// Finds the best content/feedback column in any row
function extractContent(row: Record<string, any>): string {
  const possibleKeys = [
    "content",
    "feedback",
    "review",
    "comment",
    "message",
    "text",
    "description",
    "summary",
    "body",
    "notes",
    "issue",
    "ticket",
    "user_feedback",
    "customer_feedback",
    "details",
    "response",
    "verbatim",
    "quote",
  ];

  // 1. Check exact key match
  for (const key of Object.keys(row)) {
    const cleanKey = key.toLowerCase().trim().replace(/[\s_-]+/g, "");
    for (const p of possibleKeys) {
      if (cleanKey === p.replace(/[\s_-]+/g, "")) {
        const val = row[key];
        if (val && typeof val === "string" && val.trim().length > 0) {
          return val.trim();
        }
      }
    }
  }

  // 2. Fallback: Find the longest string column in the row
  let longestString = "";
  for (const key of Object.keys(row)) {
    const val = row[key];
    if (typeof val === "string" && val.trim().length > longestString.length) {
      longestString = val.trim();
    }
  }

  return longestString;
}

// Finds customer label from row
function extractCustomer(row: Record<string, any>): string | undefined {
  const possibleKeys = [
    "customer",
    "customer_label",
    "customer_id",
    "customer_name",
    "user",
    "user_id",
    "user_email",
    "email",
    "author",
    "name",
    "username",
    "account",
    "company",
  ];

  for (const key of Object.keys(row)) {
    const cleanKey = key.toLowerCase().trim().replace(/[\s_-]+/g, "");
    for (const p of possibleKeys) {
      if (cleanKey === p.replace(/[\s_-]+/g, "")) {
        const val = row[key];
        if (val && typeof val === "string" && val.trim().length > 0) {
          return val.trim();
        }
      }
    }
  }
  return undefined;
}

// Finds channel from row
function extractChannel(row: Record<string, any>): string {
  const possibleKeys = ["channel", "source", "platform", "type", "origin", "medium", "category"];

  for (const key of Object.keys(row)) {
    const cleanKey = key.toLowerCase().trim().replace(/[\s_-]+/g, "");
    for (const p of possibleKeys) {
      if (cleanKey === p.replace(/[\s_-]+/g, "")) {
        const val = row[key];
        if (val && typeof val === "string" && val.trim().length > 0) {
          return normalizeChannel(val);
        }
      }
    }
  }
  return "other";
}

// Safe Date parsing
function extractDate(row: Record<string, any>): Date | undefined {
  const possibleKeys = ["date", "created_at", "createdat", "timestamp", "time", "submitted_at"];

  for (const key of Object.keys(row)) {
    const cleanKey = key.toLowerCase().trim().replace(/[\s_-]+/g, "");
    for (const p of possibleKeys) {
      if (cleanKey === p.replace(/[\s_-]+/g, "")) {
        const val = row[key];
        if (val) {
          const parsed = new Date(val);
          if (!isNaN(parsed.getTime())) {
            return parsed;
          }
        }
      }
    }
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["ADMIN", "ANALYST"]);
    const workspaceId = session.user.workspaceId;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name || "upload.csv";
    if (!fileName.toLowerCase().endsWith(".csv") && !fileName.toLowerCase().endsWith(".txt")) {
      return NextResponse.json({ error: "Uploaded file must be a .csv file" }, { status: 400 });
    }

    const text = await file.text();

    // Parse CSV with auto-detection of delimiters (commas, semicolons, tabs)
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: "greedy",
      dynamicTyping: false,
    });

    const rows = parsed.data as Record<string, any>[];
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "CSV file contains no data rows" }, { status: 400 });
    }

    const errors: Array<{ row: number; message: string }> = [];
    const validItems: Array<{
      content: string;
      channel: string;
      customerLabel?: string;
      createdAt?: Date;
      sourceRef: string;
    }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const content = extractContent(row);

      if (!content || content.length < 2) {
        errors.push({ row: i + 2, message: "Missing feedback text/content in row" });
        continue;
      }

      const channel = extractChannel(row);
      const customerLabel = extractCustomer(row);
      const createdAt = extractDate(row);

      validItems.push({
        content,
        channel,
        customerLabel,
        createdAt,
        sourceRef: `csv-import-${Date.now()}-${i + 1}`,
      });
    }

    if (validItems.length === 0) {
      return NextResponse.json(
        {
          error: "Could not find valid feedback text columns in the uploaded CSV. Ensure columns like 'content', 'feedback', 'review', or 'comment' are present.",
          failed: rows.length,
          errors: errors.slice(0, 10),
        },
        { status: 400 }
      );
    }

    // Ingest into database
    let imported = 0;
    const existingThemes = await getWorkspaceThemeNames(workspaceId);

    // Batch insert and trigger background AI classification
    for (const item of validItems) {
      try {
        const feedback = await db.feedback.create({
          data: {
            content: item.content,
            channel: item.channel as any,
            customerLabel: item.customerLabel,
            sourceRef: item.sourceRef,
            workspaceId,
            ...(item.createdAt && { createdAt: item.createdAt }),
          },
        });
        imported++;

        // Async classification & vector embedding in background
        Promise.all([
          classifyFeedback(feedback.content, existingThemes)
            .then(async (result) => {
              // Resolve or create theme records in database
              const themeIds: string[] = [];
              if (result.themes && result.themes.length > 0) {
                for (const tName of result.themes) {
                  let theme = await db.theme.findFirst({
                    where: { workspaceId, name: { equals: tName, mode: "insensitive" } },
                  });
                  if (!theme) {
                    theme = await db.theme.create({
                      data: { name: tName, workspaceId, color: "#6366F1" },
                    });
                  }
                  themeIds.push(theme.id);
                }
              }

              await db.feedback.update({
                where: { id: feedback.id },
                data: {
                  sentiment: result.sentiment as any,
                  sentimentScore: result.sentimentScore,
                  featureArea: result.featureArea,
                  rationale: result.rationale,
                  classified: true,
                  themes: {
                    createMany: {
                      data: themeIds.map((tId) => ({ themeId: tId, confidence: 0.9 })),
                      skipDuplicates: true,
                    },
                  },
                },
              });
            })
            .catch((e) => console.error("CSV background classify error:", e)),
          storeEmbedding(feedback.id, feedback.content).catch((e) =>
            console.error("CSV background embed error:", e)
          ),
        ]);
      } catch (err: any) {
        console.error("Row insertion error:", err);
        errors.push({ row: validItems.indexOf(item) + 2, message: err?.message || "Database insert error" });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        imported,
        failed: errors.length,
        errors: errors.slice(0, 10),
        total: rows.length,
        message: `Successfully imported ${imported} feedback items from CSV! AI classification is processing in the background.`,
      },
    });
  } catch (error: any) {
    console.error("CSV upload fatal error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process CSV file" },
      { status: 500 }
    );
  }
}
