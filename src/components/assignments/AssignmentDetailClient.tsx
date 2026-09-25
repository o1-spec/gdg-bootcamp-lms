'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Trophy,
  CheckSquare2,
  Square,
  Sparkles,
  ExternalLink,
  BookOpen,
  Layers,
  FileText,
  GitBranch,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SubmissionForm } from '@/components/assignments/SubmissionForm';
import { AssignmentStatusBadge } from '@/components/assignments/AssignmentStatusBadge';
import { FullAssignment, AssignmentSubmission, ExtendedAssignmentStatus, StudentProfile, Track } from '@/types/lms';
import { mockStudentProfile, mockDashboardStats, mockUpcomingClasses, mockTracks } from '@/data/mockData';

interface AssignmentDetailClientProps {
  assignment: FullAssignment;
  student?: StudentProfile;
  enrolledTracks?: Track[];
}

export function AssignmentDetailClient({
  assignment: initialAssignment,
  student = mockStudentProfile,
  enrolledTracks = mockTracks,
}: AssignmentDetailClientProps) {
  const [assignment, setAssignment] = useState<FullAssignment>(initialAssignment);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [checkedRequirements, setCheckedRequirements] = useState<Record<number, boolean>>({});

  const toggleRequirement = (idx: number) => {
    setCheckedRequirements((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleUpdateSubmission = (newSubmission: AssignmentSubmission) => {
    let newStatus: ExtendedAssignmentStatus = assignment.status;
    if (newSubmission.status === 'SUBMITTED') {
      newStatus = 'submitted';
    } else if (newSubmission.status === 'DRAFT') {
      newStatus = 'in_progress';
    }
    setAssignment((prev) => ({
      ...prev,
      status: newStatus,
      submission: newSubmission,
    }));
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7EE] text-[#0D0E11] antialiased selection:bg-[#FBBC04]/30">
      {/* Sidebar */}
      <DashboardSidebar
        currentTab="assignments"
        student={student}
        enrolledTracks={enrolledTracks}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingAssignmentsCount={mockDashboardStats.pendingAssignments}
        liveClassesCount={mockUpcomingClasses.filter((c) => c.isLiveNow).length}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader
          currentTab="assignments"
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
            </div>
            <span className="hidden lg:inline text-[11px] font-bold tracking-normal opacity-90 pl-4">
              GDG on Campus LASU Sprint & Milestone Portfolio Hub
            </span>
          </div>
        </div>

        <main className="flex-1 p-6 sm:p-8 lg:p-10 space-y-8 max-w-5xl w-full mx-auto">
          {/* Back button & Breadcrumbs */}
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/assignments"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#5F6368] hover:text-[#0D0E11] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to all assignments</span>
            </Link>

            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                style={{
                  backgroundColor: `${assignment.trackAccentColor}15`,
                  borderColor: `${assignment.trackAccentColor}30`,
                  color: assignment.trackAccentColor,
                }}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>{assignment.trackName}</span>
              </span>
              <span className="text-xs font-bold text-[#5F6368]">
                {assignment.moduleName}
              </span>
            </div>
          </div>

          {/* Section A: Header Banner */}
          <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden space-y-6">
            <div
              className="absolute top-0 left-0 right-0 h-2"
              style={{ backgroundColor: assignment.trackAccentColor }}
            />

            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
                    {assignment.type} Deliverable
                  </span>
                  <AssignmentStatusBadge
                    status={assignment.status}
                    daysRemaining={assignment.daysRemaining}
                    showDueDateText={true}
                  />
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-[#0D0E11] tracking-tight">
                  {assignment.title}
                </h1>

                <p className="text-sm sm:text-base text-[#5F6368] font-medium leading-relaxed">
                  {assignment.shortDescription}
                </p>
              </div>

              {/* Due Date & Points Card */}
              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] shrink-0">
                <div className="space-y-1 lg:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] flex items-center lg:justify-end gap-1">
                    <Calendar className="h-3.5 w-3.5 text-[#4285F4]" />
                    Deadline
                  </span>
                  <p className="text-xs sm:text-sm font-black text-[#0D0E11]">
                    {assignment.dueDate}
                  </p>
                  {assignment.dueTime && (
                    <p className="text-[11px] text-[#5F6368] font-medium">
                      at {assignment.dueTime}
                    </p>
                  )}
                </div>

                <div className="space-y-1 lg:text-right pt-0 lg:pt-2 lg:border-t lg:border-[#E5DFD0]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] flex items-center lg:justify-end gap-1">
                    <Trophy className="h-3.5 w-3.5 text-[#FBBC04]" />
                    Points Value
                  </span>
                  <p className="text-lg sm:text-xl font-black text-[#0D0E11]">
                    {assignment.points} Points
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Assignment Overview */}
          <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#4285F4]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
                  Assignment Overview
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0D0E11] tracking-tight">
                Project Scope & Architectural Context
              </h2>
              <p className="text-sm text-[#0D0E11] leading-relaxed">
                {assignment.fullDescription}
              </p>
            </div>

            {/* Objectives */}
            <div className="space-y-3 pt-4 border-t border-[#E5DFD0]">
              <h3 className="text-sm font-black text-[#0D0E11] uppercase tracking-wider">
                Key Learning Objectives
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assignment.objectives.map((obj, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-xs font-semibold text-[#0D0E11]"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#34A853]/15 text-[#34A853] text-[10px] font-black">
                      ✓
                    </span>
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Outcome */}
            <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368]">
                Expected Deliverable Outcome
              </span>
              <p className="text-xs sm:text-sm font-bold text-[#0D0E11]">
                {assignment.expectedOutcome}
              </p>
            </div>
          </div>

          {/* Section C: Requirements Checklist */}
          <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CheckSquare2 className="h-4 w-4 text-[#34A853]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
                    Deliverable Checklist
                  </span>
                </div>
                <h3 className="text-xl font-black text-[#0D0E11] tracking-tight mt-1">
                  Requirements
                </h3>
              </div>
              <span className="text-xs font-bold text-[#5F6368]">
                {Object.values(checkedRequirements).filter(Boolean).length} of{' '}
                {assignment.requirements.length} completed
              </span>
            </div>

            <p className="text-xs text-[#5F6368]">
              Check off items as you implement them to track your progress before submitting.
            </p>

            <div className="space-y-2.5">
              {assignment.requirements.map((req, idx) => {
                const isChecked = !!checkedRequirements[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleRequirement(idx)}
                    className="flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none bg-white hover:bg-[#FAF7EE] border-[#E5DFD0]"
                  >
                    <div className="pt-0.5 shrink-0">
                      {isChecked ? (
                        <CheckSquare2 className="h-5 w-5 text-[#34A853]" />
                      ) : (
                        <Square className="h-5 w-5 text-[#5F6368]" />
                      )}
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-semibold transition-colors ${
                        isChecked ? 'line-through text-[#5F6368]' : 'text-[#0D0E11]'
                      }`}
                    >
                      {req}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section D & E: Submission Instructions & Helpful Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Submission Instructions */}
            <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-7 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#FBBC04]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
                  Guidelines
                </span>
              </div>
              <h3 className="text-lg font-black text-[#0D0E11] tracking-tight">
                Submission Instructions
              </h3>
              <ol className="space-y-3 list-decimal list-inside text-xs text-[#0D0E11] font-medium leading-relaxed">
                {assignment.submissionInstructions.map((inst, idx) => (
                  <li key={idx} className="pl-1">
                    <span>{inst}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Helpful Resources */}
            <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-7 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#4285F4]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
                  Reference Material
                </span>
              </div>
              <h3 className="text-lg font-black text-[#0D0E11] tracking-tight">
                Helpful Lesson Resources
              </h3>
              <div className="space-y-2.5">
                {assignment.resources.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target={res.url.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7EE] hover:bg-[#FAF7EE]/80 border border-[#E5DFD0] transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#0D0E11] border border-[#E5DFD0]">
                        {res.type === 'github' ? (
                          <GitBranch className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-[#0D0E11] truncate group-hover:text-[#4285F4]">
                        {res.title}
                      </span>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-[#5F6368] shrink-0 ml-2 group-hover:text-[#4285F4]" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Section F: Student Submission Form Area */}
          <div id="submission-area">
            <SubmissionForm
              assignmentId={assignment.id}
              initialSubmission={assignment.submission}
              maxPoints={assignment.points}
              onUpdateSubmission={handleUpdateSubmission}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
