'use client';

import React, { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { TrackDetailView } from '@/components/tracks/TrackDetailView';
import { DetailedTrack, StudentProfile, Track } from '@/types/lms';
import { mockStudentProfile, mockDashboardStats, mockUpcomingClasses, mockTracks } from '@/data/mockData';

interface TrackDetailClientProps {
  track: DetailedTrack;
  student?: StudentProfile;
  enrolledTracks?: Track[];
}

export function TrackDetailClient({ track, student = mockStudentProfile, enrolledTracks = mockTracks }: TrackDetailClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FAF7EE] text-[#0D0E11] antialiased selection:bg-[#FBBC04]/30">
      {/* Sidebar */}
      <DashboardSidebar
        currentTab="my-tracks"
        student={student}
        enrolledTracks={enrolledTracks}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingAssignmentsCount={mockDashboardStats.pendingAssignments}
        liveClassesCount={mockUpcomingClasses.filter((c) => c.isLiveNow).length}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader
          currentTab="my-tracks"
          student={student}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
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
              <span className="hidden sm:inline">BUILD ✦ INNOVATE ✦ SHIP</span>
            </div>
            <span className="hidden lg:inline text-[11px] font-bold tracking-normal opacity-90 pl-4">
              GDG on Campus LASU Career Bootcamp 2026
            </span>
          </div>
        </div>

        <main className="flex-1 p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl w-full mx-auto">
          <TrackDetailView track={track} />
        </main>
      </div>
    </div>
  );
}
