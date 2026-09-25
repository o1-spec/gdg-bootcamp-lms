import { z } from "zod";

/**
 * Onboarding Profile Setup Validation Schema
 */
export const profileSetupSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters"),
  displayName: z
    .string()
    .trim()
    .max(60, "Display name cannot exceed 60 characters")
    .optional()
    .or(z.literal("")),
  avatarUrl: z
    .string()
    .trim()
    .url("Please enter a valid avatar image URL")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(500, "Bio cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  githubUrl: z
    .string()
    .trim()
    .url("Please enter a valid GitHub profile URL (e.g. https://github.com/username)")
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .trim()
    .url("Please enter a valid LinkedIn profile URL (e.g. https://linkedin.com/in/username)")
    .optional()
    .or(z.literal("")),
});

export type ProfileSetupFormData = z.infer<typeof profileSetupSchema>;

/**
 * Join Bootcamp with Invite Code Schema
 */
export const joinBootcampSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Invite code must be at least 3 characters")
    .max(30, "Invite code is too long")
    .regex(/^[A-Za-z0-9_-]+$/, "Invite code can only contain letters, numbers, hyphens, and underscores"),
  trackIds: z.array(z.string().min(1)).optional(),
});

export type JoinBootcampFormData = z.infer<typeof joinBootcampSchema>;

/**
 * Admin Create Invite Schema
 */
export const createInviteSchema = z.object({
  bootcampId: z.string().min(1, "Bootcamp is required"),
  cohortId: z.string().optional().or(z.literal("")),
  trackId: z.string().optional().or(z.literal("")),
  code: z
    .string()
    .trim()
    .min(3, "Invite code must be at least 3 characters")
    .max(30, "Invite code is too long")
    .regex(/^[A-Za-z0-9_-]+$/, "Code can only contain alphanumeric characters, hyphens, or underscores")
    .optional()
    .or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
  maxUses: z
    .union([z.number().int().positive(), z.string().transform((v) => (v ? parseInt(v, 10) : undefined))])
    .optional(),
  allowTrackSelection: z.boolean().default(false),
  maxTrackSelections: z
    .union([z.number().int().positive(), z.string().transform((v) => (v ? parseInt(v, 10) : undefined))])
    .optional(),
});

export type CreateInviteFormData = z.infer<typeof createInviteSchema>;
