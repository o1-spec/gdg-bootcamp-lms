import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { updateBootcampSchema } from "@/lib/validations/admin";
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
    const result = updateBootcampSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data: any = {};
    if (result.data.name !== undefined) data.name = result.data.name;
    if (result.data.description !== undefined) data.description = result.data.description || null;
    if (result.data.startDate !== undefined) data.startDate = result.data.startDate ? new Date(result.data.startDate) : null;
    if (result.data.endDate !== undefined) data.endDate = result.data.endDate ? new Date(result.data.endDate) : null;
    if (result.data.isActive !== undefined) data.isActive = result.data.isActive;

    const updated = await prisma.bootcamp.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, bootcamp: updated });
  } catch (error) {
    console.error("PATCH /api/admin/bootcamps/[id] error:", error);
    return NextResponse.json({ error: "Failed to update bootcamp" }, { status: 500 });
  }
}

// Safe deletion: prefer deactivate to prevent cascade deletion of student records
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN)) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const deactivated = await prisma.bootcamp.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: "Bootcamp deactivated successfully", bootcamp: deactivated });
  } catch (error) {
    console.error("DELETE /api/admin/bootcamps/[id] error:", error);
    return NextResponse.json({ error: "Failed to deactivate bootcamp" }, { status: 500 });
  }
}
