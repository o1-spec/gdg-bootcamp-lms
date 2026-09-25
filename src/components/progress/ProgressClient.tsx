'use client';

import React, { useState } from 'react';
import { Sparkles, Trophy } from 'lucide-react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProgressHero } from '@/components/progress/ProgressHero';
import { TrackProgressCard } from '@/components/progress/TrackProgressCard';
import { ActivitySummary } from '@/components/progress/ActivitySummary';
import { AttendanceSummaryCard } from '@/components/progress/AttendanceSummaryCard';
import { OverallBootcampProgress, StudentProfile, Track } from '@/types/lms';

const defaultProgress: OverallBootcampProgress = {
  overallPercentage: 0,
  tracksEnrolled: 0,
  completedLessons: 0,
  totalLessons: 0,
  completedModules: 0,
  totalModules: 0,
  completedAssignments: 0,
  totalAssignments: 0,
  attendanceRate: 100,
  weeklyActivity: {
    lessonsCompletedThisWeek: 0,
    assignmentsSubmittedThisWeek: 0,
    sessionsAttendedThisWeek: 0,
    hoursSpentThisWeek: 0,
  },
  attendanceSummary: {
    attendanceRate: 100,
    totalSessions: 0,
    presentCount: 0,
    absentCount: 0,
    excusedCount: 0,
  },
  trackSummaries: [],
};

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

interface ProgressClientProps {
  initialProgress?: OverallBootcampProgress;
  student?: StudentProfile;
  enrolledTracks?: Track[];
}

export function ProgressClient({
  initialProgress,
  student = fallbackStudent,
  enrolledTracks = [],
}: ProgressClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const progress = initialProgress || defaultProgress;

  return (
    <div className="flex min-h-screen bg-gdg-cream text-gdg-black antialiased selection:bg-gdg-yellow/30">
      {/* Sidebar */}
      <DashboardSidebar
        currentTab="progress"
        student={student}
        enrolledTracks={enrolledTracks}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingAssignmentsCount={Math.max(0, progress.totalAssignments - progress.completedAssignments)}
        liveClassesCount={0}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader
          currentTab="progress"
          student={student}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        {/* Ticker Ribbon */}
        <div className="w-full bg-gdg-yellow text-gdg-black py-2 px-6 overflow-hidden border-b border-gdg-black/10">
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gdg-border pb-6 sm:pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-gdg-green" />
                <span className="text-xs font-bold uppercase tracking-wider text-gdg-gray">
                  Learning Journey Analytics
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gdg-black tracking-tight">
                Progress
              </h1>
              <p className="text-sm text-gdg-gray font-medium max-w-xl">
                Track your learning journey across all enrolled tracks. Monitor module completions, assignment milestones, and attendance consistency.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-gdg-border bg-white px-4 py-2.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-gdg-yellow" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray block">
                      Target Completion
                    </span>
                    <span className="text-sm font-black text-gdg-black">
                      Cohort Graduation: Dec 2026
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 1. Overall Progress Hero */}
          <ProgressHero progress={progress} />

          {/* 2. Track-by-Track Detailed Progress */}
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gdg-gray">
                Curriculum Breakdown
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gdg-black tracking-tight">
                Track-by-Track Progress
              </h2>
            </div>

            <div className="space-y-6">
              {progress.trackSummaries.map((trackSummary) => (
                <TrackProgressCard
                  key={trackSummary.trackId}
                  trackProgress={trackSummary}
                />
              ))}
            </div>
          </div>

          {/* 3. Lightweight Weekly Activity Summary */}
          <ActivitySummary activity={progress.weeklyActivity} />

          {/* 4. Attendance Summary */}
          <AttendanceSummaryCard summary={progress.attendanceSummary} />

          {/* Graduation Capstone Readiness Callout */}
          <div className="rounded-3xl border border-gdg-dark-border bg-gdg-black text-gdg-cream p-6 sm:p-8 relative overflow-hidden">
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-gdg-blue/15 blur-3xl" />
            <div className="relative z-10 space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gdg-yellow" />
                <span className="text-xs font-bold uppercase tracking-wider text-gdg-yellow">
                  Certificate of Achievement Standard
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gdg-cream tracking-tight">
                Maintain 80%+ Attendance & Complete All Core Track Projects
              </h3>
              <p className="text-xs sm:text-sm text-gdg-cream/70 font-normal leading-relaxed">
                Graduates meeting the technical criteria receive an official verified Google Developer Groups on Campus LASU Certificate and guaranteed placement interview introductions.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
