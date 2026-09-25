import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getStudentDashboardData } from "@/lib/data/dashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";

export const metadata = {
  title: "Student Dashboard | GDG LASU Bootcamp LMS",
  description: "Track your learning progress, upcoming sessions, and course assignments.",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?from=/dashboard");
  }

  if (user.role === "MENTOR") {
    redirect("/mentor");
  }

  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  if (user.role === "STUDENT" && user.onboardingCompleted === false) {
    redirect("/onboarding");
  }

  const initialData = await getStudentDashboardData(user);

  return <StudentDashboard initialData={initialData} />;
}
