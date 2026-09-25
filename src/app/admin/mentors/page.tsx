import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAdminMentors } from "@/lib/data/admin";
import { AdminMentorsClient } from "@/components/admin/mentors/AdminMentorsClient";
import { Role } from "@prisma/client";

export default async function AdminMentorsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?from=/admin/mentors");
  }

  if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
    redirect(user.role === Role.MENTOR ? "/mentor/dashboard" : "/");
  }

  const data = await getAdminMentors();

  const adminProfile = {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    role: user.role === Role.SUPER_ADMIN ? "Super Administrator" : "Platform Administrator",
  };

  return (
    <AdminMentorsClient
      mentors={data.mentors}
      tracks={data.tracks}
      admin={adminProfile}
    />
  );
}
