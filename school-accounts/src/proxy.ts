/**
 * middleware.ts
 * Next.js middleware that runs on every request.
 *
 * Protection rules:
 * - /login → public (redirect to dashboard if already logged in)
 * - /dashboard, /transactions, /categories, /students, /reports → require auth
 * - Role-based checks:
 *     ADMIN       → all routes
 *     ACCOUNTANT  → dashboard, transactions (create), categories (read), students (read)
 *     VIEWER      → dashboard, reports (read-only)
 *
 * Fine-grained role checks are also enforced at the server action level.
 */

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that do NOT require authentication
const PUBLIC_ROUTES = ["/login"];

// Routes that require ADMIN role only
const ADMIN_ONLY_ROUTES = ["/categories", "/students"];

export default auth(function middleware(req: NextRequest & { auth: { user?: { role?: string } } | null }) {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    // Redirect already-authenticated users away from /login
    if (session?.user) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user.role;

  // VIEWER can only access dashboard and reports
  if (role === "VIEWER") {
    const allowed = ["/dashboard", "/reports"];
    if (!allowed.some((r) => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // ACCOUNTANT cannot access admin-only routes
  if (role === "ACCOUNTANT" && ADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  // Match all routes except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
