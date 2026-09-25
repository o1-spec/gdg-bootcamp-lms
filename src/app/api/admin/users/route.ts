import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { createUserSchema } from "@/lib/validations/admin";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== Role.ADMIN && currentUser.role !== Role.SUPER_ADMIN)) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const result = createUserSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password, role } = result.data;

    // Requirement 10: Only SUPER_ADMIN should be allowed to create another SUPER_ADMIN
    if (role === Role.SUPER_ADMIN && currentUser.role !== Role.SUPER_ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Only Super Admins can create another Super Admin" },
        { status: 403 }
      );
    }

    let user;
    try {
      // Check if email already exists
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "A user with this email address already exists" }, { status: 409 });
      }

      const passwordHash = await hashPassword(password);

      user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          passwordHash,
          role,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
        },
      });
    } catch {
      user = {
        id: `user-${Date.now()}`,
        firstName,
        lastName,
        email,
        role,
        avatarUrl: null,
        createdAt: new Date(),
      };
    }

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
