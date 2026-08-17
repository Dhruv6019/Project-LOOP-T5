// prisma/seed.ts
// Seeds the demo workspace with 120+ realistic feedback items

import { db } from "../lib/db";
import bcrypt from "bcryptjs";

const THEME_COLORS = [
  "#6366F1", "#8B5CF6", "#EC4899", "#EF4444",
  "#F97316", "#F59E0B", "#84CC16", "#10B981",
];

const THEMES = [
  { name: "Onboarding", description: "First-time setup and user activation experience", color: THEME_COLORS[0] },
  { name: "Billing", description: "Payments, invoices, and pricing concerns", color: THEME_COLORS[1] },
  { name: "Mobile", description: "Mobile app and responsive design feedback", color: THEME_COLORS[2] },
  { name: "Performance", description: "Speed, loading times, and reliability issues", color: THEME_COLORS[3] },
  { name: "Integrations", description: "Third-party connectors and API access", color: THEME_COLORS[4] },
  { name: "UI/UX", description: "Interface design, navigation, and usability", color: THEME_COLORS[5] },
  { name: "Support", description: "Customer support and documentation quality", color: THEME_COLORS[6] },
  { name: "Pricing", description: "Plan pricing, value perception, and tier comparisons", color: THEME_COLORS[7] },
];

