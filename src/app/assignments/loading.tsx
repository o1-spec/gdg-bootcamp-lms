import { PageLoadingSkeleton } from "@/components/ui/PageLoadingSkeleton";

export default function AssignmentsLoading() {
  return (
    <PageLoadingSkeleton
      title="Assignments & Milestones"
      subtitle="Loading your assigned tasks and submission records..."
      cardCount={6}
    />
  );
}
