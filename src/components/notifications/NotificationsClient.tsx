'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  Calendar,
  Award,
  AlertCircle,
  FileText,
  Megaphone,
  BookOpen,
  ArrowLeft,
  Search,
  ExternalLink,
  Check,
  Loader2,
  Inbox,
  Sparkles,
  Filter,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  readAt?: string | null;
  createdAt: string;
}

interface NotificationsClientProps {
  initialNotifications: NotificationItem[];
  userRole?: string;
  userName?: string;
}

// Icon & Color definitions for notification types
const TYPE_META: Record<
  string,
  {
    icon: React.ElementType;
    label: string;
    bgColor: string;
    textColor: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  ASSIGNMENT_NEW: {
    icon: FileText,
    label: 'Assignment',
    bgColor: 'bg-[#4285F4]/10',
    textColor: 'text-[#4285F4]',
    badgeBg: 'bg-[#4285F4]/10',
    badgeText: 'text-[#4285F4]',
  },
  ASSIGNMENT_GRADED: {
    icon: Award,
    label: 'Graded',
    bgColor: 'bg-[#34A853]/10',
    textColor: 'text-[#34A853]',
    badgeBg: 'bg-[#34A853]/10',
    badgeText: 'text-[#34A853]',
  },
  SUBMISSION_RECEIVED: {
    icon: BookOpen,
    label: 'Submission',
    bgColor: 'bg-[#FBBC04]/15',
    textColor: 'text-[#B08800]',
    badgeBg: 'bg-[#FBBC04]/15',
    badgeText: 'text-[#B08800]',
  },
  SESSION_NEW: {
    icon: Calendar,
    label: 'Live Session',
    bgColor: 'bg-[#EA4335]/10',
    textColor: 'text-[#EA4335]',
    badgeBg: 'bg-[#EA4335]/10',
    badgeText: 'text-[#EA4335]',
  },
  SESSION_REMINDER: {
    icon: Calendar,
    label: 'Session Alert',
    bgColor: 'bg-[#EA4335]/10',
    textColor: 'text-[#EA4335]',
    badgeBg: 'bg-[#EA4335]/10',
    badgeText: 'text-[#EA4335]',
  },
  RESOURCE_NEW: {
    icon: FileText,
    label: 'Resource',
    bgColor: 'bg-[#4285F4]/10',
    textColor: 'text-[#4285F4]',
    badgeBg: 'bg-[#4285F4]/10',
    badgeText: 'text-[#4285F4]',
  },
  ANNOUNCEMENT_NEW: {
    icon: Megaphone,
    label: 'Announcement',
    bgColor: 'bg-[#FBBC04]/15',
    textColor: 'text-[#B08800]',
    badgeBg: 'bg-[#FBBC04]/15',
    badgeText: 'text-[#B08800]',
  },
  ENROLLMENT_CONFIRMED: {
    icon: CheckCircle2,
    label: 'Enrolment',
    bgColor: 'bg-[#34A853]/10',
    textColor: 'text-[#34A853]',
    badgeBg: 'bg-[#34A853]/10',
    badgeText: 'text-[#34A853]',
  },
  GENERAL: {
    icon: AlertCircle,
    label: 'Notice',
    bgColor: 'bg-[#5F6368]/10',
    textColor: 'text-[#5F6368]',
    badgeBg: 'bg-[#5F6368]/10',
    badgeText: 'text-[#5F6368]',
  },
};

type CategoryTab = 'all' | 'assignments' | 'sessions' | 'announcements' | 'resources' | 'system';

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

function getDateGroup(dateStr: string): 'Today' | 'Yesterday' | 'Earlier' {
  const date = new Date(dateStr);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'Yesterday';

  return 'Earlier';
}

