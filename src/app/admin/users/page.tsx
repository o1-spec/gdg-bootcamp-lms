import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAdminUsers } from "@/lib/data/admin";
import { AdminUsersClient } from "@/components/admin/users/AdminUsersClient";
import { Role } from "@prisma/client";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?from=/admin/users");
  }

  if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
    redirect(user.role === Role.MENTOR ? "/mentor/dashboard" : "/");
  }

  const users = await getAdminUsers();

  const adminProfile = {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: user.avatarUrl || "",
    role: user.role === Role.SUPER_ADMIN ? "Super Administrator" : "Platform Administrator",
    rawRole: user.role,
  };

  return <AdminUsersClient users={users} admin={adminProfile} />;
}
