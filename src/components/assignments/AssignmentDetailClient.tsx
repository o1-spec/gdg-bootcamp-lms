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

interface AssignmentDetailClientProps {
  assignment: FullAssignment;
  student?: StudentProfile;
  enrolledTracks?: Track[];
}

export function AssignmentDetailClient({
  assignment: initialAssignment,
  student = fallbackStudent,
  enrolledTracks = [],
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
              GDG on Campus LASU Sprint & Milestone Portfolio Hub
            </span>
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-5xl w-full mx-auto">
          {/* Back button & Breadcrumbs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/assignments"
              className="inline-flex items-center gap-2 text-xs font-bold text-gdg-gray hover:text-gdg-black transition-colors"
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
              <span className="text-xs font-bold text-gdg-gray">
                {assignment.moduleName}
              </span>
            </div>
          </div>

          {/* Section A: Header Banner */}
          <div className="rounded-3xl border border-gdg-border bg-white p-5 sm:p-8 shadow-xs relative overflow-hidden space-y-6">
            <div
              className="absolute top-0 left-0 right-0 h-2"
              style={{ backgroundColor: assignment.trackAccentColor }}
            />

            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-gdg-cream text-gdg-gray border border-gdg-border">
                    {assignment.type} Deliverable
                  </span>
                  <AssignmentStatusBadge
                    status={assignment.status}
                    daysRemaining={assignment.daysRemaining}
                    showDueDateText={true}
                  />
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-gdg-black tracking-tight">
                  {assignment.title}
                </h1>

                <p className="text-sm sm:text-base text-gdg-gray font-medium leading-relaxed">
                  {assignment.shortDescription}
                </p>
              </div>

              {/* Due Date & Points Card */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 sm:gap-4 p-4 rounded-2xl bg-gdg-cream border border-gdg-border shrink-0">
                <div className="space-y-1 sm:text-left lg:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray flex items-center lg:justify-end gap-1">
                    <Calendar className="h-3.5 w-3.5 text-gdg-blue" />
                    Deadline
                  </span>
                  <p className="text-xs sm:text-sm font-black text-gdg-black">
                    {assignment.dueDate}
                  </p>
                  {assignment.dueTime && (
                    <p className="text-[11px] text-gdg-gray font-medium">
                      at {assignment.dueTime}
                    </p>
                  )}
                </div>

                <div className="space-y-1 sm:text-left lg:text-right pt-2 sm:pt-0 lg:pt-2 border-t sm:border-t-0 sm:border-l sm:pl-4 lg:border-l-0 lg:pl-0 lg:border-t border-gdg-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray flex items-center lg:justify-end gap-1">
                    <Trophy className="h-3.5 w-3.5 text-gdg-yellow" />
                    Points Value
                  </span>
                  <p className="text-lg sm:text-xl font-black text-gdg-black">
                    {assignment.points} Points
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Assignment Overview */}
          <div className="rounded-3xl border border-gdg-border bg-white p-5 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gdg-blue" />
                <span className="text-xs font-bold uppercase tracking-wider text-gdg-gray">
                  Assignment Overview
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gdg-black tracking-tight">
                Project Scope & Architectural Context
              </h2>
              <p className="text-sm text-gdg-black leading-relaxed">
                {assignment.fullDescription}
              </p>
            </div>

            {/* Objectives */}
            <div className="space-y-3 pt-4 border-t border-gdg-border">
              <h3 className="text-sm font-black text-gdg-black uppercase tracking-wider">
                Key Learning Objectives
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assignment.objectives.map((obj, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-2xl bg-gdg-cream border border-gdg-border text-xs font-semibold text-gdg-black"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gdg-green/15 text-gdg-green text-[10px] font-black">
                      ✓
                    </span>
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Outcome */}
            <div className="p-4 rounded-2xl bg-gdg-cream border border-gdg-border space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray">
                Expected Deliverable Outcome
              </span>
              <p className="text-xs sm:text-sm font-bold text-gdg-black">
                {assignment.expectedOutcome}
              </p>
            </div>
          </div>

          {/* Section C: Requirements Checklist */}
          <div className="rounded-3xl border border-gdg-border bg-white p-5 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CheckSquare2 className="h-4 w-4 text-gdg-green" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gdg-gray">
                    Deliverable Checklist
                  </span>
                </div>
                <h3 className="text-xl font-black text-gdg-black tracking-tight mt-1">
                  Requirements
                </h3>
              </div>
              <span className="text-xs font-bold text-gdg-gray">
                {Object.values(checkedRequirements).filter(Boolean).length} of{' '}
                {assignment.requirements.length} completed
              </span>
            </div>

            <p className="text-xs text-gdg-gray">
              Check off items as you implement them to track your progress before submitting.
            </p>

            <div className="space-y-2.5">
              {assignment.requirements.map((req, idx) => {
                const isChecked = !!checkedRequirements[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleRequirement(idx)}
                    className="flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none bg-white hover:bg-gdg-cream border-gdg-border"
                  >
                    <div className="pt-0.5 shrink-0">
                      {isChecked ? (
                        <CheckSquare2 className="h-5 w-5 text-gdg-green" />
                      ) : (
                        <Square className="h-5 w-5 text-gdg-gray" />
                      )}
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-semibold transition-colors ${
                        isChecked ? 'line-through text-gdg-gray' : 'text-gdg-black'
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
            <div className="rounded-3xl border border-gdg-border bg-white p-6 sm:p-7 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gdg-yellow" />
                <span className="text-xs font-bold uppercase tracking-wider text-gdg-gray">
                  Guidelines
                </span>
              </div>
              <h3 className="text-lg font-black text-gdg-black tracking-tight">
                Submission Instructions
              </h3>
              <ol className="space-y-3 list-decimal list-inside text-xs text-gdg-black font-medium leading-relaxed">
                {assignment.submissionInstructions.map((inst, idx) => (
                  <li key={idx} className="pl-1">
                    <span>{inst}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Helpful Resources */}
            <div className="rounded-3xl border border-gdg-border bg-white p-6 sm:p-7 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gdg-blue" />
                <span className="text-xs font-bold uppercase tracking-wider text-gdg-gray">
                  Reference Material
                </span>
              </div>
              <h3 className="text-lg font-black text-gdg-black tracking-tight">
                Helpful Lesson Resources
              </h3>
              <div className="space-y-2.5">
                {assignment.resources.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target={res.url.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-gdg-cream hover:bg-gdg-cream/80 border border-gdg-border transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-gdg-black border border-gdg-border">
                        {res.type === 'github' ? (
                          <GitBranch className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-gdg-black truncate group-hover:text-gdg-blue">
                        {res.title}
                      </span>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-gdg-gray shrink-0 ml-2 group-hover:text-gdg-blue" />
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
