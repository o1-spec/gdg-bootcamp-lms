import React from "react";
import { SubmissionStatus, AttendanceStatus, AnnouncementPriority, Role } from "@prisma/client";
import { SUBMISSION_STATUS_CONFIG, ATTENDANCE_STATUS_CONFIG, ANNOUNCEMENT_PRIORITY_CONFIG } from "@/constants/status";
import { ROLE_LABELS, ROLE_COLORS } from "@/constants/roles";
import { cn } from "@/lib/utils";

type BadgeType =
  | { type: "submission"; status: SubmissionStatus }
  | { type: "attendance"; status: AttendanceStatus }
  | { type: "priority"; priority: AnnouncementPriority }
  | { type: "role"; role: Role };

interface StatusBadgeProps {
  config: BadgeType;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ config, className, size = "sm" }: StatusBadgeProps) {
  let label = "";
  let bg = "bg-white/10";
  let text = "text-[#FAF7EE]/70";
  let border = "border-white/20";

  if (config.type === "submission") {
    const item = SUBMISSION_STATUS_CONFIG[config.status];
    if (item) {
      label = item.label;
      bg = item.bg;
      text = item.text;
      border = item.border;
    }
  } else if (config.type === "attendance") {
    const item = ATTENDANCE_STATUS_CONFIG[config.status];
    if (item) {
      label = item.label;
      bg = item.bg;
      text = item.text;
      border = item.border;
    }
  } else if (config.type === "priority") {
    const item = ANNOUNCEMENT_PRIORITY_CONFIG[config.priority];
    if (item) {
      label = item.label;
      bg = item.bg;
      text = item.text;
      border = item.border;
    }
  } else if (config.type === "role") {
    const color = ROLE_COLORS[config.role];
    label = ROLE_LABELS[config.role] || config.role;
    if (color) {
      bg = color.bg;
      text = color.text;
      border = color.border;
    }
  }

  const sizeClasses = size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-bold border",
        sizeClasses,
        bg,
        text,
        border,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
