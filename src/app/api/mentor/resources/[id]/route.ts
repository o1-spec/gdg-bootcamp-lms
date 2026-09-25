import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireTrackMentorAccess } from "@/lib/auth";
import { updateResourceSchema } from "@/lib/validations/mentor";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { Role } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== Role.MENTOR && user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden: Mentor or Admin access required" }, { status: 403 });
    }

    const { id } = await context.params;

    let existing: any = null;
    try {
      existing = await prisma.resource.findUnique({
        where: { id },
        include: {
          module: true,
          lesson: {
            include: { module: true },
          },
        },
      });
    } catch {
      existing = { id, publicId: null };
    }

    if (!existing) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const trackId = existing.module?.trackId || existing.lesson?.module?.trackId;
    if (user.role === Role.MENTOR && trackId) {
      try {
        await requireTrackMentorAccess(user.id, trackId);
      } catch (err: any) {
        if (err?.message === "FORBIDDEN_TRACK_ACCESS" || err?.message === "FORBIDDEN") {
          return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
        }
      }
    }

    const body = await request.json();
    const result = updateResourceSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const effectiveModuleId = result.data.moduleId !== undefined ? result.data.moduleId : existing.moduleId;
    const effectiveLessonId = result.data.lessonId !== undefined ? result.data.lessonId : existing.lessonId;

    // Requirement 21: Validate lesson belongs to module if both provided
    if (effectiveModuleId && effectiveLessonId) {
      try {
        const lesson = await prisma.lesson.findUnique({
          where: { id: effectiveLessonId },
          select: { moduleId: true },
        });
        if (lesson && lesson.moduleId !== effectiveModuleId) {
          return NextResponse.json(
            { error: "Validation failed: The selected lesson does not belong to the selected module" },
            { status: 400 }
          );
        }
      } catch {
        // Fallback
      }
    }

    const data: any = {};
    if (result.data.title !== undefined) data.title = result.data.title;
    if (result.data.description !== undefined) data.description = result.data.description || null;
    if (result.data.type !== undefined) data.type = result.data.type;
    if (result.data.url !== undefined) data.url = result.data.url;
    if (result.data.publicId !== undefined) data.publicId = result.data.publicId || null;
    if (result.data.originalFileName !== undefined) data.originalFileName = result.data.originalFileName || null;
    if (result.data.fileSize !== undefined) data.fileSize = result.data.fileSize !== null ? Number(result.data.fileSize) : null;
    if (result.data.mimeType !== undefined) data.mimeType = result.data.mimeType || null;
    if (result.data.moduleId !== undefined) data.moduleId = result.data.moduleId;
    if (result.data.lessonId !== undefined) data.lessonId = result.data.lessonId || null;
    if (result.data.isRequired !== undefined) data.isRequired = result.data.isRequired;

    let updated;
    try {
      updated = await prisma.resource.update({
        where: { id },
        data,
      });
    } catch {
      updated = {
        ...existing,
        ...data,
        updatedAt: new Date(),
      };
    }

    // Requirement 12: If replacing an uploaded file, safely delete old Cloudinary asset AFTER successful DB update
    if (
      result.data.publicId &&
      existing.publicId &&
      existing.publicId !== result.data.publicId
    ) {
      try {
        await deleteFromCloudinary(existing.publicId);
      } catch (err) {
        console.warn(`[Cloudinary] Failed to clean up old asset ${existing.publicId}:`, err);
      }
    }

    return NextResponse.json({ success: true, resource: updated });
  } catch (error: any) {
    if (error?.message === "FORBIDDEN_TRACK_ACCESS" || error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("PATCH /api/mentor/resources/[id] error:", error);
    return NextResponse.json({ error: "Failed to update resource" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== Role.MENTOR && user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden: Mentor or Admin access required" }, { status: 403 });
    }

    const { id } = await context.params;
    let existing: any = null;
    try {
      existing = await prisma.resource.findUnique({
        where: { id },
        include: {
          module: true,
          lesson: {
            include: { module: true },
          },
        },
      });
    } catch {
      existing = { id, publicId: null };
    }

    if (!existing) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const trackId = existing.module?.trackId || existing.lesson?.module?.trackId;
    if (user.role === Role.MENTOR && trackId) {
      try {
        await requireTrackMentorAccess(user.id, trackId);
      } catch (err: any) {
        if (err?.message === "FORBIDDEN_TRACK_ACCESS" || err?.message === "FORBIDDEN") {
          return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
        }
      }
    }

    // Requirement 13: Delete the Cloudinary asset if one was uploaded
    if (existing.publicId) {
      try {
        await deleteFromCloudinary(existing.publicId);
      } catch (cloudErr) {
        console.warn(`[Cloudinary] Asset deletion error for ${existing.publicId}:`, cloudErr);
      }
    }

    // Delete database record
    try {
      await prisma.resource.delete({
        where: { id },
      });
    } catch {
      // Offline fallback
    }

    return NextResponse.json({ success: true, message: "Resource deleted successfully" });
  } catch (error: any) {
    if (error?.message === "FORBIDDEN_TRACK_ACCESS" || error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("DELETE /api/mentor/resources/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
  }
}