export function NotificationsClient({
  initialNotifications,
  userRole,
  userName,
}: NotificationsClientProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [selectedTab, setSelectedTab] = useState<CategoryTab>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Unread count
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.readAt).length,
    [notifications]
  );

  // Determine back navigation link based on user role
  const backLink = useMemo(() => {
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') return '/admin';
    if (userRole === 'MENTOR') return '/mentor';
    return '/';
  }, [userRole]);

  // Refresh notifications from API
  const refreshNotifications = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.notifications)) {
        setNotifications(
          data.notifications.map((n: any) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            link: n.link ?? undefined,
            readAt: n.readAt ? new Date(n.readAt).toISOString() : null,
            createdAt: new Date(n.createdAt).toISOString(),
          }))
        );
      }
    } catch {
      // Silently ignore
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;
    setIsMarkingAll(true);

    // Optimistic update
    const prev = notifications;
    setNotifications((curr) =>
      curr.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
    );

    try {
      const res = await fetch('/api/notifications/read-all', { method: 'PATCH' });
      if (!res.ok) throw new Error();
    } catch {
      // Rollback on failure
      setNotifications(prev);
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Mark a single notification as read
  const handleMarkSingleRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Optimistic update
    setNotifications((curr) =>
      curr.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );

    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch {
      // Background failure silently handled
    }
  };

  // Handle card click (mark read + navigate if link exists)
  const handleCardClick = async (notif: NotificationItem) => {
    if (!notif.readAt) {
      handleMarkSingleRead(notif.id);
    }
    if (notif.link) {
      router.push(notif.link);
    }
  };

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // Unread only filter
      if (unreadOnly && notif.readAt) return false;

      // Category tab filter
      if (selectedTab === 'assignments') {
        if (
          notif.type !== 'ASSIGNMENT_NEW' &&
          notif.type !== 'ASSIGNMENT_GRADED' &&
          notif.type !== 'SUBMISSION_RECEIVED'
        )
          return false;
      } else if (selectedTab === 'sessions') {
        if (notif.type !== 'SESSION_NEW' && notif.type !== 'SESSION_REMINDER') return false;
      } else if (selectedTab === 'announcements') {
        if (notif.type !== 'ANNOUNCEMENT_NEW') return false;
      } else if (selectedTab === 'resources') {
        if (notif.type !== 'RESOURCE_NEW') return false;
      } else if (selectedTab === 'system') {
        if (notif.type !== 'ENROLLMENT_CONFIRMED' && notif.type !== 'GENERAL') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches =
          notif.title.toLowerCase().includes(query) ||
          notif.message.toLowerCase().includes(query);
        if (!matches) return false;
      }

      return true;
    });
  }, [notifications, selectedTab, unreadOnly, searchQuery]);

  // Group filtered notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: { [key in 'Today' | 'Yesterday' | 'Earlier']: NotificationItem[] } = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };

    filteredNotifications.forEach((notif) => {
      const group = getDateGroup(notif.createdAt);
      groups[group].push(notif);
    });

    return groups;
  }, [filteredNotifications]);

  // Count per category tab
  const tabCounts = useMemo(() => {
    const counts = {
      all: notifications.length,
      assignments: 0,
      sessions: 0,
      announcements: 0,
      resources: 0,
      system: 0,
    };

    notifications.forEach((n) => {
      if (
        n.type === 'ASSIGNMENT_NEW' ||
        n.type === 'ASSIGNMENT_GRADED' ||
        n.type === 'SUBMISSION_RECEIVED'
      ) {
        counts.assignments++;
      } else if (n.type === 'SESSION_NEW' || n.type === 'SESSION_REMINDER') {
        counts.sessions++;
      } else if (n.type === 'ANNOUNCEMENT_NEW') {
        counts.announcements++;
      } else if (n.type === 'RESOURCE_NEW') {
        counts.resources++;
      } else if (n.type === 'ENROLLMENT_CONFIRMED' || n.type === 'GENERAL') {
        counts.system++;
      }
    });

    return counts;
  }, [notifications]);

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-[#0D0E11] antialiased selection:bg-[#FBBC04]/30">
      {/* Ticker Ribbon */}
      <div className="w-full bg-[#0D0E11] text-[#FAF7EE] py-2 px-6 overflow-hidden border-b border-[#0D0E11]/10">
        <div className="flex items-center justify-between text-xs font-black tracking-wider uppercase whitespace-nowrap">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            <span>BUILD ✦</span>
            <span>INNOVATE ✦</span>
            <span>DESIGN ✦</span>
            <span>SHIP ✦</span>
            <span>LEARN ✦</span>
            <span>CONNECT ✦</span>
            <span>GROW ✦</span>
          </div>
          <span className="hidden lg:inline text-[11px] font-semibold tracking-normal text-[#FAF7EE]/70 pl-4">
            GDG on Campus LASU · In-App Activity & Broadcast Center
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href={backLink}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#5F6368] hover:text-[#0D0E11] transition-colors rounded-xl px-3 py-2 -ml-3 hover:bg-black/5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshNotifications}
              disabled={isRefreshing}
              title="Refresh notifications"
              className="p-2 rounded-xl border border-[#E5DFD0] bg-white text-[#5F6368] hover:text-[#0D0E11] hover:border-[#0D0E11]/30 transition-all shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin text-[#4285F4]')} />
            </button>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={isMarkingAll}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0D0E11] text-[#FAF7EE] hover:bg-[#0D0E11]/85 transition-all shadow-2xs disabled:opacity-50"
              >
                {isMarkingAll ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCheck className="h-3.5 w-3.5 text-[#34A853]" />
                )}
                <span>Mark all as read</span>
              </button>
            )}
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5DFD0] pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#4285F4] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
                Real-Time Activity Feed
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#0D0E11] tracking-tight">
              Notifications
            </h1>
            <p className="text-sm text-[#5F6368] font-medium max-w-xl">
              Stay on top of assignment releases, review evaluations, scheduled cohort sessions, and community broadcasts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-[#E5DFD0] bg-white px-5 py-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#4285F4]/10 flex items-center justify-center text-[#4285F4]">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
                    Unread Alerts
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-[#0D0E11]">{unreadCount}</span>
                    <span className="text-xs text-[#5F6368] font-medium">
                      / {notifications.length} total
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls: Category Tabs & Search Bar */}
        <div className="space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {(
              [
                { id: 'all', label: 'All', count: tabCounts.all },
                { id: 'assignments', label: 'Assignments', count: tabCounts.assignments },
                { id: 'sessions', label: 'Live Sessions', count: tabCounts.sessions },
                { id: 'announcements', label: 'Announcements', count: tabCounts.announcements },
                { id: 'resources', label: 'Resources', count: tabCounts.resources },
                { id: 'system', label: 'System', count: tabCounts.system },
              ] as const
            ).map((tab) => {
              const active = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border',
                    active
                      ? 'bg-[#0D0E11] text-[#FAF7EE] border-[#0D0E11] shadow-2xs'
                      : 'bg-white text-[#5F6368] border-[#E5DFD0] hover:border-[#0D0E11]/30 hover:text-[#0D0E11]'
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full font-black',
                      active ? 'bg-white/20 text-[#FAF7EE]' : 'bg-[#FAF7EE] text-[#5F6368]'
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Controls: Search & Unread Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F6368]" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-[#E5DFD0] bg-white text-[#0D0E11] placeholder:text-[#5F6368]/60 focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setUnreadOnly((prev) => !prev)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border',
                  unreadOnly
                    ? 'bg-[#FBBC04]/20 border-[#FBBC04] text-[#805B00]'
                    : 'bg-white border-[#E5DFD0] text-[#5F6368] hover:text-[#0D0E11]'
                )}
              >
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    unreadOnly ? 'bg-[#FBBC04]' : 'bg-[#E5DFD0]'
                  )}
                />
                <span>Unread only</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="space-y-8">
          {filteredNotifications.length === 0 ? (
            <div className="rounded-3xl border border-[#E5DFD0] bg-white p-12 text-center space-y-4 shadow-2xs">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-[#FAF7EE] flex items-center justify-center border border-[#E5DFD0] text-[#5F6368]">
                <Inbox className="h-8 w-8 text-[#5F6368]/70" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-black text-[#0D0E11]">No notifications to display</h3>
                <p className="text-xs text-[#5F6368] font-medium leading-relaxed">
                  {unreadOnly
                    ? "You're all caught up! You don't have any unread notifications right now."
                    : searchQuery
                    ? 'No notifications match your search query. Try searching for something else.'
                    : 'When you receive assignments, session reminders, or announcements, they will appear here.'}
                </p>
              </div>
              {(unreadOnly || searchQuery || selectedTab !== 'all') && (
                <button
                  onClick={() => {
                    setUnreadOnly(false);
                    setSearchQuery('');
                    setSelectedTab('all');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#FAF7EE] text-[#0D0E11] border border-[#E5DFD0] hover:bg-[#E5DFD0]/40 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#FBBC04]" />
                  <span>Reset filters</span>
                </button>
              )}
            </div>
          ) : (
            (['Today', 'Yesterday', 'Earlier'] as const).map((groupName) => {
              const items = groupedNotifications[groupName];
              if (items.length === 0) return null;

              return (
                <div key={groupName} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black uppercase tracking-wider text-[#5F6368]">
                      {groupName}
                    </span>
                    <div className="h-[1px] flex-1 bg-[#E5DFD0]" />
                    <span className="text-[10px] font-bold text-[#5F6368]">
                      {items.length} {items.length === 1 ? 'alert' : 'alerts'}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {items.map((notif) => {
                      const isUnread = !notif.readAt;
                      const meta = TYPE_META[notif.type] || TYPE_META.GENERAL;
                      const Icon = meta.icon;

                      return (
                        <div
                          key={notif.id}
                          onClick={() => handleCardClick(notif)}
                          className={cn(
                            'group relative rounded-2xl border transition-all duration-200 cursor-pointer p-4 sm:p-5 flex items-start gap-4 shadow-2xs',
                            isUnread
                              ? 'bg-white border-[#4285F4]/30 hover:border-[#4285F4] shadow-sm'
                              : 'bg-white/70 hover:bg-white border-[#E5DFD0] hover:border-[#0D0E11]/30 opacity-90 hover:opacity-100'
                          )}
                        >
                          {/* Unread Accent Indicator */}
                          {isUnread && (
                            <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
                              <span className="flex h-2.5 w-2.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4285F4] opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4285F4]" />
                              </span>
                            </div>
                          )}

                          {/* Icon Circle */}
                          <div
                            className={cn(
                              'h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
                              meta.bgColor,
                              meta.textColor
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          {/* Body Content */}
                          <div className="flex-1 min-w-0 pr-6 sm:pr-8 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={cn(
                                  'text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md',
                                  meta.badgeBg,
                                  meta.badgeText
                                )}
                              >
                                {meta.label}
                              </span>
                              <span className="text-xs text-[#5F6368] font-semibold">
                                • {timeAgo(notif.createdAt)}
                              </span>
                            </div>

                            <h4
                              className={cn(
                                'text-sm sm:text-base font-bold text-[#0D0E11] leading-snug group-hover:text-[#4285F4] transition-colors',
                                isUnread && 'font-black'
                              )}
                            >
                              {notif.title}
                            </h4>

                            <p className="text-xs sm:text-sm text-[#5F6368] font-normal leading-relaxed">
                              {notif.message}
                            </p>

                            {/* Actions / Link Bar */}
                            <div className="flex items-center gap-3 pt-2">
                              {notif.link && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4285F4] group-hover:underline">
                                  <span>View details</span>
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </span>
                              )}

                              {isUnread && (
                                <button
                                  onClick={(e) => handleMarkSingleRead(notif.id, e)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5F6368] hover:text-[#0D0E11] transition-colors px-2 py-0.5 rounded-md hover:bg-black/5"
                                >
                                  <Check className="h-3 w-3 text-[#34A853]" />
                                  <span>Mark read</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
