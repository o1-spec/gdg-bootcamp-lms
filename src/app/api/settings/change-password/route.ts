import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getCurrentUser, verifyPassword, signSessionToken, setAuthCookie } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validations/settings";
import { createNotification } from "@/lib/data/notifications";
import { NotificationType } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = changePasswordSchema.safeParse(body);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors)[0]?.[0] || "Invalid password data";
      return NextResponse.json({ error: firstError, details: fieldErrors }, { status: 400 });
    }

    const { currentPassword, newPassword } = result.data;

    // 1. Fetch user record with passwordHash
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, passwordHash: true, email: true, role: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Verify current password
    const isCurrentValid = await verifyPassword(currentPassword, dbUser.passwordHash);
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "Incorrect current password. Please check your password and try again." },
        { status: 400 }
      );
    }

    // 3. Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);

    // 4. Update database
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    // 5. Cleanly refresh the session cookie
    const token = await signSessionToken({
      userId: user.id,
      email: dbUser.email,
      role: dbUser.role,
    });
    await setAuthCookie(token);

    // 6. Security Event Notification: Create in-app notification
    await createNotification({
      userId: user.id,
      type: NotificationType.GENERAL,
      title: "Password Changed",
      message: "Your account password was updated successfully. If you did not make this change, please contact an administrator immediately.",
      link: "/settings",
      eventKey: `password-changed:${user.id}:${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.error("POST /api/settings/change-password error:", error);
    return NextResponse.json(
      { error: "Failed to update password. Please try again later." },
      { status: 500 }
    );
  }
}
