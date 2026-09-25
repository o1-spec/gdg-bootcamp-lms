import prisma from "@/lib/prisma";
import { safeUserSelect } from "@/lib/auth";
import { DetailedTrack, Track, TrackCategory, ResourceType } from "@/types/lms";

export async function getAllTracks() {
  try {
    return await prisma.track.findMany({
      include: {
        cohort: {
          select: {
            id: true,
            name: true,
            bootcamp: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  } catch (error) {
    console.error("[Tracks] Error fetching all tracks:", error);
    return [];
  }
}

export async function getTrackBySlug(slug: string) {
  try {
    return await prisma.track.findUnique({
      where: { slug },
      include: {
        cohort: {
          select: {
            id: true,
            name: true,
            bootcamp: true,
          },
        },
        mentorAssignments: {
          include: {
            mentor: {
              select: safeUserSelect,
            },
          },
        },
        modules: {
          orderBy: {
            order: "asc",
          },
          include: {
            lessons: {
              orderBy: {
                order: "asc",
              },
              select: {
                id: true,
                title: true,
                slug: true,
                durationMinutes: true,
                order: true,
                isPublished: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
            modules: true,
            assignments: true,
          },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function getModulesByTrackSlug(slug: string) {
  try {
    const track = await prisma.track.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        modules: {
          orderBy: {
            order: "asc",
          },
          include: {
            lessons: {
              orderBy: {
                order: "asc",
              },
            },
            resources: true,
          },
        },
      },
    });

    return track?.modules ?? null;
  } catch {
    return null;
  }
}

/**
 * Returns DetailedTrack list for only the tracks the student is enrolled in.
 */
export async function getStudentTracks(studentId: string): Promise<DetailedTrack[]> {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: studentId,
        isActive: true,
      },
      include: {
        track: {
          include: {
            cohort: true,
            mentorAssignments: {
              include: {
                mentor: {
                  select: safeUserSelect,
                },
              },
            },
            modules: {
              orderBy: { order: "asc" },
              include: {
                resources: true,
                lessons: {
                  where: { isPublished: true },
                  orderBy: { order: "asc" },
                  include: {
                    progress: {
                      where: { studentId },
                    },
                  },
                },
              },
            },
            assignments: {
              include: {
                submissions: {
                  where: { studentId },
                },
              },
            },
            sessions: {
              where: { startTime: { gte: new Date() } },
              orderBy: { startTime: "asc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!enrollments || enrollments.length === 0) {
      return [];
    }

    return enrollments.map((enr) => {
      const track = enr.track;
      const mentorUser = track.mentorAssignments[0]?.mentor;

      let totalLessons = 0;
      let completedLessons = 0;
      let completedModules = 0;

      const moduleProgressList = track.modules.map((m) => {
        const mLessons = m.lessons;
        const mTotal = mLessons.length;
        const mCompleted = mLessons.filter((l) => l.progress.some((p) => p.completed)).length;

        totalLessons += mTotal;
        completedLessons += mCompleted;

        const isModuleDone = mTotal > 0 && mCompleted === mTotal;
        if (isModuleDone) completedModules += 1;

        const percentage = mTotal > 0 ? Math.round((mCompleted / mTotal) * 100) : 0;

        return {
          moduleOrder: m.order,
          moduleTitle: m.title,
          percentage,
        };
      });

      const overallPercentage =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      const totalAssignments = track.assignments.length;
      const completedAssignments = track.assignments.filter((a) =>
        a.submissions.some((s) => s.status === "SUBMITTED" || s.status === "REVIEWED")
      ).length;

      // Next session formatted string
      const nextSession = track.sessions[0];
      const nextClassStr = nextSession
        ? new Date(nextSession.startTime).toLocaleDateString("en-US", {
            weekday: "long",
            hour: "numeric",
            minute: "numeric",
          })
        : "TBA";

      // Current module title
      const currentMod =
        track.modules.find((m) => {
          const mLessons = m.lessons;
          const mCompleted = mLessons.filter((l) => l.progress.some((p) => p.completed)).length;
          return mCompleted < mLessons.length;
        })?.title || track.modules[0]?.title || "Fundamentals";

      return {
        id: track.id,
        slug: track.slug,
        name: track.name as TrackCategory,
        shortDescription: track.description || "Bootcamp engineering track",
        fullDescription: track.description || "In-depth engineering curriculum",
        accentColor: track.accent || "#4285F4",
        cohort: track.cohort.name,
        duration: "12 Weeks",
        mentor: {
          name: mentorUser ? `${mentorUser.firstName} ${mentorUser.lastName}` : "Lead Track Mentor",
          role: mentorUser ? `${mentorUser.role} • GDG LASU` : "Track Mentor • GDG LASU",
          avatar: mentorUser?.avatarUrl || "",
        },
        currentModule: currentMod,
        nextClass: nextClassStr,
        progress: {
          overallPercentage,
          completedLessons,
          totalLessons,
          completedModules,
          totalModules: track.modules.length,
          completedAssignments,
          totalAssignments,
          attendanceRate: 100,
          moduleProgress: moduleProgressList,
        },
        modules: track.modules.map((m) => {
          const mLessons = m.lessons;
          const mTotal = mLessons.length;
          const mCompleted = mLessons.filter((l) => l.progress.some((p) => p.completed)).length;

          let status: "completed" | "in_progress" | "upcoming" = "upcoming";
          if (mTotal > 0 && mCompleted === mTotal) status = "completed";
          else if (mCompleted > 0) status = "in_progress";

          return {
            id: m.id,
            order: m.order,
            title: m.title,
            description: m.description || "",
            totalLessons: mTotal,
            completedLessons: mCompleted,
            status,
            lessons: mLessons.map((l) => ({
              id: l.id,
              title: l.title,
              durationMinutes: l.durationMinutes || 45,
              status: l.progress.some((p) => p.completed)
                ? ("completed" as const)
                : ("current" as const),
              order: l.order,
            })),
          };
        }),
        resources: track.modules.flatMap((m) => m.resources).map((r) => ({
          id: r.id,
          title: r.title,
          type: r.type.toLowerCase() as ResourceType,
          moduleTitle: currentMod,
          url: r.url,
          isRequired: r.isRequired,
        })),
        assignments: track.assignments.map((a) => {
          const sub = a.submissions[0];
          let status: "in_progress" | "not_started" | "submitted" = "not_started";
          if (sub?.status === "SUBMITTED" || sub?.status === "REVIEWED") status = "submitted";
          else if (sub?.status === "DRAFT") status = "in_progress";

          return {
            id: a.id,
            title: a.title,
            moduleTitle: currentMod,
            dueDate: a.dueDate ? a.dueDate.toISOString().split("T")[0] : "In 2 weeks",
            status,
            points: a.points || 100,
            description: a.description,
          };
        }),
      };
    });
  } catch (error) {
    console.error("[Tracks] Error fetching student tracks:", error);
    return [];
  }
}

/**
 * Returns single DetailedTrack by slug for the authenticated student.
 */
export async function getStudentTrackBySlug(
  slug: string,
  studentId: string
): Promise<DetailedTrack | null> {
  const tracks = await getStudentTracks(studentId);
  return tracks.find((t) => t.slug === slug) || null;
}

/**
 * Returns enrolled track summary array formatted for sidebar & dashboard cards.
 */
export async function getStudentEnrolledTracksSummary(studentId: string): Promise<Track[]> {
  try {
    const detailedTracks = await getStudentTracks(studentId);
    return detailedTracks.map((dt) => {
      // Find first incomplete lesson
      let nextLesson: { id: string; title: string; durationMinutes: number } | undefined = undefined;

      for (const m of dt.modules) {
        const nextL = m.lessons.find((l) => l.status !== "completed");
        if (nextL) {
          nextLesson = {
            id: nextL.id,
            title: nextL.title,
            durationMinutes: nextL.durationMinutes,
          };
          break;
        }
      }
      if (!nextLesson && dt.modules[0]?.lessons[0]) {
        const firstL = dt.modules[0].lessons[0];
        nextLesson = {
          id: firstL.id,
          title: firstL.title,
          durationMinutes: firstL.durationMinutes,
        };
      }

      return {
        id: dt.id,
        name: dt.name,
        slug: dt.slug,
        description: dt.shortDescription,
        cohort: dt.cohort,
        instructors: [
          {
            name: dt.mentor.name,
            avatar: dt.mentor.avatar,
            title: dt.mentor.role,
          },
        ],
        progressPercentage: dt.progress.overallPercentage,
        completedLessons: dt.progress.completedLessons,
        totalLessons: dt.progress.totalLessons,
        currentModule: dt.currentModule,
        nextLesson,
        colorTheme: {
          badge: `bg-[${dt.accentColor}]/10 text-[${dt.accentColor}] border-[${dt.accentColor}]/30`,
          border: `border-[${dt.accentColor}]`,
          accent: dt.accentColor,
        },
      };
    });
  } catch (error) {
    console.error("[Tracks] Error fetching student enrolled tracks summary:", error);
    return [];
  }
}
