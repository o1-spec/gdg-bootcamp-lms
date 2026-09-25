import { NextResponse } from "next/server";
import { getModulesByTrackSlug } from "@/lib/data/tracks";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const modules = await getModulesByTrackSlug(slug);

    if (modules === null) {
      return NextResponse.json(
        { error: `Track with slug "${slug}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ modules }, { status: 200 });
  } catch (error) {
    console.error("GET /api/tracks/[slug]/modules error:", error);
    return NextResponse.json(
      { error: "Failed to fetch modules for track" },
      { status: 500 }
    );
  }
}
