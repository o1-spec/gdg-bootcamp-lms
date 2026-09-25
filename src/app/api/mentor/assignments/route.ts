import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireTrackMentorAccess } from "@/lib/auth";
import { assignmentSchema } from "@/lib/validations/mentor";
import { notifyTrackStudents } from "@/lib/data/notifications";
import { NotificationType } from "@prisma/client";

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
    const result = assignmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { trackId, moduleId, title, description, instructions, type, dueDate, points } = result.data;

    // Verify track mentor access
    await requireTrackMentorAccess(user.id, trackId);

    const newAssignment = await prisma.assignment.create({
      data: {
        trackId,
        moduleId: moduleId || null,
        title,
        description,
        instructions: instructions || null,
        type,
        dueDate: new Date(dueDate),
        points,
        createdById: user.id,
      },
    });

    // Notify all enrolled students about the new assignment
    await notifyTrackStudents(trackId, {
      type: NotificationType.ASSIGNMENT_NEW,
      title: `New Assignment: ${title}`,
      message: `A new assignment "${title}" has been posted${dueDate ? ` — due ${new Date(dueDate).toLocaleDateString()}` : ""}.`,
      link: `/assignments`,
      eventKey: `assignment-new:${newAssignment.id}`,
    });

    return NextResponse.json({ success: true, assignment: newAssignment }, { status: 201 });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === "FORBIDDEN_TRACK_ACCESS" || err?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("POST /api/mentor/assignments error:", error);
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
  }
}

