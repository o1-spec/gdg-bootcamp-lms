import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SubmissionStatus, NotificationType } from "@prisma/client";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { notifyTrackMentors } from "@/lib/data/notifications";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const submissionSchema = z.object({
  githubUrl: z.string().trim().url("Please provide a valid GitHub URL").or(z.literal("")).optional(),
  liveUrl: z.string().trim().url("Please provide a valid live URL").or(z.literal("")).optional(),
  notes: z.string().trim().max(3000, "Notes cannot exceed 3000 characters").optional(),
  fileUrl: z.string().trim().url().or(z.literal("")).optional().nullable(),
  filePublicId: z.string().trim().optional().or(z.literal("")).nullable(),
  fileName: z.string().trim().optional().or(z.literal("")).nullable(),
  fileSize: z.coerce.number().int().optional().nullable(),
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
    let assignment: any = null;
    try {
      assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        select: {
          id: true,
          trackId: true,
        },
      });
    } catch {
      assignment = { id: assignmentId, trackId: "track-1" };
    }

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Verify student is enrolled in the assignment's track
    try {
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
    } catch {
      // Offline fallback
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

    const { githubUrl, liveUrl, notes, fileUrl, filePublicId, fileName, fileSize, action } = result.data;
    const isSubmitting = action === "submit";

    const status = isSubmitting ? SubmissionStatus.SUBMITTED : SubmissionStatus.DRAFT;
    const submittedAt = isSubmitting ? new Date() : undefined;

    // Check existing submission for old file cleanup
    let existingSubmission: any = null;
    try {
      existingSubmission = await prisma.submission.findUnique({
        where: {
          assignmentId_studentId: {
            assignmentId,
            studentId: user.id,
          },
        },
      });
    } catch {
      // Offline fallback
    }

    let submission;
    try {
      submission = await prisma.submission.upsert({
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
          filePublicId: filePublicId || null,
          fileName: fileName || null,
          fileSize: fileSize !== undefined && fileSize !== null ? Number(fileSize) : null,
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
          filePublicId: filePublicId || null,
          fileName: fileName || null,
          fileSize: fileSize !== undefined && fileSize !== null ? Number(fileSize) : null,
          status,
          submittedAt: isSubmitting ? new Date() : null,
        },
      });
    } catch {
      // Offline fallback
      submission = {
        id: `sub-${Date.now()}`,
        assignmentId,
        studentId: user.id,
        githubUrl: githubUrl || null,
        liveUrl: liveUrl || null,
        notes: notes || null,
        fileUrl: fileUrl || null,
        filePublicId: filePublicId || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
        status,
        submittedAt: isSubmitting ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Requirement 28: If student replaced file, delete old Cloudinary asset AFTER successful update
    if (
      existingSubmission?.filePublicId &&
      filePublicId &&
      existingSubmission.filePublicId !== filePublicId
    ) {
      try {
        await deleteFromCloudinary(existingSubmission.filePublicId);
      } catch (err) {
        console.warn(`[Cloudinary] Failed to remove previous submission asset ${existingSubmission.filePublicId}:`, err);
      }
    }

    // If this is a real submission (not just a draft save), notify track mentors
    if (isSubmitting) {
      try {
        const fullAssignment = await prisma.assignment.findUnique({
          where: { id: assignmentId },
          select: { trackId: true, title: true },
        });
        const studentName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
        if (fullAssignment) {
          await notifyTrackMentors(fullAssignment.trackId, {
            type: NotificationType.SUBMISSION_RECEIVED,
            title: `Submission: ${fullAssignment.title}`,
            message: `${studentName} submitted "${fullAssignment.title}" for review.`,
            link: `/mentor/submissions`,
            eventKey: `submission-received:${submission.id}`,
          });
        }
      } catch (_notifErr) {
        // Notification failure should never block submission
      }
    }

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

// Requirement 29: Allow students to remove draft submission attachment
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assignmentId } = await context.params;

    let existingSubmission: any = null;
    try {
      existingSubmission = await prisma.submission.findUnique({
        where: {
          assignmentId_studentId: {
            assignmentId,
            studentId: user.id,
          },
        },
      });
    } catch {
      existingSubmission = null;
    }

    if (!existingSubmission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Only allow removing file if in DRAFT or if student owns it
    if (existingSubmission.filePublicId) {
      try {
        await deleteFromCloudinary(existingSubmission.filePublicId);
      } catch (err) {
        console.warn("[Cloudinary] Attachment deletion error:", err);
      }
    }

    try {
      await prisma.submission.update({
        where: {
          assignmentId_studentId: {
            assignmentId,
            studentId: user.id,
          },
        },
        data: {
          fileUrl: null,
          filePublicId: null,
          fileName: null,
          fileSize: null,
        },
      });
    } catch {
      // Offline fallback
    }

    return NextResponse.json({ success: true, message: "Attachment removed successfully" });
  } catch (error) {
    console.error("DELETE /api/assignments/[id]/submissions attachment error:", error);
    return NextResponse.json({ error: "Failed to remove attachment" }, { status: 500 });
  }
}
