import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  validateFile,
  uploadToCloudinary,
} from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Please sign in" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const assignmentId = formData.get("assignmentId") as string | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!assignmentId) {
      return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
    }

    // Validate file size and type server-side
    const fileValidation = validateFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!fileValidation.valid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 });
    }

    // Verify assignment exists and student is enrolled in the assignment's track
    try {
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        select: { id: true, trackId: true },
      });

      if (!assignment) {
        return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
      }

      // If user is a student, check track enrollment
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
          { error: "Forbidden: You are not actively enrolled in this track" },
          { status: 403 }
        );
      }
    } catch {
      // Fallback for offline dev
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Predictable folder structure: bootcamp-lms/submissions/<userId>/<assignmentId>
    const folder = `bootcamp-lms/submissions/${user.id}/${assignmentId}`;

    const uploadResult = await uploadToCloudinary(buffer, {
      folder,
      originalFileName: file.name,
      mimeType: file.type || "application/octet-stream",
    });

    return NextResponse.json(
      {
        success: true,
        fileUrl: uploadResult.secureUrl,
        filePublicId: uploadResult.publicId,
        fileName: uploadResult.originalFileName,
        fileSize: uploadResult.fileSize,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/upload/submission error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload submission file" },
      { status: 500 }
    );
  }
}
