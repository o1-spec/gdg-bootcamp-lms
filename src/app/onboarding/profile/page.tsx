import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProfileSetupForm } from "@/components/onboarding/ProfileSetupForm";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Profile Setup | GDG LASU Bootcamp LMS",
  description: "Set up your student profile and details.",
};

export default async function OnboardingProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?from=/onboarding/profile");
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gdg-cream flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gdg-yellow" />
        </div>
      }
    >
      <ProfileSetupForm
        initialUser={{
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          displayName: user.displayName || "",
          email: user.email,
          avatarUrl: user.avatarUrl || "",
          bio: user.bio || "",
          githubUrl: user.githubUrl || "",
          linkedinUrl: user.linkedinUrl || "",
        }}
      />
    </Suspense>
  );
}
