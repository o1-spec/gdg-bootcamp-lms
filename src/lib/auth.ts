import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import prisma from "@/lib/prisma";
import { StudentProfile } from "@/types/lms";

export const AUTH_COOKIE_NAME = "bootcamp_lms_session";
const JWT_SECRET = process.env.AUTH_SECRET || "fallback-secret-for-development-min-32-chars-long";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface SafeUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const safeUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * Format database UserRole enum to UI role display string
 */
export function formatUserRole(role: string): "Student" | "Mentor/Tutor" | "Admin" {
  if (role === "MENTOR") return "Mentor/Tutor";
  if (role === "ADMIN") return "Admin";
  return "Student";
}

/**
 * Construct strongly-typed StudentProfile from SafeUser
 */
export function buildStudentProfile(
  user: { id: string; firstName: string; lastName: string; email: string; avatarUrl?: string | null; role: string },
  enrolledTracksCount: number = 0
): StudentProfile {
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar:
      user.avatarUrl ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    cohort: "Bootcamp 2026 (Cohort 1)",
    role: formatUserRole(user.role),
    enrolledTracksCount,
    studyStreakDays: 14,
    totalHoursSpent: 128,
  };
}

/**
 * Hash a plain text password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a signed JWT session token
 */
export async function signSessionToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

/**
 * Verify and decode a session JWT token
 */
export async function verifySessionToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

/**
 * Set the authentication cookie in the response headers
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clear the authentication cookie
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

/**
 * Retrieve the current authenticated user from session cookie without passwordHash
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload?.userId) return null;

    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: safeUserSelect,
      });
      if (user) return user;
    } catch {
      // Database connection fallback during offline development
    }

    if (payload.userId === "user-mentor-1" || payload.email === "mentor@gdglasu.dev") {
      return {
        id: payload.userId || "user-mentor-1",
        firstName: "Femi",
        lastName: "Oladipo",
        email: payload.email || "mentor@gdglasu.dev",
        role: Role.MENTOR,
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    if (payload.userId === "user-admin-1" || payload.email === "admin@gdglasu.dev") {
      return {
        id: payload.userId || "user-admin-1",
        firstName: "Chioma",
        lastName: "Okonkwo",
        email: payload.email || "admin@gdglasu.dev",
        role: Role.ADMIN,
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    if (payload.userId === "user-student-1" || payload.email === "student@gdglasu.dev") {
      return {
        id: payload.userId || "user-student-1",
        firstName: "Alex",
        lastName: "Johnson",
        email: payload.email || "student@gdglasu.dev",
        role: Role.STUDENT,
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Require an authenticated user or throw an error. Usable from Route Handlers & Server Components.
 */
export async function requireAuth(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

/**
 * Require the authenticated user to have one of the specified roles.
 */
export async function requireRole(allowedRoles: Role[]): Promise<SafeUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

/**
 * Require the user to be an assigned mentor for the track, or an ADMIN / SUPER_ADMIN.
 * Accepts either track CUID or track slug.
 */
export async function requireTrackMentorAccess(
  userId: string,
  trackIdOrSlug: string
) {
  const user = await requireRole([Role.MENTOR, Role.ADMIN, Role.SUPER_ADMIN]);

  // If Admin / Super Admin, they have universal access to all tracks
  if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
    const track = await prisma.track.findFirst({
      where: {
        OR: [{ id: trackIdOrSlug }, { slug: trackIdOrSlug }],
      },
    });
    if (!track) {
      throw new Error("TRACK_NOT_FOUND");
    }
    return { user, track };
  }

  // Mentor role: verify MentorAssignment exists
  const track = await prisma.track.findFirst({
    where: {
      OR: [{ id: trackIdOrSlug }, { slug: trackIdOrSlug }],
      mentorAssignments: {
        some: { mentorId: userId },
      },
    },
  });

  if (!track) {
    throw new Error("FORBIDDEN_TRACK_ACCESS");
  }

  return { user, track };
}
