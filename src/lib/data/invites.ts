import prisma from "@/lib/prisma";
import { BootcampInvite, InviteValidationResult } from "@/types/lms";

/**
 * In-memory fallback invites store for offline development
 */
let mockInvites: BootcampInvite[] = [
  {
    id: "inv-backend-2026",
    code: "BACKEND26",
    bootcampId: "bootcamp-1",
    bootcampName: "GDG LASU Bootcamp 2026",
    cohortId: "cohort-1",
    cohortName: "Cohort 1 (Alpha)",
    trackId: "track-backend",
    trackName: "Backend Development",
    allowTrackSelection: false,
    maxTrackSelections: 1,
    createdById: "user-admin-1",
    creatorName: "Chioma Okonkwo",
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    maxUses: 100,
    useCount: 12,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "inv-frontend-2026",
    code: "FRONTEND26",
    bootcampId: "bootcamp-1",
    bootcampName: "GDG LASU Bootcamp 2026",
    cohortId: "cohort-1",
    cohortName: "Cohort 1 (Alpha)",
    trackId: "track-frontend",
    trackName: "Frontend Development",
    allowTrackSelection: false,
    maxTrackSelections: 1,
    createdById: "user-admin-1",
    creatorName: "Chioma Okonkwo",
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    maxUses: 100,
    useCount: 24,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "inv-general-2026",
    code: "GDGLASU26",
    bootcampId: "bootcamp-1",
    bootcampName: "GDG LASU Bootcamp 2026",
    cohortId: "cohort-1",
    cohortName: "Cohort 1 (Alpha)",
    trackId: null,
    trackName: null,
    allowTrackSelection: true,
    maxTrackSelections: 2,
    createdById: "user-admin-1",
    creatorName: "Chioma Okonkwo",
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    maxUses: 500,
    useCount: 68,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "inv-expired-demo",
    code: "EXPIRED26",
    bootcampId: "bootcamp-1",
    bootcampName: "GDG LASU Bootcamp 2026",
    cohortId: "cohort-1",
    cohortName: "Cohort 1 (Alpha)",
    trackId: "track-backend",
    trackName: "Backend Development",
    allowTrackSelection: false,
    maxTrackSelections: 1,
    createdById: "user-admin-1",
    creatorName: "Chioma Okonkwo",
    expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    maxUses: 50,
    useCount: 15,
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "inv-full-demo",
    code: "FULL26",
    bootcampId: "bootcamp-1",
    bootcampName: "GDG LASU Bootcamp 2026",
    cohortId: "cohort-1",
    cohortName: "Cohort 1 (Alpha)",
    trackId: "track-backend",
    trackName: "Backend Development",
    allowTrackSelection: false,
    maxTrackSelections: 1,
    createdById: "user-admin-1",
    creatorName: "Chioma Okonkwo",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    maxUses: 5,
    useCount: 5, // reached maxUses
    isActive: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Offline development tracking of user enrollments
const mockUserEnrollments: Record<string, Set<string>> = {};

/**
 * Generate a random readable uppercase alphanumeric invite code
 */
export function generateInviteCode(prefix?: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let random = "";
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const cleanPrefix = (prefix || "GDG")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
  return `${cleanPrefix}${random}`;
}

/**
 * Validate an invite code server-side
 */
export async function validateInviteCode(rawCode: string): Promise<InviteValidationResult> {
  const code = (rawCode || "").trim().toUpperCase();

  if (!code || code.length < 3) {
    return { valid: false, error: "Please enter a valid invite code" };
  }

  try {
    const invite = await prisma.invite.findUnique({
      where: { code },
      include: {
        bootcamp: { select: { id: true, name: true } },
        cohort: {
          select: {
            id: true,
            name: true,
            tracks: {
              select: { id: true, name: true, slug: true, description: true, accent: true },
            },
          },
        },
        track: { select: { id: true, name: true, slug: true, description: true, accent: true } },
      },
    });

    if (!invite) {
      return { valid: false, error: "Invite code not found." };
    }

    if (!invite.isActive) {
      return { valid: false, error: "This invite is no longer active." };
    }

    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return { valid: false, error: "This invite has expired." };
    }

    if (invite.maxUses !== null && invite.maxUses !== undefined && invite.useCount >= invite.maxUses) {
      return { valid: false, error: "This invite has reached its usage limit." };
    }

    // Resolve available tracks for selection if enabled
    let availableTracks = invite.cohort?.tracks || [];
    if (availableTracks.length === 0 && invite.bootcampId) {
      const allTracks = await prisma.track.findMany({
        where: { cohort: { bootcampId: invite.bootcampId } },
        select: { id: true, name: true, slug: true, description: true, accent: true },
      });
      availableTracks = allTracks;
    }

    return {
      valid: true,
      invite: {
        code: invite.code,
        bootcampId: invite.bootcampId,
        bootcampName: invite.bootcamp.name,
        cohortId: invite.cohortId,
        cohortName: invite.cohort?.name || null,
        trackId: invite.trackId,
        trackName: invite.track?.name || null,
        trackSlug: invite.track?.slug || null,
        allowTrackSelection: invite.allowTrackSelection,
        maxTrackSelections: invite.maxTrackSelections || 1,
        availableTracks: availableTracks.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          description: t.description,
          accent: t.accent,
        })),
      },
    };
  } catch {
    // In-memory fallback during offline development
    const mock = mockInvites.find((i) => i.code.toUpperCase() === code);
    if (!mock) {
      return { valid: false, error: "Invite code not found." };
    }

    if (!mock.isActive) {
      return { valid: false, error: "This invite is no longer active." };
    }

    if (mock.expiresAt && new Date(mock.expiresAt) < new Date()) {
      return { valid: false, error: "This invite has expired." };
    }

    if (mock.maxUses !== null && mock.maxUses !== undefined && mock.useCount >= mock.maxUses) {
      return { valid: false, error: "This invite has reached its usage limit." };
    }

    const mockTracks = [
      {
        id: "track-backend",
        name: "Backend Development",
        slug: "backend-development",
        description: "Node.js, PostgreSQL, Cloud Architecture, and APIs.",
        accent: "#4285F4",
      },
      {
        id: "track-frontend",
        name: "Frontend Development",
        slug: "frontend-development",
        description: "React, Next.js, TypeScript, and modern UI engineering.",
        accent: "#34A853",
      },
      {
        id: "track-dsa",
        name: "DSA & Interview Prep",
        slug: "dsa-interview-prep",
        description: "Algorithms, problem-solving, and technical interviews.",
        accent: "#EA4335",
      },
      {
        id: "track-uiux",
        name: "UI/UX Design",
        slug: "ui-ux-design",
        description: "Figma design systems, accessibility, and user research.",
        accent: "#FBBC04",
      },
    ];

    return {
      valid: true,
      invite: {
        code: mock.code,
        bootcampId: mock.bootcampId,
        bootcampName: mock.bootcampName || "GDG LASU Bootcamp 2026",
        cohortId: mock.cohortId,
        cohortName: mock.cohortName || "Cohort 1 (Alpha)",
        trackId: mock.trackId,
        trackName: mock.trackName,
        trackSlug: mock.trackId ? mock.trackId.replace("track-", "") : null,
        allowTrackSelection: mock.allowTrackSelection,
        maxTrackSelections: mock.maxTrackSelections || 1,
        availableTracks: mockTracks,
      },
    };
  }
}

