import { Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  [Role.STUDENT]: "Student",
  [Role.MENTOR]: "Mentor / Tutor",
  [Role.ADMIN]: "Admin",
  [Role.SUPER_ADMIN]: "Super Admin",
};

export const ROLE_COLORS: Record<Role, { bg: string; text: string; border: string }> = {
  [Role.STUDENT]: {
    bg: "bg-gdg-blue/10",
    text: "text-gdg-blue",
    border: "border-gdg-blue/30",
  },
  [Role.MENTOR]: {
    bg: "bg-gdg-green/10",
    text: "text-gdg-green",
    border: "border-gdg-green/30",
  },
  [Role.ADMIN]: {
    bg: "bg-gdg-yellow/10",
    text: "text-gdg-yellow",
    border: "border-gdg-yellow/30",
  },
  [Role.SUPER_ADMIN]: {
    bg: "bg-gdg-red/10",
    text: "text-gdg-red",
    border: "border-gdg-red/30",
  },
};
