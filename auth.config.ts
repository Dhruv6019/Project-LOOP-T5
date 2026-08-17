// auth.config.ts
// Edge-compatible NextAuth configuration (safe for Next.js Middleware & App Router)

import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  trustHost: true, // Mandatory for NextAuth v5 to trust localhost & production hosts
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "loop-secret-key-super-secure-32-chars-minimum",
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.workspaceId = (user as any).workspaceId;
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
  providers: [], // Added dynamically in lib/auth.ts for Node.js runtime
};
