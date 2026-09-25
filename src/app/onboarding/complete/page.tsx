import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { OnboardingCompleteClient } from "@/components/onboarding/OnboardingCompleteClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Welcome to Bootcamp | GDG LASU Bootcamp LMS",
  description: "Your enrollment is complete. Welcome to the bootcamp.",
};

export default async function OnboardingCompletePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?from=/onboarding/complete");
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7EE] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FBBC04]" />
        </div>
      }
    >
      <OnboardingCompleteClient />
    </Suspense>
  );
}
