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
    // Offline fallback
    bootcamps = [{ id: "bootcamp-1", name: "GDG LASU Bootcamp 2026" }];
    cohorts = [{ id: "cohort-1", name: "Cohort 1 (Alpha)", bootcampId: "bootcamp-1" }];
    tracks = [
      { id: "track-backend", name: "Backend Development", cohortId: "cohort-1", accent: "#4285F4" },
      { id: "track-frontend", name: "Frontend Development", cohortId: "cohort-1", accent: "#34A853" },
      { id: "track-dsa", name: "DSA & Interview Prep", cohortId: "cohort-1", accent: "#EA4335" },
      { id: "track-uiux", name: "UI/UX Design", cohortId: "cohort-1", accent: "#FBBC04" },
    ];
  }

  return (
    <AdminInvitesClient
      initialInvites={invites}
      admin={{
        id: user.id,
        name: user.displayName || `${user.firstName} ${user.lastName}`,
        email: user.email,
        avatar: user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        role: user.role === Role.SUPER_ADMIN ? "Super Admin" : "Admin",
      }}
      bootcamps={bootcamps}
      cohorts={cohorts}
      tracks={tracks}
    />
  );
}
