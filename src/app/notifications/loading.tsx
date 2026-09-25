import { PageLoadingSkeleton } from "@/components/ui/PageLoadingSkeleton";

export default function NotificationsLoading() {
  return (
    <PageLoadingSkeleton
      title="Notification Center"
      subtitle="Loading your real-time alerts, assignment reviews, and session reminders..."
      cardCount={4}
    />
  );
}
