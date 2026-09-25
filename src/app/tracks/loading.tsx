import { PageLoadingSkeleton } from "@/components/ui/PageLoadingSkeleton";

export default function TracksLoading() {
  return (
    <PageLoadingSkeleton
      title="Engineering Tracks"
      subtitle="Loading learning pathways and enrolled curriculum modules..."
      cardCount={4}
    />
  );
}
