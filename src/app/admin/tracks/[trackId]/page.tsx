import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAdminTrackDetail } from "@/lib/data/admin";
import { AdminTrackDetailClient } from "@/components/admin/tracks/AdminTrackDetailClient";
import { Role } from "@prisma/client";

interface PageProps {
  params: Promise<{ trackId: string }>;
}

export default async function AdminTrackDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?from=/admin/tracks");
  }

  if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
    redirect(user.role === Role.MENTOR ? "/mentor/dashboard" : "/");
  }

  const { trackId } = await params;
  const data = await getAdminTrackDetail(trackId);

  if (!data || !data.track) {
    notFound();
  }

  const adminProfile = {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    role: user.role === Role.SUPER_ADMIN ? "Super Administrator" : "Platform Administrator",
  };

  return (
    <AdminTrackDetailClient
      track={data.track}
      resources={data.resources}
      students={data.students}
      mentors={data.mentors}
      sessions={data.sessions}
      assignments={data.assignments}
      attendanceRate={data.attendanceRate}
      admin={adminProfile}
    />
  );
}