/**
 * Process a student join request using an invite code
 */
export async function processEnrollmentWithInvite(
  userId: string,
  rawCode: string,
  selectedTrackIds?: string[]
): Promise<{
  success: boolean;
  error?: string;
  alreadyEnrolled?: boolean;
  enrolledTrackNames?: string[];
  bootcampName?: string;
}> {
  const validation = await validateInviteCode(rawCode);
  if (!validation.valid || !validation.invite) {
    return { success: false, error: validation.error || "Invalid invite code." };
  }

  const { invite } = validation;

  // Determine target track IDs
  let targetTrackIds: string[] = [];
  if (invite.trackId) {
    targetTrackIds = [invite.trackId];
  } else if (invite.allowTrackSelection && selectedTrackIds && selectedTrackIds.length > 0) {
    // Validate selected tracks
    const maxAllowed = invite.maxTrackSelections || 1;
    if (selectedTrackIds.length > maxAllowed) {
      return {
        success: false,
        error: `You can select a maximum of ${maxAllowed} track${maxAllowed > 1 ? "s" : ""}.`,
      };
    }
    const validIds = new Set((invite.availableTracks || []).map((t) => t.id));
    for (const id of selectedTrackIds) {
      if (!validIds.has(id)) {
        return { success: false, error: "One or more selected tracks are invalid for this invite." };
      }
    }
    targetTrackIds = selectedTrackIds;
  } else if (invite.availableTracks && invite.availableTracks.length > 0) {
    // Default to first track if none selected and not forced
    targetTrackIds = [invite.availableTracks[0].id];
  } else {
    return { success: false, error: "No tracks are available for this invite." };
  }

  try {
    // Check existing enrollments for this user
    const existingEnrollments = await prisma.enrollment.findMany({
      where: {
        userId,
        trackId: { in: targetTrackIds },
      },
      include: { track: { select: { name: true } } },
    });

    if (existingEnrollments.length >= targetTrackIds.length) {
      return {
        success: false,
        alreadyEnrolled: true,
        error: "You're already enrolled in this track.",
      };
    }

    const enrolledIds = new Set(existingEnrollments.map((e) => e.trackId));
    const newTrackIds = targetTrackIds.filter((id) => !enrolledIds.has(id));

    // Execute atomic transaction: create enrollments, increment useCount, mark user onboardingCompleted
    await prisma.$transaction(async (tx) => {
      for (const trackId of newTrackIds) {
        await tx.enrollment.upsert({
          where: {
            userId_trackId: { userId, trackId },
          },
          update: { isActive: true },
          create: {
            userId,
            trackId,
            isActive: true,
          },
        });
      }

      await tx.invite.update({
        where: { code: invite.code },
        data: {
          useCount: { increment: 1 },
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          onboardingCompleted: true,
        },
      });
    });

    const enrolledTrackNames = (invite.availableTracks || [])
      .filter((t) => targetTrackIds.includes(t.id))
      .map((t) => t.name);

    return {
      success: true,
      enrolledTrackNames: enrolledTrackNames.length > 0 ? enrolledTrackNames : [invite.trackName || "Bootcamp Track"],
      bootcampName: invite.bootcampName,
    };
  } catch (_err) {
    // Offline development fallback
    const userSet = mockUserEnrollments[userId] || new Set();
    const alreadyEnrolledAll = targetTrackIds.length > 0 && targetTrackIds.every((id) => userSet.has(id));
    if (userSet.size > 0 && alreadyEnrolledAll) {
      return {
        success: false,
        alreadyEnrolled: true,
        error: "You're already enrolled in this track.",
      };
    }
    targetTrackIds.forEach((id) => userSet.add(id));
    mockUserEnrollments[userId] = userSet;

    const mock = mockInvites.find((i) => i.code === invite.code);
    if (mock) {
      mock.useCount += 1;
    }

    const enrolledTrackNames = (invite.availableTracks || [])
      .filter((t) => targetTrackIds.includes(t.id))
      .map((t) => t.name);

    return {
      success: true,
      enrolledTrackNames: enrolledTrackNames.length > 0 ? enrolledTrackNames : [invite.trackName || "Bootcamp Track"],
      bootcampName: invite.bootcampName,
    };
  }
}

