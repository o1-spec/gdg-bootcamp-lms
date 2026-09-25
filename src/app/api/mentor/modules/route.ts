import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, requireTrackMentorAccess } from "@/lib/auth";
import { moduleSchema } from "@/lib/validations/mentor";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = moduleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { trackId, title, slug, description, order } = result.data;

    // Check mentor authorization for track
    await requireTrackMentorAccess(user.id, trackId);

    // Check slug uniqueness
    const existing = await prisma.module.findFirst({
      where: { trackId, slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A module with this slug already exists in this track" },
        { status: 409 }
      );
    }

    const newModule = await prisma.module.create({
      data: {
        trackId,
        title,
        slug,
        description: description || null,
        order,
      },
    });

    return NextResponse.json({ success: true, module: newModule }, { status: 201 });
  } catch (error: any) {
    if (error?.message === "FORBIDDEN_TRACK_ACCESS" || error?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this track" }, { status: 403 });
    }
    console.error("POST /api/mentor/modules error:", error);
    return NextResponse.json({ error: "Failed to create module" }, { status: 500 });
  }
}
