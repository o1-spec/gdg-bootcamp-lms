import { PageLoadingSkeleton } from "@/components/ui/PageLoadingSkeleton";

export default function AnnouncementsLoading() {
  return (
    <PageLoadingSkeleton
      title="Cohort Announcements"
      subtitle="Loading official communications and updates from organizers and mentors..."
      cardCount={3}
    />
  );
}
