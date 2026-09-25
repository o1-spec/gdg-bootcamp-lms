import { NextResponse } from "next/server";
import { getAllTracks } from "@/lib/data/tracks";

export async function GET() {
  try {
    const tracks = await getAllTracks();
    return NextResponse.json({ tracks }, { status: 200 });
  } catch (error) {
    console.error("GET /api/tracks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracks" },
      { status: 500 }
    );
  }
}
