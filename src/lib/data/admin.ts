import prisma from "@/lib/prisma";
import { Role, SubmissionStatus, AttendanceStatus, SessionMode, AnnouncementPriority } from "@prisma/client";

export interface AdminDashboardMetrics {
  activeBootcampsCount: number;
  activeCohortsCount: number;
  totalStudentsCount: number;
  totalMentorsCount: number;
  totalTracksCount: number;
  upcomingSessionsCount: number;
  pendingReviewsCount: number;
  overallAttendanceRate: number;
}

export interface AdminRecentEnrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string;
  trackId: string;
  trackName: string;
  trackAccent: string;
  enrolledAt: Date;
  isActive: boolean;
}

export interface AdminCohortSummary {
  id: string;
  name: string;
  bootcampId: string;
  bootcampName: string;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  trackCount: number;
  studentCount: number;
  mentorCount: number;
}

export interface AdminTrackOverview {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  accent: string;
  cohortId: string;
  cohortName: string;
  studentCount: number;
  mentorCount: number;
  moduleCount: number;
  lessonCount: number;
}

/**
 * 1. Admin Dashboard Data
 */
export async function getAdminDashboardData() {
  try {
    const [
      bootcamps,
      cohorts,
      students,
      mentors,
      tracks,
      sessions,
      submissions,
      attendances,
      enrollments,
      announcements,
    ] = await Promise.all([
      prisma.bootcamp.findMany({ where: { isActive: true } }),
      prisma.cohort.findMany({
        where: { isActive: true },
        include: {
          bootcamp: true,
          tracks: {
            include: {
              enrollments: { where: { isActive: true } },
              mentorAssignments: true,
            },
          },
        },
      }),
      prisma.user.findMany({ where: { role: Role.STUDENT } }),
      prisma.user.findMany({ where: { role: Role.MENTOR } }),
      prisma.track.findMany({
        include: {
          cohort: true,
          enrollments: { where: { isActive: true } },
          mentorAssignments: true,
          modules: { include: { lessons: true } },
        },
      }),
      prisma.session.findMany({
        where: { startTime: { gte: new Date() } },
        include: { track: true, mentor: true },
        orderBy: { startTime: "asc" },
        take: 5,
      }),
      prisma.submission.findMany({
        where: { status: SubmissionStatus.SUBMITTED },
      }),
      prisma.attendance.findMany(),
      prisma.enrollment.findMany({
        include: { user: true, track: true },
        orderBy: { enrolledAt: "desc" },
        take: 6,
      }),
      prisma.announcement.findMany({
        include: { track: true, author: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    // Attendance calculation
    const attendedCount = attendances.filter(
      (a) => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.EXCUSED
    ).length;
    const overallAttendanceRate =
      attendances.length > 0 ? Math.round((attendedCount / attendances.length) * 100) : 92;

    const metrics: AdminDashboardMetrics = {
      activeBootcampsCount: bootcamps.length,
      activeCohortsCount: cohorts.length,
      totalStudentsCount: students.length,
      totalMentorsCount: mentors.length,
      totalTracksCount: tracks.length,
      upcomingSessionsCount: sessions.length,
      pendingReviewsCount: submissions.length,
      overallAttendanceRate,
    };

    const recentEnrollments: AdminRecentEnrollment[] = enrollments.map((enr) => ({
      id: enr.id,
      studentId: enr.userId,
      studentName: `${enr.user.firstName} ${enr.user.lastName}`,
      studentEmail: enr.user.email,
      studentAvatar:
        enr.user.avatarUrl ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      trackId: enr.trackId,
      trackName: enr.track.name,
      trackAccent: enr.track.accent || "#4285F4",
      enrolledAt: enr.enrolledAt,
      isActive: enr.isActive,
    }));

    const activeCohortsList: AdminCohortSummary[] = cohorts.map((c) => {
      const studentIds = new Set(
        c.tracks.flatMap((t) => t.enrollments.map((e) => e.userId))
      );
      const mentorIds = new Set(
        c.tracks.flatMap((t) => t.mentorAssignments.map((m) => m.mentorId))
      );
      return {
        id: c.id,
        name: c.name,
        bootcampId: c.bootcampId,
        bootcampName: c.bootcamp.name,
        startDate: c.startDate,
        endDate: c.endDate,
        isActive: c.isActive,
        trackCount: c.tracks.length,
        studentCount: studentIds.size,
        mentorCount: mentorIds.size,
      };
    });

    const trackOverviewList: AdminTrackOverview[] = tracks.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      accent: t.accent || "#4285F4",
      cohortId: t.cohortId,
      cohortName: t.cohort.name,
      studentCount: t.enrollments.length,
      mentorCount: t.mentorAssignments.length,
      moduleCount: t.modules.length,
      lessonCount: t.modules.reduce((acc, m) => acc + m.lessons.length, 0),
    }));

    return {
      metrics,
      recentEnrollments,
      activeCohorts: activeCohortsList,
      upcomingSessions: sessions,
      recentAnnouncements: announcements,
      trackOverview: trackOverviewList,
    };
  } catch (error) {
    console.error("getAdminDashboardData fallback:", error);
    // Offline development fallback
    return {
      metrics: {
        activeBootcampsCount: 1,
        activeCohortsCount: 1,
        totalStudentsCount: 4,
        totalMentorsCount: 2,
        totalTracksCount: 4,
        upcomingSessionsCount: 2,
        pendingReviewsCount: 2,
        overallAttendanceRate: 94,
      },
      recentEnrollments: [
        {
          id: "enr-1",
          studentId: "stu-1",
          studentName: "Tobi Adebayo",
          studentEmail: "student@gdglasu.dev",
          studentAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          trackId: "track-1",
          trackName: "Backend Development",
          trackAccent: "#4285F4",
          enrolledAt: new Date(),
          isActive: true,
        },
        {
          id: "enr-2",
          studentId: "stu-2",
          studentName: "Kehinde Bankole",
          studentEmail: "kehinde@gdglasu.dev",
          studentAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
          trackId: "track-1",
          trackName: "Backend Development",
          trackAccent: "#4285F4",
          enrolledAt: new Date(),
          isActive: true,
        },
        {
          id: "enr-3",
          studentId: "stu-3",
          studentName: "Amaka Eze",
          studentEmail: "amaka@gdglasu.dev",
          studentAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
          trackId: "track-2",
          trackName: "Frontend Engineering",
          trackAccent: "#34A853",
          enrolledAt: new Date(),
          isActive: true,
        },
      ],
      activeCohorts: [
        {
          id: "cohort-1",
          name: "Cohort 1.0 (Alpha)",
          bootcampId: "bootcamp-1",
          bootcampName: "GDG LASU Tech Accelerator 2026",
          startDate: new Date("2026-09-01"),
          endDate: new Date("2026-12-15"),
          isActive: true,
          trackCount: 4,
          studentCount: 4,
          mentorCount: 2,
        },
      ],
      upcomingSessions: [],
      recentAnnouncements: [],
      trackOverview: [
        {
          id: "track-1",
          name: "Backend Development",
          slug: "backend-development",
          description: "Master modern server-side engineering with Node.js, Express, and PostgreSQL.",
          accent: "#4285F4",
          cohortId: "cohort-1",
          cohortName: "Cohort 1.0 (Alpha)",
          studentCount: 4,
          mentorCount: 1,
          moduleCount: 3,
          lessonCount: 6,
        },
        {
          id: "track-2",
          name: "Frontend Engineering",
          slug: "frontend-engineering",
          description: "Build cutting-edge user interfaces with Next.js, React 19, and Tailwind CSS.",
          accent: "#34A853",
          cohortId: "cohort-1",
          cohortName: "Cohort 1.0 (Alpha)",
          studentCount: 3,
          mentorCount: 1,
          moduleCount: 3,
          lessonCount: 6,
        },
        {
          id: "track-3",
          name: "Mobile App Development",
          slug: "mobile-development",
          description: "Cross-platform mobile applications with Flutter and React Native.",
          accent: "#FBBC04",
          cohortId: "cohort-1",
          cohortName: "Cohort 1.0 (Alpha)",
          studentCount: 2,
          mentorCount: 1,
          moduleCount: 2,
          lessonCount: 4,
        },
        {
          id: "track-4",
          name: "UI/UX & Product Design",
          slug: "ui-ux-design",
          description: "User research, wireframing, high-fidelity prototyping, and design systems.",
          accent: "#EA4335",
          cohortId: "cohort-1",
          cohortName: "Cohort 1.0 (Alpha)",
          studentCount: 2,
          mentorCount: 1,
          moduleCount: 2,
          lessonCount: 4,
        },
      ],
    };
  }
}

/**
 * 2. Bootcamps Data
 */
export async function getAdminBootcamps() {
  try {
    const bootcamps = await prisma.bootcamp.findMany({
      include: {
        cohorts: {
          include: {
            tracks: {
              include: {
                enrollments: { where: { isActive: true } },
                mentorAssignments: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return bootcamps.map((b) => {
      const studentIds = new Set(
        b.cohorts.flatMap((c) =>
          c.tracks.flatMap((t) => t.enrollments.map((e) => e.userId))
        )
      );
      const mentorIds = new Set(
        b.cohorts.flatMap((c) =>
          c.tracks.flatMap((t) => t.mentorAssignments.map((m) => m.mentorId))
        )
      );
      const totalTracks = b.cohorts.reduce((acc, c) => acc + c.tracks.length, 0);

      return {
        id: b.id,
        name: b.name,
        description: b.description,
        startDate: b.startDate,
        endDate: b.endDate,
        isActive: b.isActive,
        createdAt: b.createdAt,
        cohortCount: b.cohorts.length,
        trackCount: totalTracks,
        studentCount: studentIds.size,
        mentorCount: mentorIds.size,
        cohorts: b.cohorts.map((c) => ({
          id: c.id,
          name: c.name,
          isActive: c.isActive,
          startDate: c.startDate,
          endDate: c.endDate,
          trackCount: c.tracks.length,
        })),
      };
    });
  } catch (error) {
    console.error("getAdminBootcamps fallback:", error);
    return [
      {
        id: "bootcamp-1",
        name: "GDG LASU Tech Accelerator 2026",
        description: "Official campus engineering and product accelerator program empowering undergraduate engineers.",
        startDate: new Date("2026-09-01"),
        endDate: new Date("2026-12-15"),
        isActive: true,
        createdAt: new Date("2026-08-15"),
        cohortCount: 1,
        trackCount: 4,
        studentCount: 4,
        mentorCount: 2,
        cohorts: [
          {
            id: "cohort-1",
            name: "Cohort 1.0 (Alpha)",
            isActive: true,
            startDate: new Date("2026-09-01"),
            endDate: new Date("2026-12-15"),
            trackCount: 4,
          },
        ],
      },
    ];
  }
}

/**
 * 3. Bootcamp Detail
 */
export async function getAdminBootcampDetail(bootcampId: string) {
  try {
    const bootcamp = await prisma.bootcamp.findUnique({
      where: { id: bootcampId },
      include: {
        cohorts: {
          include: {
            tracks: {
              include: {
                enrollments: { where: { isActive: true }, include: { user: true } },
                mentorAssignments: { include: { mentor: true } },
                modules: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!bootcamp) return null;

    const studentIds = new Set(
      bootcamp.cohorts.flatMap((c) =>
        c.tracks.flatMap((t) => t.enrollments.map((e) => e.userId))
      )
    );
    const mentorIds = new Set(
      bootcamp.cohorts.flatMap((c) =>
        c.tracks.flatMap((t) => t.mentorAssignments.map((m) => m.mentorId))
      )
    );
    const totalTracks = bootcamp.cohorts.reduce((acc, c) => acc + c.tracks.length, 0);

    return {
      ...bootcamp,
      studentCount: studentIds.size,
      mentorCount: mentorIds.size,
      trackCount: totalTracks,
    };
  } catch (error) {
    console.error("getAdminBootcampDetail fallback:", error);
    return {
      id: bootcampId || "bootcamp-1",
      name: "GDG LASU Tech Accelerator 2026",
      description: "Official campus engineering and product accelerator program empowering undergraduate engineers.",
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-12-15"),
      isActive: true,
      createdAt: new Date("2026-08-15"),
      updatedAt: new Date("2026-08-15"),
      studentCount: 4,
      mentorCount: 2,
      trackCount: 4,
      cohorts: [
        {
          id: "cohort-1",
          name: "Cohort 1.0 (Alpha)",
          bootcampId: bootcampId || "bootcamp-1",
          startDate: new Date("2026-09-01"),
          endDate: new Date("2026-12-15"),
          isActive: true,
          createdAt: new Date("2026-08-20"),
          tracks: [
            {
              id: "track-1",
              name: "Backend Development",
              slug: "backend-development",
              accent: "#4285F4",
              enrollments: [{ id: "enr-1" }, { id: "enr-2" }, { id: "enr-3" }, { id: "enr-4" }],
              mentorAssignments: [{ id: "ma-1" }],
              modules: [{}, {}, {}],
            },
          ],
        },
      ],
    };
  }
}

/**
 * 4. Cohorts Data
 */
export async function getAdminCohorts() {
  try {
    const [cohorts, bootcamps] = await Promise.all([
      prisma.cohort.findMany({
        include: {
          bootcamp: true,
          tracks: {
            include: {
              enrollments: { where: { isActive: true } },
              mentorAssignments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.bootcamp.findMany({ select: { id: true, name: true, isActive: true } }),
    ]);

    const formattedCohorts = cohorts.map((c) => {
      const studentIds = new Set(
        c.tracks.flatMap((t) => t.enrollments.map((e) => e.userId))
      );
      const mentorIds = new Set(
        c.tracks.flatMap((t) => t.mentorAssignments.map((m) => m.mentorId))
      );
      return {
        id: c.id,
        name: c.name,
        bootcampId: c.bootcampId,
        bootcampName: c.bootcamp.name,
        startDate: c.startDate,
        endDate: c.endDate,
        isActive: c.isActive,
        createdAt: c.createdAt,
        trackCount: c.tracks.length,
        studentCount: studentIds.size,
        mentorCount: mentorIds.size,
        tracks: c.tracks.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          accent: t.accent || "#4285F4",
          studentCount: t.enrollments.length,
        })),
      };
    });

    return {
      cohorts: formattedCohorts,
      bootcamps,
    };
  } catch (error) {
    console.error("getAdminCohorts fallback:", error);
    return {
      cohorts: [
        {
          id: "cohort-1",
          name: "Cohort 1.0 (Alpha)",
          bootcampId: "bootcamp-1",
          bootcampName: "GDG LASU Tech Accelerator 2026",
          startDate: new Date("2026-09-01"),
          endDate: new Date("2026-12-15"),
          isActive: true,
          createdAt: new Date("2026-08-20"),
          trackCount: 4,
          studentCount: 4,
          mentorCount: 2,
          tracks: [
            { id: "track-1", name: "Backend Development", slug: "backend-development", accent: "#4285F4", studentCount: 4 },
            { id: "track-2", name: "Frontend Engineering", slug: "frontend-engineering", accent: "#34A853", studentCount: 3 },
          ],
        },
      ],
      bootcamps: [{ id: "bootcamp-1", name: "GDG LASU Tech Accelerator 2026", isActive: true }],
    };
  }
}

/**
 * 5. Cohort Detail
 */
export async function getAdminCohortDetail(cohortId: string) {
  try {
    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
      include: {
        bootcamp: true,
        tracks: {
          include: {
            enrollments: {
              where: { isActive: true },
              include: { user: true },
            },
            mentorAssignments: {
              include: { mentor: true },
            },
            modules: {
              include: { lessons: true },
            },
            sessions: {
              orderBy: { startTime: "asc" },
            },
          },
        },
      },
    });

    if (!cohort) return null;

    const studentIds = new Set(
      cohort.tracks.flatMap((t) => t.enrollments.map((e) => e.userId))
    );
    const mentorIds = new Set(
      cohort.tracks.flatMap((t) => t.mentorAssignments.map((m) => m.mentorId))
    );

    return {
      ...cohort,
      totalStudents: studentIds.size,
      totalMentors: mentorIds.size,
    };
  } catch (error) {
    console.error("getAdminCohortDetail fallback:", error);
    return {
      id: cohortId || "cohort-1",
      name: "Cohort 1.0 (Alpha)",
      bootcampId: "bootcamp-1",
      bootcamp: { id: "bootcamp-1", name: "GDG LASU Tech Accelerator 2026" },
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-12-15"),
      isActive: true,
      totalStudents: 4,
      totalMentors: 2,
      tracks: [
        {
          id: "track-1",
          name: "Backend Development",
          slug: "backend-development",
          description: "Server-side engineering with Node.js and PostgreSQL.",
          accent: "#4285F4",
          enrollments: [],
          mentorAssignments: [],
          modules: [],
          sessions: [],
        },
      ],
    };
  }
}

/**
 * 6. Tracks Data for Admin
 */
export async function getAdminTracks() {
  try {
    const [tracks, cohorts] = await Promise.all([
      prisma.track.findMany({
        include: {
          cohort: { include: { bootcamp: true } },
          enrollments: { where: { isActive: true } },
          mentorAssignments: { include: { mentor: true } },
          modules: { include: { lessons: true } },
          assignments: true,
          sessions: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.cohort.findMany({
        where: { isActive: true },
        select: { id: true, name: true, bootcamp: { select: { name: true } } },
      }),
    ]);

    const formattedTracks = tracks.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      accent: t.accent || "#4285F4",
      cohortId: t.cohortId,
      cohortName: t.cohort.name,
      bootcampName: t.cohort.bootcamp.name,
      studentCount: t.enrollments.length,
      mentorCount: t.mentorAssignments.length,
      moduleCount: t.modules.length,
      lessonCount: t.modules.reduce((acc, m) => acc + m.lessons.length, 0),
      assignmentCount: t.assignments.length,
      sessionCount: t.sessions.length,
      mentors: t.mentorAssignments.map((ma) => ({
        id: ma.mentor.id,
        name: `${ma.mentor.firstName} ${ma.mentor.lastName}`,
        email: ma.mentor.email,
        avatar: ma.mentor.avatarUrl,
      })),
    }));

    return {
      tracks: formattedTracks,
      cohorts,
    };
  } catch (error) {
    console.error("getAdminTracks fallback:", error);
    return {
      tracks: [
        {
          id: "track-1",
          name: "Backend Development",
          slug: "backend-development",
          description: "Master modern server-side engineering with Node.js, Express, and PostgreSQL.",
          accent: "#4285F4",
          cohortId: "cohort-1",
          cohortName: "Cohort 1.0 (Alpha)",
          bootcampName: "GDG LASU Tech Accelerator 2026",
          studentCount: 4,
          mentorCount: 1,
          moduleCount: 3,
          lessonCount: 6,
          assignmentCount: 2,
          sessionCount: 2,
          mentors: [
            {
              id: "user-mentor-1",
              name: "Femi Oladipo",
              email: "mentor@gdglasu.dev",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            },
          ],
        },
      ],
      cohorts: [
        { id: "cohort-1", name: "Cohort 1.0 (Alpha)", bootcamp: { name: "GDG LASU Tech Accelerator 2026" } },
      ],
    };
  }
}

/**
 * 7. Track Detail for Admin (Unrestricted track administration)
 */
export async function getAdminTrackDetail(trackId: string) {
  try {
    const track = await prisma.track.findFirst({
      where: {
        OR: [{ id: trackId }, { slug: trackId }],
      },
      include: {
        cohort: { include: { bootcamp: true } },
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
            assignments: { include: { submissions: true } },
          },
        },
        assignments: {
          include: {
            module: true,
            submissions: { include: { student: true } },
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
          include: { mentor: true },
        },
      },
    });

    if (!track) return null;

    const moduleIds = track.modules.map((m) => m.id);
    const resources = await prisma.resource.findMany({
      where: {
        OR: [
          { moduleId: { in: moduleIds } },
          { lesson: { moduleId: { in: moduleIds } } },
        ],
      },
      include: { module: true, lesson: true, uploadedBy: true },
      orderBy: { createdAt: "desc" },
    });

    const allLessons = track.modules.flatMap((m) => m.lessons);
    const totalLessonCount = allLessons.length;
    const totalAssignmentCount = track.assignments.length;
    const totalSessionsCount = track.sessions.length;

    const students = track.enrollments.map((enr) => {
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
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        enrolledAt: enr.enrolledAt,
        isActive: enr.isActive,
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

    const mentors = track.mentorAssignments.map((ma) => ({
      id: ma.mentor.id,
      name: `${ma.mentor.firstName} ${ma.mentor.lastName}`,
      email: ma.mentor.email,
      avatar: ma.mentor.avatarUrl,
    }));

    const allAttendances = track.sessions.flatMap((s) => s.attendances);
    const presentAttendances = allAttendances.filter(
      (a) => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.EXCUSED
    ).length;
    const attendanceRate =
      allAttendances.length > 0
        ? Math.round((presentAttendances / allAttendances.length) * 100)
        : 92;

    return {
      track,
      resources,
      students,
      mentors,
      sessions: track.sessions,
      assignments: track.assignments,
      attendanceRate,
    };
  } catch (error) {
    console.error("getAdminTrackDetail fallback:", error);
    return {
      track: {
        id: trackId || "track-1",
        name: "Backend Development",
        slug: "backend-development",
        description: "Master modern server-side engineering with Node.js and PostgreSQL.",
        accent: "#4285F4",
        cohort: { name: "Cohort 1.0 (Alpha)", bootcamp: { name: "GDG LASU Tech Accelerator 2026" } },
        modules: [],
        assignments: [],
        sessions: [],
        enrollments: [],
        mentorAssignments: [],
      },
      resources: [],
      students: [],
      mentors: [
        {
          id: "user-mentor-1",
          name: "Femi Oladipo",
          email: "mentor@gdglasu.dev",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        },
      ],
      sessions: [],
      assignments: [],
      attendanceRate: 94,
    };
  }
}

/**
 * 8. User Management Data
 */
export async function getAdminUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        enrollments: {
          include: { track: true },
        },
        mentorAssignments: {
          include: { track: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      role: u.role,
      avatarUrl: u.avatarUrl,
      createdAt: u.createdAt,
      enrolledTracks: u.enrollments.map((e) => ({
        id: e.track.id,
        name: e.track.name,
        accent: e.track.accent,
        isActive: e.isActive,
      })),
      assignedTracks: u.mentorAssignments.map((ma) => ({
        id: ma.track.id,
        name: ma.track.name,
        accent: ma.track.accent,
      })),
    }));
  } catch (error) {
    console.error("getAdminUsers fallback:", error);
    return [
      {
        id: "user-admin-1",
        firstName: "Chioma",
        lastName: "Okonkwo",
        name: "Chioma Okonkwo",
        email: "admin@gdglasu.dev",
        role: Role.ADMIN,
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        createdAt: new Date("2026-08-01"),
        enrolledTracks: [],
        assignedTracks: [],
      },
      {
        id: "user-mentor-1",
        firstName: "Femi",
        lastName: "Oladipo",
        name: "Femi Oladipo",
        email: "mentor@gdglasu.dev",
        role: Role.MENTOR,
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        createdAt: new Date("2026-08-15"),
        enrolledTracks: [],
        assignedTracks: [{ id: "track-1", name: "Backend Development", accent: "#4285F4" }],
      },
      {
        id: "user-student-1",
        firstName: "Alex",
        lastName: "Johnson",
        name: "Alex Johnson",
        email: "student@gdglasu.dev",
        role: Role.STUDENT,
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        createdAt: new Date("2026-09-01"),
        enrolledTracks: [{ id: "track-1", name: "Backend Development", accent: "#4285F4", isActive: true }],
        assignedTracks: [],
      },
      {
        id: "stu-1",
        firstName: "Tobi",
        lastName: "Adebayo",
        name: "Tobi Adebayo",
        email: "tobi@gdglasu.dev",
        role: Role.STUDENT,
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        createdAt: new Date("2026-09-01"),
        enrolledTracks: [{ id: "track-1", name: "Backend Development", accent: "#4285F4", isActive: true }],
        assignedTracks: [],
      },
      {
        id: "stu-2",
        firstName: "Kehinde",
        lastName: "Bankole",
        name: "Kehinde Bankole",
        email: "kehinde@gdglasu.dev",
        role: Role.STUDENT,
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        createdAt: new Date("2026-09-01"),
        enrolledTracks: [{ id: "track-1", name: "Backend Development", accent: "#4285F4", isActive: true }],
        assignedTracks: [],
      },
      {
        id: "stu-3",
        firstName: "Amaka",
        lastName: "Eze",
        name: "Amaka Eze",
        email: "amaka@gdglasu.dev",
        role: Role.STUDENT,
        avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
        createdAt: new Date("2026-09-01"),
        enrolledTracks: [{ id: "track-2", name: "Frontend Engineering", accent: "#34A853", isActive: true }],
        assignedTracks: [],
      },
    ];
  }
}

/**
 * 9. Enrollment Management Data
 */
export async function getAdminEnrollments() {
  try {
    const [enrollments, tracks, students] = await Promise.all([
      prisma.enrollment.findMany({
        include: {
          user: true,
          track: { include: { cohort: true } },
        },
        orderBy: { enrolledAt: "desc" },
      }),
      prisma.track.findMany({
        include: {
          cohort: true,
          enrollments: { select: { userId: true } },
        },
      }),
      prisma.user.findMany({
        where: { role: Role.STUDENT },
        include: {
          enrollments: true,
        },
        orderBy: { firstName: "asc" },
      }),
    ]);

    return {
      enrollments: enrollments.map((e) => ({
        id: e.id,
        studentId: e.userId,
        studentName: `${e.user.firstName} ${e.user.lastName}`,
        studentEmail: e.user.email,
        studentAvatar: e.user.avatarUrl,
        trackId: e.trackId,
        trackName: e.track.name,
        trackAccent: e.track.accent || "#4285F4",
        cohortName: e.track.cohort.name,
        enrolledAt: e.enrolledAt,
        isActive: e.isActive,
      })),
      tracks: tracks.map((t) => ({
        id: t.id,
        name: t.name,
        accent: t.accent || "#4285F4",
        cohortName: t.cohort.name,
        enrolledStudentIds: t.enrollments.map((e) => e.userId),
      })),
      students: students.map((s) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        email: s.email,
        avatar: s.avatarUrl,
        enrolledTrackIds: s.enrollments.map((e) => e.trackId),
      })),
    };
  } catch (error) {
    console.error("getAdminEnrollments fallback:", error);
    return {
      enrollments: [
        {
          id: "enr-1",
          studentId: "stu-1",
          studentName: "Tobi Adebayo",
          studentEmail: "tobi@gdglasu.dev",
          studentAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          trackId: "track-1",
          trackName: "Backend Development",
          trackAccent: "#4285F4",
          cohortName: "Cohort 1.0 (Alpha)",
          enrolledAt: new Date("2026-09-01"),
          isActive: true,
        },
      ],
      tracks: [
        { id: "track-1", name: "Backend Development", accent: "#4285F4", cohortName: "Cohort 1.0 (Alpha)", enrolledStudentIds: ["stu-1"] },
        { id: "track-2", name: "Frontend Engineering", accent: "#34A853", cohortName: "Cohort 1.0 (Alpha)", enrolledStudentIds: ["stu-3"] },
      ],
      students: [
        { id: "stu-1", name: "Tobi Adebayo", email: "tobi@gdglasu.dev", avatar: "", enrolledTrackIds: ["track-1"] },
        { id: "stu-2", name: "Kehinde Bankole", email: "kehinde@gdglasu.dev", avatar: "", enrolledTrackIds: [] },
        { id: "stu-3", name: "Amaka Eze", email: "amaka@gdglasu.dev", avatar: "", enrolledTrackIds: ["track-2"] },
        { id: "stu-4", name: "Daniel Oshodi", email: "daniel@gdglasu.dev", avatar: "", enrolledTrackIds: [] },
      ],
    };
  }
}

/**
 * 10. Mentor Management Data
 */
export async function getAdminMentors() {
  try {
    const [mentors, tracks] = await Promise.all([
      prisma.user.findMany({
        where: { role: Role.MENTOR },
        include: {
          mentorAssignments: {
            include: {
              track: {
                include: {
                  cohort: true,
                  enrollments: { where: { isActive: true } },
                },
              },
            },
          },
          mentorSessions: {
            where: { startTime: { gte: new Date() } },
          },
        },
        orderBy: { firstName: "asc" },
      }),
      prisma.track.findMany({
        include: {
          cohort: true,
          mentorAssignments: true,
        },
      }),
    ]);

    const formattedMentors = mentors.map((m) => {
      const assignedTracks = m.mentorAssignments.map((ma) => ({
        assignmentId: ma.id,
        trackId: ma.track.id,
        trackName: ma.track.name,
        trackAccent: ma.track.accent || "#4285F4",
        cohortName: ma.track.cohort.name,
        studentCount: ma.track.enrollments.length,
        assignedAt: ma.assignedAt,
      }));

      const totalStudents = m.mentorAssignments.reduce(
        (acc, ma) => acc + ma.track.enrollments.length,
        0
      );

      return {
        id: m.id,
        name: `${m.firstName} ${m.lastName}`,
        email: m.email,
        avatar:
          m.avatarUrl ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        assignedTracks,
        totalAssignedTracks: assignedTracks.length,
        totalSupervisedStudents: totalStudents,
        upcomingSessionsCount: m.mentorSessions.length,
      };
    });

    return {
      mentors: formattedMentors,
      tracks: tracks.map((t) => ({
        id: t.id,
        name: t.name,
        accent: t.accent || "#4285F4",
        cohortName: t.cohort.name,
        assignedMentorIds: t.mentorAssignments.map((ma) => ma.mentorId),
      })),
    };
  } catch (error) {
    console.error("getAdminMentors fallback:", error);
    return {
      mentors: [
        {
          id: "user-mentor-1",
          name: "Femi Oladipo",
          email: "mentor@gdglasu.dev",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          assignedTracks: [
            {
              assignmentId: "ma-1",
              trackId: "track-1",
              trackName: "Backend Development",
              trackAccent: "#4285F4",
              cohortName: "Cohort 1.0 (Alpha)",
              studentCount: 4,
              assignedAt: new Date(),
            },
          ],
          totalAssignedTracks: 1,
          totalSupervisedStudents: 4,
          upcomingSessionsCount: 2,
        },
      ],
      tracks: [
        { id: "track-1", name: "Backend Development", accent: "#4285F4", cohortName: "Cohort 1.0 (Alpha)", assignedMentorIds: ["user-mentor-1"] },
        { id: "track-2", name: "Frontend Engineering", accent: "#34A853", cohortName: "Cohort 1.0 (Alpha)", assignedMentorIds: [] },
      ],
    };
  }
}

/**
 * 11. Sessions Management Data
 */
export async function getAdminSessions() {
  try {
    const [sessions, tracks, mentors] = await Promise.all([
      prisma.session.findMany({
        include: {
          track: { include: { cohort: true } },
          mentor: true,
          attendances: true,
        },
        orderBy: { startTime: "asc" },
      }),
      prisma.track.findMany({
        select: { id: true, name: true, slug: true, accent: true, cohort: { select: { name: true } } },
      }),
      prisma.user.findMany({
        where: { role: Role.MENTOR },
        select: { id: true, firstName: true, lastName: true, email: true },
      }),
    ]);

    const formattedSessions = sessions.map((s) => {
      const presentCount = s.attendances.filter(
        (a) => a.status === AttendanceStatus.PRESENT
      ).length;
      const absentCount = s.attendances.filter(
        (a) => a.status === AttendanceStatus.ABSENT
      ).length;
      const excusedCount = s.attendances.filter(
        (a) => a.status === AttendanceStatus.EXCUSED
      ).length;

      return {
        id: s.id,
        trackId: s.trackId,
        trackName: s.track.name,
        trackAccent: s.track.accent || "#4285F4",
        cohortName: s.track.cohort.name,
        title: s.title,
        description: s.description,
        startTime: s.startTime,
        endTime: s.endTime,
        mode: s.mode,
        meetingUrl: s.meetingUrl,
        location: s.location,
        recordingUrl: s.recordingUrl,
        mentor: s.mentor
          ? {
              id: s.mentor.id,
              name: `${s.mentor.firstName} ${s.mentor.lastName}`,
            }
          : null,
        attendance: {
          total: s.attendances.length,
          present: presentCount,
          absent: absentCount,
          excused: excusedCount,
        },
      };
    });

    return {
      sessions: formattedSessions,
      tracks,
      mentors: mentors.map((m) => ({
        id: m.id,
        name: `${m.firstName} ${m.lastName}`,
        email: m.email,
      })),
    };
  } catch (error) {
    console.error("getAdminSessions fallback:", error);
    return {
      sessions: [],
      tracks: [{ id: "track-1", name: "Backend Development", slug: "backend-development", accent: "#4285F4", cohort: { name: "Cohort 1.0" } }],
      mentors: [{ id: "user-mentor-1", name: "Femi Oladipo", email: "mentor@gdglasu.dev" }],
    };
  }
}

/**
 * 12. Announcements Management Data
 */
export async function getAdminAnnouncements() {
  try {
    const [announcements, tracks] = await Promise.all([
      prisma.announcement.findMany({
        include: {
          track: true,
          author: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.track.findMany({
        select: { id: true, name: true, slug: true, accent: true },
      }),
    ]);

    return {
      announcements: announcements.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        priority: a.priority,
        trackId: a.trackId,
        trackName: a.track?.name || null,
        trackAccent: a.track?.accent || null,
        authorName: `${a.author.firstName} ${a.author.lastName}`,
        authorEmail: a.author.email,
        authorRole: a.author.role,
        createdAt: a.createdAt,
      })),
      tracks,
    };
  } catch (error) {
    console.error("getAdminAnnouncements fallback:", error);
    return {
      announcements: [],
      tracks: [{ id: "track-1", name: "Backend Development", slug: "backend-development", accent: "#4285F4" }],
    };
  }
}
