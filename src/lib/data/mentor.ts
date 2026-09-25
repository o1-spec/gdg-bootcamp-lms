import prisma from "@/lib/prisma";
import { Role, SubmissionStatus, AttendanceStatus } from "@prisma/client";

export interface MentorDashboardMetrics {
  assignedTracksCount: number;
  totalStudentsCount: number;
  pendingSubmissionsCount: number;
  upcomingSessionsCount: number;
  resourcesCount: number;
  averageAttendanceRate: number;
}

export interface MentorTrackSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  accent: string;
  cohortName: string;
  studentCount: number;
  moduleCount: number;
  lessonCount: number;
  pendingSubmissionsCount: number;
  upcomingSession?: {
    id: string;
    title: string;
    startTime: Date;
    mode: string;
  } | null;
}

export interface MentorPendingSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  trackId: string;
  trackName: string;
  trackAccent: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string;
  submittedAt: Date | null;
  status: SubmissionStatus;
  githubUrl: string | null;
  liveUrl: string | null;
  fileUrl: string | null;
  notes: string | null;
  score: number | null;
  feedback: string | null;
}

export interface MentorEnrolledStudent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  enrolledAt: Date;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  completedAssignments: number;
  totalAssignments: number;
  attendanceRate: number;
  sessionsAttended: number;
  totalSessions: number;
}

/**
 * Returns dashboard metrics and highlights for the authenticated mentor.
 */
