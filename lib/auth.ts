// lib/auth.ts
// NextAuth configuration + role guard helpers (Node.js runtime with Prisma & bcrypt)

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { LoginSchema } from "@/lib/validations";
import { authConfig } from "@/auth.config";
import type { Role } from "@/types";

import Google from "next-auth/providers/google";
import { cookies } from "next/headers";
import { slugify } from "@/lib/utils";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            passwordHash: true,
            role: true,
            workspaceId: true,
          },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as Role,
          workspaceId: user.workspaceId,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        // 1. Check if user already exists
        const existing = await db.user.findUnique({
          where: { email: user.email },
        });

        if (existing) {
          (user as any).id = existing.id;
          (user as any).role = existing.role;
          (user as any).workspaceId = existing.workspaceId;
          return true;
        }

        // 2. New user: check for pending workspace name passed during signup
        let workspaceName = "My Workspace";
        try {
          const cookieStore = cookies();
          const cookieVal = cookieStore.get("pending_workspace_name")?.value;
          if (cookieVal) {
            workspaceName = decodeURIComponent(cookieVal);
          } else if (user.name) {
            workspaceName = `${user.name}'s Workspace`;
          }
        } catch {
          if (user.name) workspaceName = `${user.name}'s Workspace`;
        }

        const slug = slugify(workspaceName);
        const uniqueSlug = `${slug}-${Date.now()}`;

        const created = await db.$transaction(async (tx) => {
          const workspace = await tx.workspace.create({
            data: { name: workspaceName, slug: uniqueSlug },
          });

          const newUser = await tx.user.create({
            data: {
              name: user.name || "User",
              email: user.email!,
              passwordHash: await hashPassword(Math.random().toString(36) + Date.now().toString()),
              role: "ADMIN",
              workspaceId: workspace.id,
            },
          });

          return { workspace, user: newUser };
        });

        (user as any).id = created.user.id;
        (user as any).role = created.user.role;
        (user as any).workspaceId = created.workspace.id;
        return true;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.workspaceId = (user as any).workspaceId;
      } else if (token.email && (!token.workspaceId || !token.role)) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true, workspaceId: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.workspaceId = dbUser.workspaceId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).workspaceId = token.workspaceId;
      }
      return session;
    },
  },
});

// ---- Role guard helpers ----

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number = 401) {
    super(message);
    this.status = status;
    this.name = "AuthError";
  }
}

/**
 * Get the current session and throw if not authenticated.
 * Returns typed session with role and workspaceId.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthError("Unauthorized — please log in", 401);
  }
  return session as unknown as {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: Role;
      workspaceId: string;
    };
  };
}

/**
 * Require the user to have one of the specified roles.
 * Throws 403 if role doesn't match.
 */
export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.user.role)) {
    throw new AuthError(
      `Forbidden — requires one of: ${allowedRoles.join(", ")}`,
      403,
    );
  }
  return session;
}

/**
 * Returns the workspace ID from the current session.
 * Throws if not authenticated.
 */
export async function getWorkspaceId(): Promise<string> {
  const session = await requireAuth();
  return session.user.workspaceId;
}

/**
 * Check if a role has write permissions.
 */
export function canWrite(role: Role): boolean {
  return role === "ADMIN" || role === "ANALYST";
}

/**
 * Check if a role is an admin.
 */
export function isAdmin(role: Role): boolean {
  return role === "ADMIN";
}

/**
 * Hash a password for storage.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
