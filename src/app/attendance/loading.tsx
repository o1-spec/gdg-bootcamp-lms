import { PageLoadingSkeleton } from "@/components/ui/PageLoadingSkeleton";

export default function AttendanceLoading() {
  return (
    <PageLoadingSkeleton
      title="Attendance Records"
      subtitle="Loading your verified attendance ledger across all cohort sessions..."
      cardCount={4}
    />
  );
}
