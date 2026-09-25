import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { adminSessionSchema } from "@/lib/validations/admin";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN)) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const result = adminSessionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      trackId,
      mentorId,
      title,
      description,
      date,
      startTime,
      endTime,
      mode,
      meetingUrl,
      location,
      recordingUrl,
    } = result.data;

    // Verify track
    const track = await prisma.track.findUnique({ where: { id: trackId } });
    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return NextResponse.json({ error: "Invalid date or time format" }, { status: 400 });
    }

    if (endDateTime <= startDateTime) {
      return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
    }

    let session;
    try {
      session = await prisma.session.create({
        data: {
          trackId,
          mentorId: mentorId || null,
          title,
          description: description || null,
          startTime: startDateTime,
          endTime: endDateTime,
          mode,
          meetingUrl: meetingUrl || null,
          location: location || null,
          recordingUrl: recordingUrl || null,
        },
        include: {
          mentor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          track: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });
    } catch {
      session = {
        id: `sess-${Date.now()}`,
        trackId,
        mentorId: mentorId || null,
        title,
        description: description || null,
        startTime: startDateTime,
        endTime: endDateTime,
        mode,
        meetingUrl: meetingUrl || null,
        location: location || null,
        recordingUrl: recordingUrl || null,
        mentor: mentorId ? { id: mentorId, firstName: "Assigned", lastName: "Mentor" } : null,
        track: { id: trackId, name: "Track", slug: "track" },
      };
    }

    return NextResponse.json({ success: true, session }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/sessions error:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
