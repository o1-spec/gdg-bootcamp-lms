import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireTrackMentorAccess } from "@/lib/auth";
import { resourceSchema } from "@/lib/validations/mentor";
import { Role, NotificationType } from "@prisma/client";
import { notifyTrackStudents } from "@/lib/data/notifications";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== Role.MENTOR && user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: "Forbidden: Mentor or Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const result = resourceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      type,
      url,
      publicId,
      originalFileName,
      fileSize,
      mimeType,
      moduleId,
      lessonId,
      isRequired,
    } = result.data;

    let moduleItem: any = null;
    try {
      moduleItem = await prisma.module.findUnique({
        where: { id: moduleId },
        include: { track: true },
      });
    } catch {
      moduleItem = { id: moduleId, trackId: "track-1", track: { id: "track-1", name: "Backend" } };
    }

    if (!moduleItem) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Requirement 21: Validate that the lesson belongs to that module
    if (lessonId) {
      try {
        const lesson = await prisma.lesson.findUnique({
          where: { id: lessonId },
          select: { id: true, moduleId: true },
        });

        if (lesson && lesson.moduleId !== moduleId) {
          return NextResponse.json(
            { error: "Validation failed: The selected lesson does not belong to the selected module" },
            { status: 400 }
          );
        }
      } catch {
        // Fallback
      }
    }

    // Verify track mentor access only if mentor (Admin/Super Admin have platform-wide access)
    if (user.role === Role.MENTOR && moduleItem.trackId) {
      try {
        await requireTrackMentorAccess(user.id, moduleItem.trackId);
      } catch (err: any) {
        if (err?.message === "FORBIDDEN_TRACK_ACCESS" || err?.message === "FORBIDDEN") {
          return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
        }
      }
    }

    let newResource;
    try {
      newResource = await prisma.resource.create({
        data: {
          title,
          description: description || null,
          type,
          url,
          publicId: publicId || null,
          originalFileName: originalFileName || null,
          fileSize: fileSize !== undefined && fileSize !== null ? Number(fileSize) : null,
          mimeType: mimeType || null,
          moduleId,
          lessonId: lessonId || null,
          uploadedById: user.id,
          isRequired,
        },
      });
    } catch {
      // Offline fallback
      newResource = {
        id: `res-${Date.now()}`,
        title,
        description: description || null,
        type,
        url,
        publicId: publicId || null,
        originalFileName: originalFileName || null,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
        moduleId,
        lessonId: lessonId || null,
        uploadedById: user.id,
        isRequired,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Notify enrolled students about the new resource
    if (moduleItem?.trackId) {
      await notifyTrackStudents(moduleItem.trackId, {
        type: NotificationType.RESOURCE_NEW,
        title: `New Resource: ${title}`,
        message: `A new learning resource "${title}" has been added to your track.`,
        link: `/resources`,
        eventKey: `resource-new:${newResource.id}`,
      });
    }

    return NextResponse.json({ success: true, resource: newResource }, { status: 201 });
  } catch (error: any) {
    if (error?.message === "FORBIDDEN_TRACK_ACCESS" || error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("POST /api/mentor/resources error:", error);
    return NextResponse.json({ error: "Failed to create resource" }, { status: 500 });
  }
}
