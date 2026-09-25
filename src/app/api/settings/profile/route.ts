import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, safeUserSelect } from "@/lib/auth";
import { profileSettingsSchema } from "@/lib/validations/settings";

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = profileSettingsSchema.safeParse(body);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors)[0]?.[0] || "Invalid profile data";
      return NextResponse.json({ error: firstError, details: fieldErrors }, { status: 400 });
    }

    const { firstName, lastName, displayName, bio, githubUrl, linkedinUrl } = result.data;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName,
        lastName,
        displayName: displayName || `${firstName} ${lastName}`,
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
  } catch (error) {
    console.error("PATCH /api/settings/profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
