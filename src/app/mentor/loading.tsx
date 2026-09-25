import { PageLoadingSkeleton } from "@/components/ui/PageLoadingSkeleton";

export default function MentorLoading() {
  return (
    <PageLoadingSkeleton
      title="Mentor Portal"
      subtitle="Loading assigned track curricula, student submissions, and sessions..."
      cardCount={4}
    />
  );
}
