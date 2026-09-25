import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireTrackMentorAccess } from "@/lib/auth";
import { updateLessonSchema } from "@/lib/validations/mentor";

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
    const existing = await prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: { track: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    await requireTrackMentorAccess(user.id, existing.module.trackId);

    const body = await request.json();
    const result = updateLessonSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await prisma.lesson.update({
      where: { id },
      data: {
        ...(result.data.title !== undefined ? { title: result.data.title } : {}),
        ...(result.data.slug !== undefined ? { slug: result.data.slug } : {}),
        ...(result.data.description !== undefined ? { description: result.data.description } : {}),
        ...(result.data.content !== undefined ? { content: result.data.content } : {}),
        ...(result.data.durationMinutes !== undefined ? { durationMinutes: result.data.durationMinutes } : {}),
        ...(result.data.order !== undefined ? { order: result.data.order } : {}),
        ...(result.data.isPublished !== undefined ? { isPublished: result.data.isPublished } : {}),
      },
    });

    return NextResponse.json({ success: true, lesson: updated });
  } catch (error: any) {
    if (error?.message === "FORBIDDEN_TRACK_ACCESS" || error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("PATCH /api/mentor/lessons/[id] error:", error);
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: { track: true },
        },
        progress: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    await requireTrackMentorAccess(user.id, existing.module.trackId);

    await prisma.lesson.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Lesson deleted successfully" });
  } catch (error: any) {
    if (error?.message === "FORBIDDEN_TRACK_ACCESS" || error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("DELETE /api/mentor/lessons/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 });
  }
}
