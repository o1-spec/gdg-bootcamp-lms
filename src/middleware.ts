import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "bootcamp_lms_session";
const JWT_SECRET = process.env.AUTH_SECRET || "fallback-secret-for-development-min-32-chars-long";
const secretKey = new TextEncoder().encode(JWT_SECRET);

// Protected path prefixes
const protectedPaths = [
  "/tracks",
  "/resources",
  "/assignments",
  "/schedule",
  "/progress",
  "/attendance",
  "/announcements",
  "/dashboard",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  let isAuthenticated = false;
  if (token) {
    try {
      await jwtVerify(token, secretKey);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // If user is accessing login or register while already authenticated, redirect to home
  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check if current route is protected or root dashboard
  const isProtected =
    pathname === "/" ||
    protectedPaths.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Don't append returnUrl for root page
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes handle their own auth responses)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
