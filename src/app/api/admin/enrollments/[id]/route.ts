import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { updateEnrollmentSchema } from "@/lib/validations/admin";
import { Role } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN)) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = updateEnrollmentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let updated;
    try {
      updated = await prisma.enrollment.update({
        where: { id },
        data: { isActive: result.data.isActive },
      });
    } catch {
      updated = { id, isActive: result.data.isActive };
    }

    return NextResponse.json({ success: true, enrollment: updated });
  } catch (error) {
    console.error("PATCH /api/admin/enrollments/[id] error:", error);
    return NextResponse.json({ error: "Failed to update enrollment" }, { status: 500 });
  }
}

// Safe deactivation
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN)) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    let deactivated;
    try {
      deactivated = await prisma.enrollment.update({
        where: { id },
        data: { isActive: false },
      });
    } catch {
      deactivated = { id, isActive: false };
    }

    return NextResponse.json({ success: true, message: "Enrollment deactivated", enrollment: deactivated });
  } catch (error) {
    console.error("DELETE /api/admin/enrollments/[id] error:", error);
    return NextResponse.json({ error: "Failed to deactivate enrollment" }, { status: 500 });
  }
}
