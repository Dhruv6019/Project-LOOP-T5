// middleware.ts
// Protects all (app) routes — redirects unauthenticated users to /login
// Redirects logged-in users from homepage (/) and auth pages (/login, /signup) to /dashboard

import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req: NextRequest & { auth: any }) => {
  const isLoggedIn = !!req.auth?.user;
  const { pathname } = req.nextUrl;

  // 1. Root homepage: Redirect logged-in users to /dashboard, show homepage ONLY to guests
  if (pathname === "/") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // 2. Redirect logged-in users away from /login and /signup
  if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 3. Public routes that guests can access
  const publicRoutes = ["/login", "/signup", "/api/auth", "/api/feedback"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  if (isPublicRoute) return NextResponse.next();

  // 4. Protected app routes: Redirect unauthenticated guests to /login
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all paths except static files, images, and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
