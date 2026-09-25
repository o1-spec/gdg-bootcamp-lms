/**
 * Notification helpers - server-side only
 * Creates, retrieves, and marks notifications for the LMS in-app notification system.
 */

import prisma from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  /** Optional deduplication key — skips insert if (userId, eventKey) already exists */
  eventKey?: string;
}

// ─────────────────────────────────────────────────────────────
// Core primitives
// ─────────────────────────────────────────────────────────────

/** Map NotificationType to user preference key. Returns null for non-optional system notifications. */
export function getNotificationPreferenceKey(type: NotificationType): string | null {
  switch (type) {
    case NotificationType.ASSIGNMENT_NEW:
    case NotificationType.SUBMISSION_RECEIVED:
      return "assignments";
    case NotificationType.ASSIGNMENT_GRADED:
      return "feedback";
    case NotificationType.SESSION_NEW:
    case NotificationType.SESSION_REMINDER:
      return "sessions";
    case NotificationType.RESOURCE_NEW:
      return "resources";
    case NotificationType.ANNOUNCEMENT_NEW:
      return "announcements";
    default:
      return null; // Critical system & security notifications always deliver
  }
}

/**
 * Create a single notification for one user.
 * Checks user notification preferences for optional categories.
 * Safe to call anywhere on the server — silently swallows DB errors.
 */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  try {
    const prefKey = getNotificationPreferenceKey(input.type);
    if (prefKey) {
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
        select: { notificationPreferences: true },
      });
      const prefs = user?.notificationPreferences as Record<string, boolean> | null;
      if (prefs && prefs[prefKey] === false) {
        // User opted out of this optional notification category
        return;
      }
    }

    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link ?? null,
        eventKey: input.eventKey ?? null,
      },
    });
  } catch (err: unknown) {
    // Unique constraint violation = duplicate eventKey — silently ignore
    const code = (err as { code?: string })?.code;
    if (code !== "P2002") {
      console.warn("[notifications] createNotification failed:", err);
    }
  }
}

/**
 * Create notifications for multiple users at once (fan-out).
 * Filters recipients by notification preferences in a single batch query.
 * Fires all creates in parallel; individual failures are swallowed.
 */
export async function createNotificationsForUsers(
  userIds: string[],
  base: Omit<CreateNotificationInput, "userId">
): Promise<void> {
  if (!userIds.length) return;

  const prefKey = getNotificationPreferenceKey(base.type);
  let recipientIds = userIds;

  if (prefKey) {
    try {
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, notificationPreferences: true },
      });
      recipientIds = users
        .filter((u) => {
          const prefs = u.notificationPreferences as Record<string, boolean> | null;
          return prefs?.[prefKey] !== false;
        })
        .map((u) => u.id);
    } catch {
      // Fallback to sending to all userIds if query fails
      recipientIds = userIds;
    }
  }

  if (!recipientIds.length) return;

  await Promise.allSettled(
    recipientIds.map((userId) =>
      createNotification({
        ...base,
        userId,
        eventKey: base.eventKey ? `${base.eventKey}:${userId}` : undefined,
      })
    )
  );
}

// ─────────────────────────────────────────────────────────────
// Track-scoped helpers
// ─────────────────────────────────────────────────────────────

/** Notify all active students enrolled in a track */
export async function notifyTrackStudents(
  trackId: string,
  base: Omit<CreateNotificationInput, "userId">
): Promise<void> {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { trackId, isActive: true },
      select: { userId: true },
    });
    const ids = enrollments.map((e) => e.userId);
    await createNotificationsForUsers(ids, base);
  } catch (err) {
    console.warn("[notifications] notifyTrackStudents failed:", err);
  }
}

/** Notify all mentors assigned to a track */
export async function notifyTrackMentors(
  trackId: string,
  base: Omit<CreateNotificationInput, "userId">
): Promise<void> {
  try {
    const assignments = await prisma.mentorAssignment.findMany({
      where: { trackId },
      select: { mentorId: true },
    });
    const ids = assignments.map((a) => a.mentorId);
    await createNotificationsForUsers(ids, base);
  } catch (err) {
    console.warn("[notifications] notifyTrackMentors failed:", err);
  }
}

// ─────────────────────────────────────────────────────────────
// Query helpers (used by API routes)
// ─────────────────────────────────────────────────────────────

export async function getNotificationsForUser(userId: string, limit = 50) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCountForUser(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}

export async function markNotificationRead(id: string, userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { id, userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
