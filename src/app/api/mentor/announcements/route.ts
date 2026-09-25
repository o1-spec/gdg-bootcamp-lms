import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireTrackMentorAccess } from "@/lib/auth";
import { announcementSchema } from "@/lib/validations/mentor";
import { Role, NotificationType } from "@prisma/client";
import { notifyTrackStudents, notifyTrackMentors } from "@/lib/data/notifications";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isGlobalAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;

    const body = await request.json();
    const result = announcementSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { trackId, title, content, priority } = result.data;

    // Requirement 19: Mentor should NOT be able to create a general/global announcement unless ADMIN or SUPER_ADMIN
    if (!trackId && !isGlobalAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Only Administrators can create general/global cohort announcements." },
        { status: 403 }
      );
    }

    if (trackId) {
      await requireTrackMentorAccess(user.id, trackId);
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        priority,
        trackId: trackId || null,
        authorId: user.id,
      },
    });

    // Notification: truncate content preview
    const preview = content.length > 120 ? content.slice(0, 117) + "..." : content;
    const notifBase = {
      type: NotificationType.ANNOUNCEMENT_NEW,
      title: `📢 ${title}`,
      message: preview,
      link: `/announcements`,
      eventKey: `announcement-new:${announcement.id}`,
    };

    if (trackId) {
      // Track-scoped: notify students and mentors in the track
      await Promise.all([
        notifyTrackStudents(trackId, notifBase),
        notifyTrackMentors(trackId, { ...notifBase, eventKey: `announcement-new-mentor:${announcement.id}` }),
      ]);
    } else {
      // Global announcement: notify everyone across all tracks
      // Get all enrolled students across all active tracks
      const allEnrollments = await prisma.enrollment.findMany({
        where: { isActive: true },
        select: { userId: true },
        distinct: ["userId"],
      });
      const allMentors = await prisma.mentorAssignment.findMany({
        select: { mentorId: true },
        distinct: ["mentorId"],
      });
      const allUserIds = [
        ...new Set([
          ...allEnrollments.map((e) => e.userId),
          ...allMentors.map((m) => m.mentorId),
        ]),
      ];
      await Promise.all(
        allUserIds.map((uid) =>
          prisma.notification.create({
            data: {
              userId: uid,
              type: NotificationType.ANNOUNCEMENT_NEW,
              title: notifBase.title,
              message: notifBase.message,
              link: notifBase.link,
              eventKey: `${notifBase.eventKey}:${uid}`,
            },
          }).catch(() => null)
        )
      );
    }

    return NextResponse.json({ success: true, announcement }, { status: 201 });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === "FORBIDDEN_TRACK_ACCESS" || err?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("POST /api/mentor/announcements error:", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}

