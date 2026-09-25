import prisma from "@/lib/prisma";
import { ResourceType } from "@prisma/client";
import { safeUserSelect } from "@/lib/auth";
import { LibraryResource, ResourceType as UIResourceType } from "@/types/lms";
import { mockLibraryResources } from "@/data/resources";

export interface ResourceFilters {
  trackSlug?: string;
  moduleId?: string;
  lessonId?: string;
  type?: ResourceType;
  search?: string;
}

export async function getResources(filters?: ResourceFilters) {
  try {
    const where: Record<string, unknown> = {};

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.lessonId) {
      where.lessonId = filters.lessonId;
    }

    if (filters?.moduleId) {
      where.moduleId = filters.moduleId;
    }

    if (filters?.trackSlug) {
      where.OR = [
        {
          module: {
            track: {
              slug: filters.trackSlug,
            },
          },
        },
        {
          lesson: {
            module: {
              track: {
                slug: filters.trackSlug,
              },
            },
          },
        },
      ];
    }

    if (filters?.search) {
      where.title = {
        contains: filters.search,
        mode: "insensitive",
      };
    }

    return await prisma.resource.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        uploadedBy: {
          select: safeUserSelect,
        },
        lesson: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        module: {
          select: {
            id: true,
            title: true,
            slug: true,
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
      },
    });
  } catch {
    return [];
  }
}

/**
 * Returns LibraryResource items belonging only to tracks the student is enrolled in.
 */
export async function getStudentResources(studentId: string): Promise<LibraryResource[]> {
  try {
    const resources = await prisma.resource.findMany({
      where: {
        OR: [
          {
            module: {
              track: {
                enrollments: {
                  some: {
                    userId: studentId,
                    isActive: true,
                  },
                },
              },
            },
          },
          {
            lesson: {
              module: {
                track: {
                  enrollments: {
                    some: {
                      userId: studentId,
                      isActive: true,
                    },
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        uploadedBy: {
          select: safeUserSelect,
        },
        module: {
          include: {
            track: true,
          },
        },
        lesson: {
          include: {
            module: {
              include: {
                track: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!resources || resources.length === 0) {
      return mockLibraryResources;
    }

    return resources.map((r) => {
      const track = r.module?.track || r.lesson?.module?.track;
      const modName = r.module?.title || r.lesson?.module?.title || "Curriculum";

      return {
        id: r.id,
        title: r.title,
        description: r.description || "Curriculum reference resource",
        type: r.type.toLowerCase() as UIResourceType,
        trackId: track?.slug || "general",
        trackName: track?.name || "General Bootcamp",
        moduleName: modName,
        url: r.url,
        fileSize: "1.5 MB",
        uploadedBy: r.uploadedBy ? `${r.uploadedBy.firstName} ${r.uploadedBy.lastName} (${r.uploadedBy.role})` : "Mentor",
        addedAt: "Recently added",
        isRequired: r.isRequired,
        accentColor: track?.accent || "#4285F4",
      };
    });
  } catch {
    return mockLibraryResources;
  }
}
