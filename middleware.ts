import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  ADMIN_COOKIE_NAME,
  verifySessionTokenEdge,
  verifyAdminSessionTokenEdge,
} from "./lib/auth-edge";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 1. Admin UI Routes protection
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const adminSession = adminToken ? await verifyAdminSessionTokenEdge(adminToken) : null;

    if (isLoginPage) {
      if (adminSession) {
        // If already signed in as admin, redirect directly to admin overview
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.next();
    }

    if (!adminSession) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 2. Admin API Routes protection
  if (pathname.startsWith("/api/admin")) {
    const isAuthRoute = pathname === "/api/admin/auth";
    if (isAuthRoute) {
      return NextResponse.next();
    }

    const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const adminSession = adminToken ? await verifyAdminSessionTokenEdge(adminToken) : null;

    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Administrator credentials required." },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // 3. Customer Protected UI Routes
  const isProtectedCustomerRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/wizard") ||
    pathname.startsWith("/will") ||
    pathname === "/checkout/court-fee";

  if (isProtectedCustomerRoute) {
    const userToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const userSession = userToken ? await verifySessionTokenEdge(userToken) : null;

    if (!userSession) {
      const signinUrl = new URL("/auth/signin", req.url);
      signinUrl.searchParams.set("next", pathname + search);
      return NextResponse.redirect(signinUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/dashboard/:path*",
    "/wizard/:path*",
    "/will/:path*",
    "/checkout/court-fee",
  ],
};

