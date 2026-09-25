import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/settings";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors)[0]?.[0] || "Invalid email address";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email } = result.data;

    // 1. Look up user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, isActive: true },
    });

    let devToken: string | undefined = undefined;

    // 2. If user exists and is active, create reset token
    if (user && user.isActive) {
      // Invalidate existing unused tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      // Generate cryptographically secure raw token
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      devToken = rawToken;
      console.log(`\n[PASSWORD RESET FOUNDATION] Generated reset token for ${email}:`);
      console.log(`[PASSWORD RESET FOUNDATION] Link: /reset-password?token=${rawToken}\n`);
    }

    // Always return neutral message to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists for this email, password reset instructions will be sent.",
      // Include devToken in development only for admin/developer testing
      ...(process.env.NODE_ENV !== "production" && devToken
        ? { devResetUrl: `/reset-password?token=${devToken}` }
        : {}),
    });
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your request." },
      { status: 500 }
    );
  }
}
