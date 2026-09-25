import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireTrackMentorAccess } from "@/lib/auth";
import { updateSessionSchema } from "@/lib/validations/mentor";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await prisma.session.findUnique({
      where: { id },
      include: { track: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await requireTrackMentorAccess(user.id, existing.trackId);

    const body = await request.json();
    const result = updateSessionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data: any = {};
    if (result.data.title !== undefined) data.title = result.data.title;
    if (result.data.description !== undefined) data.description = result.data.description;
    if (result.data.mode !== undefined) data.mode = result.data.mode;
    if (result.data.meetingUrl !== undefined) data.meetingUrl = result.data.meetingUrl || null;
    if (result.data.location !== undefined) data.location = result.data.location || null;
    if (result.data.recordingUrl !== undefined) data.recordingUrl = result.data.recordingUrl || null;

    if (result.data.date && result.data.startTime) {
      data.startTime = new Date(`${result.data.date}T${result.data.startTime}`);
    }
    if (result.data.date && result.data.endTime) {
      data.endTime = new Date(`${result.data.date}T${result.data.endTime}`);
    }

    const updated = await prisma.session.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, session: updated });
  } catch (error: any) {
    if (error?.message === "FORBIDDEN_TRACK_ACCESS" || error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("PATCH /api/mentor/sessions/[id] error:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await prisma.session.findUnique({
      where: { id },
      include: { track: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await requireTrackMentorAccess(user.id, existing.trackId);

    await prisma.session.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Session deleted successfully" });
  } catch (error: any) {
    if (error?.message === "FORBIDDEN_TRACK_ACCESS" || error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("DELETE /api/mentor/sessions/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
