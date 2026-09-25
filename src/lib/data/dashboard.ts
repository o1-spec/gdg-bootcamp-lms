import {
  StudentProfile,
  DashboardStats,
  Track,
  UpcomingClass,
  Assignment,
  Resource,
  Announcement,
  TrackCategory,
} from "@/types/lms";
import { SafeUser, buildStudentProfile } from "@/lib/auth";
import { getStudentEnrolledTracksSummary } from "./tracks";
import { getStudentAssignments } from "./assignments";
import { getStudentSchedule } from "./schedule";
import { getStudentResources } from "./resources";
import { getStudentAnnouncements } from "./announcements";
import { getStudentProgress } from "./progress";

export interface StudentDashboardData {
  student: StudentProfile;
  enrolledTracks: Track[];
  stats: DashboardStats;
  upcomingClasses: UpcomingClass[];
  assignments: Assignment[];
  resources: Resource[];
  announcements: Announcement[];
}

export async function getStudentDashboardData(user: SafeUser): Promise<StudentDashboardData> {
  try {
    const [enrolledTracks, progressData, assignmentsData, scheduleData, resourcesData, announcementsData] =
      await Promise.all([
        getStudentEnrolledTracksSummary(user.id),
        getStudentProgress(user.id),
        getStudentAssignments(user.id),
        getStudentSchedule(user.id),
        getStudentResources(user.id),
        getStudentAnnouncements(user.id),
      ]);

    const cohortTitle = enrolledTracks[0]?.name ? `${enrolledTracks[0].name} Cohort` : undefined;
    const student: StudentProfile = buildStudentProfile(user, enrolledTracks.length, {
      cohort: cohortTitle,
      studyStreakDays: 0,
      totalHoursSpent: Math.round(progressData.completedLessons * 1.5),
    });

    const pendingAssignmentsCount = assignmentsData.filter(
      (a) => a.status === "in_progress" || a.status === "not_started" || a.status === "overdue"
    ).length;

    const stats: DashboardStats = {
      enrolledTracks: enrolledTracks.length,
      completedLessons: progressData.completedLessons,
      totalLessons: progressData.totalLessons,
      pendingAssignments: pendingAssignmentsCount,
      overallProgressPercentage: progressData.overallPercentage,
      attendanceRate: progressData.attendanceRate,
    };

    const upcomingClasses: UpcomingClass[] = scheduleData
      .filter((s) => !s.isPast)
      .slice(0, 3)
      .map((s) => ({
        id: s.id,
        title: s.title,
        trackName: s.trackName,
        instructor: {
          name: s.mentor.name,
          role: s.mentor.role,
          avatar: s.mentor.avatar || "",
        },
        dateTime: `${s.dayOfWeek}, ${s.timeRange}`,
        duration: "120 mins",
        isLiveNow: s.isLiveNow,
        meetUrl: s.meetUrl || "",
        attendeesCount: 0,
      }));

    const dashboardAssignments: Assignment[] = assignmentsData.slice(0, 4).map((a) => {
      let uiStatus: "pending" | "due_soon" | "submitted" | "graded" = "pending";
      if (a.status === "submitted") uiStatus = "submitted";
      else if (a.status === "reviewed") uiStatus = "graded";
      else if (a.daysRemaining <= 2) uiStatus = "due_soon";

      return {
        id: a.id,
        title: a.title,
        trackId: a.trackId,
        trackName: a.trackName,
        dueDate: a.dueDate,
        dueTime: a.dueTime || "11:59 PM",
        daysRemaining: a.daysRemaining,
        points: a.points,
        status: uiStatus,
        grade: a.submission.score,
      };
    });

    const dashboardResources: Resource[] = resourcesData.slice(0, 4).map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      trackId: r.trackId,
      trackName: r.trackName,
      moduleName: r.moduleName,
      url: r.url,
      fileSize: r.fileSize,
      duration: r.duration,
      addedAt: r.addedAt,
      description: r.description,
    }));

    const dashboardAnnouncements: Announcement[] = announcementsData.slice(0, 3).map((a) => ({
      id: a.id,
      title: a.title,
      author: {
        name: a.author.name,
        role: a.author.role,
        avatar: a.author.avatar || "",
      },
      publishedAt: a.postedDate,
      trackName: (a.trackName as TrackCategory | "All Cohort") || "All Cohort",
      content: a.content,
      isPinned: a.isPinned,
      category: a.priority === "URGENT" || a.priority === "IMPORTANT" ? "Reminder" : "Curriculum",
    }));

    return {
      student,
      enrolledTracks,
      stats,
      upcomingClasses,
      assignments: dashboardAssignments,
      resources: dashboardResources,
      announcements: dashboardAnnouncements,
    };
  } catch (error) {
    console.error("[Dashboard] Error fetching student dashboard data:", error);
    return {
      student: buildStudentProfile(user, 0),
      enrolledTracks: [],
      stats: {
        enrolledTracks: 0,
        completedLessons: 0,
        totalLessons: 0,
        pendingAssignments: 0,
        overallProgressPercentage: 0,
        attendanceRate: 100,
      },
      upcomingClasses: [],
      assignments: [],
      resources: [],
      announcements: [],
    };
  }
}
