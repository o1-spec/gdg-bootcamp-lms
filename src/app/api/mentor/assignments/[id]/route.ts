import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireTrackMentorAccess } from "@/lib/auth";
import { updateAssignmentSchema } from "@/lib/validations/mentor";

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
    const existing = await prisma.assignment.findUnique({
      where: { id },
      include: { track: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    await requireTrackMentorAccess(user.id, existing.trackId);

    const body = await request.json();
    const result = updateAssignmentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        ...(result.data.title !== undefined ? { title: result.data.title } : {}),
        ...(result.data.description !== undefined ? { description: result.data.description } : {}),
        ...(result.data.instructions !== undefined ? { instructions: result.data.instructions } : {}),
        ...(result.data.type !== undefined ? { type: result.data.type } : {}),
        ...(result.data.dueDate !== undefined ? { dueDate: new Date(result.data.dueDate) } : {}),
        ...(result.data.points !== undefined ? { points: result.data.points } : {}),
        ...(result.data.moduleId !== undefined ? { moduleId: result.data.moduleId || null } : {}),
      },
    });

    return NextResponse.json({ success: true, assignment: updated });
  } catch (error: any) {
    if (error?.message === "FORBIDDEN_TRACK_ACCESS" || error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("PATCH /api/mentor/assignments/[id] error:", error);
    return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await prisma.assignment.findUnique({
      where: { id },
      include: {
        submissions: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    await requireTrackMentorAccess(user.id, existing.trackId);

    // Requirement 30: Deletion Safety - Do not casually delete an assignment with student submissions
    if (existing.submissions.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete assignment: ${existing.submissions.length} student submission(s) exist for this deliverable. Archiving is recommended instead of data loss.`,
        },
        { status: 400 }
      );
    }

    await prisma.assignment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Assignment deleted successfully" });
  } catch (error: any) {
    if (error?.message === "FORBIDDEN_TRACK_ACCESS" || error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("DELETE /api/mentor/assignments/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
  }
}
