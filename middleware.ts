import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;

  const isProtectedPath = pathname.startsWith("/owner") || pathname.startsWith("/admin");
  const isLoginPage = pathname === "/login";

  // 1. If user is trying to access owner/admin portal without a valid session
  if (isProtectedPath && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Strict RBAC for Executive Admin Panel (/admin)
  // ONLY ADMIN and OWNER are allowed into /admin.
  // CASHIER and KITCHEN must NOT have access to /admin!
  if (pathname.startsWith("/admin") && session) {
    if (session.role !== "ADMIN" && session.role !== "OWNER") {
      const redirectTarget = session.role === "KITCHEN" ? "/owner/orders" : "/owner/pos";
      return NextResponse.redirect(new URL(redirectTarget, request.url));
    }
  }

  // 3. Strict RBAC for KITCHEN role
  // Kitchen display user only needs /owner/orders (Kitchen Display Screen).
  if (session && session.role === "KITCHEN") {
    if (
      pathname.startsWith("/owner/pos") ||
      pathname.startsWith("/owner/reports") ||
      pathname.startsWith("/owner/shifts") ||
      pathname.startsWith("/owner/customers")
    ) {
      return NextResponse.redirect(new URL("/owner/orders", request.url));
    }
  }

  // 4. Strict RBAC for CASHIER role
  // Cashiers should not access management reports
  if (session && session.role === "CASHIER" && pathname.startsWith("/owner/reports")) {
    return NextResponse.redirect(new URL("/owner/pos", request.url));
  }

  // 5. If user is already logged in and visits /login, redirect to their role-appropriate home
  if (isLoginPage && session) {
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    if (redirectParam) {
      return NextResponse.redirect(new URL(redirectParam, request.url));
    }
    if (session.role === "ADMIN" || session.role === "OWNER") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (session.role === "KITCHEN") {
      return NextResponse.redirect(new URL("/owner/orders", request.url));
    }
    return NextResponse.redirect(new URL("/owner/pos", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/owner/:path*", "/admin/:path*", "/login"],
};


