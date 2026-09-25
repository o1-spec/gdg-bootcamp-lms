import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getNotificationsForUser } from "@/lib/data/notifications";
import { NotificationsClient } from "@/components/notifications/NotificationsClient";

export const metadata = {
  title: "Notifications — GDG LASU Bootcamp",
  description: "Your in-app notifications for assignments, sessions, announcements, and more.",
};

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?from=/notifications");

  const notifications = await getNotificationsForUser(user.id, 100);

  return (
    <NotificationsClient
      initialNotifications={notifications.map((n) => ({
        id: n.id,
        type: n.type as string,
        title: n.title,
        message: n.message,
        link: n.link ?? undefined,
        readAt: n.readAt?.toISOString() ?? null,
        createdAt: n.createdAt.toISOString(),
      }))}
      userRole={user.role}
      userName={user.displayName || `${user.firstName} ${user.lastName}`}
    />
  );
}
