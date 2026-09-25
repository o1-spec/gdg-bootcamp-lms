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
        return { page: 'My Tracks', sub: 'Curriculum & Modules' };
      case 'resources':
        return { page: 'Resources', sub: 'Slides, Notes, Code & Repos' };
      case 'assignments':
        return { page: 'Assignments', sub: 'Projects & Coding Challenges' };
      case 'schedule':
        return { page: 'Schedule', sub: 'Live Mentoring & Workshops' };
      case 'progress':
        return { page: 'Progress', sub: 'Curriculum & Attendance Analytics' };
      case 'announcements':
        return { page: 'Announcements', sub: 'Official Cohort Updates' };
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
      color: 'text-[#EA4335] bg-[#EA4335]/10',
    },
    {
      id: 'notif-2',
      title: 'Assignment Graded: 95/100',
      desc: 'Your submission for Docker Multi-stage Builds received feedback.',
      time: '2h ago',
      icon: Award,
      unread: true,
      color: 'text-[#34A853] bg-[#34A853]/10',
    },
    {
      id: 'notif-3',
      title: 'New Cheatsheet Added',
      desc: 'NestJS Dependency Injection & Architecture Cheat Sheet is available.',
      time: '3h ago',
      icon: AlertCircle,
      unread: true,
      color: 'text-[#4285F4] bg-[#4285F4]/10',
    },
  ];

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

      {/* Right: Chapter badge, Notification Bell & Student Profile */}
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

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E5DFD0] bg-white hover:bg-[#F2EDE0] text-[#0D0E11] transition-colors cursor-pointer shadow-2xs"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EA4335] text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-[#E5DFD0] bg-white p-4 shadow-xl z-50 text-[#0D0E11] animate-in fade-in-0 zoom-in-95">
              <div className="flex items-center justify-between border-b border-[#E5DFD0] pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D0E11]">
                    Notifications
                  </h3>
                  <p className="text-[11px] text-[#5F6368] font-medium">
                    {unreadCount} unread announcements & alerts
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setUnreadCount(0)}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#4285F4] hover:underline cursor-pointer"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="mt-2.5 space-y-2 max-h-72 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        'flex items-start gap-3 p-2.5 rounded-xl transition-colors cursor-pointer border border-transparent',
                        n.unread ? 'bg-[#FAF7EE] border-[#E5DFD0]' : 'hover:bg-[#FAF7EE]'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                          n.color
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[#0D0E11] truncate">
                            {n.title}
                          </p>
                          <span className="text-[10px] text-[#5F6368] font-medium ml-1">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5F6368] line-clamp-1 mt-0.5 font-normal">
                          {n.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
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
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-[#0D0E11] hover:bg-[#FAF7EE] rounded-xl transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-[#4285F4]" />
                  <span>My Student Portfolio</span>
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-[#0D0E11] hover:bg-[#FAF7EE] rounded-xl transition-colors"
                >
                  <Settings className="h-3.5 w-3.5 text-[#FBBC04]" />
                  <span>Settings & Preferences</span>
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-[#0D0E11] hover:bg-[#FAF7EE] rounded-xl transition-colors"
                >
                  <HelpCircle className="h-3.5 w-3.5 text-[#34A853]" />
                  <span>Mentor Support</span>
                </button>
              </div>

              <div className="pt-1 border-t border-[#E5DFD0]">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-bold text-[#EA4335] hover:bg-[#EA4335]/10 rounded-xl transition-colors"
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
