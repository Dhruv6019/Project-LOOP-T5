// app/api/user/profile/route.ts
// Secure database-connected Profile management for all authenticated users

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, hashPassword } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(100, "Name is too long").optional(),
  email: z.string().email("Invalid email address").optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "New password must be at least 6 characters").optional(),
});

// GET /api/user/profile — Retrieve current user profile details
export async function GET() {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        workspaceId: true,
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            createdAt: true,
            _count: {
              select: {
                users: true,
                feedback: true,
                themes: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (error: any) {
    console.error("GET Profile error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch user profile" },
      { status: error?.status || 500 }
    );
  }
}

// PATCH /api/user/profile — Update user profile (name, email, password) in the database
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const body = await request.json();
    const parsed = UpdateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, currentPassword, newPassword } = parsed.data;

    // Fetch existing user to verify password if password change requested
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: {
      name?: string;
      email?: string;
      passwordHash?: string;
    } = {};

    // 1. Update Name if provided
    if (name !== undefined) {
      updateData.name = name.trim();
    }

    // 2. Update Email if changed
    if (email && email.toLowerCase() !== existingUser.email.toLowerCase()) {
      const emailLower = email.toLowerCase().trim();
      
      // Check if email already in use
      const emailTaken = await db.user.findUnique({
        where: { email: emailLower },
      });

      if (emailTaken && emailTaken.id !== userId) {
        return NextResponse.json(
          { error: "This email address is already in use by another account" },
          { status: 409 }
        );
      }

      updateData.email = emailLower;
    }

    // 3. Update Password if requested
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password" },
          { status: 400 }
        );
      }

      // Check current password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        existingUser.passwordHash
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Incorrect current password" },
          { status: 401 }
        );
      }

      updateData.passwordHash = await hashPassword(newPassword);
    }

    // Execute database update in Prisma
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        workspaceId: true,
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: updatedUser,
      message: "Profile updated successfully in database",
    });
  } catch (error: any) {
    console.error("PATCH Profile error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update profile" },
      { status: error?.status || 500 }
    );
  }
}
