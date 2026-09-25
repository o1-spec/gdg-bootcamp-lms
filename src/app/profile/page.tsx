import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  ProfileOverviewClient,
  StudentTrackSummary,
  MentorTrackSummary,
} from "@/components/profile/ProfileOverviewClient";

export const metadata = {
  title: "My Profile — GDG LASU Bootcamp",
  description: "View your verified GDG LASU community profile, track progress, and bios.",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?from=/profile");
  }

  let studentTracks: StudentTrackSummary[] = [];
  let mentorTracks: MentorTrackSummary[] = [];

  try {
    if (user.role === "STUDENT") {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: user.id, isActive: true },
        include: {
          track: {
            select: {
              id: true,
              name: true,
              slug: true,
              accent: true,
              cohort: { select: { name: true } },
              modules: {
                select: {
                  lessons: { select: { id: true } },
                },
              },
            },
          },
        },
      });

      // Fetch completed lessons count for student
      const completedProgress = await prisma.lessonProgress.findMany({
        where: { studentId: user.id, completed: true },
        select: { lessonId: true },
      });
      const completedSet = new Set(completedProgress.map((p) => p.lessonId));

      studentTracks = enrollments.map((e) => {
        const allLessonIds = e.track.modules.flatMap((m) => m.lessons.map((l) => l.id));
        const completedCount = allLessonIds.filter((id) => completedSet.has(id)).length;
        return {
          id: e.track.id,
          name: e.track.name,
          slug: e.track.slug,
          accent: e.track.accent,
          cohortName: e.track.cohort?.name,
          completedLessons: completedCount,
          totalLessons: allLessonIds.length,
        };
      });
    } else if (user.role === "MENTOR") {
      const assignments = await prisma.mentorAssignment.findMany({
        where: { mentorId: user.id },
        include: {
          track: { select: { id: true, name: true, slug: true, accent: true } },
        },
      });
      mentorTracks = assignments.map((a) => ({
        id: a.track.id,
        name: a.track.name,
        slug: a.track.slug,
        accent: a.track.accent,
      }));
    }
  } catch {
    // Non-blocking fallback
  }

  return (
    <ProfileOverviewClient
      user={{
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        createdAt: user.createdAt.toISOString(),
      }}
      studentTracks={studentTracks}
      mentorTracks={mentorTracks}
    />
  );
}
