import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireTrackMentorAccess } from "@/lib/auth";
import { updateModuleSchema } from "@/lib/validations/mentor";

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
    const existing = await prisma.module.findUnique({
      where: { id },
      include: { track: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    await requireTrackMentorAccess(user.id, existing.trackId);

    const body = await request.json();
    const result = updateModuleSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await prisma.module.update({
      where: { id },
      data: {
        ...(result.data.title !== undefined ? { title: result.data.title } : {}),
        ...(result.data.slug !== undefined ? { slug: result.data.slug } : {}),
        ...(result.data.description !== undefined ? { description: result.data.description } : {}),
        ...(result.data.order !== undefined ? { order: result.data.order } : {}),
      },
    });

    return NextResponse.json({ success: true, module: updated });
  } catch (error: any) {
    if (error?.message === "FORBIDDEN_TRACK_ACCESS" || error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("PATCH /api/mentor/modules/[id] error:", error);
    return NextResponse.json({ error: "Failed to update module" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await prisma.module.findUnique({
      where: { id },
      include: {
        lessons: true,
        resources: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    await requireTrackMentorAccess(user.id, existing.trackId);

    // Safe deletion: prevent deleting if it has lessons
    if (existing.lessons.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete module: It currently contains active lessons. Delete or move the lessons first.",
        },
        { status: 400 }
      );
    }

    await prisma.module.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Module deleted successfully" });
  } catch (error: any) {
    if (error?.message === "FORBIDDEN_TRACK_ACCESS" || error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("DELETE /api/mentor/modules/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete module" }, { status: 500 });
  }
}
