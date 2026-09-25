import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAdminBootcampDetail } from "@/lib/data/admin";
import { AdminBootcampDetailClient } from "@/components/admin/bootcamps/AdminBootcampDetailClient";
import { Role } from "@prisma/client";

interface PageProps {
  params: Promise<{ bootcampId: string }>;
}

export default async function AdminBootcampDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?from=/admin/bootcamps");
  }

  if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
    redirect(user.role === Role.MENTOR ? "/mentor/dashboard" : "/");
  }

  const { bootcampId } = await params;
  const bootcamp = await getAdminBootcampDetail(bootcampId);

  if (!bootcamp) {
    notFound();
  }

  const adminProfile = {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: user.avatarUrl || "",
    role: user.role === Role.SUPER_ADMIN ? "Super Administrator" : "Platform Administrator",
  };

  return <AdminBootcampDetailClient bootcamp={bootcamp} admin={adminProfile} />;
}
