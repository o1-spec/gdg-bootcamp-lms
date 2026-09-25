'use client';

import React, { useState, useMemo } from 'react';
import {
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Inbox,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { AssignmentCard } from '@/components/assignments/AssignmentCard';
import { AssignmentFilters, AssignmentStatusFilter } from '@/components/assignments/AssignmentFilters';
import { FullAssignment, StudentProfile, Track } from '@/types/lms';

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

interface AssignmentsClientProps {
  initialAssignments?: FullAssignment[];
  student?: StudentProfile;
  enrolledTracks?: Track[];
}

export function AssignmentsClient({
  initialAssignments,
  student = fallbackStudent,
  enrolledTracks = [],
}: AssignmentsClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<AssignmentStatusFilter>('all');
  const [selectedTrack, setSelectedTrack] = useState('all');

  const allAssignments = initialAssignments || [];

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedTrack('all');
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = allAssignments.length;
    const completed = allAssignments.filter(
      (a) => a.status === 'completed' || a.status === 'reviewed'
    ).length;
    const inProgress = allAssignments.filter((a) => a.status === 'in_progress').length;
    const dueSoon = allAssignments.filter(
      (a) => a.daysRemaining <= 3 && a.status !== 'completed' && a.status !== 'reviewed'
    ).length;

    return { total, completed, inProgress, dueSoon };
  }, [allAssignments]);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return allAssignments.filter((asg) => {
      // Search matching
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches =
          asg.title.toLowerCase().includes(query) ||
          asg.trackName.toLowerCase().includes(query) ||
          asg.moduleName.toLowerCase().includes(query) ||
          asg.shortDescription.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Track matching
      if (selectedTrack !== 'all' && asg.trackId !== selectedTrack) {
        return false;
      }

      // Status matching
      if (selectedStatus === 'due_soon') {
        return asg.daysRemaining <= 3 && asg.status !== 'completed' && asg.status !== 'reviewed';
      }
      if (selectedStatus === 'completed') {
        return asg.status === 'completed' || asg.status === 'reviewed';
      }
      if (selectedStatus !== 'all' && asg.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [allAssignments, searchQuery, selectedTrack, selectedStatus]);

  return (
    <div className="flex min-h-screen bg-gdg-cream text-gdg-black antialiased selection:bg-gdg-yellow/30">
      {/* Sidebar */}
      <DashboardSidebar
        currentTab="assignments"
        student={student}
        enrolledTracks={enrolledTracks}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingAssignmentsCount={0}
        liveClassesCount={0}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader
          currentTab="assignments"
          student={student}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onSearchChange={setSearchQuery}
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
              <span className="hidden sm:inline">BUILD ✦ INNOVATE ✦ SHIP</span>
            </div>
            <span className="hidden lg:inline text-[11px] font-bold tracking-normal opacity-90 pl-4">
              GDG on Campus LASU Sprint & Milestone Portfolio Hub
            </span>
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gdg-border pb-6 sm:pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-gdg-red" />
                <span className="text-xs font-bold uppercase tracking-wider text-gdg-gray">
                  Sprint Deliverables & Portfolio Checks
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gdg-black tracking-tight">
                Assignments
              </h1>
              <p className="text-sm text-gdg-gray font-medium max-w-xl">
                View, track, and submit your bootcamp assignments. Receive mentor code reviews, benchmark algorithms, and level up your engineering skills.
              </p>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
              <div className="rounded-2xl border border-gdg-border bg-white p-3.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-gdg-blue" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray">
                    Total
                  </span>
                </div>
                <div className="text-xl font-black text-gdg-black mt-1">{stats.total}</div>
              </div>

              <div className="rounded-2xl border border-gdg-border bg-white p-3.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-gdg-green" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray">
                    Done
                  </span>
                </div>
                <div className="text-xl font-black text-gdg-green-dark mt-1">{stats.completed}</div>
              </div>

              <div className="rounded-2xl border border-gdg-border bg-white p-3.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gdg-yellow" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray">
                    Active
                  </span>
                </div>
                <div className="text-xl font-black text-[#855B00] mt-1">{stats.inProgress}</div>
              </div>

              <div className="rounded-2xl border border-gdg-border bg-white p-3.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-gdg-red" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray">
                    Due Soon
                  </span>
                </div>
                <div className="text-xl font-black text-gdg-red mt-1">{stats.dueSoon}</div>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <AssignmentFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedTrack={selectedTrack}
            onTrackChange={setSelectedTrack}
            onResetFilters={handleResetFilters}
            totalResultsCount={filteredAssignments.length}
          />

          {/* Assignments Grid or Empty State */}
          {filteredAssignments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gdg-border bg-white p-12 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gdg-cream text-gdg-gray border border-gdg-border">
                <Inbox className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-gdg-black">
                  No assignments found
                </h3>
                <p className="text-xs sm:text-sm text-gdg-gray max-w-md mx-auto">
                  No assignments match your selected status or track filters.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gdg-black text-gdg-cream text-xs font-black hover:bg-black transition-all cursor-pointer shadow-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset all filters</span>
              </button>
            </div>
          )}

          {/* Peer Code Review & Capstone Banner */}
          <div className="rounded-3xl border border-gdg-dark-border bg-gdg-black text-gdg-cream p-6 sm:p-8 relative overflow-hidden">
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-gdg-red/15 blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-gdg-yellow" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gdg-yellow">
                    Mentor Review Standards
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gdg-cream tracking-tight">
                  High-Quality GitHub Commits & Automated Linting
                </h3>
                <p className="text-xs sm:text-sm text-gdg-cream/70 font-normal leading-relaxed">
                  Every submitted project is evaluated by GDG industry mentors against real-world standards: clean architectural modularity, informative commit logs, and test coverage.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-sm font-black text-gdg-cream">
                    <Trophy className="h-4 w-4 text-gdg-yellow" />
                    <span>Top 10%</span>
                  </div>
                  <span className="text-[10px] text-gdg-cream/60 font-semibold uppercase tracking-wider block mt-0.5">
                    Portfolio Honors
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
