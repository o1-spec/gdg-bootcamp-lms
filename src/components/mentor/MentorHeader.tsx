'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MentorNavTab } from './MentorSidebar';

interface MentorHeaderProps {
  currentTab: MentorNavTab;
  mentor: {
    name: string;
    email: string;
    avatar: string;
    role: string;
  };
  onOpenMobileMenu: () => void;
  onSearchChange?: (term: string) => void;
  title?: string;
  subtitle?: string;
}

export function MentorHeader({
  currentTab,
  mentor,
  onOpenMobileMenu,
  onSearchChange,
  title,
  subtitle,
}: MentorHeaderProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  const titles: Record<MentorNavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Mentor Command Center',
      subtitle: 'Overview of assigned tracks, student deliverables, and live sessions',
    },
    tracks: {
      title: 'Assigned Tracks',
      subtitle: 'Manage curriculum, modules, lessons, and enrolled cohort students',
    },
    resources: {
      title: 'Track Resource Hub',
      subtitle: 'Upload and manage slides, cheatsheets, repositories, and docs',
    },
    assignments: {
      title: 'Assignments & Projects',
      subtitle: 'Create deliverables, configure deadlines, and track submissions',
    },
    submissions: {
      title: 'Deliverables & Submissions',
      subtitle: 'Review student GitHub repositories, score deliverables, and give feedback',
    },
    schedule: {
      title: 'Masterclass & Workshop Schedule',
      subtitle: 'Organize virtual Google Meet streams and campus labs',
    },
    attendance: {
      title: 'Participation Ledger',
      subtitle: 'Record and update cohort attendance for live workshops',
    },
    announcements: {
      title: 'Broadcasts & Bulletins',
      subtitle: 'Publish updates and reminders to track students',
    },
  };

  const headerInfo = titles[currentTab] || {
    title: title || 'Mentor Console',
    subtitle: subtitle || 'Manage your tracks and guide students',
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-[#E5DFD0] bg-[#FAF7EE]/90 px-6 sm:px-8 backdrop-blur-md">
      {/* Left Area: Mobile Trigger + Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="rounded-xl border border-[#E5DFD0] bg-white p-2 text-[#0D0E11] hover:bg-[#FAF7EE] lg:hidden cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex flex-col">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#FBBC04]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368]">
              GDG on Campus LASU
            </span>
          </div>
          <h2 className="text-sm font-black text-[#0D0E11] tracking-tight">
            {headerInfo.title}
          </h2>
        </div>
      </div>

      {/* Center Search Input */}
      {onSearchChange && (
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F6368]" />
            <input
              type="text"
              placeholder="Search students, submissions, or resources..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                onSearchChange(e.target.value);
              }}
              className="w-full h-10 rounded-full border border-[#E5DFD0] bg-white pl-10 pr-4 text-xs font-medium text-[#0D0E11] placeholder:text-[#5F6368] focus:border-[#0D0E11] focus:outline-none transition-all shadow-2xs"
            />
          </div>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Role Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBBC04]/15 border border-[#FBBC04]/40 text-[#0D0E11]">
          <Sparkles className="h-3.5 w-3.5 text-[#FBBC04]" />
          <span className="text-[11px] font-bold tracking-tight">
            {mentor.role === 'ADMIN' ? 'Admin Access' : 'Instructor'}
          </span>
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-2xl border border-[#E5DFD0] bg-white hover:bg-[#FAF7EE] transition-all cursor-pointer shadow-2xs"
          >
            <Avatar className="h-7 w-7 rounded-xl border border-[#E5DFD0]">
              <AvatarImage src={mentor.avatar} alt={mentor.name} />
              <AvatarFallback className="bg-[#0D0E11] text-[#FAF7EE] text-[10px] font-bold">
                {mentor.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-xs font-bold text-[#0D0E11] pr-1">
              {mentor.name.split(' ')[0]}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-[#5F6368]" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#E5DFD0] bg-white p-2 shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-3 border-b border-[#E5DFD0]/60">
                <p className="text-xs font-black text-[#0D0E11]">{mentor.name}</p>
                <p className="text-[10px] text-[#5F6368] truncate">{mentor.email}</p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full p-2.5 rounded-xl text-xs font-bold text-[#EA4335] hover:bg-[#EA4335]/10 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
