'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  FolderGit2,
  FileCheck,
  CalendarDays,
  TrendingUp,
  UserCheck,
  Megaphone,
  X,
  ExternalLink,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StudentProfile, Track } from '@/types/lms';
import { cn } from '@/lib/utils';

export type DashboardNavTab =
  | 'dashboard'
  | 'my-tracks'
  | 'resources'
  | 'assignments'
  | 'schedule'
  | 'progress'
  | 'attendance'
  | 'announcements';

interface DashboardSidebarProps {
  currentTab?: DashboardNavTab;
  onSelectTab?: (tab: DashboardNavTab) => void;
  student: StudentProfile;
  enrolledTracks: Track[];
  isMobileOpen: boolean;
  onMobileClose: () => void;
  pendingAssignmentsCount?: number;
  liveClassesCount?: number;
}

export function DashboardSidebar({
  currentTab,
  onSelectTab,
  student,
  enrolledTracks,
  isMobileOpen,
  onMobileClose,
  pendingAssignmentsCount = 3,
  liveClassesCount = 1,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  // Determine active tab based on route if on separate pages
  const activeTab: DashboardNavTab =
    pathname === '/resources' || pathname.startsWith('/resources/')
      ? 'resources'
      : pathname === '/assignments' || pathname.startsWith('/assignments/')
      ? 'assignments'
      : pathname === '/schedule' || pathname.startsWith('/schedule/')
      ? 'schedule'
      : pathname === '/progress' || pathname.startsWith('/progress/')
      ? 'progress'
      : pathname === '/attendance' || pathname.startsWith('/attendance/')
      ? 'attendance'
      : pathname === '/announcements' || pathname.startsWith('/announcements/')
      ? 'announcements'
      : pathname === '/tracks' || pathname.startsWith('/tracks/')
      ? 'my-tracks'
      : pathname === '/'
      ? currentTab || 'dashboard'
      : currentTab || 'dashboard';

  const navItems = [
    {
      id: 'dashboard' as DashboardNavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/',
    },
    {
      id: 'my-tracks' as DashboardNavTab,
      label: 'My Tracks',
      icon: Layers,
      href: '/tracks',
      badgeText: `${enrolledTracks.length}`,
    },
    {
      id: 'resources' as DashboardNavTab,
      label: 'Resources',
      icon: FolderGit2,
      href: '/resources',
    },
    {
      id: 'assignments' as DashboardNavTab,
      label: 'Assignments',
      icon: FileCheck,
      href: '/assignments',
      badgeText: pendingAssignmentsCount > 0 ? `${pendingAssignmentsCount}` : undefined,
      badgeAlert: true,
    },
    {
      id: 'schedule' as DashboardNavTab,
      label: 'Schedule',
      icon: CalendarDays,
      href: '/schedule',
      badgeText: liveClassesCount > 0 ? 'Live' : undefined,
      badgeLive: liveClassesCount > 0,
    },
    {
      id: 'progress' as DashboardNavTab,
      label: 'Progress',
      icon: TrendingUp,
      href: '/progress',
    },
    {
      id: 'attendance' as DashboardNavTab,
      label: 'Attendance',
      icon: UserCheck,
      href: '/attendance',
      badgeText: '91%',
    },
    {
      id: 'announcements' as DashboardNavTab,
      label: 'Announcements',
      icon: Megaphone,
      href: '/announcements',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0D0E11] text-[#FAF7EE] border-r border-[#22242B] transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* GDG on Campus LASU Branding Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-[#22242B]">
          <Link href="/" className="flex items-center gap-3">
            {/* Google 4-color brackets logo */}
            <div className="flex items-center gap-1">
              <span className="h-4 w-1.5 rounded-full bg-[#4285F4]" />
              <span className="h-4 w-1.5 rounded-full bg-[#EA4335]" />
              <span className="h-4 w-1.5 rounded-full bg-[#FBBC04]" />
              <span className="h-4 w-1.5 rounded-full bg-[#34A853]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-[#FAF7EE] uppercase">
                  GDG on Campus
                </span>
              </div>
              <p className="text-[11px] font-medium text-[#FAF7EE]/60">
                Lagos State University • LMS
              </p>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            className="rounded-lg p-1.5 text-[#FAF7EE]/60 hover:bg-[#1C1D22] hover:text-[#FAF7EE] lg:hidden cursor-pointer"
            onClick={onMobileClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div>
            <div className="px-3 pb-2.5 text-[11px] font-bold uppercase tracking-wider text-[#FAF7EE]/40">
              Navigation
            </div>
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                const content = (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-colors',
                          isActive
                            ? 'text-[#0D0E11]'
                            : 'text-[#FAF7EE]/60 group-hover:text-[#FAF7EE]'
                        )}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badgeText && (
                      <span
                        className={cn(
                          'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold',
                          isActive
                            ? 'bg-[#0D0E11] text-[#FAF7EE]'
                            : item.badgeLive
                            ? 'bg-[#EA4335]/20 text-[#EA4335]'
                            : item.badgeAlert
                            ? 'bg-[#FBBC04]/20 text-[#FBBC04]'
                            : 'bg-[#22242B] text-[#FAF7EE]/80'
                        )}
                      >
                        {item.badgeText}
                      </span>
                    )}
                  </>
                );

                const itemClass = cn(
                  'group flex w-full items-center justify-between rounded-full px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer',
                  isActive
                    ? 'bg-[#FAF7EE] text-[#0D0E11] shadow-xs'
                    : 'text-[#FAF7EE]/70 hover:bg-[#1C1D22] hover:text-[#FAF7EE]'
                );

                if (item.href.startsWith('/')) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => {
                        onSelectTab?.(item.id);
                        onMobileClose();
                      }}
                      className={itemClass}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectTab?.(item.id);
                      onMobileClose();
                    }}
                    className={itemClass}
                  >
                    {content}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Enrolled Tracks with Google-accent dot tags */}
          <div>
            <div className="px-3 pb-2.5 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FAF7EE]/40">
                Enrolled Tracks
              </span>
              <span className="rounded-full bg-[#22242B] px-2 py-0.5 text-[10px] font-bold text-[#FAF7EE]/70">
                {enrolledTracks.length}
              </span>
            </div>

            <div className="space-y-2">
              {enrolledTracks.map((track) => {
                const dotColor =
                  track.name === 'Backend Development'
                    ? 'bg-[#4285F4]'
                    : track.name === 'Frontend Development'
                    ? 'bg-[#34A853]'
                    : 'bg-[#EA4335]';

                const isCurrentTrack = pathname === `/tracks/${track.slug}`;

                return (
                  <Link
                    key={track.id}
                    href={`/tracks/${track.slug}`}
                    onClick={onMobileClose}
                    className={cn(
                      'group flex w-full items-center justify-between rounded-2xl border p-3 text-left transition-all cursor-pointer',
                      isCurrentTrack
                        ? 'border-[#FAF7EE] bg-[#1C1D22]'
                        : 'border-[#22242B] bg-[#15161A] hover:border-[#383A42] hover:bg-[#1A1B20]'
                    )}
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className={cn('h-2 w-2 rounded-full shrink-0', dotColor)} />
                        <p className="text-xs font-bold text-[#FAF7EE] truncate">
                          {track.name}
                        </p>
                      </div>
                      <p className="text-[10px] text-[#FAF7EE]/60 pl-4 font-medium">
                        {track.progressPercentage}% completed
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* GDG Community Study Lounge Card */}
          <div className="rounded-2xl border border-[#22242B] bg-[#15161A] p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#34A853] animate-pulse" />
              <span className="text-xs font-bold text-[#FAF7EE]">
                GDG LASU Chapter
              </span>
            </div>
            <p className="text-[11px] text-[#FAF7EE]/70 leading-relaxed font-normal">
              Collaborate in squads, request mentor code reviews, and join live pair programming rooms.
            </p>
            <a
              href="https://gdg.community.dev"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4285F4] hover:underline pt-1"
            >
              <span>Join Chapter Platform</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="border-t border-[#22242B] p-4 bg-[#111215]">
          <div className="flex items-center gap-3 rounded-2xl p-2 bg-[#15161A] border border-[#22242B]">
            <Avatar className="h-9 w-9 border border-[#383A42] shrink-0">
              <AvatarImage src={student.avatar} alt={student.name} />
              <AvatarFallback className="text-xs font-bold bg-[#FAF7EE] text-[#0D0E11]">
                {student.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#FAF7EE] truncate">
                {student.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="rounded-full bg-[#34A853]/20 text-[#34A853] px-1.5 py-0.2 text-[9px] font-bold">
                  {student.role}
                </span>
                <span className="text-[10px] text-[#FAF7EE]/50 truncate">
                  Bootcamp 3.0
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
