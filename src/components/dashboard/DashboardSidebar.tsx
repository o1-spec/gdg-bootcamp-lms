'use client';

import React from 'react';
import {
  LayoutDashboard,
  Layers,
  FolderGit2,
  FileCheck,
  CalendarDays,
  TrendingUp,
  Megaphone,
  GraduationCap,
  Sparkles,
  ChevronRight,
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
  | 'announcements';

interface DashboardSidebarProps {
  currentTab: DashboardNavTab;
  onSelectTab: (tab: DashboardNavTab) => void;
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
  const navItems = [
    {
      id: 'dashboard' as DashboardNavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'my-tracks' as DashboardNavTab,
      label: 'My Tracks',
      icon: Layers,
      badgeText: `${enrolledTracks.length}`,
    },
    {
      id: 'resources' as DashboardNavTab,
      label: 'Resources',
      icon: FolderGit2,
    },
    {
      id: 'assignments' as DashboardNavTab,
      label: 'Assignments',
      icon: FileCheck,
      badgeText: pendingAssignmentsCount > 0 ? `${pendingAssignmentsCount}` : undefined,
      badgeAlert: true,
    },
    {
      id: 'schedule' as DashboardNavTab,
      label: 'Schedule',
      icon: CalendarDays,
      badgeText: liveClassesCount > 0 ? 'Live' : undefined,
      badgeLive: liveClassesCount > 0,
    },
    {
      id: 'progress' as DashboardNavTab,
      label: 'Progress',
      icon: TrendingUp,
    },
    {
      id: 'announcements' as DashboardNavTab,
      label: 'Announcements',
      icon: Megaphone,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xs lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card/95 backdrop-blur-sm transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo & Cohort Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-border/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-foreground">
                  Bootcamp LMS
                </span>
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-primary uppercase">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                {student.cohort}
              </p>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden cursor-pointer"
            onClick={onMobileClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          <div>
            <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              Menu
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      onMobileClose();
                    }}
                    className={cn(
                      'group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-colors',
                          isActive
                            ? 'text-primary-foreground'
                            : 'text-muted-foreground group-hover:text-foreground'
                        )}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badgeText && (
                      <span
                        className={cn(
                          'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold',
                          isActive
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : item.badgeLive
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : item.badgeAlert
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {item.badgeText}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Enrolled Tracks Quick Jump */}
          <div>
            <div className="px-2 pb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                Active Tracks
              </span>
              <span className="text-[10px] text-muted-foreground">
                {enrolledTracks.length} enrolled
              </span>
            </div>
            <div className="space-y-1.5">
              {enrolledTracks.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => {
                    onSelectTab('my-tracks');
                    onMobileClose();
                  }}
                  className="group flex w-full items-center justify-between rounded-lg border border-border/50 bg-background/50 p-2 text-left hover:border-border hover:bg-muted/40 transition-all cursor-pointer"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {track.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {track.progressPercentage}% completed
                    </p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          {/* Bootcamp Community Card */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Cohort Study Lounge</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Connect with mentors, peer code reviews, and live pair programming rooms.
            </p>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <span>Open Discord Room</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="border-t border-border/80 p-3.5">
          <div className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-muted/50 transition-colors">
            <Avatar className="h-9 w-9 border border-border shrink-0">
              <AvatarImage src={student.avatar} alt={student.name} />
              <AvatarFallback className="text-xs font-semibold">
                {student.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground truncate">
                  {student.name}
                </p>
                <span className="rounded bg-muted px-1.5 py-0.2 text-[9px] font-medium text-muted-foreground">
                  {student.role}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {student.email}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
