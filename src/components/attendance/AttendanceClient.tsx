'use client';

import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  X,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { AttendanceTable } from '@/components/attendance/AttendanceTable';
import { mockAttendanceRecords, mockAttendanceSummary } from '@/data/attendance';
import { mockStudentProfile, mockDashboardStats, mockUpcomingClasses, mockTracks } from '@/data/mockData';
import { AttendanceRecord, AttendanceStatus, AttendanceSummaryData, StudentProfile, Track } from '@/types/lms';
import { cn } from '@/lib/utils';

interface AttendanceClientProps {
  initialSummary?: AttendanceSummaryData;
  initialRecords?: AttendanceRecord[];
  student?: StudentProfile;
  enrolledTracks?: Track[];
}

export function AttendanceClient({
  initialSummary,
  initialRecords,
  student = mockStudentProfile,
  enrolledTracks = mockTracks,
}: AttendanceClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | AttendanceStatus>('all');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const summary = initialSummary || mockAttendanceSummary;
  const allRecords =
    initialRecords && initialRecords.length > 0 ? initialRecords : mockAttendanceRecords;

  const trackOptions = [
    { id: 'all', label: 'All Tracks' },
    { id: 'backend-development', label: 'Backend Development' },
    { id: 'frontend-development', label: 'Frontend Development' },
    { id: 'dsa-interview-prep', label: 'DSA & Interview Prep' },
    { id: 'ui-ux-design', label: 'UI/UX Design' },
  ];

  const statusOptions: { id: 'all' | AttendanceStatus; label: string }[] = [
    { id: 'all', label: 'All Records' },
    { id: 'present', label: 'Present' },
    { id: 'absent', label: 'Absent' },
    { id: 'excused', label: 'Excused' },
  ];

  const filteredRecords = useMemo(() => {
    return allRecords.filter((rec) => {
      // Status filter
      if (selectedStatus !== 'all' && rec.status !== selectedStatus) {
        return false;
      }

      // Track filter
      if (selectedTrack !== 'all' && rec.trackId !== selectedTrack) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches =
          rec.sessionTitle.toLowerCase().includes(query) ||
          rec.mentorName.toLowerCase().includes(query) ||
          rec.trackName.toLowerCase().includes(query) ||
          rec.date.toLowerCase().includes(query);
        if (!matches) return false;
      }

      return true;
    });
  }, [allRecords, selectedStatus, selectedTrack, searchQuery]);

  const handleResetFilters = () => {
    setSelectedStatus('all');
    setSelectedTrack('all');
    setSearchQuery('');
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7EE] text-[#0D0E11] antialiased selection:bg-[#FBBC04]/30">
      {/* Sidebar */}
      <DashboardSidebar
        currentTab="attendance"
        student={student}
        enrolledTracks={enrolledTracks}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingAssignmentsCount={mockDashboardStats.pendingAssignments}
        liveClassesCount={mockUpcomingClasses.filter((c) => c.isLiveNow).length}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader
          currentTab="attendance"
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
              GDG on Campus LASU Class Participation Ledger
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
                  Official Class Ledger
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#0D0E11] tracking-tight">
                Attendance
              </h1>
              <p className="text-sm text-[#5F6368] font-medium max-w-xl">
                View your attendance across bootcamp classes and sessions. Live participation is recorded automatically during Google Meet sessions.
              </p>
            </div>

            {/* Overall Rate Badge */}
            <div className="rounded-2xl border border-[#34A853]/30 bg-[#34A853]/10 px-5 py-3 shadow-2xs self-start md:self-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1e7e34] block">
                Overall Rate
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#1e7e34]">
                {summary.attendanceRate}%
              </span>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-3xl border border-[#E5DFD0] bg-white p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider">
                  Rate
                </span>
                <UserCheck className="h-4 w-4 text-[#34A853]" />
              </div>
              <p className="text-2xl font-black text-[#1e7e34]">
                {summary.attendanceRate}%
              </p>
              <span className="text-[11px] text-[#5F6368]">
                Target: &gt;80%
              </span>
            </div>

            <div className="rounded-3xl border border-[#E5DFD0] bg-white p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider">
                  Present
                </span>
                <CheckCircle2 className="h-4 w-4 text-[#34A853]" />
              </div>
              <p className="text-2xl font-black text-[#0D0E11]">
                {summary.presentCount}
              </p>
              <span className="text-[11px] text-[#5F6368]">
                Sessions attended
              </span>
            </div>

            <div className="rounded-3xl border border-[#E5DFD0] bg-white p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider">
                  Missed
                </span>
                <XCircle className="h-4 w-4 text-[#EA4335]" />
              </div>
              <p className="text-2xl font-black text-[#EA4335]">
                {summary.absentCount}
              </p>
              <span className="text-[11px] text-[#5F6368]">
                Unexcused absences
              </span>
            </div>

            <div className="rounded-3xl border border-[#E5DFD0] bg-white p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider">
                  Excused
                </span>
                <AlertCircle className="h-4 w-4 text-[#FBBC04]" />
              </div>
              <p className="text-2xl font-black text-[#0D0E11]">
                {summary.excusedCount}
              </p>
              <span className="text-[11px] text-[#5F6368]">
                Authorized leave
              </span>
            </div>
          </div>

          {/* Filters Controller */}
          <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 shadow-xs space-y-5">
            {/* Search Input */}
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F6368]" />
              <input
                type="text"
                placeholder="Search sessions by topic, mentor, or track..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 rounded-full border border-[#E5DFD0] bg-[#FAF7EE]/50 pl-11 pr-11 text-xs sm:text-sm font-medium text-[#0D0E11] placeholder:text-[#5F6368] focus:border-[#0D0E11] focus:bg-white focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5F6368] hover:text-[#0D0E11]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Tabs: Status & Tracks */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
              {/* Status Pills */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
                  Filter by Status
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {statusOptions.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStatus(st.id)}
                      className={cn(
                        'px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                        selectedStatus === st.id
                          ? 'bg-[#0D0E11] text-[#FAF7EE]'
                          : 'bg-[#FAF7EE] border border-[#E5DFD0] text-[#5F6368] hover:text-[#0D0E11]'
                      )}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset button */}
              <div className="flex items-center gap-3 pt-2 lg:pt-0 text-xs font-medium text-[#5F6368]">
                <span>
                  Showing <strong>{filteredRecords.length}</strong> of{' '}
                  {mockAttendanceRecords.length} records
                </span>
                {(selectedStatus !== 'all' || selectedTrack !== 'all' || searchQuery) && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#EA4335] hover:underline cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Track selector pills */}
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

          {/* Table / List */}
          <AttendanceTable records={filteredRecords} />

          {/* Absence Appeal Policy Callout */}
          <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#FBBC04]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#FBBC04]">
                  Excused Leave Policy
                </span>
              </div>
              <h4 className="text-lg sm:text-xl font-black text-[#0D0E11] tracking-tight">
                Missed a live session due to exams or technical issues?
              </h4>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Submit an absence excuse note with supporting proof to your track mentor within 48 hours to convert unexcused absences to approved status.
              </p>
            </div>

            <button
              type="button"
              onClick={() => alert('Absence appeal form submitted to track mentor!')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0D0E11] text-[#FAF7EE] text-xs font-black hover:bg-black transition-all cursor-pointer shadow-md shrink-0"
            >
              <span>Submit Absence Excuse</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
