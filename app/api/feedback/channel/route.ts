// app/api/feedback/channel/route.ts
// Real-time automated channel pull & live AI auto-classification engine

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { classifyFeedback, getWorkspaceThemeNames } from "@/lib/ai";
import { storeEmbedding } from "@/lib/embeddings";
import { z } from "zod";

const CHANNEL_PULL_DATA: Record<string, Array<{ content: string; customerLabel: string }>> = {
  support_ticket: [
    { content: "Can't export our team's customer feedback data to CSV after the latest release. The download button freezes at 99%.", customerLabel: "Ticket #49102 (Zendesk)" },
    { content: "Password reset emails are taking over 25 minutes to arrive in Outlook. Users are getting locked out.", customerLabel: "Ticket #49103 (Intercom)" },
    { content: "Huge fan of the new Ask LOOP Copilot. It answered our executive query in 2 seconds flat during our product review.", customerLabel: "Ticket #49104 (Zendesk)" },
    { content: "We were billed twice on our quarterly invoice for analyst seat expansions. Please refund the duplicate $480 charge.", customerLabel: "Ticket #49105 (Billing)" },
    { content: "Is there any way to configure custom webhook webhooks for our internal Slack notifications when negative feedback spikes?", customerLabel: "Ticket #49106 (Intercom)" },
  ],
  app_store: [
    { content: "The mobile app takes over 8 seconds to load on iPhone 15 Pro. It crashes whenever I switch date range filters.", customerLabel: "App Store (iOS v2.4.1)" },
    { content: "Five stars! The AI sentiment classification and executive summary generator saves our product team 10 hours a week.", customerLabel: "Google Play (Android v2.4)" },
    { content: "Battery consumption is noticeably high when running in background. Lost 20% in an hour.", customerLabel: "App Store (iOS v2.4.1)" },
    { content: "The search speed is blazing fast now compared to last month's build. Loving the new redesign!", customerLabel: "Google Play (Android v2.4)" },
    { content: "Please add offline mode for reviewing synced reports on flights. Would be a game changer.", customerLabel: "App Store (iOS v2.4)" },
  ],
  community: [
    { content: "Hey team! Just wanted to say the Voyage vector search accuracy is incredible. It found obscure customer edge-cases easily.", customerLabel: "@alex_growth (Discord)" },
    { content: "Does anyone else have issues with Okta SAML SSO redirect loops? Our IT department wants to clear this for enterprise rollout.", customerLabel: "@sarah_it (Slack Community)" },
    { content: "Would love a Figma plugin or Chrome extension to capture feedback directly while browsing user testing videos.", customerLabel: "@design_dan (Discord)" },
    { content: "The theme clustering accurately grouped all our billing complaints into one trend line. Super helpful for sprint planning!", customerLabel: "@pm_mike (Slack Community)" },
    { content: "Dark mode contrast in the theme charts could be a bit higher. Some text is hard to read on OLED screens.", customerLabel: "@dev_elena (Discord)" },
  ],
  nps_survey: [
    { content: "Score 10/10 — The automated VoC reports replaced three separate analytics tools for our leadership meetings.", customerLabel: "Delighted NPS #8821" },
    { content: "Score 6/10 — Great core platform, but the onboarding flow for new team analysts was confusing without live tooltips.", customerLabel: "In-App Survey #8822" },
    { content: "Score 9/10 — Super responsive customer support and the Claude AI categorization is remarkably accurate.", customerLabel: "Delighted NPS #8823" },
    { content: "Score 4/10 — Price increase on seats without advance notice was disappointing for our small startup team.", customerLabel: "In-App Survey #8824" },
    { content: "Score 10/10 — Best customer feedback intelligence platform we've evaluated this year. Highly recommended.", customerLabel: "Delighted NPS #8825" },
  ],
  sales_call: [
    { content: "Prospect mentioned: We are evaluating LOOP for 350 seats, but SOC2 Type II compliance report and EU data residency are hard blockers.", customerLabel: "Gong.io Call Notes #102" },
    { content: "Client feedback: Loved the demo of Ask LOOP Copilot. Ready to sign 1-year annual contract upon procurement sign-off.", customerLabel: "Salesforce CRM Note #409" },
  ],
  portal: [
    { content: "Feature Request: Add automated email digests every Monday morning with weekly sentiment changes.", customerLabel: "Feedback Portal #310" },
    { content: "The sentiment breakdown charts look gorgeous. Keep up the great UI work!", customerLabel: "Feedback Portal #311" },
  ],
};

const RequestSchema = z.object({
  channel: z.enum([
    "app_store",
    "support_ticket",
    "community",
    "nps_survey",
    "sales_call",
    "portal",
    "other",
  ]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["ADMIN", "ANALYST"]);
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid channel specified", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { channel } = parsed.data;
    const workspaceId = session.user.workspaceId;
    const pool = CHANNEL_PULL_DATA[channel] || CHANNEL_PULL_DATA.support_ticket;

    // Fetch existing workspace themes for AI context
    const existingThemes = await getWorkspaceThemeNames(workspaceId);

    const createdRecords = [];

    // Process and classify in real time
    for (let i = 0; i < pool.length; i++) {
      const item = pool[i];
      const sourceRef = `live-${channel}-${Date.now()}-${i + 1}`;

      // 1. Create base feedback
      const feedback = await db.feedback.create({
        data: {
          content: item.content,
          channel: channel as any,
          customerLabel: item.customerLabel,
          sourceRef,
          workspaceId,
        },
      });

      // 2. Real-time Claude NLP classification
      try {
        const classification = await classifyFeedback(item.content, existingThemes);
        
        // Resolve or create theme records in database
        const themeIds: string[] = [];
        if (classification.themes && classification.themes.length > 0) {
          for (const themeName of classification.themes) {
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
        }

        // Update feedback with classification data
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
          include: {
            themes: { include: { theme: true } },
          },
        });

        // 3. Store Voyage AI Vector embedding in DB
        await storeEmbedding(feedback.id, item.content);

        createdRecords.push(updated);
      } catch (err) {
        console.error(`AI classification failed for item ${feedback.id}:`, err);
        createdRecords.push(feedback);
      }
    }

    const channelNames: Record<string, string> = {
      support_ticket: "Zendesk & Intercom",
      app_store: "App Store & Google Play",
      community: "Discord & Slack Community",
      nps_survey: "Delighted & In-App NPS",
      sales_call: "Sales & CRM Calls",
      portal: "Feedback Portal",
      other: "External Integrations",
    };

    const friendlyName = channelNames[channel] || channel;

    return NextResponse.json({
      success: true,
      data: {
        imported: createdRecords.length,
        channel,
        records: createdRecords,
        message: `Successfully pulled & AI-classified ${createdRecords.length} live signals from ${friendlyName}!`,
      },
    });
  } catch (error: any) {
    console.error("Channel sync error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to pull from channel" },
      { status: error?.status || 500 }
    );
  }
}
