// lib/email.ts
// Universal Email Dispatcher for Project LOOP
// Supports SMTP (Gmail, SendGrid, Postmark, AWS SES, Resend) + Auto Dev Preview Fallback

import nodemailer from "nodemailer";

interface InviteEmailOptions {
  to: string;
  inviterName: string;
  inviterEmail: string;
  workspaceName: string;
  role: string;
  inviteUrl: string;
}

interface VoCReportEmailOptions {
  to: string | string[];
  reportTitle: string;
  periodLabel: string;
  executiveSummary: string;
  topThemes?: Array<{ name: string; count: number; delta: number }>;
  sentimentAnalysis?: { positive: number; neutral: number; negative: number };
  recommendedActions?: string[];
  reportUrl: string;
  senderName: string;
  customNote?: string;
}

// Create Nodemailer Transporter
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Development Fallback Transporter (Simulated / Local Stream)
  return nodemailer.createTransport({
    jsonTransport: true,
  });
}

const FROM_EMAIL = process.env.SMTP_FROM || '"Project LOOP VoC" <notifications@projectloop.ai>';

// ============================================================
// 1. Send Workspace Member Invitation Email
// ============================================================
export async function sendWorkspaceInviteEmail(options: InviteEmailOptions) {
  const { to, inviterName, inviterEmail, workspaceName, role, inviteUrl } = options;
  const transporter = getTransporter();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #0F172A; margin: 0; padding: 40px 20px; }
    .container { max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
    .header { background: #0F172A; padding: 36px 32px; text-align: center; color: #FFFFFF; }
    .logo { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #FFFFFF; margin-bottom: 6px; }
    .subtitle { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #818CF8; font-weight: 700; }
    .body { padding: 36px 32px; }
    h1 { font-size: 20px; font-weight: 800; color: #0F172A; margin-top: 0; }
    p { font-size: 14px; line-height: 1.6; color: #475569; margin: 16px 0; }
    .badge-box { background: #F1F5F9; border-radius: 16px; padding: 18px; margin: 24px 0; border: 1px solid #E2E8F0; }
    .badge-item { display: flex; justify-content: space-between; font-size: 13px; margin: 6px 0; }
    .badge-label { color: #64748B; font-weight: 600; }
    .badge-val { color: #0F172A; font-weight: 800; }
    .btn-container { text-align: center; margin: 32px 0 24px; }
    .btn { display: inline-block; background: #4F46E5; color: #FFFFFF !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
    .footer { text-align: center; font-size: 11px; color: #94A3B8; padding: 24px 32px; border-top: 1px solid #F1F5F9; background: #FAFAFA; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">LOOP</div>
      <div class="subtitle">Voice-of-Customer Intelligence</div>
    </div>
    <div class="body">
      <h1>You're invited to join ${workspaceName}</h1>
      <p>
        <strong>${inviterName || inviterEmail}</strong> has invited you to collaborate on customer feedback intelligence, AI thematic clustering, and executive VoC reporting.
      </p>
      
      <div class="badge-box">
        <div class="badge-item">
          <span class="badge-label">Workspace:</span>
          <span class="badge-val">${workspaceName}</span>
        </div>
        <div class="badge-item">
          <span class="badge-label">Assigned Role:</span>
          <span class="badge-val" style="color: #4F46E5;">${role}</span>
        </div>
        <div class="badge-item">
          <span class="badge-label">Invited by:</span>
          <span class="badge-val">${inviterName || inviterEmail}</span>
        </div>
      </div>

      <div class="btn-container">
        <a href="${inviteUrl}" class="btn">Accept Invitation & Join</a>
      </div>

      <p style="font-size: 12px; color: #94A3B8; text-align: center;">
        This invitation is valid for 7 days. If you did not expect this invitation, you can safely ignore this email.
      </p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Project LOOP Inc. • Autonomous VoC Intelligence
    </div>
  </div>
</body>
</html>
`;

  const mailOptions = {
    from: FROM_EMAIL,
    to,
    subject: `Join ${workspaceName} on Project LOOP (${role} Access)`,
    html,
  };

  const result = await transporter.sendMail(mailOptions);
  console.log(`[Email] Sent workspace invitation to ${to}. MessageId:`, (result as any)?.messageId || "simulated-ok");
  return result;
}

// ============================================================
// 2. Send Executive VoC Report Email
// ============================================================
export async function sendVoCReportEmail(options: VoCReportEmailOptions) {
  const {
    to,
    reportTitle,
    periodLabel,
    executiveSummary,
    topThemes = [],
    sentimentAnalysis = { positive: 0, neutral: 0, negative: 0 },
    recommendedActions = [],
    reportUrl,
    senderName,
    customNote,
  } = options;

  const transporter = getTransporter();

  const themesHtml = topThemes
    .map(
      (t) => `
      <tr style="border-bottom: 1px solid #F1F5F9;">
        <td style="padding: 10px 12px; font-weight: 700; color: #0F172A; font-size: 13px;">${t.name}</td>
        <td style="padding: 10px 12px; color: #64748B; font-size: 13px;">${t.count} items</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 700; font-size: 12px; color: ${
          t.delta >= 0 ? "#059669" : "#E11D48"
        }">${t.delta >= 0 ? "+" : ""}${t.delta}%</td>
      </tr>`
    )
    .join("");

  const actionsHtml = recommendedActions
    .map(
      (action, idx) => `
      <div style="display: flex; margin-bottom: 10px; font-size: 13px; color: #334155; line-height: 1.5;">
        <span style="background: #4F46E5; color: #FFF; width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; margin-right: 10px; flex-shrink: 0;">${idx + 1}</span>
        <span>${action}</span>
      </div>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #0F172A; margin: 0; padding: 40px 20px; }
    .container { max-width: 620px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 25px rgba(0,0,0,0.04); }
    .header { background: #0F172A; padding: 32px; color: #FFFFFF; }
    .tag { display: inline-block; background: rgba(99, 102, 241, 0.25); border: 1px solid rgba(129, 140, 248, 0.4); color: #C7D2FE; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px; }
    .title { font-size: 22px; font-weight: 900; color: #FFFFFF; margin: 0 0 6px; letter-spacing: -0.3px; }
    .period { font-size: 12px; color: #94A3B8; font-weight: 600; }
    .body { padding: 32px; }
    .custom-note { background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 14px 16px; border-radius: 0 12px 12px 0; font-size: 13px; color: #1E3A8A; margin-bottom: 24px; }
    .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0F172A; margin: 24px 0 12px; }
    .summary-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; font-size: 14px; line-height: 1.6; color: #334155; }
    .stats-grid { display: table; width: 100%; margin: 16px 0; }
    .stat-col { display: table-cell; width: 33.33%; padding: 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; text-align: center; }
    .btn-container { text-align: center; margin: 32px 0 16px; }
    .btn { display: inline-block; background: #0F172A; color: #FFFFFF !important; font-size: 13px; font-weight: 700; text-decoration: none; padding: 14px 30px; border-radius: 9999px; }
    .footer { text-align: center; font-size: 11px; color: #94A3B8; padding: 24px 32px; border-top: 1px solid #F1F5F9; background: #FAFAFA; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="tag">Executive VoC Intelligence</span>
      <h1 class="title">${reportTitle}</h1>
      <div class="period">Evaluation Period: ${periodLabel} • Shared by ${senderName}</div>
    </div>

    <div class="body">
      ${customNote ? `<div class="custom-note"><strong>Note from ${senderName}:</strong> ${customNote}</div>` : ""}

      <div class="section-title">Executive Summary</div>
      <div class="summary-box">
        ${executiveSummary}
      </div>

      <div class="section-title">Sentiment Distribution</div>
      <table style="width: 100%; border-collapse: separate; border-spacing: 8px 0; margin-bottom: 20px;">
        <tr>
          <td style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 14px; text-align: center;">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #065F46;">Positive</div>
            <div style="font-size: 20px; font-weight: 900; color: #047857; margin-top: 4px;">${sentimentAnalysis.positive}</div>
          </td>
          <td style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px; text-align: center;">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569;">Neutral</div>
            <div style="font-size: 20px; font-weight: 900; color: #0F172A; margin-top: 4px;">${sentimentAnalysis.neutral}</div>
          </td>
          <td style="background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 12px; padding: 14px; text-align: center;">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #9F1239;">Negative</div>
            <div style="font-size: 20px; font-weight: 900; color: #BE123C; margin-top: 4px;">${sentimentAnalysis.negative}</div>
          </td>
        </tr>
      </table>

      ${topThemes.length > 0 ? `
      <div class="section-title">Top Customer Themes</div>
      <table style="width: 100%; border-collapse: collapse; background: #F8FAFC; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0;">
        ${themesHtml}
      </table>
      ` : ""}

      ${recommendedActions.length > 0 ? `
      <div class="section-title" style="margin-top: 24px;">Recommended Product Actions</div>
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 18px;">
        ${actionsHtml}
      </div>
      ` : ""}

      <div class="btn-container">
        <a href="${reportUrl}" class="btn">Open Interactive Report in LOOP →</a>
      </div>
    </div>

    <div class="footer">
      Generated automatically by Project LOOP Voice-of-Customer Platform.
    </div>
  </div>
</body>
</html>
`;

  const recipients = Array.isArray(to) ? to.join(", ") : to;
  const mailOptions = {
    from: FROM_EMAIL,
    to: recipients,
    subject: `[VoC Report] ${reportTitle} (${periodLabel})`,
    html,
  };

  const result = await transporter.sendMail(mailOptions);
  console.log(`[Email] Sent VoC Report to ${recipients}. MessageId:`, (result as any)?.messageId || "simulated-ok");
  return result;
}
