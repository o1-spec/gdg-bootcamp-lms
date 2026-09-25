import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Onboarding | GDG LASU Bootcamp LMS",
  description: "Complete your profile and join your bootcamp track.",
};

export default async function OnboardingPage(props: {
  searchParams: Promise<{ code?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?from=/onboarding");
  }

  const { code } = await props.searchParams;
  const codeParam = code ? `?code=${encodeURIComponent(code)}` : "";

  // If user has not completed basic profile or has no name, send to profile
  if (!user.firstName || !user.lastName) {
    redirect(`/onboarding/profile${codeParam}`);
  }

  // Otherwise route to join step
  redirect(`/onboarding/join${codeParam}`);
}
