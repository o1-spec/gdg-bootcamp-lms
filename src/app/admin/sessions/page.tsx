import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAdminSessions } from "@/lib/data/admin";
import { AdminSessionsClient } from "@/components/admin/sessions/AdminSessionsClient";
import { Role } from "@prisma/client";

export default async function AdminSessionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?from=/admin/sessions");
  }

  if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
    redirect(user.role === Role.MENTOR ? "/mentor/dashboard" : "/");
  }

  const data = await getAdminSessions();

  const adminProfile = {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    role: user.role === Role.SUPER_ADMIN ? "Super Administrator" : "Platform Administrator",
  };

  return (
    <AdminSessionsClient
      sessions={data.sessions}
      tracks={data.tracks}
      mentors={data.mentors}
      admin={adminProfile}
    />
  );
}
