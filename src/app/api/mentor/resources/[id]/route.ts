import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireTrackMentorAccess } from "@/lib/auth";
import { updateResourceSchema } from "@/lib/validations/mentor";

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
    const existing = await prisma.resource.findUnique({
      where: { id },
      include: {
        module: true,
        lesson: {
          include: { module: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const trackId = existing.module?.trackId || existing.lesson?.module?.trackId;
    if (trackId) {
      await requireTrackMentorAccess(user.id, trackId);
    }

    const body = await request.json();
    const result = updateResourceSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await prisma.resource.update({
      where: { id },
      data: {
        ...(result.data.title !== undefined ? { title: result.data.title } : {}),
        ...(result.data.description !== undefined ? { description: result.data.description } : {}),
        ...(result.data.type !== undefined ? { type: result.data.type } : {}),
        ...(result.data.url !== undefined ? { url: result.data.url } : {}),
        ...(result.data.moduleId !== undefined ? { moduleId: result.data.moduleId } : {}),
        ...(result.data.lessonId !== undefined ? { lessonId: result.data.lessonId } : {}),
        ...(result.data.isRequired !== undefined ? { isRequired: result.data.isRequired } : {}),
      },
    });

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

    const { id } = await context.params;
    const existing = await prisma.resource.findUnique({
      where: { id },
      include: {
        module: true,
        lesson: {
          include: { module: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const trackId = existing.module?.trackId || existing.lesson?.module?.trackId;
    if (trackId) {
      await requireTrackMentorAccess(user.id, trackId);
    }

    await prisma.resource.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Resource deleted successfully" });
  } catch (error: any) {
    if (error?.message === "FORBIDDEN_TRACK_ACCESS" || error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("DELETE /api/mentor/resources/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
  }
}
