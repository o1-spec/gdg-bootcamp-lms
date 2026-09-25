import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, verifyPassword, signSessionToken, setAuthCookie } from "@/lib/auth";
import { changeEmailSchema } from "@/lib/validations/settings";

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = changeEmailSchema.safeParse(body);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors)[0]?.[0] || "Invalid input";
      return NextResponse.json({ error: firstError, details: fieldErrors }, { status: 400 });
    }

    const { currentPassword, newEmail } = result.data;

    // Check if new email is identical to current email
    if (newEmail.toLowerCase() === user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "New email must be different from your current email address." },
        { status: 400 }
      );
    }

    // 1. Fetch user record with passwordHash to verify current password
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, passwordHash: true, role: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isMatch = await verifyPassword(currentPassword, dbUser.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Incorrect current password. Identity could not be verified." },
        { status: 400 }
      );
    }

    // 2. Check for duplicate email
    const existing = await prisma.user.findUnique({
      where: { email: newEmail },
      select: { id: true },
    });

    if (existing && existing.id !== user.id) {
      return NextResponse.json(
        { error: "This email address is already in use by another account." },
        { status: 409 }
      );
    }

    // 3. Update email in database
    await prisma.user.update({
      where: { id: user.id },
      data: { email: newEmail },
    });

    // 4. Reissue session token with updated email
    const token = await signSessionToken({
      userId: user.id,
      email: newEmail,
      role: dbUser.role,
    });
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: "Email address updated successfully",
      email: newEmail,
    });
  } catch (error) {
    console.error("PATCH /api/settings/account error:", error);
    return NextResponse.json({ error: "Failed to update account email" }, { status: 500 });
  }
}
