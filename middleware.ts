import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;

  const isProtectedPath = pathname.startsWith("/owner") || pathname.startsWith("/admin");
  const isLoginPage = pathname === "/login";

  // If user is trying to access owner/admin portal without a valid session
  if (isProtectedPath && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is already logged in and visits /login, redirect to requested page or /owner/orders
  if (isLoginPage && session) {
    const redirectParam = request.nextUrl.searchParams.get("redirect") || "/owner/orders";
    return NextResponse.redirect(new URL(redirectParam, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/owner/:path*", "/admin/:path*", "/login"],
};

