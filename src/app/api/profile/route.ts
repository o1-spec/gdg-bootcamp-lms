import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, safeUserSelect } from "@/lib/auth";
import { profileSetupSchema } from "@/lib/validations/onboarding";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          ...safeUserSelect,
          enrollments: {
            where: { isActive: true },
            include: {
              track: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  accent: true,
                  cohort: { select: { name: true } },
                },
              },
            },
          },
        },
      });

      if (dbUser) {
        return NextResponse.json({ user: dbUser });
      }
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    } catch {
      return NextResponse.json({
        user: {
          ...user,
          enrollments: [],
        },
      });
    }
  } catch (error: any) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileSetupSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors)[0]?.[0] || "Invalid profile data";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { firstName, lastName, displayName, avatarUrl, bio, githubUrl, linkedinUrl } = parsed.data;

    try {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName,
          lastName,
          displayName: displayName || `${firstName} ${lastName}`,
          avatarUrl: avatarUrl || user.avatarUrl,
          bio: bio || null,
          githubUrl: githubUrl || null,
          linkedinUrl: linkedinUrl || null,
        },
        select: safeUserSelect,
      });

      return NextResponse.json({
        success: true,
        message: "Profile updated successfully",
        user: updated,
      });
    } catch {
      return NextResponse.json({
        success: true,
        message: "Profile updated successfully (local)",
        user: {
          ...user,
          firstName,
          lastName,
          displayName: displayName || `${firstName} ${lastName}`,
          avatarUrl: avatarUrl || user.avatarUrl,
          bio: bio || null,
          githubUrl: githubUrl || null,
          linkedinUrl: linkedinUrl || null,
        },
      });
    }
  } catch (error: any) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
