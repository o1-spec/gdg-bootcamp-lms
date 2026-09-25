import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireTrackMentorAccess } from "@/lib/auth";
import { lessonSchema } from "@/lib/validations/mentor";

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
    const result = lessonSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { moduleId, title, slug, description, content, durationMinutes, order, isPublished } = result.data;

    // Check module and track access
    const moduleItem = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { track: true },
    });

    if (!moduleItem) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    await requireTrackMentorAccess(user.id, moduleItem.trackId);

    // Check slug uniqueness within module
    const existing = await prisma.lesson.findFirst({
      where: { moduleId, slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A lesson with this slug already exists in this module" },
        { status: 409 }
      );
    }

    const newLesson = await prisma.lesson.create({
      data: {
        moduleId,
        title,
        slug,
        description: description || null,
        content: content || null,
        durationMinutes,
        order,
        isPublished,
      },
    });

    return NextResponse.json({ success: true, lesson: newLesson }, { status: 201 });
  } catch (error: any) {
    if (error?.message === "FORBIDDEN_TRACK_ACCESS" || error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("POST /api/mentor/lessons error:", error);
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }
}
