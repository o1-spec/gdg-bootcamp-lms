import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAdminTracks } from "@/lib/data/admin";
import { AdminTracksClient } from "@/components/admin/tracks/AdminTracksClient";
import { Role } from "@prisma/client";

export default async function AdminTracksPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?from=/admin/tracks");
  }

  if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
    redirect(user.role === Role.MENTOR ? "/mentor/dashboard" : "/");
  }

  const { tracks, cohorts } = await getAdminTracks();

  const adminProfile = {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: user.avatarUrl || "",
    role: user.role === Role.SUPER_ADMIN ? "Super Administrator" : "Platform Administrator",
  };

  return <AdminTracksClient tracks={tracks} cohorts={cohorts} admin={adminProfile} />;
}
