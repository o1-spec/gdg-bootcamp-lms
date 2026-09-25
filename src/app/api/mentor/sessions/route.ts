import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireTrackMentorAccess } from "@/lib/auth";
import { sessionSchema } from "@/lib/validations/mentor";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = sessionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { trackId, title, description, date, startTime, endTime, mode, meetingUrl, location, recordingUrl } = result.data;

    await requireTrackMentorAccess(user.id, trackId);

    // Parse full ISO Date-Times from date and time strings
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    const newSession = await prisma.session.create({
      data: {
        trackId,
        title,
        description: description || null,
        startTime: startDateTime,
        endTime: endDateTime,
        mode,
        meetingUrl: meetingUrl || null,
        location: location || null,
        recordingUrl: recordingUrl || null,
        mentorId: user.id,
      },
    });

    return NextResponse.json({ success: true, session: newSession }, { status: 201 });
  } catch (error: any) {
    if (error?.message === "FORBIDDEN_TRACK_ACCESS" || error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("POST /api/mentor/sessions error:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
