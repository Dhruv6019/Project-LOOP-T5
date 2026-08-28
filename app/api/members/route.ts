// app/api/members/route.ts
// GET: list workspace members | POST: invite new member via email

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole, requireAuth } from "@/lib/auth";
import { InviteMemberSchema } from "@/lib/validations";
import { sendWorkspaceInviteEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const members = await db.user.findMany({
      where: { workspaceId: session.user.workspaceId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ data: members });
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["ADMIN"]);
    const body = await request.json();
    const parsed = InviteMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const { email, role } = parsed.data;
    const workspaceId = session.user.workspaceId;

    // Fetch workspace name
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, name: true },
    });

    const workspaceName = workspace?.name || "Project LOOP Workspace";
    const inviterName = session.user.name || session.user.email?.split("@")[0] || "Workspace Admin";
    const inviterEmail = session.user.email || "admin@projectloop.ai";

    const origin = request.nextUrl.origin || process.env.NEXTAUTH_URL || "https://projectloop.vercel.app";

    // 1. Check if user already in workspace
    const existing = await db.user.findFirst({ where: { email, workspaceId } });
    if (existing) {
      return NextResponse.json({ error: "This user is already a member of your workspace" }, { status: 409 });
    }

    // 2. Check if user exists in the system
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      const updated = await db.user.update({
        where: { id: existingUser.id },
        data: { workspaceId, role },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });

      // Send email notification to user
      try {
        await sendWorkspaceInviteEmail({
          to: email,
          inviterName,
          inviterEmail,
          workspaceName,
          role,
          inviteUrl: `${origin}/dashboard`,
        });
      } catch (e) {
        console.error("Failed to send invite email:", e);
      }

      return NextResponse.json(
        { data: updated, message: `User added to workspace and invitation notification emailed to ${email}.` },
        { status: 201 }
      );
    }

    // 3. Create an invite token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await db.inviteToken.create({
      data: { email, role, workspaceId, expiresAt },
    });

    const inviteUrl = `${origin}/signup?token=${invite.token}&email=${encodeURIComponent(email)}&role=${role}&workspaceName=${encodeURIComponent(workspaceName)}`;

    // Dispatch branded invitation email
    try {
      await sendWorkspaceInviteEmail({
        to: email,
        inviterName,
        inviterEmail,
        workspaceName,
        role,
        inviteUrl,
      });
    } catch (e) {
      console.error("Failed to send invite email:", e);
    }

    return NextResponse.json(
      {
        data: invite,
        inviteUrl,
        message: `Invitation email dispatched to ${email} with role ${role}!`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Failed to invite member" }, { status: 500 });
  }
}
