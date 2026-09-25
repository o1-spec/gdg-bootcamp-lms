import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { markAllNotificationsRead } from "@/lib/data/notifications";

/**
 * PATCH /api/notifications/read-all
 * Marks every unread notification for the current user as read.
 */
export async function PATCH() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await markAllNotificationsRead(user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/notifications/read-all error:", error);
    return NextResponse.json({ error: "Failed to mark all as read" }, { status: 500 });
  }
}
