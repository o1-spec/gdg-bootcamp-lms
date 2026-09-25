import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { bootcampSchema } from "@/lib/validations/admin";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN)) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const result = bootcampSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, description, startDate, endDate, isActive } = result.data;

    const bootcamp = await prisma.bootcamp.create({
      data: {
        name,
        description: description || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ success: true, bootcamp }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/bootcamps error:", error);
    return NextResponse.json({ error: "Failed to create bootcamp" }, { status: 500 });
  }
}
