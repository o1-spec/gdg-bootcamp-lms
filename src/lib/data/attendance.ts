import prisma from "@/lib/prisma";
import { AttendanceRecord, AttendanceSummaryData, AttendanceStatus as UIAttendanceStatus, TrackCategory } from "@/types/lms";

export interface StudentAttendanceResult {
  summary: AttendanceSummaryData;
  records: AttendanceRecord[];
}

export async function getStudentAttendance(studentId: string): Promise<StudentAttendanceResult> {
  try {
    const records = await prisma.attendance.findMany({
      where: {
        studentId,
      },
      include: {
        session: {
          include: {
            track: true,
            mentor: true,
          },
        },
      },
      orderBy: {
        session: {
          startTime: "desc",
        },
      },
    });

    if (!records || records.length === 0) {
      return {
        summary: {
          attendanceRate: 100,
          totalSessions: 0,
          presentCount: 0,
          absentCount: 0,
          excusedCount: 0,
        },
        records: [],
      };
    }

    let presentCount = 0;
    let absentCount = 0;
    let excusedCount = 0;

    const formattedRecords: AttendanceRecord[] = records.map((r) => {
      let uiStatus: UIAttendanceStatus = "present";
      if (r.status === "PRESENT") {
        presentCount++;
        uiStatus = "present";
      } else if (r.status === "ABSENT") {
        absentCount++;
        uiStatus = "absent";
      } else if (r.status === "EXCUSED") {
        excusedCount++;
        uiStatus = "excused";
      }

      const sessionDate = new Date(r.session.startTime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const mentorName = r.session.mentor
        ? `${r.session.mentor.firstName} ${r.session.mentor.lastName}`
        : "Lead Mentor";

      return {
        id: r.id,
        date: sessionDate,
        trackId: r.session.track.slug,
        trackName: r.session.track.name as TrackCategory,
        trackAccentColor: r.session.track.accent || "#4285F4",
        sessionTitle: r.session.title,
        mentorName,
        status: uiStatus,
        durationMinutes: 120,
      };
    });

    const totalSessions = records.length;
    const attendanceRate =
      totalSessions > 0
        ? Math.round(((presentCount + excusedCount) / totalSessions) * 100)
        : 100;

    return {
      summary: {
        attendanceRate,
        totalSessions,
        presentCount,
        absentCount,
        excusedCount,
      },
      records: formattedRecords,
    };
  } catch (error) {
    console.error("[Attendance] Error fetching student attendance:", error);
    return {
      summary: {
        attendanceRate: 100,
        totalSessions: 0,
        presentCount: 0,
        absentCount: 0,
        excusedCount: 0,
      },
      records: [],
    };
  }
}
