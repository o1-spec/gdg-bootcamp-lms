import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireTrackMentorAccess } from "@/lib/auth";
import { announcementSchema } from "@/lib/validations/mentor";
import { Role } from "@prisma/client";

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

    return NextResponse.json({ success: true, announcement }, { status: 201 });
  } catch (error: any) {
    if (error?.message === "FORBIDDEN_TRACK_ACCESS" || error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("POST /api/mentor/announcements error:", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