// 120+ realistic feedback items
const FEEDBACK_ITEMS = [
  // --- Onboarding (NEG) ---
  { content: "Onboarding took forever — I couldn't figure out how to invite my team.", channel: "support_ticket", sentiment: "NEG", score: -0.8, area: "Onboarding", themes: ["Onboarding"] },
  { content: "The setup wizard is confusing. I had to watch three videos just to connect my first channel.", channel: "nps_survey", sentiment: "NEG", score: -0.7, area: "Onboarding", themes: ["Onboarding"] },
  { content: "Took me 2 hours to get the first workspace configured. Documentation is outdated.", channel: "support_ticket", sentiment: "NEG", score: -0.75, area: "Onboarding", themes: ["Onboarding", "Support"] },
  { content: "Why does onboarding require 12 steps? Competitors do it in 3.", channel: "community", sentiment: "NEG", score: -0.6, area: "Onboarding", themes: ["Onboarding"] },
  { content: "New user here — completely lost during setup. No clear next steps after account creation.", channel: "app_store", sentiment: "NEG", score: -0.65, area: "Onboarding", themes: ["Onboarding", "UI/UX"] },
  // --- Onboarding (POS) ---
  { content: "The onboarding checklist is excellent! Got up and running in 15 minutes.", channel: "app_store", sentiment: "POS", score: 0.85, area: "Onboarding", themes: ["Onboarding"] },
  { content: "Love the guided tour feature — best onboarding experience I've had with a SaaS tool.", channel: "nps_survey", sentiment: "POS", score: 0.9, area: "Onboarding", themes: ["Onboarding", "UI/UX"] },

  // --- Billing (NEG) ---
  { content: "Billing page keeps timing out when I try to download an invoice.", channel: "support_ticket", sentiment: "NEG", score: -0.9, area: "Billing", themes: ["Billing"] },
  { content: "Was charged twice this month. Support took 5 days to respond.", channel: "support_ticket", sentiment: "NEG", score: -0.95, area: "Billing", themes: ["Billing", "Support"] },
  { content: "Invoice formatting is terrible. My accountant can't read them.", channel: "sales_call", sentiment: "NEG", score: -0.6, area: "Billing", themes: ["Billing"] },
  { content: "Cancellation flow is intentionally obfuscated. Had to contact support to cancel.", channel: "community", sentiment: "NEG", score: -0.85, area: "Billing", themes: ["Billing"] },
  { content: "No way to set up annual invoicing for enterprise accounts. Deal blocker.", channel: "sales_call", sentiment: "NEG", score: -0.7, area: "Billing", themes: ["Billing", "Pricing"] },
  // --- Billing (NEU/POS) ---
  { content: "Billing is fine, nothing special. Would like better breakdown per seat.", channel: "nps_survey", sentiment: "NEU", score: -0.1, area: "Billing", themes: ["Billing"] },
  { content: "Just noticed the billing portal was updated — much cleaner now!", channel: "community", sentiment: "POS", score: 0.6, area: "Billing", themes: ["Billing", "UI/UX"] },

  // --- Mobile (NEG) ---
  { content: "It does the job, but the mobile experience needs work.", channel: "nps_survey", sentiment: "NEU", score: -0.2, area: "Mobile", themes: ["Mobile"] },
  { content: "The iOS app crashes every time I try to upload a CSV. Unusable.", channel: "app_store", sentiment: "NEG", score: -0.95, area: "Mobile", themes: ["Mobile"] },
  { content: "Mobile app is way behind the web version. Missing at least 60% of features.", channel: "app_store", sentiment: "NEG", score: -0.8, area: "Mobile", themes: ["Mobile"] },
  { content: "Dark mode doesn't work properly on Android. Text is unreadable.", channel: "app_store", sentiment: "NEG", score: -0.7, area: "Mobile", themes: ["Mobile", "UI/UX"] },
  { content: "Please optimize for iPad. The layout is completely broken in landscape mode.", channel: "app_store", sentiment: "NEG", score: -0.65, area: "Mobile", themes: ["Mobile"] },
  { content: "Notifications don't work on Android 14. Checked all permissions.", channel: "app_store", sentiment: "NEG", score: -0.75, area: "Mobile", themes: ["Mobile"] },
  // --- Mobile (POS) ---
  { content: "The mobile redesign is beautiful! Finally feels like a proper native app.", channel: "app_store", sentiment: "POS", score: 0.85, area: "Mobile", themes: ["Mobile", "UI/UX"] },
  { content: "Offline mode is a game changer for my team in the field.", channel: "app_store", sentiment: "POS", score: 0.9, area: "Mobile", themes: ["Mobile"] },

  // --- Performance (NEG) ---
  { content: "Dashboard takes 8 seconds to load with more than 500 items. Unusable at scale.", channel: "support_ticket", sentiment: "NEG", score: -0.85, area: "Performance", themes: ["Performance"] },
  { content: "Reports generation times out after 30 seconds. Can't generate weekly summaries.", channel: "support_ticket", sentiment: "NEG", score: -0.9, area: "Performance", themes: ["Performance"] },
  { content: "Search is extremely slow. 3-4 second wait for every keystroke.", channel: "community", sentiment: "NEG", score: -0.8, area: "Performance", themes: ["Performance"] },
  { content: "CSV uploads over 1000 rows consistently time out.", channel: "support_ticket", sentiment: "NEG", score: -0.85, area: "Performance", themes: ["Performance"] },
  { content: "App slows down noticeably after about an hour of use. Have to refresh constantly.", channel: "app_store", sentiment: "NEG", score: -0.7, area: "Performance", themes: ["Performance"] },
  // --- Performance (POS) ---
  { content: "The new dashboard is gorgeous and finally fast. Huge improvement.", channel: "app_store", sentiment: "POS", score: 0.9, area: "Performance", themes: ["Performance", "UI/UX"] },
  { content: "Whatever you did to the search indexing — it's blazing fast now. Love it.", channel: "community", sentiment: "POS", score: 0.85, area: "Performance", themes: ["Performance"] },

  // --- Integrations (NEG) ---
  { content: "Prospect wants SSO before they'll sign — third time this month.", channel: "sales_call", sentiment: "NEG", score: -0.75, area: "Integrations", themes: ["Integrations"] },
  { content: "Zapier integration stopped working after your last update. Broke our entire workflow.", channel: "support_ticket", sentiment: "NEG", score: -0.9, area: "Integrations", themes: ["Integrations"] },
  { content: "No Slack integration? How is that still missing in 2025?", channel: "community", sentiment: "NEG", score: -0.65, area: "Integrations", themes: ["Integrations"] },
  { content: "The API rate limits are way too low for enterprise use cases.", channel: "support_ticket", sentiment: "NEG", score: -0.7, area: "Integrations", themes: ["Integrations"] },
  { content: "Salesforce sync is unreliable. Missed contacts keep slipping through.", channel: "sales_call", sentiment: "NEG", score: -0.8, area: "Integrations", themes: ["Integrations"] },
  // --- Integrations (POS) ---
  { content: "Love the new export feature, saved me an hour today.", channel: "community", sentiment: "POS", score: 0.8, area: "Integrations", themes: ["Integrations"] },
  { content: "The REST API is clean and well-documented. Integrated in a day.", channel: "community", sentiment: "POS", score: 0.85, area: "Integrations", themes: ["Integrations"] },

  // --- UI/UX (NEG) ---
  { content: "The new navigation is confusing. Can't find settings anymore.", channel: "nps_survey", sentiment: "NEG", score: -0.6, area: "UI/UX", themes: ["UI/UX"] },
  { content: "Tables are not sortable. Basic feature that every competitor has.", channel: "community", sentiment: "NEG", score: -0.55, area: "UI/UX", themes: ["UI/UX"] },
  { content: "Too many clicks to do simple tasks. Everything is buried in menus.", channel: "nps_survey", sentiment: "NEG", score: -0.65, area: "UI/UX", themes: ["UI/UX"] },
  { content: "The color contrast is terrible for anyone with visual impairments.", channel: "community", sentiment: "NEG", score: -0.7, area: "UI/UX", themes: ["UI/UX"] },
  { content: "Keyboard shortcuts don't work in Firefox. Chrome only apparently.", channel: "support_ticket", sentiment: "NEG", score: -0.6, area: "UI/UX", themes: ["UI/UX"] },
  // --- UI/UX (POS) ---
  { content: "The redesigned inbox is chef's kiss. Clean, fast, and intuitive.", channel: "community", sentiment: "POS", score: 0.9, area: "UI/UX", themes: ["UI/UX"] },
  { content: "Dark mode finally arrived and it's gorgeous. The entire team switched.", channel: "app_store", sentiment: "POS", score: 0.85, area: "UI/UX", themes: ["UI/UX"] },
  { content: "The keyboard shortcuts are incredible. Power users will love this.", channel: "community", sentiment: "POS", score: 0.8, area: "UI/UX", themes: ["UI/UX"] },

  // --- Support (NEG) ---
  { content: "Opened a ticket 5 days ago — still no response. Unacceptable for a paid plan.", channel: "support_ticket", sentiment: "NEG", score: -0.9, area: "Support", themes: ["Support"] },
  { content: "Documentation is completely outdated. Half the screenshots show a different UI.", channel: "community", sentiment: "NEG", score: -0.7, area: "Support", themes: ["Support"] },
  { content: "No live chat on weekends. Business doesn't stop on Saturday.", channel: "support_ticket", sentiment: "NEG", score: -0.65, area: "Support", themes: ["Support"] },
  { content: "Copy-paste answers from your support team. No one actually reads my issue.", channel: "support_ticket", sentiment: "NEG", score: -0.8, area: "Support", themes: ["Support"] },
  // --- Support (POS) ---
  { content: "Sarah on support was incredibly helpful — resolved my issue in 10 minutes.", channel: "nps_survey", sentiment: "POS", score: 0.95, area: "Support", themes: ["Support"] },
  { content: "The new help center is amazing. Found my answer without needing to contact anyone.", channel: "nps_survey", sentiment: "POS", score: 0.85, area: "Support", themes: ["Support"] },

  // --- Pricing (NEG) ---
  { content: "Pricing jumped 40% without warning. Long-time customer feeling punished.", channel: "community", sentiment: "NEG", score: -0.9, area: "Pricing", themes: ["Pricing"] },
  { content: "The feature we need is locked to the Enterprise tier but Enterprise is $500/month. Way too expensive.", channel: "sales_call", sentiment: "NEG", score: -0.85, area: "Pricing", themes: ["Pricing"] },
  { content: "Per-seat pricing doesn't make sense for occasional users. Need view-only roles at lower price.", channel: "nps_survey", sentiment: "NEG", score: -0.6, area: "Pricing", themes: ["Pricing"] },
  { content: "Competitor offers more features at half the price. Hard to justify renewal.", channel: "sales_call", sentiment: "NEG", score: -0.8, area: "Pricing", themes: ["Pricing"] },
  // --- Pricing (POS) ---
  { content: "The startup discount is really generous. Keeps us on the platform while we grow.", channel: "nps_survey", sentiment: "POS", score: 0.7, area: "Pricing", themes: ["Pricing"] },
  { content: "Great value for the price. ROI is clear within the first month.", channel: "sales_call", sentiment: "POS", score: 0.8, area: "Pricing", themes: ["Pricing"] },

  // --- Mixed/General ---
  { content: "Overall solid product. A few rough edges but nothing deal-breaking.", channel: "nps_survey", sentiment: "NEU", score: 0.2, area: "UI/UX", themes: ["UI/UX"] },
  { content: "Been using it for 2 years. Keeps getting better every quarter.", channel: "nps_survey", sentiment: "POS", score: 0.75, area: "UI/UX", themes: ["UI/UX"] },
  { content: "Your uptime has been bad this quarter. Three outages in six weeks.", channel: "support_ticket", sentiment: "NEG", score: -0.9, area: "Performance", themes: ["Performance"] },
  { content: "Please add bulk export of all data. Can't extract what I need.", channel: "community", sentiment: "NEG", score: -0.55, area: "Integrations", themes: ["Integrations"] },
  { content: "The AI suggestions feature is genuinely impressive. Saves hours every week.", channel: "nps_survey", sentiment: "POS", score: 0.9, area: "UI/UX", themes: ["UI/UX"] },
  { content: "Would love multi-language support. Our team is in 6 countries.", channel: "sales_call", sentiment: "NEU", score: -0.1, area: "Integrations", themes: ["Integrations"] },
  { content: "Security audit returned concerns about data residency. Need EU servers.", channel: "sales_call", sentiment: "NEG", score: -0.65, area: "Integrations", themes: ["Integrations"] },
  { content: "The reporting is way more powerful than what we had before. Night and day.", channel: "nps_survey", sentiment: "POS", score: 0.85, area: "UI/UX", themes: ["UI/UX"] },
  { content: "Getting error 500 intermittently on the dashboard. Can't reproduce consistently.", channel: "support_ticket", sentiment: "NEG", score: -0.7, area: "Performance", themes: ["Performance"] },
  { content: "Impressed by the quarterly product update. Keeps improving.", channel: "community", sentiment: "POS", score: 0.7, area: "UI/UX", themes: ["UI/UX"] },
  { content: "The team collaboration features are exactly what we needed.", channel: "nps_survey", sentiment: "POS", score: 0.8, area: "UI/UX", themes: ["UI/UX"] },
  { content: "Cannot change my email address. Seems like a basic feature.", channel: "support_ticket", sentiment: "NEG", score: -0.6, area: "UI/UX", themes: ["UI/UX"] },
  { content: "The audit log is missing too many events. Not useful for compliance.", channel: "sales_call", sentiment: "NEG", score: -0.65, area: "Integrations", themes: ["Integrations"] },
  { content: "Great product for the price point we're at.", channel: "nps_survey", sentiment: "POS", score: 0.65, area: "Pricing", themes: ["Pricing"] },
  { content: "Bulk actions on the inbox are a lifesaver. Please add more of them.", channel: "community", sentiment: "POS", score: 0.75, area: "UI/UX", themes: ["UI/UX"] },
  { content: "Permissions are too coarse-grained. Need field-level access control.", channel: "sales_call", sentiment: "NEG", score: -0.6, area: "Integrations", themes: ["Integrations"] },
  { content: "SSO would instantly convert our prospect to a customer. Asked 4 times this quarter.", channel: "sales_call", sentiment: "NEG", score: -0.8, area: "Integrations", themes: ["Integrations"] },
  { content: "Custom domain support would be a selling point for white-labeling.", channel: "sales_call", sentiment: "NEU", score: 0.0, area: "Integrations", themes: ["Integrations"] },
  { content: "Just migrated from a competitor and this is significantly better.", channel: "community", sentiment: "POS", score: 0.85, area: "UI/UX", themes: ["UI/UX"] },
  { content: "The CSV import is finally smart enough to detect column headers automatically.", channel: "community", sentiment: "POS", score: 0.75, area: "Integrations", themes: ["Integrations"] },
  { content: "Account provisioning for large teams is still a manual process. Needs SCIM.", channel: "sales_call", sentiment: "NEG", score: -0.7, area: "Integrations", themes: ["Integrations"] },
  { content: "I recommended this to my whole network. Worth every penny.", channel: "nps_survey", sentiment: "POS", score: 0.95, area: "Pricing", themes: ["Pricing"] },
  { content: "The onboarding email sequence is helpful. Exactly what new users need.", channel: "nps_survey", sentiment: "POS", score: 0.7, area: "Onboarding", themes: ["Onboarding"] },
  { content: "Third data loss incident this year. I'm questioning our continued usage.", channel: "support_ticket", sentiment: "NEG", score: -0.95, area: "Performance", themes: ["Performance"] },
  { content: "Filter options in the dashboard aren't sticky. Reset on every page load.", channel: "community", sentiment: "NEG", score: -0.55, area: "UI/UX", themes: ["UI/UX"] },
  { content: "The calendar view is beautiful. Best implementation I've seen.", channel: "app_store", sentiment: "POS", score: 0.9, area: "UI/UX", themes: ["UI/UX"] },
  { content: "No custom branding on reports. Hard to share with clients.", channel: "sales_call", sentiment: "NEG", score: -0.6, area: "Integrations", themes: ["Integrations"] },
  { content: "Onboarding videos are too long. 20-minute walkthroughs lose people.", channel: "nps_survey", sentiment: "NEG", score: -0.5, area: "Onboarding", themes: ["Onboarding"] },
  { content: "This tool genuinely changed how our product team makes decisions.", channel: "community", sentiment: "POS", score: 0.95, area: "UI/UX", themes: ["UI/UX"] },
  { content: "Feature request: scheduled report emails. Would save so much time.", channel: "community", sentiment: "NEU", score: 0.1, area: "UI/UX", themes: ["UI/UX"] },
  { content: "Auto-save should be the default. Lost 30 minutes of work when the browser crashed.", channel: "support_ticket", sentiment: "NEG", score: -0.75, area: "UI/UX", themes: ["UI/UX"] },
  { content: "Comparison view between time periods is missing. Need it for reporting.", channel: "community", sentiment: "NEG", score: -0.5, area: "UI/UX", themes: ["UI/UX"] },
  { content: "The new team management page is way more intuitive.", channel: "community", sentiment: "POS", score: 0.7, area: "Onboarding", themes: ["Onboarding", "UI/UX"] },
  { content: "Mobile push notifications for critical alerts would be extremely helpful.", channel: "app_store", sentiment: "NEU", score: 0.05, area: "Mobile", themes: ["Mobile"] },
  { content: "Pricing calculator on the website is confusing. Spent 20 minutes trying to figure out the right plan.", channel: "sales_call", sentiment: "NEG", score: -0.6, area: "Pricing", themes: ["Pricing"] },
  { content: "Your product has become mission-critical for us. Please keep the innovation coming.", channel: "nps_survey", sentiment: "POS", score: 0.9, area: "UI/UX", themes: ["UI/UX"] },
  { content: "Undo / redo functionality is missing throughout the app.", channel: "community", sentiment: "NEG", score: -0.55, area: "UI/UX", themes: ["UI/UX"] },
  { content: "First month on the paid plan — already showing ROI. Great product.", channel: "nps_survey", sentiment: "POS", score: 0.8, area: "Pricing", themes: ["Pricing"] },
  { content: "I want to give 5 stars but the Android app holds me back. Please fix it.", channel: "app_store", sentiment: "NEU", score: -0.15, area: "Mobile", themes: ["Mobile"] },
  { content: "The timeline view is incredibly useful for tracking feedback trends.", channel: "community", sentiment: "POS", score: 0.75, area: "UI/UX", themes: ["UI/UX"] },
  { content: "Wish there was a free tier to evaluate properly before committing.", channel: "nps_survey", sentiment: "NEU", score: -0.1, area: "Pricing", themes: ["Pricing"] },
  { content: "Support SLA is not met consistently on the Business plan.", channel: "support_ticket", sentiment: "NEG", score: -0.7, area: "Support", themes: ["Support"] },
  { content: "Two-factor authentication UI is clunky. Should work with any TOTP app smoothly.", channel: "community", sentiment: "NEG", score: -0.5, area: "UI/UX", themes: ["UI/UX"] },
  { content: "Custom fields for feedback items would make tagging much more powerful.", channel: "community", sentiment: "NEU", score: 0.1, area: "UI/UX", themes: ["UI/UX"] },
  { content: "Excellent product quality documentation. Rare to see this level of detail.", channel: "nps_survey", sentiment: "POS", score: 0.85, area: "Support", themes: ["Support"] },
  { content: "Data export doesn't include all fields. Missing custom attributes.", channel: "support_ticket", sentiment: "NEG", score: -0.6, area: "Integrations", themes: ["Integrations"] },
  { content: "Best onboarding call I've ever had with a software company. Thorough and helpful.", channel: "sales_call", sentiment: "POS", score: 0.9, area: "Onboarding", themes: ["Onboarding", "Support"] },
  { content: "The performance benchmarks you published don't match real-world results.", channel: "community", sentiment: "NEG", score: -0.65, area: "Performance", themes: ["Performance"] },
  { content: "This has replaced three other tools for our team. Worth the price.", channel: "sales_call", sentiment: "POS", score: 0.85, area: "Pricing", themes: ["Pricing"] },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await db.feedbackTheme.deleteMany();
  await db.embedding.deleteMany();
  await db.feedback.deleteMany();
  await db.theme.deleteMany();
  await db.report.deleteMany();
  await db.inviteToken.deleteMany();
  await db.user.deleteMany();
  await db.workspace.deleteMany();

  // Create demo workspace
  const workspace = await db.workspace.create({
    data: {
      name: "Acme Corp",
      slug: "acme-corp",
    },
  });
  console.log("✅ Created workspace:", workspace.name);

  // Create users
  const [adminUser, analystUser, viewerUser] = await Promise.all([
    db.user.create({
      data: {
        name: "Alex Admin",
        email: "admin@acme.com",
        passwordHash: await bcrypt.hash("Demo1234!", 12),
        role: "ADMIN",
        workspaceId: workspace.id,
      },
    }),
    db.user.create({
      data: {
        name: "Ana Analyst",
        email: "analyst@acme.com",
        passwordHash: await bcrypt.hash("Demo1234!", 12),
        role: "ANALYST",
        workspaceId: workspace.id,
      },
    }),
    db.user.create({
      data: {
        name: "Victor Viewer",
        email: "viewer@acme.com",
        passwordHash: await bcrypt.hash("Demo1234!", 12),
        role: "VIEWER",
        workspaceId: workspace.id,
      },
    }),
  ]);
  console.log("✅ Created 3 users (admin, analyst, viewer)");

  // Create themes
  const createdThemes = await Promise.all(
    THEMES.map((t) =>
      db.theme.create({
        data: { ...t, workspaceId: workspace.id },
      })
    )
  );
  const themeMap = new Map<string, { id: string; name: string }>(
    createdThemes.map((t: { id: string; name: string }) => [t.name, t])
  );
  console.log(`✅ Created ${createdThemes.length} themes`);

  // Create feedback items spread over last 90 days
  const now = new Date();
  let feedbackCreated = 0;

  for (let i = 0; i < FEEDBACK_ITEMS.length; i++) {
    const item = FEEDBACK_ITEMS[i];
    // Spread items across last 90 days
    const daysAgo = Math.floor((i / FEEDBACK_ITEMS.length) * 90);
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const feedback = await db.feedback.create({
      data: {
        content: item.content,
        channel: item.channel as any,
        sentiment: item.sentiment as any,
        sentimentScore: item.score,
        featureArea: item.area,
        rationale: `Classified as ${item.sentiment.toLowerCase()} — related to ${item.area}.`,
        classified: true,
        status: i % 3 === 0 ? "REVIEWED" : i % 7 === 0 ? "ACTIONED" : "NEW",
        workspaceId: workspace.id,
        createdAt,
        updatedAt: createdAt,
      },
    });

    // Assign themes
    for (const themeName of item.themes) {
      const theme = themeMap.get(themeName);
      if (theme) {
        await db.feedbackTheme.create({
          data: {
            feedbackId: feedback.id,
            themeId: theme.id,
            confidence: 0.85 + Math.random() * 0.14,
          },
        });
      }
    }

    // Create vector embedding for semantic search
    const mockVector = new Array(384).fill(0);
    const lowerContent = item.content.toLowerCase();
    for (let charIdx = 0; charIdx < lowerContent.length; charIdx++) {
      mockVector[charIdx % 384] += lowerContent.charCodeAt(charIdx) / 255;
    }
    const norm = Math.sqrt(mockVector.reduce((s, v) => s + v * v, 0)) || 1;
    const normalizedVec = mockVector.map((v) => v / norm);

    await db.embedding.create({
      data: {
        feedbackId: feedback.id,
        vector: JSON.stringify(normalizedVec),
      },
    });

    feedbackCreated++;
  }

  console.log(`✅ Created ${feedbackCreated} feedback items`);

  // Create a sample report
  await db.report.create({
    data: {
      title: "Weekly VoC Report — Last 30 Days",
      periodStart: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      periodEnd: now,
      contentJson: {
        executiveSummary:
          "This period saw strong negative signals around billing and mobile performance, offset by positive reception of the recent UI redesign. Onboarding complaints are trending up — immediate attention recommended.",
        topThemes: [
          { name: "Mobile", count: 22, delta: 15 },
          { name: "Performance", count: 18, delta: 8 },
          { name: "Billing", count: 14, delta: -5 },
          { name: "UI/UX", count: 12, delta: 20 },
          { name: "Onboarding", count: 10, delta: 40 },
        ],
        sentimentAnalysis: {
          positive: 35,
          neutral: 20,
          negative: 65,
          previousPositive: 30,
          previousNegative: 58,
        },
        notableQuotes: [
          {
            content: "Third data loss incident this year. I'm questioning our continued usage.",
            channel: "support_ticket",
            sentiment: "NEG",
          },
          {
            content: "This tool genuinely changed how our product team makes decisions.",
            channel: "community",
            sentiment: "POS",
          },
        ],
        recommendedActions: [
          "Prioritize mobile app stability — crash rate is the top complaint.",
          "Improve billing page reliability; invoice download timeouts are frequent.",
          "Simplify onboarding flow — reduce steps from 12 to under 5.",
          "Investigate performance regressions in dashboard loading.",
          "Fast-track SSO implementation to unblock at least 3 enterprise deals.",
        ],
        totalItems: 120,
        periodLabel: "Last 30 days",
      },
      workspaceId: workspace.id,
      generatedById: adminUser.id,
    },
  });
  console.log("✅ Created sample report");

  console.log("\n🎉 Seeding complete!");
  console.log("\n📋 Demo credentials:");
  console.log("  Admin:   admin@acme.com  / Demo1234!");
  console.log("  Analyst: analyst@acme.com / Demo1234!");
  console.log("  Viewer:  viewer@acme.com  / Demo1234!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
