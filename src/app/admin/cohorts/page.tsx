import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAdminCohorts } from "@/lib/data/admin";
import { AdminCohortsClient } from "@/components/admin/cohorts/AdminCohortsClient";
import { Role } from "@prisma/client";

export default async function AdminCohortsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?from=/admin/cohorts");
  }

  if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
    redirect(user.role === Role.MENTOR ? "/mentor/dashboard" : "/");
  }

  const { cohorts, bootcamps } = await getAdminCohorts();

  const adminProfile = {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: user.avatarUrl || "",
    role: user.role === Role.SUPER_ADMIN ? "Super Administrator" : "Platform Administrator",
  };

  return <AdminCohortsClient cohorts={cohorts} bootcamps={bootcamps} admin={adminProfile} />;
}
