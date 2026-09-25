import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireTrackMentorAccess } from "@/lib/auth";
import { Role } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    const isGlobalAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;

    if (existing.trackId) {
      await requireTrackMentorAccess(user.id, existing.trackId);
    } else if (!isGlobalAdmin) {
      return NextResponse.json({ error: "Forbidden: Only administrators can delete global announcements" }, { status: 403 });
    }

    await prisma.announcement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Announcement deleted successfully" });
  } catch (error: any) {
    if (error?.message === "FORBIDDEN_TRACK_ACCESS" || error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("DELETE /api/mentor/announcements/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}
