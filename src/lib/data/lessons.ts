import prisma from "@/lib/prisma";
import { FullLesson, LessonStatus, ResourceType } from "@/types/lms";

export async function getLessonsByModuleId(moduleId: string) {
  try {
    return await prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { order: "asc" },
      include: {
        resources: true,
        _count: {
          select: {
            progress: true,
          },
        },
      },
    });
  } catch {
    return [];
  }
}

export async function getLessonById(id: string) {
  try {
    return await prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            track: {
              select: {
                id: true,
                name: true,
                slug: true,
                accent: true,
              },
            },
          },
        },
        resources: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
  } catch {
    return null;
  }
}

/**
 * Returns full lesson details including completion status and previous/next navigation for student.
 */
export async function getLessonDetails(
  trackSlug: string,
  lessonSlugOrId: string,
  studentId: string
): Promise<FullLesson | null> {
  try {
    const lesson = await prisma.lesson.findFirst({
      where: {
        OR: [{ slug: lessonSlugOrId }, { id: lessonSlugOrId }],
        module: {
          track: {
            slug: trackSlug,
          },
        },
      },
      include: {
        module: {
          include: {
            track: true,
            lessons: {
              where: { isPublished: true },
              orderBy: { order: "asc" },
              select: {
                id: true,
                slug: true,
                title: true,
                order: true,
              },
            },
          },
        },
        resources: true,
        progress: {
          where: { studentId },
        },
      },
    });

    if (!lesson) {
      return null;
    }

    const isCompleted = lesson.progress.some((p) => p.completed);
    const status: LessonStatus = isCompleted ? "completed" : "current";

    // Compute previous and next sibling lessons within the module
    const siblingLessons = lesson.module.lessons;
    const currentIndex = siblingLessons.findIndex((l) => l.id === lesson.id);

    const prevSibling = currentIndex > 0 ? siblingLessons[currentIndex - 1] : undefined;
    const nextSibling =
      currentIndex < siblingLessons.length - 1 ? siblingLessons[currentIndex + 1] : undefined;

    return {
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      trackId: lesson.module.track.id,
      trackName: lesson.module.track.name,
      trackAccentColor: lesson.module.track.accent || "#4285F4",
      moduleId: lesson.module.id,
      moduleName: lesson.module.title,
      moduleOrder: lesson.module.order,
      durationMinutes: lesson.durationMinutes || 45,
      type: "Lesson",
      status,
      description: lesson.description || "",
      learningObjectives: [
        `Master the core principles of ${lesson.title}`,
        "Understand industrial best practices and architectural patterns",
        "Apply hands-on engineering principles to solve practical challenges",
        "Build foundational understanding for upcoming capstone project deliverables",
      ],
      video: {
        title: `${lesson.title} - Masterclass Recording`,
        duration: `${lesson.durationMinutes || 40}:00`,
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      sections: [
        {
          title: `1. Overview of ${lesson.title}`,
          content:
            lesson.content ||
            `${lesson.title} forms a foundational pillar in modern backend engineering. Understanding these concepts enables you to architect reliable, fault-tolerant, and performant systems.`,
          bulletPoints: [
            "Clear separation of concerns between systems and components",
            "Predictable, standardized interfaces for consumer applications",
            "Defensive engineering and schema verification against abnormal edge cases",
          ],
        },
      ],
      resources: lesson.resources.map((r) => ({
        id: r.id,
        title: r.title,
        type: r.type.toLowerCase() as ResourceType,
        url: r.url,
        isRequired: r.isRequired,
        description: r.description || undefined,
      })),
      prevLesson: prevSibling
        ? {
            id: prevSibling.id,
            slug: prevSibling.slug,
            title: prevSibling.title,
          }
        : undefined,
      nextLesson: nextSibling
        ? {
            id: nextSibling.id,
            slug: nextSibling.slug,
            title: nextSibling.title,
          }
        : undefined,
    };
  } catch (error) {
    console.error("[Lessons] Error fetching lesson details:", error);
    return null;
  }
}
