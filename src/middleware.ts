import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "bootcamp_lms_session";
const JWT_SECRET = process.env.AUTH_SECRET || "fallback-secret-for-development-min-32-chars-long";
const secretKey = new TextEncoder().encode(JWT_SECRET);

// Protected path prefixes for students, mentors, and admins
const protectedPaths = [
  "/tracks",
  "/resources",
  "/assignments",
  "/schedule",
  "/progress",
  "/attendance",
  "/announcements",
  "/dashboard",
  "/profile",
  "/onboarding",
  "/mentor",
  "/admin",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  let isAuthenticated = false;
  let userRole: string | undefined = undefined;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      isAuthenticated = true;
      userRole = payload.role as string;
    } catch {
      isAuthenticated = false;
    }
  }

  // If user is accessing login or register while already authenticated, redirect based on role
  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    let destination = "/";
    if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
      destination = "/admin/dashboard";
    } else if (userRole === "MENTOR") {
      destination = "/mentor/dashboard";
    }
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Check if current route is protected or root dashboard
  const isProtected =
    pathname === "/" ||
    protectedPaths.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Restrict /admin routes: ONLY ADMIN and SUPER_ADMIN can access
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
    if (!isAdmin) {
      // Forbidden: redirect mentors to mentor dashboard, students to student dashboard
      return NextResponse.redirect(
        new URL(userRole === "MENTOR" ? "/mentor/dashboard" : "/", request.url)
      );
    }
  }

  // Restrict /mentor routes: only MENTOR, ADMIN, SUPER_ADMIN can access
  if (pathname.startsWith("/mentor")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const isStaff = userRole === "MENTOR" || userRole === "ADMIN" || userRole === "SUPER_ADMIN";
    if (!isStaff) {
      // Forbidden: redirect student to their student dashboard
      return NextResponse.redirect(new URL("/", request.url));
    }
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
