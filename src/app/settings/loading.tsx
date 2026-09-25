import { PageLoadingSkeleton } from "@/components/ui/PageLoadingSkeleton";

export default function SettingsLoading() {
  return (
    <PageLoadingSkeleton
      title="Account Settings"
      subtitle="Loading your profile, security options, and notification preferences..."
      cardCount={3}
    />
  );
}
