import prisma from "@/lib/prisma";
import { SessionMode } from "@prisma/client";
import { safeUserSelect } from "@/lib/auth";
import { BootcampSession, SessionMode as UISessionMode, TrackCategory } from "@/types/lms";
import { mockBootcampSessions } from "@/data/schedule";

export interface SessionFilters {
  trackSlug?: string;
  mode?: SessionMode;
}

export async function getSessions(filters?: SessionFilters) {
  try {
    const where: Record<string, unknown> = {};

    if (filters?.mode) {
      where.mode = filters.mode;
    }

    if (filters?.trackSlug) {
      where.track = {
        slug: filters.trackSlug,
      };
    }

    return await prisma.session.findMany({
      where,
      orderBy: { startTime: "asc" },
      include: {
        track: {
          select: {
            id: true,
            name: true,
            slug: true,
            accent: true,
          },
        },
        mentor: {
          select: safeUserSelect,
        },
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });
  } catch {
    return [];
  }
}

/**
 * Returns BootcampSession items belonging to the student's enrolled tracks.
 */
export async function getStudentSchedule(studentId: string): Promise<BootcampSession[]> {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        track: {
          enrollments: {
            some: {
              userId: studentId,
              isActive: true,
            },
          },
        },
      },
      include: {
        track: true,
        mentor: {
          select: safeUserSelect,
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    if (!sessions || sessions.length === 0) {
      return mockBootcampSessions;
    }

    const now = new Date();

    return sessions.map((s) => {
      const start = new Date(s.startTime);
      const end = new Date(s.endTime);
      const isPast = end < now;
      const isLiveNow = start <= now && now <= end;

      const dayOfWeek = start.toLocaleDateString("en-US", { weekday: "long" }) as BootcampSession["dayOfWeek"];
      const dateStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const timeRange = `${start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} – ${end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;

      let uiMode: UISessionMode = "Virtual";
      if (s.mode === "PHYSICAL") uiMode = "In-Person";
      else if (s.mode === "HYBRID") uiMode = "Hybrid";

      return {
        id: s.id,
        title: s.title,
        trackId: s.track.slug,
        trackName: s.track.name as TrackCategory,
        trackAccentColor: s.track.accent || "#4285F4",
        topic: s.title.split(":")[0] || s.title,
        dayOfWeek,
        date: dateStr,
        timeRange,
        mentor: {
          name: s.mentor ? `${s.mentor.firstName} ${s.mentor.lastName}` : "Track Mentor",
          role: s.mentor ? `${s.mentor.role} • GDG LASU` : "Lead Instructor",
          avatar: s.mentor?.avatarUrl || undefined,
        },
        mode: uiMode,
        venueOrLink: s.location || (s.meetingUrl ? "Google Meet" : "TBD"),
        meetUrl: s.meetingUrl || undefined,
        recordingUrl: s.recordingUrl || undefined,
        isLiveNow,
        isPast,
        topicsCovered: [
          `Key concepts and applications in ${s.title}`,
          "Real-world architecture and industry insights",
          "Interactive Q&A and code walkthrough with mentors",
        ],
        attachedResources: [
          {
            title: `${s.track.name} Lecture Slides`,
            type: "slides",
            url: "#",
          },
        ],
      };
    });
  } catch {
    return mockBootcampSessions;
  }
}
