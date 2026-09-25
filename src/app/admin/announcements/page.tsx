import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAdminAnnouncements } from "@/lib/data/admin";
import { AdminAnnouncementsClient } from "@/components/admin/announcements/AdminAnnouncementsClient";
import { Role } from "@prisma/client";

export default async function AdminAnnouncementsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?from=/admin/announcements");
  }

  if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
    redirect(user.role === Role.MENTOR ? "/mentor/dashboard" : "/");
  }

  const data = await getAdminAnnouncements();

  const adminProfile = {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    role: user.role === Role.SUPER_ADMIN ? "Super Administrator" : "Platform Administrator",
  };

  return (
    <AdminAnnouncementsClient
      announcements={data.announcements}
      tracks={data.tracks}
      admin={adminProfile}
    />
  );
}
