import {
  LayoutDashboard,
  Layers,
  BookOpen,
  FolderGit2,
  FileCheck,
  CalendarDays,
  UserCheck,
  TrendingUp,
  Megaphone,
  Users,
  Award,
  CalendarRange,
  Ticket,
  ShieldCheck,
  Send,
} from "lucide-react";

export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: "pendingAssignments" | "liveClasses" | "pendingSubmissions" | "assignedTracks" | "activeBootcamps" | "totalStudents";
  badgeVariant?: "accent" | "danger" | "success";
}

export interface NavSectionConfig {
  title: string;
  items: NavItemConfig[];
}

export const STUDENT_NAV_SECTIONS: NavSectionConfig[] = [
  {
    title: "LEARN",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { id: "tracks", label: "My Tracks", href: "/tracks", icon: Layers },
      { id: "resources", label: "Resources", href: "/resources", icon: FolderGit2 },
      {
        id: "assignments",
        label: "Assignments",
        href: "/assignments",
        icon: FileCheck,
        badgeKey: "pendingAssignments",
        badgeVariant: "accent",
      },
    ],
  },
  {
    title: "BOOTCAMP",
    items: [
      {
        id: "schedule",
        label: "Schedule",
        href: "/schedule",
        icon: CalendarDays,
        badgeKey: "liveClasses",
        badgeVariant: "danger",
      },
      { id: "attendance", label: "Attendance", href: "/attendance", icon: UserCheck },
      { id: "progress", label: "Progress", href: "/progress", icon: TrendingUp },
      { id: "announcements", label: "Announcements", href: "/announcements", icon: Megaphone },
    ],
  },
];

export const MENTOR_NAV_SECTIONS: NavSectionConfig[] = [
  {
    title: "TEACHING",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/mentor/dashboard", icon: LayoutDashboard },
      {
        id: "tracks",
        label: "Assigned Tracks",
        href: "/mentor/tracks",
        icon: Layers,
        badgeKey: "assignedTracks",
      },
      { id: "resources", label: "Resources", href: "/mentor/resources", icon: FolderGit2 },
      { id: "assignments", label: "Assignments", href: "/mentor/assignments", icon: FileCheck },
      {
        id: "submissions",
        label: "Submissions",
        href: "/mentor/submissions",
        icon: Send,
        badgeKey: "pendingSubmissions",
        badgeVariant: "accent",
      },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { id: "schedule", label: "Live Schedule", href: "/mentor/schedule", icon: CalendarDays },
      { id: "attendance", label: "Attendance", href: "/mentor/attendance", icon: UserCheck },
      { id: "announcements", label: "Announcements", href: "/mentor/announcements", icon: Megaphone },
    ],
  },
];

export const ADMIN_NAV_SECTIONS: NavSectionConfig[] = [
  {
    title: "OVERVIEW",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "PROGRAM STRUCTURE",
    items: [
      { id: "bootcamps", label: "Bootcamps", href: "/admin/bootcamps", icon: Award },
      { id: "cohorts", label: "Cohorts", href: "/admin/cohorts", icon: CalendarRange },
      { id: "tracks", label: "Tracks", href: "/admin/tracks", icon: Layers },
    ],
  },
  {
    title: "PEOPLE & ACCESS",
    items: [
      { id: "users", label: "Users & Roles", href: "/admin/users", icon: Users },
      { id: "enrollments", label: "Enrollments", href: "/admin/enrollments", icon: BookOpen },
      { id: "invites", label: "Invites", href: "/admin/invites", icon: Ticket },
      { id: "mentors", label: "Mentor Assignments", href: "/admin/mentors", icon: ShieldCheck },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { id: "sessions", label: "Sessions", href: "/admin/sessions", icon: CalendarDays },
      { id: "announcements", label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    ],
  },
];
