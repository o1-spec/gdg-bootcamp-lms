import { NextResponse } from "next/server";
import { getResources } from "@/lib/data/resources";
import { ResourceType } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackSlug = searchParams.get("trackSlug") || undefined;
    const moduleId = searchParams.get("moduleId") || undefined;
    const lessonId = searchParams.get("lessonId") || undefined;
    const search = searchParams.get("search") || undefined;
    const rawType = searchParams.get("type");

    let type: ResourceType | undefined;
    if (rawType && Object.values(ResourceType).includes(rawType as ResourceType)) {
      type = rawType as ResourceType;
    }

    const resources = await getResources({
      trackSlug,
      moduleId,
      lessonId,
      type,
      search,
    });

    return NextResponse.json({ resources }, { status: 200 });
  } catch (error) {
    console.error("GET /api/resources error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}
