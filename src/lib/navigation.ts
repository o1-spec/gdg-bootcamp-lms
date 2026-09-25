import { Role } from "@prisma/client";
import {
  LayoutDashboard,
  Layers,
  FolderGit2,
  FileCheck,
  CalendarDays,
  TrendingUp,
  UserCheck,
  Megaphone,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badgeKey?: "enrolledTracks" | "pendingAssignments" | "liveClasses" | "attendanceRate";
  roles: Role[];
}

export const ALL_NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    roles: [Role.STUDENT, Role.MENTOR, Role.ADMIN, Role.SUPER_ADMIN],
  },
  {
    id: "my-tracks",
    label: "My Tracks",
    icon: Layers,
    href: "/tracks",
    badgeKey: "enrolledTracks",
    roles: [Role.STUDENT, Role.MENTOR, Role.ADMIN, Role.SUPER_ADMIN],
  },
  {
    id: "resources",
    label: "Resources",
    icon: FolderGit2,
    href: "/resources",
    roles: [Role.STUDENT, Role.MENTOR, Role.ADMIN, Role.SUPER_ADMIN],
  },
  {
    id: "assignments",
    label: "Assignments",
    icon: FileCheck,
    href: "/assignments",
    badgeKey: "pendingAssignments",
    roles: [Role.STUDENT, Role.MENTOR, Role.ADMIN, Role.SUPER_ADMIN],
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: CalendarDays,
    href: "/schedule",
    badgeKey: "liveClasses",
    roles: [Role.STUDENT, Role.MENTOR, Role.ADMIN, Role.SUPER_ADMIN],
  },
  {
    id: "progress",
    label: "Progress",
    icon: TrendingUp,
    href: "/progress",
    roles: [Role.STUDENT],
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: UserCheck,
    href: "/attendance",
    badgeKey: "attendanceRate",
    roles: [Role.STUDENT, Role.MENTOR, Role.ADMIN, Role.SUPER_ADMIN],
  },
  {
    id: "announcements",
    label: "Announcements",
    icon: Megaphone,
    href: "/announcements",
    roles: [Role.STUDENT, Role.MENTOR, Role.ADMIN, Role.SUPER_ADMIN],
  },
];

/**
 * Returns role-appropriate navigation items based on the user's role.
 */
export function getNavigationForRole(role: Role): NavItem[] {
  return ALL_NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export function isStudent(role: Role): boolean {
  return role === Role.STUDENT;
}

export function isMentor(role: Role): boolean {
  return role === Role.MENTOR;
}

export function isAdmin(role: Role): boolean {
  return role === Role.ADMIN || role === Role.SUPER_ADMIN;
}
