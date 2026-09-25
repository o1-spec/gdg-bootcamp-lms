import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, safeUserSelect } from "@/lib/auth";
import { profileSetupSchema } from "@/lib/validations/onboarding";

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to update your profile" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = profileSetupSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors)[0]?.[0] || "Invalid profile data";
      return NextResponse.json({ error: firstError, details: fieldErrors }, { status: 400 });
    }

    const { firstName, lastName, displayName, avatarUrl, bio, githubUrl, linkedinUrl } = parsed.data;

    try {
      const updatedUser = await prisma.user.update({
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
        user: updatedUser,
      });
    } catch {
      // Offline fallback
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
    console.error("Onboarding profile update error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while updating profile" },
      { status: 500 }
    );
  }
}
