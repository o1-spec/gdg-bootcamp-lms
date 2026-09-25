import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SubmissionStatus } from "@prisma/client";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const submissionSchema = z.object({
  githubUrl: z.string().trim().url("Please provide a valid GitHub URL").or(z.literal("")).optional(),
  liveUrl: z.string().trim().url("Please provide a valid live URL").or(z.literal("")).optional(),
  notes: z.string().trim().max(3000, "Notes cannot exceed 3000 characters").optional(),
  fileUrl: z.string().trim().url().or(z.literal("")).optional(),
  action: z.enum(["draft", "submit"]).default("submit"),
});

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assignmentId } = await context.params;

    // Verify assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: {
        id: true,
        trackId: true,
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Verify student is enrolled in the assignment's track
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_trackId: {
          userId: user.id,
          trackId: assignment.trackId,
        },
      },
    });

    if (!enrollment || !enrollment.isActive) {
      return NextResponse.json(
        { error: "Forbidden: You are not enrolled in this track" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = submissionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { githubUrl, liveUrl, notes, fileUrl, action } = result.data;
    const isSubmitting = action === "submit";

    const status = isSubmitting ? SubmissionStatus.SUBMITTED : SubmissionStatus.DRAFT;
    const submittedAt = isSubmitting ? new Date() : undefined;

    // Upsert single submission record per student per assignment
    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: user.id,
        },
      },
      update: {
        githubUrl: githubUrl || null,
        liveUrl: liveUrl || null,
        notes: notes || null,
        fileUrl: fileUrl || null,
        status,
        ...(submittedAt ? { submittedAt } : {}),
      },
      create: {
        assignmentId,
        studentId: user.id,
        githubUrl: githubUrl || null,
        liveUrl: liveUrl || null,
        notes: notes || null,
        fileUrl: fileUrl || null,
        status,
        submittedAt: isSubmitting ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: isSubmitting
        ? "Assignment submitted successfully"
        : "Draft saved successfully",
      submission,
    });
  } catch (error) {
    console.error("POST /api/assignments/[id]/submissions error:", error);
    return NextResponse.json(
      { error: "Failed to save submission" },
      { status: 500 }
    );
  }
}
