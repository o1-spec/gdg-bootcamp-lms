import prisma from "@/lib/prisma";
import { AnnouncementPriority } from "@prisma/client";
import { safeUserSelect } from "@/lib/auth";
import { FullAnnouncement, AnnouncementPriority as UIAnnouncementPriority } from "@/types/lms";

export interface AnnouncementFilters {
  trackSlug?: string;
  priority?: AnnouncementPriority;
}

export async function getAnnouncements(filters?: AnnouncementFilters) {
  try {
    const where: Record<string, unknown> = {};

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.trackSlug) {
      where.OR = [
        { trackId: null },
        {
          track: {
            slug: filters.trackSlug,
          },
        },
      ];
    }

    return await prisma.announcement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        track: {
          select: {
            id: true,
            name: true,
            slug: true,
            accent: true,
          },
        },
        author: {
          select: safeUserSelect,
        },
      },
    });
  } catch {
    return [];
  }
}

/**
 * Returns FullAnnouncement list for student's enrolled tracks + general announcements.
 */
export async function getStudentAnnouncements(studentId: string): Promise<FullAnnouncement[]> {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { trackId: null },
          {
            track: {
              enrollments: {
                some: {
                  userId: studentId,
                  isActive: true,
                },
              },
            },
          },
        ],
      },
      include: {
        track: true,
        author: {
          select: safeUserSelect,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!announcements || announcements.length === 0) {
      return [];
    }

    return announcements.map((a) => {
      const priorityMap: Record<string, UIAnnouncementPriority> = {
        URGENT: "URGENT",
        IMPORTANT: "IMPORTANT",
        REMINDER: "REMINDER",
        NORMAL: "NORMAL",
      };

      const dateStr = new Date(a.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

      return {
        id: a.id,
        title: a.title,
        content: a.content,
        trackId: a.track?.slug || "general",
        trackName: a.track?.name || "All Cohort",
        trackAccentColor: a.track?.accent || "#FBBC04",
        postedDate: dateStr,
        author: {
          name: a.author ? `${a.author.firstName} ${a.author.lastName}` : "Cohort Lead",
          role: a.author ? `${a.author.role} • GDG LASU` : "Lead Instructor",
          avatar: a.author?.avatarUrl || "",
        },
        priority: priorityMap[a.priority] || "NORMAL",
        isPinned: a.priority === "URGENT" || a.priority === "IMPORTANT",
        attachments: [],
      };
    });
  } catch (error) {
    console.error("[Announcements] Error fetching student announcements:", error);
    return [];
  }
}
