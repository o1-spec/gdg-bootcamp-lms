import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: lessonId } = await context.params;

    // Verify lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          select: { trackId: true },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Verify student is enrolled in the lesson's track
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_trackId: {
          userId: user.id,
          trackId: lesson.module.trackId,
        },
      },
    });

    if (!enrollment || !enrollment.isActive) {
      return NextResponse.json(
        { error: "Forbidden: You are not enrolled in this track" },
        { status: 403 }
      );
    }

    // Check existing progress
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        lessonId_studentId: {
          lessonId,
          studentId: user.id,
        },
      },
    });

    let isCompleted = true;
    let completedAt: Date | null = new Date();

    if (existingProgress && existingProgress.completed) {
      // Toggle to incomplete
      isCompleted = false;
      completedAt = null;

      await prisma.lessonProgress.update({
        where: { id: existingProgress.id },
        data: {
          completed: false,
          completedAt: null,
        },
      });
    } else if (existingProgress) {
      // Toggle to completed
      await prisma.lessonProgress.update({
        where: { id: existingProgress.id },
        data: {
          completed: true,
          completedAt: new Date(),
        },
      });
    } else {
      // Create new completed progress record
      await prisma.lessonProgress.create({
        data: {
          lessonId,
          studentId: user.id,
          completed: true,
          completedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      completed: isCompleted,
      completedAt,
      message: isCompleted ? "Lesson marked as complete" : "Lesson marked as incomplete",
    });
  } catch (error) {
    console.error("POST /api/lessons/[id]/progress error:", error);
    return NextResponse.json(
      { error: "Failed to update lesson progress" },
      { status: 500 }
    );
  }
}
