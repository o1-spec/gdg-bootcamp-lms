import { NextResponse } from "next/server";
import { getAssignments } from "@/lib/data/assignments";
import { AssignmentType } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackSlug = searchParams.get("trackSlug") || undefined;
    const moduleId = searchParams.get("moduleId") || undefined;
    const rawType = searchParams.get("type");

    let type: AssignmentType | undefined;
    if (rawType && Object.values(AssignmentType).includes(rawType as AssignmentType)) {
      type = rawType as AssignmentType;
    }

    const assignments = await getAssignments({
      trackSlug,
      moduleId,
      type,
    });

    return NextResponse.json({ assignments }, { status: 200 });
  } catch (error) {
    console.error("GET /api/assignments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
