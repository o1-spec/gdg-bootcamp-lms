import { Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  [Role.STUDENT]: "Student",
  [Role.MENTOR]: "Mentor / Tutor",
  [Role.ADMIN]: "Admin",
  [Role.SUPER_ADMIN]: "Super Admin",
};

export const ROLE_COLORS: Record<Role, { bg: string; text: string; border: string }> = {
  [Role.STUDENT]: {
    bg: "bg-[#4285F4]/10",
    text: "text-[#4285F4]",
    border: "border-[#4285F4]/30",
  },
  [Role.MENTOR]: {
    bg: "bg-[#34A853]/10",
    text: "text-[#34A853]",
    border: "border-[#34A853]/30",
  },
  [Role.ADMIN]: {
    bg: "bg-[#FBBC04]/10",
    text: "text-[#FBBC04]",
    border: "border-[#FBBC04]/30",
  },
  [Role.SUPER_ADMIN]: {
    bg: "bg-[#EA4335]/10",
    text: "text-[#EA4335]",
    border: "border-[#EA4335]/30",
  },
};
