import prisma from "@/lib/prisma";
import { OverallBootcampProgress, TrackCategory } from "@/types/lms";
import { mockOverallProgress } from "@/data/progress";
import { getStudentAttendance } from "./attendance";

export async function getStudentProgress(studentId: string): Promise<OverallBootcampProgress> {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: studentId,
        isActive: true,
      },
      include: {
        track: {
          include: {
            modules: {
              orderBy: { order: "asc" },
              include: {
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
          },
        },
      },
    });

    if (!enrollments || enrollments.length === 0) {
      return mockOverallProgress;
    }

    const { summary: attendanceSummary } = await getStudentAttendance(studentId);

    let totalLessonsAll = 0;
    let completedLessonsAll = 0;
    let totalModulesAll = 0;
    let completedModulesAll = 0;
    let totalAssignmentsAll = 0;
    let completedAssignmentsAll = 0;

    const trackSummaries = enrollments.map((enr) => {
      const track = enr.track;
      let tTotalLessons = 0;
      let tCompletedLessons = 0;
      let tCompletedModules = 0;

      let nextLessonHref = `/tracks/${track.slug}`;
      let foundNext = false;

      const modules = track.modules.map((m) => {
        const mLessons = m.lessons;
        const mTotal = mLessons.length;
        const mCompleted = mLessons.filter((l) => l.progress.some((p) => p.completed)).length;

        tTotalLessons += mTotal;
        tCompletedLessons += mCompleted;

        const isModuleDone = mTotal > 0 && mCompleted === mTotal;
        if (isModuleDone) tCompletedModules += 1;

        if (!foundNext) {
          const nextL = mLessons.find((l) => !l.progress.some((p) => p.completed));
          if (nextL) {
            nextLessonHref = `/tracks/${track.slug}/lessons/${nextL.slug}`;
            foundNext = true;
          }
        }

        const percentage = mTotal > 0 ? Math.round((mCompleted / mTotal) * 100) : 0;
        let status: "completed" | "in_progress" | "upcoming" = "upcoming";
        if (isModuleDone) status = "completed";
        else if (mCompleted > 0) status = "in_progress";

        return {
          id: m.id,
          moduleOrder: m.order,
          title: m.title,
          percentage,
          completedLessons: mCompleted,
          totalLessons: mTotal,
          status,
        };
      });

      totalLessonsAll += tTotalLessons;
      completedLessonsAll += tCompletedLessons;
      totalModulesAll += track.modules.length;
      completedModulesAll += tCompletedModules;

      const tTotalAssignments = track.assignments.length;
      const tCompletedAssignments = track.assignments.filter((a) =>
        a.submissions.some((s) => s.status === "SUBMITTED" || s.status === "REVIEWED")
      ).length;

      totalAssignmentsAll += tTotalAssignments;
      completedAssignmentsAll += tCompletedAssignments;

      const trackPercentage =
        tTotalLessons > 0 ? Math.round((tCompletedLessons / tTotalLessons) * 100) : 0;

      return {
        trackId: track.slug,
        trackName: track.name as TrackCategory,
        trackAccentColor: track.accent || "#4285F4",
        overallPercentage: trackPercentage,
        completedLessons: tCompletedLessons,
        totalLessons: tTotalLessons,
        completedModules: tCompletedModules,
        totalModules: track.modules.length,
        completedAssignments: tCompletedAssignments,
        totalAssignments: tTotalAssignments,
        nextLessonHref,
        modules,
      };
    });

    const overallPercentage =
      totalLessonsAll > 0 ? Math.round((completedLessonsAll / totalLessonsAll) * 100) : 0;

    return {
      overallPercentage,
      tracksEnrolled: enrollments.length,
      completedLessons: completedLessonsAll,
      totalLessons: totalLessonsAll,
      completedModules: completedModulesAll,
      totalModules: totalModulesAll,
      completedAssignments: completedAssignmentsAll,
      totalAssignments: totalAssignmentsAll,
      attendanceRate: attendanceSummary.attendanceRate,
      weeklyActivity: {
        lessonsCompletedThisWeek: 4,
        assignmentsSubmittedThisWeek: 1,
        sessionsAttendedThisWeek: 2,
        hoursSpentThisWeek: 12,
      },
      attendanceSummary,
      trackSummaries,
    };
  } catch {
    return mockOverallProgress;
  }
}
