import { z } from "zod";
import { Role, SessionMode, AnnouncementPriority } from "@prisma/client";

export const bootcampSchema = z.object({
  name: z.string().trim().min(3, "Bootcamp name must be at least 3 characters").max(150),
  description: z.string().trim().optional().or(z.literal("")),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const updateBootcampSchema = bootcampSchema.partial();

export const cohortSchema = z.object({
  bootcampId: z.string().min(1, "Bootcamp is required"),
  name: z.string().trim().min(3, "Cohort name must be at least 3 characters").max(150),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const updateCohortSchema = cohortSchema.partial();

export const trackAdminSchema = z.object({
  cohortId: z.string().min(1, "Cohort is required"),
  name: z.string().trim().min(3, "Track name must be at least 3 characters").max(150),
  slug: z.string().trim().min(2, "Slug must be at least 2 characters").max(100),
  description: z.string().trim().optional().or(z.literal("")),
  accent: z.string().trim().optional().or(z.literal("")),
});

export const updateTrackAdminSchema = trackAdminSchema.partial();

export const createUserSchema = z.object({
  firstName: z.string().trim().min(2, "First name must be at least 2 characters"),
  lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),
  email: z.string().trim().email("Please provide a valid email address").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(Role).default(Role.STUDENT),
});

export const updateUserSchema = z.object({
  firstName: z.string().trim().min(2).optional(),
  lastName: z.string().trim().min(2).optional(),
  role: z.nativeEnum(Role).optional(),
  avatarUrl: z.string().trim().url().optional().or(z.literal("")).nullable(),
});

export const enrollmentSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  trackId: z.string().min(1, "Track is required"),
});

export const bulkEnrollmentSchema = z.object({
  trackId: z.string().min(1, "Track is required"),
  studentIds: z.array(z.string().min(1)).min(1, "Please select at least one student"),
});

export const updateEnrollmentSchema = z.object({
  isActive: z.boolean(),
});

export const mentorAssignmentSchema = z.object({
  mentorId: z.string().min(1, "Mentor is required"),
  trackId: z.string().min(1, "Track is required"),
});

export const platformAnnouncementSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(180),
  content: z.string().trim().min(10, "Content must be at least 10 characters"),
  priority: z.nativeEnum(AnnouncementPriority).default(AnnouncementPriority.NORMAL),
  trackId: z.string().optional().or(z.literal("")).nullable(),
});

export const adminSessionSchema = z.object({
  trackId: z.string().min(1, "Track is required"),
  mentorId: z.string().optional().or(z.literal("")).nullable(),
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  mode: z.nativeEnum(SessionMode).default(SessionMode.VIRTUAL),
  meetingUrl: z.string().trim().url().optional().or(z.literal("")),
  location: z.string().trim().max(250).optional().or(z.literal("")),
  recordingUrl: z.string().trim().url().optional().or(z.literal("")),
});

export const updateAdminSessionSchema = adminSessionSchema.partial();
