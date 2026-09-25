import { NextResponse } from "next/server";
import { getSessions } from "@/lib/data/schedule";
import { SessionMode } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackSlug = searchParams.get("trackSlug") || undefined;
    const rawMode = searchParams.get("mode");

    let mode: SessionMode | undefined;
    if (rawMode && Object.values(SessionMode).includes(rawMode as SessionMode)) {
      mode = rawMode as SessionMode;
    }

    const sessions = await getSessions({
      trackSlug,
      mode,
    });

    return NextResponse.json({ sessions }, { status: 200 });
  } catch (error) {
    console.error("GET /api/schedule error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule sessions" },
      { status: 500 }
    );
  }
}
