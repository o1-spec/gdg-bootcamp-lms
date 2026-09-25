import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireTrackMentorAccess } from "@/lib/auth";
import { markAttendanceSchema } from "@/lib/validations/mentor";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "MENTOR" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Mentor access required" }, { status: 403 });
    }

    const body = await request.json();
    const result = markAttendanceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { sessionId, records } = result.data;

    // Verify session exists and check track mentor access
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { track: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await requireTrackMentorAccess(user.id, session.trackId);

    // Upsert attendance for each student in the payload
    await prisma.$transaction(
      records.map((r) =>
        prisma.attendance.upsert({
          where: {
            sessionId_studentId: {
              sessionId,
              studentId: r.studentId,
            },
          },
          update: {
            status: r.status,
            markedById: user.id,
            markedAt: new Date(),
          },
          create: {
            sessionId,
            studentId: r.studentId,
            status: r.status,
            markedById: user.id,
            markedAt: new Date(),
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Successfully saved attendance records for ${records.length} students.`,
    });
  } catch (error: any) {
    if (error?.message === "FORBIDDEN_TRACK_ACCESS" || error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("POST /api/mentor/attendance error:", error);
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 });
  }
}
