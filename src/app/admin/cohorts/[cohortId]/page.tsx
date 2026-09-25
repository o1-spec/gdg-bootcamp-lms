import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAdminCohortDetail } from "@/lib/data/admin";
import { AdminCohortDetailClient } from "@/components/admin/cohorts/AdminCohortDetailClient";
import { Role } from "@prisma/client";

interface PageProps {
  params: Promise<{ cohortId: string }>;
}

export default async function AdminCohortDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?from=/admin/cohorts");
  }

  if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
    redirect(user.role === Role.MENTOR ? "/mentor/dashboard" : "/");
  }

  const { cohortId } = await params;
  const cohort = await getAdminCohortDetail(cohortId);

  if (!cohort) {
    notFound();
  }

  const adminProfile = {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: user.avatarUrl || "",
    role: user.role === Role.SUPER_ADMIN ? "Super Administrator" : "Platform Administrator",
  };

  return <AdminCohortDetailClient cohort={cohort} admin={adminProfile} />;
}
