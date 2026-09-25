import { NextResponse } from "next/server";
import { getTrackBySlug } from "@/lib/data/tracks";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const track = await getTrackBySlug(slug);

    if (!track) {
      return NextResponse.json(
        { error: `Track with slug "${slug}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ track }, { status: 200 });
  } catch (error) {
    console.error("GET /api/tracks/[slug] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch track" },
      { status: 500 }
    );
  }
}
