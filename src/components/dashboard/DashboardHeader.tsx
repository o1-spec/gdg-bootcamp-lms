'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  HelpCircle,
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

export function DashboardHeader({
  currentTab,
  student,
  onOpenMobileMenu,
  onSearchChange,
}: DashboardHeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [searchTerm, setSearchTerm] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
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

  const getBreadcrumbTitle = (tab: DashboardNavTab) => {
    switch (tab) {
      case 'dashboard':
        return { page: 'Dashboard', sub: 'Overview & Learning Roadmap' };
      case 'my-tracks':
        return { page: 'My Tracks', sub: 'Enrolled Curriculum & Modules' };
      case 'resources':
        return { page: 'Resources', sub: 'PDFs, Repos, Slides & Notes' };
      case 'assignments':
        return { page: 'Assignments', sub: 'Tasks, Submissions & Grades' };
      case 'schedule':
        return { page: 'Schedule', sub: 'Live Mentoring & Workshops' };
      case 'progress':
        return { page: 'Progress', sub: 'Weekly Performance & Metrics' };
      case 'announcements':
        return { page: 'Announcements', sub: 'Cohort News & Updates' };
      default:
        return { page: 'Dashboard', sub: 'Overview' };
    }
  };

  const breadcrumb = getBreadcrumbTitle(currentTab);

  const notifications = [
    {
      id: 'notif-1',
      title: 'Live Workshop Starting Soon',
      desc: 'Sarah Chen is starting "Designing High-Throughput Microservices in NestJS".',
      time: '15m ago',
      icon: Calendar,
      unread: true,
      color: 'text-rose-500 bg-rose-500/10',
    },
    {
      id: 'notif-2',
      title: 'Assignment Graded: 95/100',
      desc: 'Your submission for Docker Multi-stage Builds received feedback.',
      time: '2h ago',
      icon: Award,
      unread: true,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      id: 'notif-3',
      title: 'New Resource Added',
      desc: 'NestJS Dependency Injection & Architecture Cheat Sheet is available.',
      time: '3h ago',
      icon: AlertCircle,
      unread: true,
      color: 'text-blue-500 bg-blue-500/10',
    },
  ];

  const handleMarkAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/80 bg-background/90 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile hamburger & breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
              Bootcamp LMS
            </span>
            <span className="text-muted-foreground/40 hidden sm:inline">/</span>
            <h1 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
              {breadcrumb.page}
            </h1>
          </div>
          <span className="text-[11px] text-muted-foreground hidden md:inline">
            {breadcrumb.sub}
          </span>
        </div>
      </div>

      {/* Center: Quick Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search lessons, tracks, resources... (Press ⌘K)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onSearchChange?.(e.target.value);
            }}
            className="w-full h-9 rounded-lg border border-border/80 bg-muted/40 pl-9 pr-9 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:outline-none transition-all"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Cohort pill, Notifications, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Cohort tag */}
        <span className="hidden xl:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
          {student.cohort}
        </span>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card p-3 shadow-lg z-50 text-foreground animate-in fade-in-0 zoom-in-95">
              <div className="flex items-center justify-between border-b border-border/70 pb-2.5 px-1">
                <div>
                  <h3 className="text-xs font-semibold text-foreground">
                    Notifications
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    You have {unreadCount} unread alerts
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="mt-2 space-y-1.5 max-h-72 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        'flex items-start gap-2.5 p-2 rounded-lg transition-colors cursor-pointer',
                        n.unread ? 'bg-muted/50 hover:bg-muted' : 'hover:bg-muted/30'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                          n.color
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-foreground truncate">
                            {n.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-1">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {n.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-border/70 text-center">
                <button
                  type="button"
                  className="text-[11px] text-muted-foreground hover:text-foreground font-medium"
                >
                  View all notification history
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Student Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 rounded-lg border border-border/70 p-1 sm:px-2 sm:py-1 hover:bg-muted transition-colors cursor-pointer"
          >
            <div className="relative">
              <Avatar className="h-7 w-7 border border-border">
                <AvatarImage src={student.avatar} alt={student.name} />
                <AvatarFallback className="text-xs font-medium">
                  {student.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
            </div>

            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-foreground leading-tight">
                {student.name}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                {student.role}
              </span>
            </div>

            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:inline" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-lg z-50 text-foreground animate-in fade-in-0 zoom-in-95">
              <div className="px-2.5 py-2 border-b border-border/70">
                <p className="text-xs font-semibold text-foreground">
                  {student.name}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {student.email}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="rounded bg-primary/10 text-primary px-1.5 py-0.2 text-[10px] font-medium">
                    {student.role}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {student.cohort}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>My Profile & Portfolio</span>
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Account Settings</span>
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Help & Mentor Support</span>
                </button>
              </div>

              <div className="pt-1 border-t border-border/70">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
