import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getNotificationsForUser,
  getUnreadCountForUser,
} from "@/lib/data/notifications";

/**
 * GET /api/notifications
 * Returns the current user's notifications + unread count.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [notifications, unreadCount] = await Promise.all([
      getNotificationsForUser(user.id, 60),
      getUnreadCountForUser(user.id),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