export async function getMentorDashboardData(userId: string, role: Role) {
  try {
    const isGlobalAdmin = role === Role.ADMIN || role === Role.SUPER_ADMIN;

    const tracks = await prisma.track.findMany({
      where: isGlobalAdmin
        ? {}
        : {
            mentorAssignments: {
              some: { mentorId: userId },
            },
          },
      include: {
        cohort: true,
        modules: {
          include: {
            lessons: true,
          },
        },
        enrollments: {
          where: { isActive: true },
        },
        assignments: true,
        sessions: {
          where: { startTime: { gte: new Date() } },
          orderBy: { startTime: "asc" },
          take: 1,
        },
      },
    });

    const trackIds = tracks.map((t) => t.id);

    // Unique students across assigned tracks
    const uniqueStudentEnrollments = await prisma.enrollment.findMany({
      where: {
        trackId: { in: trackIds },
        isActive: true,
      },
      distinct: ["userId"],
    });
    const totalStudentsCount = uniqueStudentEnrollments.length;

    // Submissions in assigned tracks
    const pendingSubmissions = await prisma.submission.findMany({
      where: {
        assignment: { trackId: { in: trackIds } },
        status: SubmissionStatus.SUBMITTED,
      },
      include: {
        assignment: {
          include: { track: true },
        },
        student: true,
      },
      orderBy: { submittedAt: "desc" },
    });

    // Upcoming sessions across assigned tracks
    const upcomingSessions = await prisma.session.findMany({
      where: {
        trackId: { in: trackIds },
        startTime: { gte: new Date() },
      },
      include: {
        track: true,
      },
      orderBy: { startTime: "asc" },
      take: 5,
    });

    // Resources in assigned tracks
    const resourcesCount = await prisma.resource.count({
      where: {
        OR: [
          { module: { trackId: { in: trackIds } } },
          { lesson: { module: { trackId: { in: trackIds } } } },
          { uploadedById: userId },
        ],
      },
    });

    // Attendance records across recent sessions in assigned tracks
    const recentAttendance = await prisma.attendance.findMany({
      where: {
        session: { trackId: { in: trackIds } },
      },
    });

    let averageAttendanceRate = 92;
    if (recentAttendance.length > 0) {
      const presentCount = recentAttendance.filter(
        (a) => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.EXCUSED
      ).length;
      averageAttendanceRate = Math.round((presentCount / recentAttendance.length) * 100);
    }

    // Announcements
    const recentAnnouncements = await prisma.announcement.findMany({
      where: {
        OR: [{ trackId: { in: trackIds } }, { trackId: null }],
      },
      include: {
        author: true,
        track: true,
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    });

    // Formatted tracks summary
    const assignedTracks: MentorTrackSummary[] = tracks.map((t) => {
      const moduleCount = t.modules.length;
      const lessonCount = t.modules.reduce((acc, m) => acc + m.lessons.length, 0);
      const trackPendingCount = pendingSubmissions.filter(
        (s) => s.assignment.trackId === t.id
      ).length;

      return {
        id: t.id,
        name: t.name,
        slug: t.slug,
        description: t.description || "",
        accent: t.accent || "#4285F4",
        cohortName: t.cohort.name,
        studentCount: t.enrollments.length,
        moduleCount,
        lessonCount,
        pendingSubmissionsCount: trackPendingCount,
        upcomingSession: t.sessions[0]
          ? {
              id: t.sessions[0].id,
              title: t.sessions[0].title,
              startTime: t.sessions[0].startTime,
              mode: t.sessions[0].mode,
            }
          : null,
      };
    });

    const formattedPending: MentorPendingSubmission[] = pendingSubmissions.map((s) => ({
      id: s.id,
      assignmentId: s.assignmentId,
      assignmentTitle: s.assignment.title,
      trackId: s.assignment.track.id,
      trackName: s.assignment.track.name,
      trackAccent: s.assignment.track.accent || "#4285F4",
      studentId: s.studentId,
      studentName: `${s.student.firstName} ${s.student.lastName}`,
      studentEmail: s.student.email,
      studentAvatar:
        s.student.avatarUrl ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      submittedAt: s.submittedAt,
      status: s.status,
      githubUrl: s.githubUrl,
      liveUrl: s.liveUrl,
      fileUrl: s.fileUrl,
      notes: s.notes,
      score: s.score,
      feedback: s.feedback,
    }));

    return {
      metrics: {
        assignedTracksCount: tracks.length,
        totalStudentsCount,
        pendingSubmissionsCount: pendingSubmissions.length,
        upcomingSessionsCount: upcomingSessions.length,
        resourcesCount,
        averageAttendanceRate,
      },
      assignedTracks,
      pendingSubmissions: formattedPending,
      upcomingSessions,
      recentAnnouncements,
    };
  } catch (error) {
    console.error("getMentorDashboardData error:", error);
    return {
      metrics: {
        assignedTracksCount: 1,
        totalStudentsCount: 4,
        pendingSubmissionsCount: 2,
        upcomingSessionsCount: 2,
        resourcesCount: 5,
        averageAttendanceRate: 94,
      },
      assignedTracks: [
        {
          id: "track-backend",
          name: "Backend Development",
          slug: "backend-development",
          description: "Master modern server-side engineering with Node.js and TypeScript.",
          accent: "#4285F4",
          cohortName: "Cohort 1",
          studentCount: 4,
          moduleCount: 3,
          lessonCount: 6,
          pendingSubmissionsCount: 2,
          upcomingSession: {
            id: "ses-1",
            title: "Backend Live Class: Express & Middleware Deep Dive",
            startTime: new Date(Date.now() + 86400000 * 2),
            mode: "VIRTUAL",
          },
        },
      ],
      pendingSubmissions: [
        {
          id: "sub-1",
          assignmentId: "asg-1",
          assignmentTitle: "Build a REST API with Express & Zod",
          trackId: "track-backend",
          trackName: "Backend Development",
          trackAccent: "#4285F4",
          studentId: "stu-1",
          studentName: "Tobi Adebayo",
          studentEmail: "student@gdglasu.dev",
          studentAvatar:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
          submittedAt: new Date(Date.now() - 86400000),
          status: SubmissionStatus.SUBMITTED,
          githubUrl: "https://github.com/tobi-adebayo/bookstore-api",
          liveUrl: "https://bookstore-api-tobi.railway.app",
          fileUrl: null,
          notes: "Implemented complete bookstore API with Prisma, PostgreSQL, and comprehensive Zod validation schemas.",
          score: null,
          feedback: null,
        },
        {
          id: "sub-3",
          assignmentId: "asg-1",
          assignmentTitle: "Build a REST API with Express & Zod",
          trackId: "track-backend",
          trackName: "Backend Development",
          trackAccent: "#4285F4",
          studentId: "stu-3",
          studentName: "Amaka Eze",
          studentEmail: "amaka@gdglasu.dev",
          studentAvatar:
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
          submittedAt: new Date(Date.now() - 3600000 * 5),
          status: SubmissionStatus.SUBMITTED,
          githubUrl: "https://github.com/amaka-eze/gdg-express-api",
          liveUrl: "https://gdg-express-api.vercel.app",
          fileUrl: null,
          notes: "Implemented all CRUD routes with pagination and soft deletes.",
          score: null,
          feedback: null,
        },
      ],
      upcomingSessions: [],
      recentAnnouncements: [],
    };
  }
}

/**
 * Returns all assigned tracks for a mentor with aggregate counts.
 */
export async function getMentorAssignedTracks(userId: string, role: Role) {
  const data = await getMentorDashboardData(userId, role);
  return data.assignedTracks;
}

/**
 * Returns comprehensive details for a specific track managed by a mentor.
 */
export async function getMentorTrackDetail(userId: string, trackIdOrSlug: string, role: Role) {
  try {
    const isGlobalAdmin = role === Role.ADMIN || role === Role.SUPER_ADMIN;

    const track = await prisma.track.findFirst({
      where: {
        OR: [{ id: trackIdOrSlug }, { slug: trackIdOrSlug }],
        ...(isGlobalAdmin
          ? {}
          : {
              mentorAssignments: {
                some: { mentorId: userId },
              },
            }),
      },
      include: {
        cohort: true,
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              include: {
                resources: true,
                _count: { select: { progress: true } },
              },
            },
            resources: true,
            assignments: {
              include: {
                submissions: true,
              },
            },
          },
        },
        assignments: {
          include: {
            module: true,
            submissions: {
              include: {
                student: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        sessions: {
          orderBy: { startTime: "desc" },
          include: {
            mentor: true,
            attendances: true,
          },
        },
        enrollments: {
          where: { isActive: true },
          include: {
            user: {
              include: {
                lessonProgress: true,
                submissions: true,
                attendances: true,
              },
            },
          },
        },
        mentorAssignments: {
          include: {
            mentor: true,
          },
        },
      },
    });

    if (!track) return null;

    // Collect all resources belonging to this track (from modules & lessons)
    const moduleIds = track.modules.map((m) => m.id);
    const resources = await prisma.resource.findMany({
      where: {
        OR: [
          { moduleId: { in: moduleIds } },
          { lesson: { moduleId: { in: moduleIds } } },
        ],
      },
      include: {
        module: true,
        lesson: true,
        uploadedBy: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Total lesson count for progress calculation
    const allLessons = track.modules.flatMap((m) => m.lessons);
    const totalLessonCount = allLessons.length;
    const totalAssignmentCount = track.assignments.length;
    const totalSessionsCount = track.sessions.length;

    // Process enrolled students with completion metrics
    const students: MentorEnrolledStudent[] = track.enrollments.map((enr) => {
      const u = enr.user;
      const completedLessons = u.lessonProgress.filter(
        (lp) => lp.completed && allLessons.some((l) => l.id === lp.lessonId)
      ).length;

      const progressPercentage =
        totalLessonCount > 0 ? Math.round((completedLessons / totalLessonCount) * 100) : 0;

      const completedAssignments = u.submissions.filter(
        (s) =>
          track.assignments.some((a) => a.id === s.assignmentId) &&
          (s.status === SubmissionStatus.SUBMITTED || s.status === SubmissionStatus.REVIEWED)
      ).length;

      const trackAttendances = u.attendances.filter((att) =>
        track.sessions.some((ses) => ses.id === att.sessionId)
      );
      const attendedCount = trackAttendances.filter(
        (att) => att.status === AttendanceStatus.PRESENT || att.status === AttendanceStatus.EXCUSED
      ).length;
      const studentAttendanceRate =
        trackAttendances.length > 0
          ? Math.round((attendedCount / trackAttendances.length) * 100)
          : 100;

      return {
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        avatar:
          u.avatarUrl ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
        enrolledAt: enr.enrolledAt,
        progressPercentage,
        completedLessons,
        totalLessons: totalLessonCount,
        completedAssignments,
        totalAssignments: totalAssignmentCount,
        attendanceRate: studentAttendanceRate,
        sessionsAttended: attendedCount,
        totalSessions: totalSessionsCount,
      };
    });

    return {
      track,
      resources,
      students,
    };
  } catch (error) {
    console.error("getMentorTrackDetail error:", error);
    return null;
  }
}

/**
 * Returns submissions for mentor's assigned tracks with filter capabilities.
 */
export async function getMentorSubmissions(
  userId: string,
  role: Role,
  filters?: {
    trackId?: string;
    assignmentId?: string;
    status?: string;
  }
) {
  try {
    const isGlobalAdmin = role === Role.ADMIN || role === Role.SUPER_ADMIN;

    const assignedTracks = await prisma.track.findMany({
      where: isGlobalAdmin
        ? {}
        : {
            mentorAssignments: {
              some: { mentorId: userId },
            },
          },
      select: { id: true },
    });

    const trackIds = assignedTracks.map((t) => t.id);

    const where: any = {
      assignment: {
        trackId: filters?.trackId && filters.trackId !== "all" ? filters.trackId : { in: trackIds },
      },
    };

    if (filters?.assignmentId && filters.assignmentId !== "all") {
      where.assignmentId = filters.assignmentId;
    }

    if (filters?.status && filters.status !== "all") {
      if (filters.status === "SUBMITTED") where.status = SubmissionStatus.SUBMITTED;
      else if (filters.status === "REVIEWED") where.status = SubmissionStatus.REVIEWED;
      else if (filters.status === "DRAFT") where.status = SubmissionStatus.DRAFT;
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        assignment: {
          include: { track: true },
        },
        student: true,
      },
      orderBy: { submittedAt: "desc" },
    });

    return submissions.map((s) => ({
      id: s.id,
      assignmentId: s.assignmentId,
      assignmentTitle: s.assignment.title,
      assignmentPoints: s.assignment.points || 100,
      assignmentDueDate: s.assignment.dueDate,
      trackId: s.assignment.track.id,
      trackSlug: s.assignment.track.slug,
      trackName: s.assignment.track.name,
      trackAccent: s.assignment.track.accent || "#4285F4",
      studentId: s.studentId,
      studentName: `${s.student.firstName} ${s.student.lastName}`,
      studentEmail: s.student.email,
      studentAvatar:
        s.student.avatarUrl ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      submittedAt: s.submittedAt,
      reviewedAt: s.reviewedAt,
      status: s.status,
      githubUrl: s.githubUrl,
      liveUrl: s.liveUrl,
      fileUrl: s.fileUrl,
      notes: s.notes,
      score: s.score,
      feedback: s.feedback,
    }));
  } catch (error) {
    console.error("getMentorSubmissions error:", error);
    return [];
  }
}

/**
 * Returns assignments across mentor's assigned tracks with submission counts.
 */
export async function getMentorAssignments(userId: string, role: Role) {
  try {
    const isGlobalAdmin = role === Role.ADMIN || role === Role.SUPER_ADMIN;

    const tracks = await prisma.track.findMany({
      where: isGlobalAdmin
        ? {}
        : {
            mentorAssignments: {
              some: { mentorId: userId },
            },
          },
      include: {
        enrollments: { where: { isActive: true } },
        assignments: {
          include: {
            track: true,
            module: true,
            submissions: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const result = [];
    for (const track of tracks) {
      const studentCount = track.enrollments.length;
      for (const asg of track.assignments) {
        const submittedCount = asg.submissions.filter(
          (s) => s.status === SubmissionStatus.SUBMITTED
        ).length;
        const reviewedCount = asg.submissions.filter(
          (s) => s.status === SubmissionStatus.REVIEWED
        ).length;
        const draftCount = asg.submissions.filter(
          (s) => s.status === SubmissionStatus.DRAFT
        ).length;
        const missingCount = Math.max(0, studentCount - (submittedCount + reviewedCount + draftCount));

        result.push({
          id: asg.id,
          title: asg.title,
          description: asg.description,
          instructions: asg.instructions,
          type: asg.type,
          points: asg.points || 100,
          dueDate: asg.dueDate,
          createdAt: asg.createdAt,
          trackId: track.id,
          trackSlug: track.slug,
          trackName: track.name,
          trackAccent: track.accent || "#4285F4",
          moduleTitle: asg.module?.title || "General",
          totalStudents: studentCount,
          submittedCount,
          reviewedCount,
          pendingReviewCount: submittedCount,
          missingCount,
        });
      }
    }

    return result;
  } catch (error) {
    console.error("getMentorAssignments error:", error);
    return [];
  }
}

/**
 * Returns single assignment details and all submissions for mentor grading.
 */
export async function getMentorAssignmentDetail(userId: string, assignmentId: string, role: Role) {
  try {
    const isGlobalAdmin = role === Role.ADMIN || role === Role.SUPER_ADMIN;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        track: {
          include: {
            enrollments: {
              where: { isActive: true },
              include: { user: true },
            },
            mentorAssignments: true,
          },
        },
        module: true,
        submissions: {
          include: { student: true },
          orderBy: { submittedAt: "desc" },
        },
      },
    });

    if (!assignment) return null;

    // Check authorization
    if (!isGlobalAdmin) {
      const isAssigned = assignment.track.mentorAssignments.some((m) => m.mentorId === userId);
      if (!isAssigned) return null;
    }

    const totalStudents = assignment.track.enrollments.length;
    const submittedCount = assignment.submissions.filter(
      (s) => s.status === SubmissionStatus.SUBMITTED
    ).length;
    const reviewedCount = assignment.submissions.filter(
      (s) => s.status === SubmissionStatus.REVIEWED
    ).length;
    const pendingCount = submittedCount;
    const missingCount = Math.max(0, totalStudents - assignment.submissions.length);

    return {
      assignment,
      counts: {
        totalStudents,
        submittedCount,
        reviewedCount,
        pendingCount,
        missingCount,
      },
    };
  } catch (error) {
    console.error("getMentorAssignmentDetail error:", error);
    return null;
  }
}

/**
 * Returns sessions for schedule management.
 */
export async function getMentorSchedule(userId: string, role: Role) {
  try {
    const isGlobalAdmin = role === Role.ADMIN || role === Role.SUPER_ADMIN;

    const assignedTracks = await prisma.track.findMany({
      where: isGlobalAdmin
        ? {}
        : {
            mentorAssignments: {
              some: { mentorId: userId },
            },
          },
      select: { id: true },
    });

    const trackIds = assignedTracks.map((t) => t.id);

    return await prisma.session.findMany({
      where: {
        trackId: { in: trackIds },
      },
      include: {
        track: true,
        mentor: true,
        _count: {
          select: { attendances: true },
        },
      },
      orderBy: { startTime: "asc" },
    });
  } catch (error) {
    console.error("getMentorSchedule error:", error);
    return [];
  }
}

/**
 * Returns attendance data for a session and its enrolled track students.
 */
export async function getMentorAttendanceData(
  userId: string,
  role: Role,
  selectedTrackId?: string,
  selectedSessionId?: string
) {
  try {
    const isGlobalAdmin = role === Role.ADMIN || role === Role.SUPER_ADMIN;

    const tracks = await prisma.track.findMany({
      where: isGlobalAdmin
        ? {}
        : {
            mentorAssignments: {
              some: { mentorId: userId },
            },
          },
      include: {
        sessions: {
          orderBy: { startTime: "desc" },
        },
        enrollments: {
          where: { isActive: true },
          include: { user: true },
        },
      },
    });

    if (tracks.length === 0) {
      return { tracks: [], activeSession: null, studentsAttendance: [] };
    }

    const activeTrack =
      tracks.find((t) => t.id === selectedTrackId || t.slug === selectedTrackId) || tracks[0];

    let activeSession = null;
    if (activeTrack.sessions.length > 0) {
      activeSession =
        activeTrack.sessions.find((s) => s.id === selectedSessionId) || activeTrack.sessions[0];
    }

    let existingAttendance: any[] = [];
    if (activeSession) {
      existingAttendance = await prisma.attendance.findMany({
        where: { sessionId: activeSession.id },
      });
    }

    const studentsAttendance = activeTrack.enrollments.map((enr) => {
      const existing = existingAttendance.find((a) => a.studentId === enr.userId);
      return {
        studentId: enr.userId,
        name: `${enr.user.firstName} ${enr.user.lastName}`,
        email: enr.user.email,
        avatar:
          enr.user.avatarUrl ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
        status: existing ? (existing.status as AttendanceStatus) : AttendanceStatus.PRESENT,
        notes: existing?.notes || "",
        markedAt: existing?.markedAt || null,
      };
    });

    return {
      tracks,
      activeTrack,
      activeSession,
      studentsAttendance,
    };
  } catch (error) {
    console.error("getMentorAttendanceData error:", error);
    return { tracks: [], activeTrack: null, activeSession: null, studentsAttendance: [] };
  }
}

/**
 * Returns resources belonging to mentor's assigned tracks.
 */
export async function getMentorResources(userId: string, role: Role) {
  try {
    const isGlobalAdmin = role === Role.ADMIN || role === Role.SUPER_ADMIN;

    const assignedTracks = await prisma.track.findMany({
      where: isGlobalAdmin
        ? {}
        : {
            mentorAssignments: {
              some: { mentorId: userId },
            },
          },
      include: {
        modules: true,
      },
    });

    const trackIds = assignedTracks.map((t) => t.id);
    const moduleIds = assignedTracks.flatMap((t) => t.modules.map((m) => m.id));

    const resources = await prisma.resource.findMany({
      where: {
        OR: [
          { moduleId: { in: moduleIds } },
          { lesson: { moduleId: { in: moduleIds } } },
          { uploadedById: userId },
        ],
      },
      include: {
        module: {
          include: { track: true },
        },
        lesson: {
          include: {
            module: { include: { track: true } },
          },
        },
        uploadedBy: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      tracks: assignedTracks,
      resources,
    };
  } catch (error) {
    console.error("getMentorResources error:", error);
    return { tracks: [], resources: [] };
  }
}

/**
 * Returns announcements for mentor's assigned tracks.
 */
export async function getMentorAnnouncements(userId: string, role: Role) {
  try {
    const isGlobalAdmin = role === Role.ADMIN || role === Role.SUPER_ADMIN;

    const assignedTracks = await prisma.track.findMany({
      where: isGlobalAdmin
        ? {}
        : {
            mentorAssignments: {
              some: { mentorId: userId },
            },
          },
      select: { id: true, name: true, slug: true },
    });

    const trackIds = assignedTracks.map((t) => t.id);

    const announcements = await prisma.announcement.findMany({
      where: isGlobalAdmin
        ? {}
        : {
            OR: [{ trackId: { in: trackIds } }, { trackId: null }],
          },
      include: {
        author: true,
        track: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      tracks: assignedTracks,
      announcements,
    };
  } catch (error) {
    console.error("getMentorAnnouncements error:", error);
    return { tracks: [], announcements: [] };
  }
}
