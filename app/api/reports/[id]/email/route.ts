// app/api/reports/[id]/email/route.ts
// Send VoC Report via Email to specified recipients or team members

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { sendVoCReportEmail } from "@/lib/email";
import { z } from "zod";

const SendReportEmailSchema = z.object({
  recipients: z.array(z.string().email("Invalid email address")).min(1, "At least one recipient is required"),
  customNote: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const workspaceId = session.user.workspaceId;
    const reportId = params.id;

    const body = await request.json();
    const parsed = SendReportEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { recipients, customNote } = parsed.data;

    // Fetch report from database
    const report = await db.report.findFirst({
      where: { id: reportId, workspaceId },
      include: {
        generatedBy: { select: { name: true, email: true } },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const content: any = report.contentJson || {};
    const origin = request.nextUrl.origin || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const reportUrl = `${origin}/reports/${report.id}`;
    const senderName = session.user.name || session.user.email?.split("@")[0] || "Team Member";

    // Send emails
    const sendPromises = recipients.map((to) =>
      sendVoCReportEmail({
        to,
        reportTitle: report.title,
        periodLabel: content.periodLabel || "Recent Evaluation",
        executiveSummary: content.executiveSummary || "Voice of Customer Intelligence Summary",
        topThemes: content.topThemes || [],
        sentimentAnalysis: content.sentimentAnalysis || { positive: 0, neutral: 0, negative: 0 },
        recommendedActions: content.recommendedActions || [],
        reportUrl,
        senderName,
        customNote,
      })
    );

    await Promise.all(sendPromises);

    return NextResponse.json({
      success: true,
      message: `VoC Report successfully emailed to ${recipients.length} recipient${recipients.length > 1 ? "s" : ""}!`,
      recipients,
    });
  } catch (error: any) {
    console.error("POST Email Report error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send report email" },
      { status: error?.status || 500 }
    );
  }
}
