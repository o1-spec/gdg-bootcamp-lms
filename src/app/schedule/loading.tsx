import { PageLoadingSkeleton } from "@/components/ui/PageLoadingSkeleton";

export default function ScheduleLoading() {
  return (
    <PageLoadingSkeleton
      title="Cohort Schedule"
      subtitle="Loading upcoming workshops, live coding masterclasses, and mentor sessions..."
      cardCount={4}
    />
  );
}
