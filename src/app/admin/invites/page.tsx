import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAdminInvites } from "@/lib/data/invites";
import { AdminInvitesClient } from "@/components/admin/invites/AdminInvitesClient";
import { Role } from "@prisma/client";

export const metadata = {
  title: "Invite Codes | GDG LASU Bootcamp Admin",
  description: "Manage student onboarding invite codes, track links, and usage analytics.",
};

export default async function AdminInvitesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?from=/admin/invites");
  }

  if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
    redirect(user.role === Role.MENTOR ? "/mentor/dashboard" : "/");
  }

  const invites = await getAdminInvites("all");

  let bootcamps: { id: string; name: string }[] = [];
  let cohorts: { id: string; name: string; bootcampId: string }[] = [];
  let tracks: { id: string; name: string; cohortId: string; accent?: string | null }[] = [];

  try {
    bootcamps = await prisma.bootcamp.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    cohorts = await prisma.cohort.findMany({
      select: { id: true, name: true, bootcampId: true },
      orderBy: { name: "asc" },
    });

    tracks = await prisma.track.findMany({
      select: { id: true, name: true, cohortId: true, accent: true },
      orderBy: { name: "asc" },
    });
  } catch {
    // DB unavailable — empty arrays let the UI render without fake data
    bootcamps = [];
    cohorts = [];
    tracks = [];
  }

  return (
    <AdminInvitesClient
      initialInvites={invites}
      admin={{
        id: user.id,
        name: user.displayName || `${user.firstName} ${user.lastName}`,
        email: user.email,
        avatar: user.avatarUrl || "",
        role: user.role === Role.SUPER_ADMIN ? "Super Admin" : "Admin",
      }}
      bootcamps={bootcamps}
      cohorts={cohorts}
      tracks={tracks}
    />
  );
}
