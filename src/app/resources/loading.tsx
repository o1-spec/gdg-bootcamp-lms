import { PageLoadingSkeleton } from "@/components/ui/PageLoadingSkeleton";

export default function ResourcesLoading() {
  return (
    <PageLoadingSkeleton
      title="Resource Library"
      subtitle="Loading documentation, starter repositories, slides, and cheat sheets..."
      cardCount={6}
    />
  );
}
