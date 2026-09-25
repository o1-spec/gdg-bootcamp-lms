'use client';

import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Sparkles,
  Inbox,
  RotateCcw,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ScheduleCard } from '@/components/schedule/ScheduleCard';
import { SessionDetails } from '@/components/schedule/SessionDetails';
import { BootcampSession, StudentProfile, Track } from '@/types/lms';
import { cn } from '@/lib/utils';

export type ScheduleTabFilter = 'upcoming' | 'this_week' | 'past' | 'all';

const fallbackStudent: StudentProfile = {
  id: '',
  name: 'Student',
  firstName: 'Student',
  lastName: '',
  email: '',
  avatar: '',
  cohort: 'Bootcamp 2026',
  role: 'Student',
  enrolledTracksCount: 0,
  studyStreakDays: 0,
  totalHoursSpent: 0,
  onboardingCompleted: true,
};

interface ScheduleClientProps {
  initialSessions?: BootcampSession[];
  student?: StudentProfile;
  enrolledTracks?: Track[];
}

export function ScheduleClient({
  initialSessions,
  student = fallbackStudent,
  enrolledTracks = [],
}: ScheduleClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<ScheduleTabFilter>('upcoming');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allSessions = initialSessions || [];

  // Session details modal state
  const [activeSession, setActiveSession] = useState<BootcampSession | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleOpenDetails = (ses: BootcampSession) => {
    setActiveSession(ses);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setActiveSession(null);
  };

  const trackOptions = [
    { id: 'all', label: 'All Tracks' },
    { id: 'backend-development', label: 'Backend Development' },
    { id: 'frontend-development', label: 'Frontend Development' },
    { id: 'dsa-interview-prep', label: 'DSA & Interview Prep' },
    { id: 'ui-ux-design', label: 'UI/UX Design' },
  ];

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return allSessions.filter((ses) => {
      // Tab filter
      if (selectedTab === 'upcoming' && ses.isPast) return false;
      if (selectedTab === 'past' && !ses.isPast) return false;
      if (selectedTab === 'this_week') {
        // e.g. Sep 30, Oct 2, Oct 3, Oct 4
        if (ses.isPast) return false;
      }

      // Track filter
      if (selectedTrack !== 'all' && ses.trackId !== selectedTrack) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches =
          ses.title.toLowerCase().includes(query) ||
          ses.topic.toLowerCase().includes(query) ||
          ses.mentor.name.toLowerCase().includes(query) ||
          ses.trackName.toLowerCase().includes(query) ||
          ses.dayOfWeek.toLowerCase().includes(query);
        if (!matches) return false;
      }

      return true;
    });
  }, [allSessions, selectedTab, selectedTrack, searchQuery]);

  // Group filtered sessions by day of week
  const groupedSessions = useMemo(() => {
    const map = new Map<string, BootcampSession[]>();
    for (const ses of filteredSessions) {
      const groupKey = `${ses.dayOfWeek} — ${ses.date}`;
      if (!map.has(groupKey)) {
        map.set(groupKey, []);
      }
      map.get(groupKey)!.push(ses);
    }
    return Array.from(map.entries());
  }, [filteredSessions]);

  return (
    <div className="flex min-h-screen bg-[#FAF7EE] text-[#0D0E11] antialiased selection:bg-[#FBBC04]/30">
      {/* Sidebar */}
      <DashboardSidebar
        currentTab="schedule"
        student={student}
        enrolledTracks={enrolledTracks}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingAssignmentsCount={0}
        liveClassesCount={allSessions.filter((c) => c.isLiveNow).length}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader
          currentTab="schedule"
          student={student}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onSearchChange={setSearchQuery}
        />

        {/* Ticker Ribbon */}
        <div className="w-full bg-[#FBBC04] text-[#0D0E11] py-2 px-6 overflow-hidden border-b border-[#0D0E11]/10">
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
            <span className="hidden lg:inline text-[11px] font-bold tracking-normal opacity-90 pl-4">
              GDG on Campus LASU Masterclasses & Live Office Hours
            </span>
          </div>
        </div>

        <main className="flex-1 p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl w-full mx-auto">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5DFD0] pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FBBC04]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
                  Cohort Calendar & Live Workshops
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#0D0E11] tracking-tight">
                Schedule
              </h1>
              <p className="text-sm text-[#5F6368] font-medium max-w-xl">
                Stay on top of your classes, workshops, and important bootcamp sessions. Join interactive Google Meet live streams or watch past recordings.
              </p>
            </div>

            {/* Live Indicator Pill */}
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-[#E5DFD0] bg-white px-4 py-2.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#EA4335] animate-ping" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
                      Live Workshop Active
                    </span>
                    <span className="text-sm font-black text-[#0D0E11]">
                      Arrays & Hash Maps
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar: Tabs & Track Selector */}
          <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 shadow-xs space-y-5">
            {/* View Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="inline-flex items-center p-1 rounded-full bg-[#FAF7EE] border border-[#E5DFD0]">
                {(
                  [
                    { id: 'upcoming', label: 'Upcoming' },
                    { id: 'this_week', label: 'This Week' },
                    { id: 'past', label: 'Past Sessions & Recordings' },
                    { id: 'all', label: 'All Sessions' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedTab(tab.id)}
                    className={cn(
                      'px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                      selectedTab === tab.id
                        ? 'bg-[#0D0E11] text-[#FAF7EE]'
                        : 'text-[#5F6368] hover:text-[#0D0E11]'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="text-xs font-medium text-[#5F6368]">
                <span>
                  Showing <strong>{filteredSessions.length}</strong> bootcamp sessions
                </span>
              </div>
            </div>

            {/* Track Filter Pills */}
            <div className="pt-3 border-t border-[#E5DFD0] space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
                Filter by Track
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {trackOptions.map((tr) => (
                  <button
                    key={tr.id}
                    type="button"
                    onClick={() => setSelectedTrack(tr.id)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                      selectedTrack === tr.id
                        ? 'bg-[#0D0E11] text-[#FAF7EE]'
                        : 'bg-[#FAF7EE] border border-[#E5DFD0] text-[#5F6368] hover:text-[#0D0E11]'
                    )}
                  >
                    {tr.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grouped Sessions by Day */}
          {groupedSessions.length > 0 ? (
            <div className="space-y-8">
              {groupedSessions.map(([dayGroup, sessions]) => (
                <div key={dayGroup} className="space-y-4">
                  {/* Day Header Ribbon */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0D0E11] text-[#FAF7EE]">
                      <CalendarDays className="h-4 w-4 text-[#FBBC04]" />
                    </div>
                    <h3 className="text-lg font-black text-[#0D0E11] tracking-tight">
                      {dayGroup}
                    </h3>
                    <div className="flex-1 h-px bg-[#E5DFD0]" />
                  </div>

                  {/* Sessions grid for this day */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sessions.map((session) => (
                      <ScheduleCard
                        key={session.id}
                        session={session}
                        onViewDetails={handleOpenDetails}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#E5DFD0] bg-white p-12 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
                <Inbox className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#0D0E11]">
                  No sessions found
                </h3>
                <p className="text-xs sm:text-sm text-[#5F6368] max-w-md mx-auto">
                  No scheduled classes match your selected timeframe or track filter.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedTab('all');
                  setSelectedTrack('all');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0D0E11] text-[#FAF7EE] text-xs font-black hover:bg-black transition-all cursor-pointer shadow-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset filters</span>
              </button>
            </div>
          )}

          {/* Sync Calendar & Attendance Notice */}
          <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#FBBC04]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#FBBC04]">
                  Automated Reminders
                </span>
              </div>
              <h4 className="text-lg sm:text-xl font-black text-[#0D0E11] tracking-tight">
                Add Bootcamp Calendar to Google Calendar (.ics)
              </h4>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Sync live Google Meet sessions and assignment deadlines directly to your mobile calendar with 15-minute push notifications.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSubscribed(true);
                setTimeout(() => setSubscribed(false), 3500);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0D0E11] text-[#FAF7EE] text-xs font-black hover:bg-black transition-all cursor-pointer shadow-md shrink-0"
            >
              <CalendarDays className="h-4 w-4 text-[#FBBC04]" />
              <span>{subscribed ? 'Calendar Subscribed' : 'Subscribe to Google Calendar'}</span>
            </button>
          </div>
        </main>
      </div>

      {/* Session Details Modal */}
      <SessionDetails
        session={activeSession}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
      />
    </div>
  );
}
