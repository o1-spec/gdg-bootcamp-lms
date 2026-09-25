import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAdminEnrollments } from "@/lib/data/admin";
import { AdminEnrollmentsClient } from "@/components/admin/enrollments/AdminEnrollmentsClient";
import { Role } from "@prisma/client";

export default async function AdminEnrollmentsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?from=/admin/enrollments");
  }

  if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
    redirect(user.role === Role.MENTOR ? "/mentor/dashboard" : "/");
  }

  const data = await getAdminEnrollments();

  const adminProfile = {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: user.avatarUrl || "",
    role: user.role === Role.SUPER_ADMIN ? "Super Administrator" : "Platform Administrator",
  };

  return (
    <AdminEnrollmentsClient
      enrollments={data.enrollments}
      tracks={data.tracks}
      students={data.students}
      admin={adminProfile}
    />
  );
}
