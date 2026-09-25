import { NextResponse } from "next/server";
import { getLessonsByModuleId } from "@/lib/data/lessons";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const lessons = await getLessonsByModuleId(id);

    return NextResponse.json({ lessons }, { status: 200 });
  } catch (error) {
    console.error("GET /api/modules/[id]/lessons error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons for module" },
      { status: 500 }
    );
  }
}
