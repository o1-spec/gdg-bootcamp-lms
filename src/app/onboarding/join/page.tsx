import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { JoinBootcampClient } from "@/components/onboarding/JoinBootcampClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Join Bootcamp | GDG LASU Bootcamp LMS",
  description: "Enter your invite code and join your bootcamp cohort and track.",
};

export default async function OnboardingJoinPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?from=/onboarding/join");
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gdg-cream flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gdg-yellow" />
        </div>
      }
    >
      <JoinBootcampClient
        user={{
          id: user.id,
          name: user.displayName || `${user.firstName} ${user.lastName}`,
          email: user.email,
        }}
      />
    </Suspense>
  );
}
