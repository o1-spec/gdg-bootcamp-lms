import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireTrackMentorAccess } from "@/lib/auth";
import { resourceSchema } from "@/lib/validations/mentor";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = resourceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, description, type, url, moduleId, lessonId, isRequired } = result.data;

    const moduleItem = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { track: true },
    });

    if (!moduleItem) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Verify track mentor access
    await requireTrackMentorAccess(user.id, moduleItem.trackId);

    const newResource = await prisma.resource.create({
      data: {
        title,
        description: description || null,
        type,
        url,
        moduleId,
        lessonId: lessonId || null,
        uploadedById: user.id,
        isRequired,
      },
    });

    return NextResponse.json({ success: true, resource: newResource }, { status: 201 });
  } catch (error: any) {
    if (error?.message === "FORBIDDEN_TRACK_ACCESS" || error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("POST /api/mentor/resources error:", error);
    return NextResponse.json({ error: "Failed to create resource" }, { status: 500 });
  }
}
