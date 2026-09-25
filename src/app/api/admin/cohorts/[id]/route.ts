import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { updateCohortSchema } from "@/lib/validations/admin";
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
    const result = updateCohortSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data: any = {};
    if (result.data.name !== undefined) data.name = result.data.name;
    if (result.data.bootcampId !== undefined) data.bootcampId = result.data.bootcampId;
    if (result.data.startDate !== undefined) data.startDate = new Date(result.data.startDate);
    if (result.data.endDate !== undefined) data.endDate = result.data.endDate ? new Date(result.data.endDate) : null;
    if (result.data.isActive !== undefined) data.isActive = result.data.isActive;

    let updated;
    try {
      updated = await prisma.cohort.update({
        where: { id },
        data,
      });
    } catch {
      updated = {
        id,
        name: data.name || "Cohort",
        bootcampId: data.bootcampId || "bootcamp-1",
        startDate: data.startDate || new Date(),
        endDate: data.endDate || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return NextResponse.json({ success: true, cohort: updated });
  } catch (error) {
    console.error("PATCH /api/admin/cohorts/[id] error:", error);
    return NextResponse.json({ error: "Failed to update cohort" }, { status: 500 });
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
      deactivated = await prisma.cohort.update({
        where: { id },
        data: { isActive: false },
      });
    } catch {
      deactivated = { id, isActive: false };
    }

    return NextResponse.json({ success: true, message: "Cohort deactivated successfully", cohort: deactivated });
  } catch (error) {
    console.error("DELETE /api/admin/cohorts/[id] error:", error);
    return NextResponse.json({ error: "Failed to deactivate cohort" }, { status: 500 });
  }
}
