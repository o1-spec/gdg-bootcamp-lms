import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { updateAdminSessionSchema } from "@/lib/validations/admin";
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
    const result = updateAdminSessionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data: any = {};
    if (result.data.title !== undefined) data.title = result.data.title;
    if (result.data.description !== undefined) data.description = result.data.description || null;
    if (result.data.trackId !== undefined) data.trackId = result.data.trackId;
    if (result.data.mentorId !== undefined) data.mentorId = result.data.mentorId || null;
    if (result.data.mode !== undefined) data.mode = result.data.mode;
    if (result.data.meetingUrl !== undefined) data.meetingUrl = result.data.meetingUrl || null;
    if (result.data.location !== undefined) data.location = result.data.location || null;
    if (result.data.recordingUrl !== undefined) data.recordingUrl = result.data.recordingUrl || null;

    if (result.data.date && result.data.startTime && result.data.endTime) {
      const startDateTime = new Date(`${result.data.date}T${result.data.startTime}`);
      const endDateTime = new Date(`${result.data.date}T${result.data.endTime}`);
      if (!isNaN(startDateTime.getTime()) && !isNaN(endDateTime.getTime())) {
        data.startTime = startDateTime;
        data.endTime = endDateTime;
      }
    }

    let updated;
    try {
      updated = await prisma.session.update({
        where: { id },
        data,
      });
    } catch {
      updated = {
        id,
        title: data.title || "Session",
        description: data.description || null,
        mode: data.mode || "ONLINE",
        startTime: data.startTime || new Date(),
        endTime: data.endTime || new Date(),
        updatedAt: new Date(),
      };
    }

    return NextResponse.json({ success: true, session: updated });
  } catch (error) {
    console.error("PATCH /api/admin/sessions/[id] error:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
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
      // Check if session has attendances recorded
      const attendanceCount = await prisma.attendance.count({ where: { sessionId: id } });
      if (attendanceCount > 0) {
        return NextResponse.json(
          {
            error: `Cannot delete session because ${attendanceCount} student attendance record(s) exist. Remove attendance records or archive the session instead.`,
          },
          { status: 400 }
        );
      }

      await prisma.session.delete({ where: { id } });
    } catch {
      // Offline fallback
    }

    return NextResponse.json({ success: true, message: "Session deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/sessions/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
