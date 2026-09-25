import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireTrackMentorAccess } from "@/lib/auth";
import { reviewSubmissionSchema } from "@/lib/validations/mentor";
import { SubmissionStatus } from "@prisma/client";
import { createNotification } from "@/lib/data/notifications";
import { NotificationType } from "@prisma/client";

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
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        assignment: {
          include: { track: true },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Verify track mentor access
    await requireTrackMentorAccess(user.id, submission.assignment.trackId);

    const body = await request.json();
    const result = reviewSubmissionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { score, feedback } = result.data;

    // Save review: only updates score, feedback, status, reviewedAt
    // Student URLs and student notes are preserved and NOT modified
    const updated = await prisma.submission.update({
      where: { id },
      data: {
        score,
        feedback,
        status: SubmissionStatus.REVIEWED,
        reviewedAt: new Date(),
      },
    });

    // Notify the student their assignment was graded
    const scoreText = score !== undefined && score !== null ? ` — Score: ${score}${submission.assignment.points ? `/${submission.assignment.points}` : ""}` : "";
    await createNotification({
      userId: submission.studentId,
      type: NotificationType.ASSIGNMENT_GRADED,
      title: `Assignment Reviewed: ${submission.assignment.title}`,
      message: `Your submission for "${submission.assignment.title}" has been reviewed${scoreText}.`,
      link: `/assignments`,
      eventKey: `submission-reviewed:${id}`,
    });

    return NextResponse.json({
      success: true,
      message: "Submission reviewed successfully",
      submission: updated,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === "FORBIDDEN_TRACK_ACCESS" || err?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("PATCH /api/mentor/submissions/[id]/review error:", error);
    return NextResponse.json({ error: "Failed to save submission review" }, { status: 500 });
  }
}
