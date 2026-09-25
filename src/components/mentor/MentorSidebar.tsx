'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  FolderGit2,
  FileCheck,
  Send,
  CalendarDays,
  UserCheck,
  Megaphone,
  X,
  ExternalLink,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export type MentorNavTab =
  | 'dashboard'
  | 'tracks'
  | 'resources'
  | 'assignments'
  | 'submissions'
  | 'schedule'
  | 'attendance'
  | 'announcements';

interface MentorUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

interface MentorSidebarProps {
  currentTab?: MentorNavTab;
  mentor: MentorUser;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  pendingSubmissionsCount?: number;
  assignedTracksCount?: number;
}

export function MentorSidebar({
  currentTab,
  mentor,
  isMobileOpen,
  onMobileClose,
  pendingSubmissionsCount = 0,
  assignedTracksCount = 1,
}: MentorSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  const navItems = [
    {
      id: 'dashboard' as MentorNavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/mentor/dashboard',
    },
    {
      id: 'tracks' as MentorNavTab,
      label: 'My Tracks',
      icon: Layers,
      href: '/mentor/tracks',
      badgeText: assignedTracksCount > 0 ? `${assignedTracksCount}` : undefined,
    },
    {
      id: 'resources' as MentorNavTab,
      label: 'Resources',
      icon: FolderGit2,
      href: '/mentor/resources',
    },
    {
      id: 'assignments' as MentorNavTab,
      label: 'Assignments',
      icon: FileCheck,
      href: '/mentor/assignments',
    },
    {
      id: 'submissions' as MentorNavTab,
      label: 'Submissions',
      icon: Send,
      href: '/mentor/submissions',
      badgeText: pendingSubmissionsCount > 0 ? `${pendingSubmissionsCount} new` : undefined,
      badgeColor: 'bg-[#EA4335] text-white',
    },
    {
      id: 'schedule' as MentorNavTab,
      label: 'Schedule',
      icon: CalendarDays,
      href: '/mentor/schedule',
    },
    {
      id: 'attendance' as MentorNavTab,
      label: 'Attendance',
      icon: UserCheck,
      href: '/mentor/attendance',
    },
    {
      id: 'announcements' as MentorNavTab,
      label: 'Announcements',
      icon: Megaphone,
      href: '/mentor/announcements',
    },
  ];

  const getActiveTab = (): MentorNavTab => {
    if (pathname === '/mentor/dashboard' || pathname === '/mentor') return 'dashboard';
    if (pathname.startsWith('/mentor/tracks')) return 'tracks';
    if (pathname.startsWith('/mentor/resources')) return 'resources';
    if (pathname.startsWith('/mentor/assignments')) return 'assignments';
    if (pathname.startsWith('/mentor/submissions')) return 'submissions';
    if (pathname.startsWith('/mentor/schedule')) return 'schedule';
    if (pathname.startsWith('/mentor/attendance')) return 'attendance';
    if (pathname.startsWith('/mentor/announcements')) return 'announcements';
    return currentTab || 'dashboard';
  };

  const activeTab = getActiveTab();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0D0E11] text-[#FAF7EE] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shrink-0 border-r border-[#22242B]',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-[#22242B]">
          <Link href="/mentor/dashboard" className="flex items-center gap-3 group">
            {/* Google Accent Strips */}
            <div className="flex items-center gap-1 bg-[#1A1C23] p-2 rounded-xl border border-[#33353F]">
              <span className="h-3.5 w-1 rounded-full bg-[#4285F4]" />
              <span className="h-3.5 w-1 rounded-full bg-[#EA4335]" />
              <span className="h-3.5 w-1 rounded-full bg-[#FBBC04]" />
              <span className="h-3.5 w-1 rounded-full bg-[#34A853]" />
            </div>

            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-[#FAF7EE] group-hover:text-white transition-colors">
                GDG Bootcamp
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FBBC04] flex items-center gap-1">
                <span>Mentor Workspace</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#FBBC04]" />
              </span>
            </div>
          </Link>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-[#1A1C23] hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto no-scrollbar">
          <div className="px-3 pb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
              Instructor Console
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  'group flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold transition-all relative',
                  isActive
                    ? 'bg-[#1A1C23] text-white shadow-xs'
                    : 'text-zinc-400 hover:bg-[#16181E] hover:text-[#FAF7EE]'
                )}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-[#4285F4]" />
                )}

                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-colors',
                      isActive ? 'text-[#4285F4]' : 'text-zinc-400 group-hover:text-white'
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {/* Badge if present */}
                {item.badgeText && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-black tracking-tight',
                      item.badgeColor || 'bg-[#22242B] text-zinc-300'
                    )}
                  >
                    {item.badgeText}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Link to Student Portal */}
        <div className="p-3 mx-3 mb-3 rounded-2xl bg-[#16181E] border border-[#22242B] text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 text-[#FBBC04]" />
            <span>Switch to Student View</span>
          </div>
          <p className="text-[10px] text-zinc-400">
            Inspect the learning portal exactly as your cohort students see it.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl bg-[#22242B] hover:bg-[#2C2E38] text-[10px] font-bold text-white transition-all"
          >
            <span>Open Student Dashboard</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* Footer Profile Section */}
        <div className="border-t border-[#22242B] p-4 bg-[#0A0B0E]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 rounded-xl border border-[#33353F] shrink-0">
                <AvatarImage src={mentor.avatar} alt={mentor.name} />
                <AvatarFallback className="bg-[#1A1C23] text-white font-bold text-xs">
                  {mentor.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col min-w-0">
                <span className="truncate text-xs font-black text-white">
                  {mentor.name}
                </span>
                <span className="truncate text-[10px] font-medium text-[#FBBC04]">
                  {mentor.role === 'ADMIN' ? 'Administrator' : 'Track Mentor'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl text-zinc-400 hover:bg-[#1A1C23] hover:text-[#EA4335] transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