/**
 * Fetch all invites for admin management
 */
export async function getAdminInvites(
  filter: "all" | "active" | "expired" | "inactive" = "all"
): Promise<BootcampInvite[]> {
  try {
    const invites = await prisma.invite.findMany({
      include: {
        bootcamp: { select: { name: true } },
        cohort: { select: { name: true } },
        track: { select: { name: true } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();

    return invites
      .map((inv) => ({
        id: inv.id,
        code: inv.code,
        bootcampId: inv.bootcampId,
        bootcampName: inv.bootcamp.name,
        cohortId: inv.cohortId,
        cohortName: inv.cohort?.name || null,
        trackId: inv.trackId,
        trackName: inv.track?.name || null,
        allowTrackSelection: inv.allowTrackSelection,
        maxTrackSelections: inv.maxTrackSelections,
        createdById: inv.createdById,
        creatorName: `${inv.createdBy.firstName} ${inv.createdBy.lastName}`,
        expiresAt: inv.expiresAt ? inv.expiresAt.toISOString() : null,
        maxUses: inv.maxUses,
        useCount: inv.useCount,
        isActive: inv.isActive,
        createdAt: inv.createdAt.toISOString(),
      }))
      .filter((inv) => {
        if (filter === "active") {
          return inv.isActive && (!inv.expiresAt || new Date(inv.expiresAt) > now);
        }
        if (filter === "expired") {
          return inv.expiresAt ? new Date(inv.expiresAt) <= now : false;
        }
        if (filter === "inactive") {
          return !inv.isActive;
        }
        return true;
      });
  } catch {
    const now = new Date();
    return mockInvites.filter((inv) => {
      if (filter === "active") {
        return inv.isActive && (!inv.expiresAt || new Date(inv.expiresAt) > now);
      }
      if (filter === "expired") {
        return inv.expiresAt ? new Date(inv.expiresAt) <= now : false;
      }
      if (filter === "inactive") {
        return !inv.isActive;
      }
      return true;
    });
  }
}

/**
 * Create a new invite
 */
export async function createAdminInvite(
  data: {
    bootcampId: string;
    cohortId?: string | null;
    trackId?: string | null;
    code?: string | null;
    expiresAt?: string | null;
    maxUses?: number | null;
    allowTrackSelection?: boolean;
    maxTrackSelections?: number | null;
  },
  createdById: string
): Promise<BootcampInvite> {
  const code = (data.code && data.code.trim())
    ? data.code.trim().toUpperCase()
    : generateInviteCode(data.trackId ? "TRK" : "GDG");

  try {
    const created = await prisma.invite.create({
      data: {
        code,
        bootcampId: data.bootcampId,
        cohortId: data.cohortId || null,
        trackId: data.trackId || null,
        allowTrackSelection: data.allowTrackSelection ?? false,
        maxTrackSelections: data.maxTrackSelections || 1,
        createdById,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        maxUses: data.maxUses ?? null,
        isActive: true,
      },
      include: {
        bootcamp: { select: { name: true } },
        cohort: { select: { name: true } },
        track: { select: { name: true } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
    });

    return {
      id: created.id,
      code: created.code,
      bootcampId: created.bootcampId,
      bootcampName: created.bootcamp.name,
      cohortId: created.cohortId,
      cohortName: created.cohort?.name || null,
      trackId: created.trackId,
      trackName: created.track?.name || null,
      allowTrackSelection: created.allowTrackSelection,
      maxTrackSelections: created.maxTrackSelections,
      createdById: created.createdById,
      creatorName: `${created.createdBy.firstName} ${created.createdBy.lastName}`,
      expiresAt: created.expiresAt ? created.expiresAt.toISOString() : null,
      maxUses: created.maxUses,
      useCount: created.useCount,
      isActive: created.isActive,
      createdAt: created.createdAt.toISOString(),
    };
  } catch (_err) {
    // Offline dev fallback
    const newMock: BootcampInvite = {
      id: `inv-${Date.now()}`,
      code,
      bootcampId: data.bootcampId,
      bootcampName: "GDG LASU Bootcamp 2026",
      cohortId: data.cohortId || null,
      cohortName: "Cohort 1 (Alpha)",
      trackId: data.trackId || null,
      trackName: data.trackId ? "Custom Track" : null,
      allowTrackSelection: data.allowTrackSelection ?? false,
      maxTrackSelections: data.maxTrackSelections || 1,
      createdById,
      creatorName: "Chioma Okonkwo",
      expiresAt: data.expiresAt || null,
      maxUses: data.maxUses || null,
      useCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    mockInvites.unshift(newMock);
    return newMock;
  }
}

/**
 * Toggle invite active status
 */
export async function toggleInviteStatus(id: string, isActive: boolean): Promise<boolean> {
  try {
    await prisma.invite.update({
      where: { id },
      data: { isActive },
    });
    return true;
  } catch {
    const found = mockInvites.find((i) => i.id === id);
    if (found) {
      found.isActive = isActive;
      return true;
    }
    return false;
  }
}

/**
 * Delete invite
 */
export async function deleteInviteRecord(id: string): Promise<boolean> {
  try {
    await prisma.invite.delete({
      where: { id },
    });
    return true;
  } catch {
    mockInvites = mockInvites.filter((i) => i.id !== id);
    return true;
  }
}
