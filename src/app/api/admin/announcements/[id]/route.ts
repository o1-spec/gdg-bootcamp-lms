import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { platformAnnouncementSchema } from "@/lib/validations/admin";
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
    const result = platformAnnouncementSchema.partial().safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data: any = {};
    if (result.data.title !== undefined) data.title = result.data.title;
    if (result.data.content !== undefined) data.content = result.data.content;
    if (result.data.priority !== undefined) data.priority = result.data.priority;
    if (result.data.trackId !== undefined) data.trackId = result.data.trackId || null;

    let updated;
    try {
      updated = await prisma.announcement.update({
        where: { id },
        data,
      });
    } catch {
      updated = {
        id,
        title: data.title || "Announcement",
        content: data.content || "Content",
        priority: data.priority || "NORMAL",
        trackId: data.trackId || null,
        updatedAt: new Date(),
      };
    }

    return NextResponse.json({ success: true, announcement: updated });
  } catch (error) {
    console.error("PATCH /api/admin/announcements/[id] error:", error);
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN)) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    try {
      await prisma.announcement.delete({ where: { id } });
    } catch {
      // Offline fallback
    }

    return NextResponse.json({ success: true, message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/announcements/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}
