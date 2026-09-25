import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireTrackMentorAccess } from "@/lib/auth";
import { sessionSchema } from "@/lib/validations/mentor";
import { notifyTrackStudents, notifyTrackMentors } from "@/lib/data/notifications";
import { NotificationType } from "@prisma/client";

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

    const sessionDate = startDateTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const sessionTime = startDateTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const sessionNotifBase = {
      type: NotificationType.SESSION_NEW,
      title: `New Session: ${title}`,
      message: `"${title}" is scheduled for ${sessionDate} at ${sessionTime} (${mode.toLowerCase()}).`,
      link: `/schedule`,
      eventKey: `session-new:${newSession.id}`,
    };

    // Notify students and other mentors on the track
    await Promise.all([
      notifyTrackStudents(trackId, sessionNotifBase),
      notifyTrackMentors(trackId, {
        ...sessionNotifBase,
        type: NotificationType.SESSION_NEW,
        title: `Session Scheduled: ${title}`,
        message: `A new session "${title}" has been added to the schedule for ${sessionDate}.`,
        eventKey: `session-new-mentor:${newSession.id}`,
      }),
    ]);

    return NextResponse.json({ success: true, session: newSession }, { status: 201 });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === "FORBIDDEN_TRACK_ACCESS" || err?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("POST /api/mentor/sessions error:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

