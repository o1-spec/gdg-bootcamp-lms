import { SubmissionStatus, AttendanceStatus, AnnouncementPriority, SessionMode } from "@prisma/client";

export const SUBMISSION_STATUS_CONFIG: Record<
  SubmissionStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  [SubmissionStatus.DRAFT]: {
    label: "Draft",
    bg: "bg-white/10",
    text: "text-[#FAF7EE]/70",
    border: "border-white/20",
  },
  [SubmissionStatus.SUBMITTED]: {
    label: "Submitted",
    bg: "bg-[#FBBC04]/10",
    text: "text-[#FBBC04]",
    border: "border-[#FBBC04]/30",
  },
  [SubmissionStatus.REVIEWED]: {
    label: "Reviewed",
    bg: "bg-[#34A853]/10",
    text: "text-[#34A853]",
    border: "border-[#34A853]/30",
  },
};

export const ATTENDANCE_STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  [AttendanceStatus.PRESENT]: {
    label: "Present",
    bg: "bg-[#34A853]/10",
    text: "text-[#34A853]",
    border: "border-[#34A853]/30",
  },
  [AttendanceStatus.ABSENT]: {
    label: "Absent",
    bg: "bg-[#EA4335]/10",
    text: "text-[#EA4335]",
    border: "border-[#EA4335]/30",
  },
  [AttendanceStatus.EXCUSED]: {
    label: "Excused",
    bg: "bg-[#FBBC04]/10",
    text: "text-[#FBBC04]",
    border: "border-[#FBBC04]/30",
  },
};

export const ANNOUNCEMENT_PRIORITY_CONFIG: Record<
  AnnouncementPriority,
  { label: string; bg: string; text: string; border: string }
> = {
  [AnnouncementPriority.NORMAL]: {
    label: "Normal",
    bg: "bg-white/10",
    text: "text-[#FAF7EE]/70",
    border: "border-white/20",
  },
  [AnnouncementPriority.REMINDER]: {
    label: "Reminder",
    bg: "bg-[#4285F4]/10",
    text: "text-[#4285F4]",
    border: "border-[#4285F4]/30",
  },
  [AnnouncementPriority.IMPORTANT]: {
    label: "Important",
    bg: "bg-[#FBBC04]/10",
    text: "text-[#FBBC04]",
    border: "border-[#FBBC04]/30",
  },
  [AnnouncementPriority.URGENT]: {
    label: "Urgent",
    bg: "bg-[#EA4335]/10",
    text: "text-[#EA4335]",
    border: "border-[#EA4335]/30",
  },
};

export const SESSION_MODE_LABELS: Record<SessionMode, string> = {
  [SessionMode.VIRTUAL]: "Virtual",
  [SessionMode.PHYSICAL]: "Physical",
  [SessionMode.HYBRID]: "Hybrid",
};
