import { NextResponse } from "next/server";
import { getAnnouncements } from "@/lib/data/announcements";
import { AnnouncementPriority } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackSlug = searchParams.get("trackSlug") || undefined;
    const rawPriority = searchParams.get("priority");

    let priority: AnnouncementPriority | undefined;
    if (rawPriority && Object.values(AnnouncementPriority).includes(rawPriority as AnnouncementPriority)) {
      priority = rawPriority as AnnouncementPriority;
    }

    const announcements = await getAnnouncements({
      trackSlug,
      priority,
    });

    return NextResponse.json({ announcements }, { status: 200 });
  } catch (error) {
    console.error("GET /api/announcements error:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}
