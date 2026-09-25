import { SubmissionStatus, AttendanceStatus, AnnouncementPriority, SessionMode } from "@prisma/client";

export const SUBMISSION_STATUS_CONFIG: Record<
  SubmissionStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  [SubmissionStatus.DRAFT]: {
    label: "Draft",
    bg: "bg-white/10",
    text: "text-gdg-cream/70",
    border: "border-white/20",
  },
  [SubmissionStatus.SUBMITTED]: {
    label: "Submitted",
    bg: "bg-gdg-yellow/10",
    text: "text-gdg-yellow",
    border: "border-gdg-yellow/30",
  },
  [SubmissionStatus.REVIEWED]: {
    label: "Reviewed",
    bg: "bg-gdg-green/10",
    text: "text-gdg-green",
    border: "border-gdg-green/30",
  },
};

export const ATTENDANCE_STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  [AttendanceStatus.PRESENT]: {
    label: "Present",
    bg: "bg-gdg-green/10",
    text: "text-gdg-green",
    border: "border-gdg-green/30",
  },
  [AttendanceStatus.ABSENT]: {
    label: "Absent",
    bg: "bg-gdg-red/10",
    text: "text-gdg-red",
    border: "border-gdg-red/30",
  },
  [AttendanceStatus.EXCUSED]: {
    label: "Excused",
    bg: "bg-gdg-yellow/10",
    text: "text-gdg-yellow",
    border: "border-gdg-yellow/30",
  },
};

export const ANNOUNCEMENT_PRIORITY_CONFIG: Record<
  AnnouncementPriority,
  { label: string; bg: string; text: string; border: string }
> = {
  [AnnouncementPriority.NORMAL]: {
    label: "Normal",
    bg: "bg-white/10",
    text: "text-gdg-cream/70",
    border: "border-white/20",
  },
  [AnnouncementPriority.REMINDER]: {
    label: "Reminder",
    bg: "bg-gdg-blue/10",
    text: "text-gdg-blue",
    border: "border-gdg-blue/30",
  },
  [AnnouncementPriority.IMPORTANT]: {
    label: "Important",
    bg: "bg-gdg-yellow/10",
    text: "text-gdg-yellow",
    border: "border-gdg-yellow/30",
  },
  [AnnouncementPriority.URGENT]: {
    label: "Urgent",
    bg: "bg-gdg-red/10",
    text: "text-gdg-red",
    border: "border-gdg-red/30",
  },
};

export const SESSION_MODE_LABELS: Record<SessionMode, string> = {
  [SessionMode.VIRTUAL]: "Virtual",
  [SessionMode.PHYSICAL]: "Physical",
  [SessionMode.HYBRID]: "Hybrid",
};
