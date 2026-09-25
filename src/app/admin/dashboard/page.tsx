import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/data/admin";
import { AdminDashboardClient } from "@/components/admin/dashboard/AdminDashboardClient";
import { Role } from "@prisma/client";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?from=/admin/dashboard");
  }

  if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
    if (user.role === Role.MENTOR) {
      redirect("/mentor/dashboard");
    } else {
      redirect("/");
    }
  }

  const data = await getAdminDashboardData();

  const adminProfile = {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: user.avatarUrl || "",
    role: user.role === Role.SUPER_ADMIN ? "Super Administrator" : "Platform Administrator",
  };

  return (
    <AdminDashboardClient
      metrics={data.metrics}
      recentEnrollments={data.recentEnrollments}
      activeCohorts={data.activeCohorts}
      upcomingSessions={data.upcomingSessions}
      recentAnnouncements={data.recentAnnouncements}
      trackOverview={data.trackOverview}
      admin={adminProfile}
    />
  );
}
