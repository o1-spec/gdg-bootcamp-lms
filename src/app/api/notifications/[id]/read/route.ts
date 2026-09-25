import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { markNotificationRead } from "@/lib/data/notifications";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/notifications/[id]/read
 * Marks a single notification as read. Scoped to the current user.
 */
export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    await markNotificationRead(id, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/notifications/[id]/read error:", error);
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 });
  }
}
