import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getStudentDashboardData } from "@/lib/data/dashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "STUDENT" && user.onboardingCompleted === false) {
    redirect("/onboarding");
  }

  const initialData = await getStudentDashboardData(user);

  return <StudentDashboard initialData={initialData} />;
}
