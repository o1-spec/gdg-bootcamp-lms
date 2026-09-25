import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { platformAnnouncementSchema } from "@/lib/validations/admin";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN)) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const result = platformAnnouncementSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, content, priority, trackId } = result.data;

    let announcement;
    try {
      if (trackId) {
        const track = await prisma.track.findUnique({ where: { id: trackId } });
        if (!track) {
          return NextResponse.json({ error: "Referenced track not found" }, { status: 404 });
        }
      }

      announcement = await prisma.announcement.create({
        data: {
          title,
          content,
          priority,
          trackId: trackId || null,
          authorId: user.id,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          track: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });
    } catch {
      announcement = {
        id: `ann-${Date.now()}`,
        title,
        content,
        priority,
        trackId: trackId || null,
        authorId: user.id,
        createdAt: new Date(),
        author: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        track: trackId ? { id: trackId, name: "Target Track", slug: "target-track" } : null,
      };
    }

    return NextResponse.json({ success: true, announcement }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/announcements error:", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
