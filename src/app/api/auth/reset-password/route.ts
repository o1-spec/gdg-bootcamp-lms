import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations/settings";
import { createNotification } from "@/lib/data/notifications";
import { NotificationType } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors)[0]?.[0] || "Invalid password data";
      return NextResponse.json({ error: firstError, details: fieldErrors }, { status: 400 });
    }

    const { token, password } = result.data;

    // 1. Hash incoming token with SHA-256
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // 2. Find valid, unexpired, unused token
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: "Invalid or expired password reset link. Please request a new one." },
        { status: 400 }
      );
    }

    if (resetRecord.usedAt) {
      return NextResponse.json(
        { error: "This password reset link has already been used. Please request a new one." },
        { status: 400 }
      );
    }

    if (new Date() > resetRecord.expiresAt) {
      return NextResponse.json(
        { error: "This password reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // 3. Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Update user password and mark token used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // 5. In-app security notification
    await createNotification({
      userId: resetRecord.userId,
      type: NotificationType.GENERAL,
      title: "Password Reset Completed",
      message: "Your account password was successfully reset. You can now use your new password to sign in.",
      link: "/settings",
      eventKey: `password-reset:${resetRecord.userId}:${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully. You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("POST /api/auth/reset-password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password. Please try again later." },
      { status: 500 }
    );
  }
}
