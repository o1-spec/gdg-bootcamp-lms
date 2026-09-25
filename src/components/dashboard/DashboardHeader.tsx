'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Menu,
  Search,
  CheckCheck,
  Calendar,
  Award,
  AlertCircle,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Loader2,
  FileText,
  Megaphone,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StudentProfile } from '@/types/lms';
import { DashboardNavTab } from './DashboardSidebar';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  currentTab: DashboardNavTab;
  student: StudentProfile;
  onOpenMobileMenu: () => void;
  onSearchChange?: (term: string) => void;
}

// Notification types → icons + colors
const TYPE_META: Record<string, { icon: React.ElementType; color: string }> = {
  ASSIGNMENT_NEW:      { icon: FileText,   color: 'text-[#4285F4] bg-[#4285F4]/10' },
  ASSIGNMENT_GRADED:  { icon: Award,      color: 'text-[#34A853] bg-[#34A853]/10' },
  SUBMISSION_RECEIVED:{ icon: BookOpen,   color: 'text-[#FBBC04] bg-[#FBBC04]/10' },
  SESSION_NEW:        { icon: Calendar,   color: 'text-[#EA4335] bg-[#EA4335]/10' },
  SESSION_REMINDER:   { icon: Calendar,   color: 'text-[#EA4335] bg-[#EA4335]/10' },
  RESOURCE_NEW:       { icon: FileText,   color: 'text-[#4285F4] bg-[#4285F4]/10' },
  ANNOUNCEMENT_NEW:   { icon: Megaphone,  color: 'text-[#FBBC04] bg-[#FBBC04]/10' },
  ENROLLMENT_CONFIRMED:{ icon: Award,     color: 'text-[#34A853] bg-[#34A853]/10' },
  GENERAL:            { icon: AlertCircle,color: 'text-[#5F6368] bg-[#5F6368]/10' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface ApiNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export function DashboardHeader({
  currentTab,
  student,
  onOpenMobileMenu,
  onSearchChange,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // ── Fetch notifications ──────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      setNotifLoading(true);
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // Silently ignore
    } finally {
      setNotifLoading(false);
    }
  }, []);

  // Fetch on mount + every 60s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Fetch fresh when bell is opened
  const handleBellClick = useCallback(() => {
    const next = !notificationsOpen;
    setNotificationsOpen(next);
    if (next) fetchNotifications();
  }, [notificationsOpen, fetchNotifications]);

  // ── Mark single notification read ────────────────────────────
  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' }).catch(() => null);
  }, []);

  // ── Mark all read ─────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    setUnreadCount(0);
    await fetch('/api/notifications/read-all', { method: 'PATCH' }).catch(() => null);
  }, []);

  // ── Logout ────────────────────────────────────────────────────
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  // ── Click outside ─────────────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Breadcrumb ────────────────────────────────────────────────
  const getBreadcrumbTitle = (tab: DashboardNavTab) => {
    switch (tab) {
      case 'dashboard':     return { page: 'Dashboard',     sub: 'Overview & Learning Roadmap' };
      case 'my-tracks':    return { page: 'My Tracks',      sub: 'Curriculum & Modules' };
      case 'resources':    return { page: 'Resources',      sub: 'Slides, Notes, Code & Repos' };
      case 'assignments':  return { page: 'Assignments',    sub: 'Projects & Coding Challenges' };
      case 'schedule':     return { page: 'Schedule',       sub: 'Live Mentoring & Workshops' };
      case 'progress':     return { page: 'Progress',       sub: 'Curriculum & Attendance Analytics' };
      case 'announcements':return { page: 'Announcements',  sub: 'Official Cohort Updates' };
      default:             return { page: 'Dashboard',      sub: 'Overview' };
    }
  };
  const breadcrumb = getBreadcrumbTitle(currentTab);

  const previewNotifs = notifications.slice(0, 5);

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-[#E5DFD0] bg-[#FAF7EE]/95 px-6 sm:px-8 backdrop-blur-sm">
      {/* Left: Mobile hamburger & bold page heading */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="rounded-full p-2 text-[#0D0E11] hover:bg-[#E5DFD0] lg:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368] hidden sm:inline">
              Bootcamp 3.0
            </span>
            <span className="text-[#5F6368]/40 hidden sm:inline">•</span>
            <h1 className="text-lg sm:text-2xl font-black text-[#0D0E11] tracking-tight">
              {breadcrumb.page}
            </h1>
          </div>
          <span className="text-xs text-[#5F6368] hidden md:inline font-medium">
            {breadcrumb.sub}
          </span>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F6368]" />
          <input
            type="text"
            placeholder="Search lessons, tracks, resources..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onSearchChange?.(e.target.value);
            }}
            className="w-full h-10 rounded-full border border-[#E5DFD0] bg-white pl-10 pr-4 text-xs font-medium text-[#0D0E11] placeholder:text-[#5F6368] focus:border-[#0D0E11] focus:outline-none transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Right: GDG badge, Bell, Avatar */}
      <div className="flex items-center gap-3">
        {/* Google 4-color dots badge */}
        <div className="hidden xl:flex items-center gap-2 rounded-full border border-[#E5DFD0] bg-white px-3 py-1.5 shadow-2xs">
          <div className="flex items-center -space-x-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#4285F4] ring-2 ring-white" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#EA4335] ring-2 ring-white" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FBBC04] ring-2 ring-white" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#34A853] ring-2 ring-white" />
          </div>
          <span className="text-xs font-bold text-[#0D0E11]">GDG LASU</span>
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            id="notifications-bell"
            type="button"
            onClick={handleBellClick}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E5DFD0] bg-white hover:bg-[#F2EDE0] text-[#0D0E11] transition-colors cursor-pointer shadow-2xs"
            aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
          >
            {notifLoading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Bell className="h-4 w-4" />
            }
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EA4335] text-[9px] font-bold text-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-[#E5DFD0] bg-white p-4 shadow-xl z-50 text-[#0D0E11] animate-in fade-in-0 zoom-in-95">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E5DFD0] pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D0E11]">
                    Notifications
                  </h3>
                  <p className="text-[11px] text-[#5F6368] font-medium">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    id="mark-all-read-btn"
                    type="button"
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#4285F4] hover:underline cursor-pointer"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="mt-2.5 space-y-1.5 max-h-72 overflow-y-auto">
                {previewNotifs.length === 0 ? (
                  <div className="py-8 text-center">
                    <Bell className="h-8 w-8 text-[#E5DFD0] mx-auto mb-2" />
                    <p className="text-xs text-[#5F6368] font-medium">No notifications yet</p>
                  </div>
                ) : (
                  previewNotifs.map((n) => {
                    const meta = TYPE_META[n.type] ?? TYPE_META.GENERAL;
                    const Icon = meta.icon;
                    const isUnread = !n.readAt;
                    const handleClick = async () => {
                      if (isUnread) await markRead(n.id);
                      if (n.link) router.push(n.link);
                      setNotificationsOpen(false);
                    };
                    return (
                      <div
                        key={n.id}
                        onClick={handleClick}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
                        className={cn(
                          'flex items-start gap-3 p-2.5 rounded-xl transition-colors cursor-pointer border border-transparent',
                          isUnread ? 'bg-[#FAF7EE] border-[#E5DFD0]' : 'hover:bg-[#FAF7EE]'
                        )}
                      >
                        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', meta.color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className={cn('text-xs truncate', isUnread ? 'font-bold text-[#0D0E11]' : 'font-semibold text-[#0D0E11]')}>
                              {n.title}
                            </p>
                            <span className="text-[10px] text-[#5F6368] font-medium shrink-0">
                              {timeAgo(n.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#5F6368] line-clamp-1 mt-0.5">
                            {n.message}
                          </p>
                        </div>
                        {isUnread && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#4285F4]" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer: view all */}
              {notifications.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#E5DFD0]">
                  <Link
                    id="view-all-notifications-link"
                    href="/notifications"
                    onClick={() => setNotificationsOpen(false)}
                    className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#4285F4] hover:underline"
                  >
                    View all notifications
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Student Avatar & Profile menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 rounded-full border border-[#E5DFD0] bg-white p-1 sm:pr-3 hover:bg-[#F2EDE0] transition-colors cursor-pointer shadow-2xs"
          >
            <Avatar className="h-8 w-8 border border-[#E5DFD0]">
              <AvatarImage src={student.avatar} alt={student.name} />
              <AvatarFallback className="text-xs font-bold bg-[#0D0E11] text-[#FAF7EE]">
                {student.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>

            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-[#0D0E11] leading-tight">
                {student.name}
              </span>
              <span className="text-[10px] font-medium text-[#5F6368] leading-tight">
                Student Innovator
              </span>
            </div>

            <ChevronDown className="h-3.5 w-3.5 text-[#5F6368] hidden sm:inline" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-[#E5DFD0] bg-white p-2 shadow-xl z-50 text-[#0D0E11] animate-in fade-in-0 zoom-in-95">
              <div className="px-3 py-2.5 border-b border-[#E5DFD0]">
                <p className="text-xs font-bold text-[#0D0E11]">
                  {student.name}
                </p>
                <p className="text-[11px] text-[#5F6368] truncate">
                  {student.email}
                </p>
                <span className="mt-1.5 inline-block rounded-full bg-[#0D0E11] text-[#FAF7EE] px-2 py-0.5 text-[9px] font-bold">
                  {student.cohort}
                </span>
              </div>

              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-[#0D0E11] hover:bg-[#FAF7EE] rounded-xl transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-[#4285F4]" />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/tracks"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-[#0D0E11] hover:bg-[#FAF7EE] rounded-xl transition-colors"
                >
                  <Award className="h-3.5 w-3.5 text-[#34A853]" />
                  <span>My Tracks</span>
                </Link>
                <Link
                  href="/notifications"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-[#0D0E11] hover:bg-[#FAF7EE] rounded-xl transition-colors"
                >
                  <Bell className="h-3.5 w-3.5 text-[#FBBC04]" />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto rounded-full bg-[#EA4335] text-white text-[9px] font-bold px-1.5 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-[#0D0E11] hover:bg-[#FAF7EE] rounded-xl transition-colors cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5 text-[#FBBC04]" />
                  <span>Settings</span>
                </button>
              </div>

              <div className="pt-1 border-t border-[#E5DFD0]">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-bold text-[#EA4335] hover:bg-[#EA4335]/10 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <LogOut className="h-3.5 w-3.5" />
                  )}
                  <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
