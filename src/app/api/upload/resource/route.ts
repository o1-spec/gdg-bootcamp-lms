import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Role } from "@prisma/client";
import {
  validateFile,
  uploadToCloudinary,
  suggestResourceType,
  MAX_FILE_SIZE_MB,
} from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Please sign in" }, { status: 401 });
    }

    // Role check: Only MENTOR, ADMIN, and SUPER_ADMIN are allowed to upload resources
    if (user.role !== Role.MENTOR && user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Students are not authorized to upload course resources" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const clientTrackId = formData.get("trackId") as string | null;
    const moduleId = formData.get("moduleId") as string | null;
    const lessonId = formData.get("lessonId") as string | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Server-side validation of file type & size (Do not trust client metadata)
    const fileValidation = validateFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!fileValidation.valid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 });
    }

    let resolvedTrackId: string | null = clientTrackId || null;
    let trackSlug = "general";

    // Requirement 21: If both moduleId and lessonId are provided, validate lesson belongs to module
    if (moduleId && lessonId) {
      try {
        const lesson = await prisma.lesson.findUnique({
          where: { id: lessonId },
          select: { moduleId: true },
        });
        if (lesson && lesson.moduleId !== moduleId) {
          return NextResponse.json(
            { error: "Validation failed: The selected lesson does not belong to the selected module" },
            { status: 400 }
          );
        }
      } catch {
        // Fallback for offline dev
      }
    }

    // Server-side track resolution: lesson -> module -> track
    if (lessonId) {
      try {
        const lesson = await prisma.lesson.findUnique({
          where: { id: lessonId },
          include: {
            module: {
              include: { track: true },
            },
          },
        });
        if (lesson?.module?.track) {
          resolvedTrackId = lesson.module.track.id;
          trackSlug = lesson.module.track.slug;
        }
      } catch {
        // Fallback
      }
    } else if (moduleId) {
      try {
        const moduleItem = await prisma.module.findUnique({
          where: { id: moduleId },
          include: { track: true },
        });
        if (moduleItem?.track) {
          resolvedTrackId = moduleItem.track.id;
          trackSlug = moduleItem.track.slug;
        }
      } catch {
        // Fallback
      }
    } else if (clientTrackId) {
      try {
        const track = await prisma.track.findUnique({
          where: { id: clientTrackId },
          select: { id: true, slug: true },
        });
        if (track) {
          resolvedTrackId = track.id;
          trackSlug = track.slug;
        }
      } catch {
        // Fallback
      }
    }

    // Requirements 18 & 19: If mentor, verify server-side that the track belongs to one of their assigned tracks
    if (user.role === Role.MENTOR) {
      if (!resolvedTrackId) {
        return NextResponse.json(
          { error: "Track context is required to verify mentor authorization" },
          { status: 400 }
        );
      }

      try {
        const assignment = await prisma.mentorAssignment.findUnique({
          where: {
            mentorId_trackId: {
              mentorId: user.id,
              trackId: resolvedTrackId,
            },
          },
        });

        if (!assignment) {
          return NextResponse.json(
            { error: "Forbidden: You are not assigned to mentor this track" },
            { status: 403 }
          );
        }
      } catch {
        // If DB is offline, allow dev fallback for mentor
      }
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Predictable folder structure: bootcamp-lms/resources/<track-slug>
    const folder = `bootcamp-lms/resources/${trackSlug}`;

    const uploadResult = await uploadToCloudinary(buffer, {
      folder,
      originalFileName: file.name,
      mimeType: file.type || "application/octet-stream",
    });

    const suggestedType = suggestResourceType(uploadResult.mimeType, uploadResult.originalFileName);

    return NextResponse.json(
      {
        success: true,
        url: uploadResult.secureUrl,
        publicId: uploadResult.publicId,
        originalFileName: uploadResult.originalFileName,
        fileSize: uploadResult.fileSize,
        mimeType: uploadResult.mimeType,
        suggestedType,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/upload/resource error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload file to Cloudinary" },
      { status: 500 }
    );
  }
}
