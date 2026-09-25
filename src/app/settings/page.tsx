import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SettingsClient } from "@/components/settings/SettingsClient";

export const metadata = {
  title: "Account Settings & Security — GDG LASU Bootcamp",
  description: "Manage your personal profile, security credentials, email, and notification preferences.",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?from=/settings");
  }

  // Fetch track and cohort context for the account section
  let enrollmentsSummary: { id: string; name: string; cohortName?: string | null }[] = [];
  let mentorTracksSummary: { id: string; name: string }[] = [];

  try {
    if (user.role === "STUDENT") {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: user.id, isActive: true },
        include: {
          track: {
            select: {
              id: true,
              name: true,
              cohort: { select: { name: true } },
            },
          },
        },
      });
      enrollmentsSummary = enrollments.map((e) => ({
        id: e.track.id,
        name: e.track.name,
        cohortName: e.track.cohort?.name,
      }));
    } else if (user.role === "MENTOR") {
      const assignments = await prisma.mentorAssignment.findMany({
        where: { mentorId: user.id },
        include: {
          track: { select: { id: true, name: true } },
        },
      });
      mentorTracksSummary = assignments.map((a) => ({
        id: a.track.id,
        name: a.track.name,
      }));
    }
  } catch {
    // Non-blocking fallback
  }

  return (
    <SettingsClient
      user={{
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        avatarPublicId: user.avatarPublicId,
        bio: user.bio,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        notificationPreferences: user.notificationPreferences as any,
      }}
      enrollmentsSummary={enrollmentsSummary}
      mentorTracksSummary={mentorTracksSummary}
    />
  );
}
