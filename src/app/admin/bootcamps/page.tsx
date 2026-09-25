import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAdminBootcamps } from "@/lib/data/admin";
import { AdminBootcampsClient } from "@/components/admin/bootcamps/AdminBootcampsClient";
import { Role } from "@prisma/client";

export default async function AdminBootcampsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?from=/admin/bootcamps");
  }

  if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
    redirect(user.role === Role.MENTOR ? "/mentor/dashboard" : "/");
  }

  const bootcamps = await getAdminBootcamps();

  const adminProfile = {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    role: user.role === Role.SUPER_ADMIN ? "Super Administrator" : "Platform Administrator",
  };

  return <AdminBootcampsClient bootcamps={bootcamps} admin={adminProfile} />;
}
