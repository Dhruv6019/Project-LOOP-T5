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
    async redirect({ url, baseUrl }) {
      let targetBase = baseUrl;
      if (typeof window === "undefined" && targetBase?.includes("localhost:3000") && process.env.NODE_ENV === "production") {
        targetBase = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "https://projectloop.vercel.app";
      }

      if (url.includes("localhost:3000") && (process.env.NODE_ENV === "production" || !targetBase.includes("localhost"))) {
        return url.replace(/https?:\/\/localhost:3000/g, targetBase);
      }

      // Allows relative callback URLs
      if (url.startsWith("/")) return `${targetBase}${url}`;

      // Allows callback URLs on the same origin
      try {
        if (new URL(url).origin === new URL(targetBase).origin) return url;
      } catch {}

      return targetBase;
    },
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
