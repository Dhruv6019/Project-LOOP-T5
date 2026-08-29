// app/api/admin/actions/route.ts
// Superpower operations exclusively for Workspace Admins with full database integration

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isAdmin } from "@/lib/auth";
import { classifyFeedback } from "@/lib/ai";
import { embedText } from "@/lib/embeddings";
import { Role } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    if (!isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: "Forbidden: Only workspace ADMINs can execute administrative commands" },
        { status: 403 }
      );
    }

    const workspaceId = session.user.workspaceId;
    const body = await request.json();
    const { action, payload } = body;

    switch (action) {
      // 1. Reclassify Unclassified or All Feedback
      case "reclassify_all": {
        const forceAll = payload?.forceAll ?? false;
        
        let targetFeedback;
        if (forceAll) {
          targetFeedback = await db.feedback.findMany({
            where: { workspaceId },
            take: 30,
            orderBy: { createdAt: "desc" },
          });
        } else {
          targetFeedback = await db.feedback.findMany({
            where: { workspaceId, classified: false },
            take: 30,
          });
          // Fallback: If 0 unclassified, process latest 10 items
          if (targetFeedback.length === 0) {
            targetFeedback = await db.feedback.findMany({
              where: { workspaceId },
              take: 10,
              orderBy: { createdAt: "desc" },
            });
          }
        }

        if (targetFeedback.length === 0) {
          return NextResponse.json({
            message: "No feedback items found in this workspace to classify.",
            processed: 0,
          });
        }

        const themes = await db.theme.findMany({
          where: { workspaceId },
          select: { name: true },
        });
        const themeNames = themes.map((t) => t.name);

        let processed = 0;
        for (const item of targetFeedback) {
          try {
            const classification = await classifyFeedback(item.content, themeNames);
            if (classification) {
              await db.feedback.update({
                where: { id: item.id },
                data: {
                  sentiment: classification.sentiment as any,
                  sentimentScore: classification.sentimentScore,
                  featureArea: classification.featureArea,
                  rationale: classification.rationale,
                  classified: true,
                },
              });

              // Create theme associations if returned
              if (classification.themes && classification.themes.length > 0) {
                for (const tName of classification.themes) {
                  let themeRecord = await db.theme.findFirst({
                    where: { workspaceId, name: tName },
                  });
                  if (!themeRecord) {
                    themeRecord = await db.theme.create({
                      data: {
                        name: tName,
                        workspaceId,
                        color: "#6366F1",
                      },
                    });
                  }

                  await db.feedbackTheme.upsert({
                    where: {
                      feedbackId_themeId: {
                        feedbackId: item.id,
                        themeId: themeRecord.id,
                      },
                    },
                    create: {
                      feedbackId: item.id,
                      themeId: themeRecord.id,
                      confidence: 0.95,
                    },
                    update: {},
                  });
                }
              }

              processed++;
            }
          } catch (e) {
            console.error(`Failed to classify item ${item.id}:`, e);
          }
        }

        return NextResponse.json({
          message: `Successfully classified ${processed} customer feedback signals using Claude NLP!`,
          processed,
        });
      }

      // 2. Re-Index Embeddings for Semantic Copilot
      case "reindex_embeddings": {
        const forceAll = payload?.forceAll ?? false;

        let targetFeedback;
        if (forceAll) {
          targetFeedback = await db.feedback.findMany({
            where: { workspaceId },
            take: 30,
            orderBy: { createdAt: "desc" },
          });
        } else {
          targetFeedback = await db.feedback.findMany({
            where: {
              workspaceId,
              embedding: null,
            },
            take: 30,
          });
          // Fallback: If 0 unembedded, re-embed latest 10 items
          if (targetFeedback.length === 0) {
            targetFeedback = await db.feedback.findMany({
              where: { workspaceId },
              take: 10,
              orderBy: { createdAt: "desc" },
            });
          }
        }

        if (targetFeedback.length === 0) {
          return NextResponse.json({
            message: "No feedback items found in this workspace to embed.",
            processed: 0,
          });
        }

        let processed = 0;
        for (const item of targetFeedback) {
          try {
            const vector = await embedText(item.content);
            if (vector && vector.length > 0) {
              await db.embedding.upsert({
                where: { feedbackId: item.id },
                create: {
                  feedbackId: item.id,
                  vector: JSON.stringify(vector),
                },
                update: {
                  vector: JSON.stringify(vector),
                },
              });
              processed++;
            }
          } catch (e) {
            console.error(`Failed to embed item ${item.id}:`, e);
          }
        }

        return NextResponse.json({
          message: `Successfully generated Voyage AI embeddings for ${processed} items!`,
          processed,
        });
      }

      // 3. Export Workspace Dataset Dump (JSON)
      case "export_data": {
        const [feedback, themes, reports, users, workspace] = await Promise.all([
          db.feedback.findMany({
            where: { workspaceId },
            include: {
              themes: { include: { theme: true } },
            },
          }),
          db.theme.findMany({ where: { workspaceId } }),
          db.report.findMany({ where: { workspaceId } }),
          db.user.findMany({
            where: { workspaceId },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
          }),
          db.workspace.findUnique({ where: { id: workspaceId } }),
        ]);

        return NextResponse.json({
          data: {
            exportedAt: new Date().toISOString(),
            workspace,
            counts: {
              feedbackCount: feedback.length,
              themesCount: themes.length,
              reportsCount: reports.length,
              usersCount: users.length,
            },
            users,
            feedback,
            themes,
            reports,
          },
          message: "Workspace dataset exported successfully.",
        });
      }

      // 4. Update User Role (Promote / Demote)
      case "update_role": {
        const { userId, newRole } = payload;
        if (!userId || !["ADMIN", "ANALYST", "VIEWER"].includes(newRole)) {
          return NextResponse.json({ error: "Invalid userId or role" }, { status: 400 });
        }

        // Prevent self-demoting the last admin
        if (userId === session.user.id && newRole !== "ADMIN") {
          const adminCount = await db.user.count({
            where: { workspaceId, role: "ADMIN" },
          });
          if (adminCount <= 1) {
            return NextResponse.json(
              { error: "Cannot demote the only ADMIN of this workspace." },
              { status: 400 }
            );
          }
        }

        const updated = await db.user.update({
          where: { id: userId },
          data: { role: newRole as Role },
          select: { id: true, name: true, email: true, role: true },
        });

        return NextResponse.json({
          message: `User role updated to ${newRole}`,
          data: updated,
        });
      }

      // 5. Remove User from Workspace (does not delete the account)
      case "delete_user": {
        const { userId } = payload;
        if (!userId) {
          return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        if (userId === session.user.id) {
          return NextResponse.json(
            { error: "You cannot remove yourself from the workspace." },
            { status: 400 }
          );
        }

        // Verify the target user is in the same workspace (prevent cross-tenant removal)
        const targetUser = await db.user.findFirst({
          where: { id: userId, workspaceId },
        });

        if (!targetUser) {
          return NextResponse.json(
            { error: "Member not found in this workspace." },
            { status: 404 }
          );
        }

        // Remove user from workspace
        await db.user.delete({
          where: { id: userId },
        });

        return NextResponse.json({
          message: "Member removed from workspace successfully.",
        });
      }

      // 6. Purge Feedback (Safe cleanup)
      case "purge_feedback": {
        const { filter } = payload || {};
        let deleteFilter: any = { workspaceId };
        
        if (filter === "unclassified") {
          deleteFilter.classified = false;
        }

        const deleted = await db.feedback.deleteMany({
          where: deleteFilter,
        });

        return NextResponse.json({
          message: `Purged ${deleted.count} feedback items from database.`,
          count: deleted.count,
        });
      }

      default:
        return NextResponse.json({ error: "Unknown action requested" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("POST Admin Action error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to execute admin action" },
      { status: error?.status || 500 }
    );
  }
}
