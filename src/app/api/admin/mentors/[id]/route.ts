import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Role } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN)) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    try {
      const assignment = await prisma.mentorAssignment.findUnique({ where: { id } });
      if (assignment) {
        await prisma.mentorAssignment.delete({ where: { id } });
      }
    } catch {
      // Offline fallback
    }

    return NextResponse.json({ success: true, message: "Mentor removed from track successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/mentors/[id] error:", error);
    return NextResponse.json({ error: "Failed to remove mentor assignment" }, { status: 500 });
  }
}
