import { z } from "zod";

const urlOrEmpty = z
  .string()
  .trim()
  .refine((val) => !val || /^https?:\/\//i.test(val), {
    message: "Must be a valid URL starting with http:// or https://",
  });

export const profileSettingsSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50, "First name is too long"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Last name is too long"),
  displayName: z.string().trim().max(50, "Display name cannot exceed 50 characters").optional().or(z.literal("")),
  bio: z.string().trim().max(500, "Bio cannot exceed 500 characters").optional().or(z.literal("")),
  githubUrl: urlOrEmpty.optional().or(z.literal("")),
  linkedinUrl: urlOrEmpty.optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters").max(100, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password cannot be the same as your current password",
    path: ["newPassword"],
  });

export const changeEmailSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required to verify identity"),
  newEmail: z.string().trim().email("Please provide a valid email address").toLowerCase(),
});

export const preferencesSchema = z.object({
  assignments: z.boolean().default(true),
  sessions: z.boolean().default(true),
  resources: z.boolean().default(true),
  announcements: z.boolean().default(true),
  feedback: z.boolean().default(true),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
export type PreferencesInput = z.infer<typeof preferencesSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
