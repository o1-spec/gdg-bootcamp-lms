import { PageLoadingSkeleton } from "@/components/ui/PageLoadingSkeleton";

export default function ProgressLoading() {
  return (
    <PageLoadingSkeleton
      title="Student Progress & Analytics"
      subtitle="Loading module completion metrics, study activity, and attendance history..."
      cardCount={4}
    />
  );
}
