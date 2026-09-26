import prisma from "@/lib/prisma";
import { BootcampInvite, InviteValidationResult } from "@/types/lms";

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
  } catch (error) {
    console.error("[Invites] Error validating invite code:", error);
    return { valid: false, error: "Failed to validate invite code. Please try again." };
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

  // One student has only one track
  targetTrackIds = targetTrackIds.slice(0, 1);

  try {
    // Check if student already has any active track enrollment
    const existingActiveEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: { track: { select: { name: true } } },
    });

    if (existingActiveEnrollment) {
      return {
        success: false,
        alreadyEnrolled: true,
        error: `You are already enrolled in ${existingActiveEnrollment.track.name}. Each student can only be enrolled in one track.`,
      };
    }

    const newTrackIds = targetTrackIds;

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
  } catch (error) {
    console.error("[Invites] Error processing enrollment:", error);
    return { success: false, error: "Failed to process enrollment. Please try again." };
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
  } catch (error) {
    console.error("[Invites] Error fetching admin invites:", error);
    return [];
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
  } catch (error) {
    console.error("[Invites] Error toggling invite status:", error);
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
  } catch (error) {
    console.error("[Invites] Error deleting invite record:", error);
    return false;
  }
}
