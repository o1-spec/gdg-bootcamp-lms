import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { preferencesSchema } from "@/lib/validations/settings";

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = preferencesSchema.safeParse(body);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors)[0]?.[0] || "Invalid preferences data";
      return NextResponse.json({ error: firstError, details: fieldErrors }, { status: 400 });
    }

    const preferences = result.data;

    await prisma.user.update({
      where: { id: user.id },
      data: { notificationPreferences: preferences },
    });

    return NextResponse.json({
      success: true,
      message: "Preferences updated successfully",
      preferences,
    });
  } catch (error) {
    console.error("PATCH /api/settings/preferences error:", error);
    return NextResponse.json(
      { error: "Failed to update notification preferences" },
      { status: 500 }
    );
  }
}
