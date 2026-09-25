import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { StudentProfileClient } from "@/components/profile/StudentProfileClient";

export const metadata = {
  title: "My Profile | GDG LASU Bootcamp LMS",
  description: "View and edit your student profile, bio, and social profiles.",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?from=/profile");
  }

  // Fetch enrolled tracks for this user
  let enrolledTracks: {
    id: string;
    name: string;
    slug: string;
    accent?: string | null;
    cohortName?: string | null;
  }[] = [];

  try {
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
          },
        },
      },
    });

    enrolledTracks = enrollments.map((e) => ({
      id: e.track.id,
      name: e.track.name,
      slug: e.track.slug,
      accent: e.track.accent,
      cohortName: e.track.cohort?.name,
    }));
  } catch {
    // Offline dev fallback
    enrolledTracks = [
      {
        id: "track-frontend",
        name: "Frontend Development",
        slug: "frontend-development",
        accent: "#34A853",
        cohortName: "Cohort 1 (Alpha)",
      },
    ];
  }

  return (
    <StudentProfileClient
      initialUser={{
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
        createdAt: user.createdAt?.toISOString(),
      }}
      enrolledTracks={enrolledTracks}
    />
  );
}
