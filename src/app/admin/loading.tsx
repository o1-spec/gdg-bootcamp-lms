import { PageLoadingSkeleton } from "@/components/ui/PageLoadingSkeleton";

export default function AdminLoading() {
  return (
    <PageLoadingSkeleton
      title="Admin Control Center"
      subtitle="Loading bootcamp management metrics, cohort tracks, users, and invites..."
      cardCount={4}
    />
  );
}
