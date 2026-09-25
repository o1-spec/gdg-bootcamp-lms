'use client';

import React, { useState } from 'react';
import { Sparkles, Trophy } from 'lucide-react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProgressHero } from '@/components/progress/ProgressHero';
import { TrackProgressCard } from '@/components/progress/TrackProgressCard';
import { ActivitySummary } from '@/components/progress/ActivitySummary';
import { AttendanceSummaryCard } from '@/components/progress/AttendanceSummaryCard';
import { mockOverallProgress } from '@/data/progress';
import { mockStudentProfile, mockDashboardStats, mockUpcomingClasses, mockTracks } from '@/data/mockData';

export function ProgressClient() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FAF7EE] text-[#0D0E11] antialiased selection:bg-[#FBBC04]/30">
      {/* Sidebar */}
      <DashboardSidebar
        currentTab="progress"
        student={mockStudentProfile}
        enrolledTracks={mockTracks}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingAssignmentsCount={mockDashboardStats.pendingAssignments}
        liveClassesCount={mockUpcomingClasses.filter((c) => c.isLiveNow).length}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader
          currentTab="progress"
          student={mockStudentProfile}
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
            </div>
            <span className="hidden lg:inline text-[11px] font-bold tracking-normal opacity-90 pl-4">
              GDG on Campus LASU Analytics & Milestone Mastery
            </span>
          </div>
        </div>

        <main className="flex-1 p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl w-full mx-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5DFD0] pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#34A853]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
                  Learning Journey Analytics
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#0D0E11] tracking-tight">
                Progress
              </h1>
              <p className="text-sm text-[#5F6368] font-medium max-w-xl">
                Track your learning journey across all enrolled tracks. Monitor module completions, assignment milestones, and attendance consistency.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-[#E5DFD0] bg-white px-4 py-2.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[#FBBC04]" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
                      Target Completion
                    </span>
                    <span className="text-sm font-black text-[#0D0E11]">
                      Cohort Graduation: Dec 2026
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 1. Overall Progress Hero */}
          <ProgressHero progress={mockOverallProgress} />

          {/* 2. Track-by-Track Detailed Progress */}
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
                Curriculum Breakdown
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#0D0E11] tracking-tight">
                Track-by-Track Progress
              </h2>
            </div>

            <div className="space-y-6">
              {mockOverallProgress.trackSummaries.map((trackSummary) => (
                <TrackProgressCard
                  key={trackSummary.trackId}
                  trackProgress={trackSummary}
                />
              ))}
            </div>
          </div>

          {/* 3. Lightweight Weekly Activity Summary */}
          <ActivitySummary activity={mockOverallProgress.weeklyActivity} />

          {/* 4. Attendance Summary */}
          <AttendanceSummaryCard summary={mockOverallProgress.attendanceSummary} />

          {/* Graduation Capstone Readiness Callout */}
          <div className="rounded-3xl border border-[#22242B] bg-[#0D0E11] text-[#FAF7EE] p-6 sm:p-8 relative overflow-hidden">
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-[#4285F4]/15 blur-3xl" />
            <div className="relative z-10 space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#FBBC04]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#FBBC04]">
                  Certificate of Achievement Standard
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#FAF7EE] tracking-tight">
                Maintain 80%+ Attendance & Complete All Core Track Projects
              </h3>
              <p className="text-xs sm:text-sm text-[#FAF7EE]/70 font-normal leading-relaxed">
                Graduates meeting the technical criteria receive an official verified Google Developer Groups on Campus LASU Certificate and guaranteed placement interview introductions.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
