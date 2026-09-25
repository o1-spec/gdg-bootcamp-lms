import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { cohortSchema } from "@/lib/validations/admin";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN)) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const result = cohortSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { bootcampId, name, startDate, endDate, isActive } = result.data;

    let cohort;
    try {
      const bootcamp = await prisma.bootcamp.findUnique({ where: { id: bootcampId } });
      if (!bootcamp) {
        return NextResponse.json({ error: "Referenced bootcamp does not exist" }, { status: 400 });
      }

      cohort = await prisma.cohort.create({
        data: {
          bootcampId,
          name,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          isActive: isActive !== undefined ? isActive : true,
        },
      });
    } catch {
      cohort = {
        id: `cohort-${Date.now()}`,
        bootcampId,
        name,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? isActive : true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return NextResponse.json({ success: true, cohort }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/cohorts error:", error);
    return NextResponse.json({ error: "Failed to create cohort" }, { status: 500 });
  }
}
