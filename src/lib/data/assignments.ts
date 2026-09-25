import prisma from "@/lib/prisma";
import { AssignmentType } from "@prisma/client";
import { safeUserSelect } from "@/lib/auth";
import { FullAssignment, ExtendedAssignmentStatus, SubmissionStatus as UISubmissionStatus, AssignmentType as UIAssignmentType, TrackCategory } from "@/types/lms";

export interface AssignmentFilters {
  trackSlug?: string;
  moduleId?: string;
  type?: AssignmentType;
}

export async function getAssignments(filters?: AssignmentFilters) {
  try {
    const where: Record<string, unknown> = {};

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.moduleId) {
      where.moduleId = filters.moduleId;
    }

    if (filters?.trackSlug) {
      where.track = {
        slug: filters.trackSlug,
      };
    }

    return await prisma.assignment.findMany({
      where,
      orderBy: [
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        track: {
          select: {
            id: true,
            name: true,
            slug: true,
            accent: true,
          },
        },
        module: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        createdBy: {
          select: safeUserSelect,
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });
  } catch {
    return [];
  }
}

export async function getAssignmentById(id: string) {
  try {
    return await prisma.assignment.findUnique({
      where: { id },
      include: {
        track: {
          select: {
            id: true,
            name: true,
            slug: true,
            accent: true,
          },
        },
        module: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        createdBy: {
          select: safeUserSelect,
        },
        submissions: {
          include: {
            student: {
              select: safeUserSelect,
            },
          },
        },
      },
    });
  } catch {
    return null;
  }
}

/**
 * Returns FullAssignment list from tracks the student is enrolled in, with computed status.
 */
export async function getStudentAssignments(studentId: string): Promise<FullAssignment[]> {
  try {
    const assignments = await prisma.assignment.findMany({
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
        module: true,
        createdBy: {
          select: safeUserSelect,
        },
        submissions: {
          where: { studentId },
        },
      },
      orderBy: [
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
    });

    if (!assignments || assignments.length === 0) {
      return [];
    }

    const now = new Date();

    return assignments.map((a) => {
      const submission = a.submissions[0];
      const dueDate = a.dueDate ? new Date(a.dueDate) : new Date(Date.now() + 7 * 86400000);
      const daysRemaining = Math.max(0, Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      let status: ExtendedAssignmentStatus = "not_started";
      let uiSubStatus: UISubmissionStatus = "NOT_STARTED";

      if (submission?.status === "REVIEWED") {
        status = "reviewed";
        uiSubStatus = "REVIEWED";
      } else if (submission?.status === "SUBMITTED") {
        status = "submitted";
        uiSubStatus = "SUBMITTED";
      } else if (submission?.status === "DRAFT") {
        status = "in_progress";
        uiSubStatus = "DRAFT";
      } else if (dueDate < now) {
        status = "overdue";
      }

      const formattedDueDate = dueDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      return {
        id: a.id,
        title: a.title,
        trackId: a.track.slug,
        trackName: a.track.name as TrackCategory,
        trackAccentColor: a.track.accent || "#4285F4",
        moduleName: a.module?.title || "Curriculum",
        type: (a.type.charAt(0) + a.type.slice(1).toLowerCase()) as UIAssignmentType,
        status,
        dueDate: formattedDueDate,
        dueTime: "11:59 PM",
        daysRemaining,
        points: a.points || 100,
        shortDescription: a.description.slice(0, 150) + (a.description.length > 150 ? "..." : ""),
        fullDescription: a.description,
        objectives: [
          `Implement practical requirements for ${a.title}`,
          "Write clean, modular, and maintainable TypeScript/JavaScript code",
          "Handle boundary cases and input validation properly",
          "Prepare artifacts ready for mentor assessment",
        ],
        expectedOutcome: "A tested, production-ready solution submitted with GitHub repository code and brief notes.",
        requirements: a.instructions
          ? a.instructions.split("\n").filter((l) => l.trim().length > 0)
          : ["Ensure clean commit history", "Validate all inputs", "Provide documentation"],
        submissionInstructions: [
          "Push your project code to a public or private GitHub repository",
          "Ensure your README contains local setup and test steps",
          "Include a live deployment link if applicable",
          "Submit your link and any notes through this portal",
        ],
        resources: [
          {
            title: `${a.track.name} Starter Template`,
            type: "github",
            url: "https://github.com",
          },
        ],
        submission: {
          status: uiSubStatus,
          githubUrl: submission?.githubUrl || undefined,
          liveUrl: submission?.liveUrl || undefined,
          notes: submission?.notes || undefined,
          submittedAt: submission?.submittedAt ? submission.submittedAt.toISOString() : undefined,
          score: submission?.score || undefined,
          maxScore: a.points || 100,
          mentorFeedback: submission?.feedback || undefined,
          mentorName: a.createdBy ? `${a.createdBy.firstName} ${a.createdBy.lastName}` : "Mentor",
        },
      };
    });
  } catch (error) {
    console.error("[Assignments] Error fetching student assignments:", error);
    return [];
  }
}

/**
 * Returns single FullAssignment details for student.
 */
export async function getStudentAssignmentDetails(
  assignmentIdOrSlug: string,
  studentId: string
): Promise<FullAssignment | null> {
  const allAssignments = await getStudentAssignments(studentId);
  return (
    allAssignments.find(
      (a) => a.id === assignmentIdOrSlug || a.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === assignmentIdOrSlug
    ) || null
  );
}
