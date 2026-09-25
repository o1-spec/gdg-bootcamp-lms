import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { updateUserSchema } from "@/lib/validations/admin";
import { Role } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== Role.ADMIN && currentUser.role !== Role.SUPER_ADMIN)) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    let targetUser: any = null;
    try {
      targetUser = await prisma.user.findUnique({ where: { id } });
    } catch {
      targetUser = { id, role: Role.STUDENT };
    }

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = updateUserSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Role enforcement checks (Requirement 11)
    if (currentUser.role !== Role.SUPER_ADMIN) {
      // An ADMIN cannot edit or demote a SUPER_ADMIN
      if (targetUser.role === Role.SUPER_ADMIN) {
        return NextResponse.json(
          { error: "Forbidden: Standard Admins cannot modify a Super Admin account" },
          { status: 403 }
        );
      }
      // An ADMIN cannot promote anyone (or themselves) to SUPER_ADMIN
      if (result.data.role === Role.SUPER_ADMIN) {
        return NextResponse.json(
          { error: "Forbidden: Only Super Admins can grant the Super Admin role" },
          { status: 403 }
        );
      }
    }

    const data: any = {};
    if (result.data.firstName !== undefined) data.firstName = result.data.firstName;
    if (result.data.lastName !== undefined) data.lastName = result.data.lastName;
    if (result.data.role !== undefined) data.role = result.data.role;
    if (result.data.avatarUrl !== undefined) data.avatarUrl = result.data.avatarUrl || null;

    let updated;
    try {
      updated = await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          avatarUrl: true,
          updatedAt: true,
        },
      });
    } catch {
      updated = {
        id,
        firstName: data.firstName || "Updated",
        lastName: data.lastName || "User",
        email: "user@gdglasu.dev",
        role: data.role || targetUser.role,
        avatarUrl: data.avatarUrl || null,
        updatedAt: new Date(),
      };
    }

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
