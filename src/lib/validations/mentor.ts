import { z } from "zod";
import { ResourceType, AssignmentType, SessionMode, AnnouncementPriority, AttendanceStatus } from "@prisma/client";

export const moduleSchema = z.object({
  trackId: z.string().min(1, "Track is required"),
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(120),
  slug: z.string().trim().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and dashes"),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  order: z.coerce.number().int().min(1, "Order must be 1 or higher"),
});

export const updateModuleSchema = moduleSchema.partial();

export const lessonSchema = z.object({
  moduleId: z.string().min(1, "Module is required"),
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(150),
  slug: z.string().trim().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and dashes"),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  content: z.string().trim().optional().or(z.literal("")),
  durationMinutes: z.coerce.number().int().min(5).max(480).default(45),
  order: z.coerce.number().int().min(1, "Order must be 1 or higher"),
  isPublished: z.boolean().default(false),
});

export const updateLessonSchema = lessonSchema.partial();

export const resourceSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(150),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  type: z.nativeEnum(ResourceType),
  url: z.string().trim().url("Must be a valid URL"),
  moduleId: z.string().min(1, "Module is required"),
  lessonId: z.string().optional().or(z.literal("")).nullable(),
  isRequired: z.boolean().default(false),
});

export const updateResourceSchema = resourceSchema.partial();

export const assignmentSchema = z.object({
  trackId: z.string().min(1, "Track is required"),
  moduleId: z.string().optional().or(z.literal("")).nullable(),
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(180),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  instructions: z.string().trim().optional().or(z.literal("")),
  type: z.nativeEnum(AssignmentType).default(AssignmentType.PROJECT),
  dueDate: z.string().min(1, "Due date is required"),
  points: z.coerce.number().int().min(1).max(500).default(100),
});

export const updateAssignmentSchema = assignmentSchema.partial();

export const reviewSubmissionSchema = z.object({
  score: z.coerce.number().int().min(0, "Score cannot be negative").max(100, "Maximum score is 100"),
  feedback: z.string().trim().min(3, "Please provide constructive feedback").max(3000),
});

export const sessionSchema = z.object({
  trackId: z.string().min(1, "Track is required"),
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

export const updateSessionSchema = sessionSchema.partial();

export const markAttendanceSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  records: z.array(
    z.object({
      studentId: z.string().min(1),
      status: z.nativeEnum(AttendanceStatus),
      notes: z.string().trim().max(500).optional(),
    })
  ).min(1, "At least one student record is required"),
});

export const announcementSchema = z.object({
  trackId: z.string().optional().or(z.literal("")).nullable(),
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  content: z.string().trim().min(10, "Content must be at least 10 characters"),
  priority: z.nativeEnum(AnnouncementPriority).default(AnnouncementPriority.NORMAL),
});
