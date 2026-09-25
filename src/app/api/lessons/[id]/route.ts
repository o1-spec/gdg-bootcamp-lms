import { NextResponse } from "next/server";
import { getLessonById } from "@/lib/data/lessons";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const lesson = await getLessonById(id);

    if (!lesson) {
      return NextResponse.json(
        { error: `Lesson with id "${id}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ lesson }, { status: 200 });
  } catch (error) {
    console.error("GET /api/lessons/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}
