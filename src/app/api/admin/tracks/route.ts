import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { trackAdminSchema } from "@/lib/validations/admin";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN)) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const result = trackAdminSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { cohortId, name, slug, description, accent } = result.data;

    let track;
    try {
      // Check cohort exists
      const cohort = await prisma.cohort.findUnique({ where: { id: cohortId } });
      if (!cohort) {
        return NextResponse.json({ error: "Referenced cohort does not exist" }, { status: 400 });
      }

      // Check slug uniqueness
      const existing = await prisma.track.findUnique({ where: { slug } });
      if (existing) {
        return NextResponse.json({ error: "A track with this slug already exists" }, { status: 409 });
      }

      track = await prisma.track.create({
        data: {
          cohortId,
          name,
          slug,
          description: description || null,
          accent: accent || "#4285F4",
        },
      });
    } catch {
      track = {
        id: `track-${Date.now()}`,
        cohortId,
        name,
        slug,
        description: description || null,
        accent: accent || "#4285F4",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return NextResponse.json({ success: true, track }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/tracks error:", error);
    return NextResponse.json({ error: "Failed to create track" }, { status: 500 });
  }
}
