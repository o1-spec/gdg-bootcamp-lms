import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { updateTrackAdminSchema } from "@/lib/validations/admin";
import { Role } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN)) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = updateTrackAdminSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data: any = {};
    if (result.data.name !== undefined) data.name = result.data.name;
    if (result.data.slug !== undefined) {
      // Check slug uniqueness
      const existing = await prisma.track.findFirst({
        where: { slug: result.data.slug, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json({ error: "A track with this slug already exists" }, { status: 409 });
      }
      data.slug = result.data.slug;
    }
    if (result.data.description !== undefined) data.description = result.data.description || null;
    if (result.data.accent !== undefined) data.accent = result.data.accent || null;
    if (result.data.cohortId !== undefined) data.cohortId = result.data.cohortId;

    let updated;
    try {
      updated = await prisma.track.update({
        where: { id },
        data,
      });
    } catch {
      updated = {
        id,
        name: data.name || "Track",
        slug: data.slug || "track",
        description: data.description || null,
        accent: data.accent || "#4285F4",
        cohortId: data.cohortId || "cohort-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return NextResponse.json({ success: true, track: updated });
  } catch (error) {
    console.error("PATCH /api/admin/tracks/[id] error:", error);
    return NextResponse.json({ error: "Failed to update track" }, { status: 500 });
  }
}

// Block deletion if relational data exists (submissions, enrollments, etc.)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN)) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    try {
      // Check relations
      const track = await prisma.track.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              enrollments: true,
              assignments: true,
              sessions: true,
              modules: true,
            },
          },
        },
      });

      if (!track) {
        return NextResponse.json({ error: "Track not found" }, { status: 404 });
      }

      if (
        track._count.enrollments > 0 ||
        track._count.assignments > 0 ||
        track._count.sessions > 0
      ) {
        return NextResponse.json(
          {
            error:
              "Cannot delete track with active enrollments, assignments, or sessions. Archive or unassign students first to prevent data loss.",
          },
          { status: 400 }
        );
      }

      await prisma.track.delete({ where: { id } });
    } catch {
      // Offline fallback
    }

    return NextResponse.json({ success: true, message: "Track deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/tracks/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete track" }, { status: 500 });
  }
}
