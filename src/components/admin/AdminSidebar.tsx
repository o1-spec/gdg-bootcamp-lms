'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Award,
  CalendarRange,
  Layers,
  Users,
  UserPlus,
  ShieldCheck,
  CalendarDays,
  Megaphone,
  X,
  ExternalLink,
  LogOut,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export type AdminNavTab =
  | 'dashboard'
  | 'bootcamps'
  | 'cohorts'
  | 'tracks'
  | 'users'
  | 'enrollments'
  | 'mentors'
  | 'sessions'
  | 'announcements';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

interface AdminSidebarProps {
  currentTab?: AdminNavTab;
  admin: AdminUser;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  activeBootcampsCount?: number;
  totalStudentsCount?: number;
}

export function AdminSidebar({
  currentTab,
  admin,
  isMobileOpen,
  onMobileClose,
  activeBootcampsCount,
  totalStudentsCount,
}: AdminSidebarProps) {
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
      id: 'dashboard' as AdminNavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin/dashboard',
    },
    {
      id: 'bootcamps' as AdminNavTab,
      label: 'Bootcamps',
      icon: Award,
      href: '/admin/bootcamps',
      badgeText: activeBootcampsCount ? `${activeBootcampsCount}` : undefined,
    },
    {
      id: 'cohorts' as AdminNavTab,
      label: 'Cohorts',
      icon: CalendarRange,
      href: '/admin/cohorts',
    },
    {
      id: 'tracks' as AdminNavTab,
      label: 'Tracks',
      icon: Layers,
      href: '/admin/tracks',
    },
    {
      id: 'users' as AdminNavTab,
      label: 'Students / Users',
      icon: Users,
      href: '/admin/users',
      badgeText: totalStudentsCount ? `${totalStudentsCount}` : undefined,
    },
    {
      id: 'enrollments' as AdminNavTab,
      label: 'Enrollments',
      icon: UserPlus,
      href: '/admin/enrollments',
    },
    {
      id: 'mentors' as AdminNavTab,
      label: 'Mentors',
      icon: ShieldCheck,
      href: '/admin/mentors',
    },
    {
      id: 'sessions' as AdminNavTab,
      label: 'Sessions',
      icon: CalendarDays,
      href: '/admin/sessions',
    },
    {
      id: 'announcements' as AdminNavTab,
      label: 'Announcements',
      icon: Megaphone,
      href: '/admin/announcements',
    },
  ];

  const content = (
    <div className="flex flex-col h-full bg-[#0D0E11] text-[#FAF7EE] border-r border-white/10 select-none">
      {/* Brand / Logo */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#EA4335] via-[#4285F4] to-[#34A853] p-[2px] transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-[#0D0E11] rounded-[14px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-[#FAF7EE]" />
            </div>
          </div>
          <div>
            <div className="font-bold text-base leading-tight tracking-tight text-[#FAF7EE] flex items-center gap-2">
              GDG LASU
              <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded-full bg-[#EA4335]/20 text-[#EA4335] border border-[#EA4335]/30">
                Admin
              </span>
            </div>
            <p className="text-xs text-white/50 font-medium">Bootcamp Command</p>
          </div>
        </Link>
        {isMobileOpen && (
          <button
            onClick={onMobileClose}
            className="md:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
          Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentTab === item.id ||
            (pathname && pathname.startsWith(item.href) && item.href !== '/admin/dashboard') ||
            (pathname === '/admin/dashboard' && item.id === 'dashboard');

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => onMobileClose()}
              className={cn(
                'group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/15 text-white shadow-sm border border-white/10 font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-[#4285F4]' : 'text-white/50 group-hover:text-white/80'
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badgeText && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-mono font-medium',
                    isActive ? 'bg-[#4285F4] text-white' : 'bg-white/10 text-white/60'
                  )}
                >
                  {item.badgeText}
                </span>
              )}
            </Link>
          );
        })}

        {/* Portal Switch Links */}
        <div className="pt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
          Quick Switch
        </div>
        <Link
          href="/mentor/dashboard"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-[#FBBC04]" />
            <span>Mentor Portal</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-white/40" />
        </Link>
        <Link
          href="/"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-[#34A853]" />
            <span>Student Experience</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-white/40" />
        </Link>
      </div>

      {/* Admin Profile & Logout */}
      <div className="p-4 border-t border-white/10 bg-white/[0.02]">
        <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="w-9 h-9 border border-white/20">
              <AvatarImage src={admin.avatar} alt={admin.name} />
              <AvatarFallback className="bg-[#EA4335] text-white font-bold text-xs">
                {admin.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#FAF7EE] truncate">{admin.name}</p>
              <p className="text-[11px] text-[#FBBC04] truncate font-medium">{admin.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 rounded-xl text-white/50 hover:text-[#EA4335] hover:bg-[#EA4335]/10 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0D0E11] shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
