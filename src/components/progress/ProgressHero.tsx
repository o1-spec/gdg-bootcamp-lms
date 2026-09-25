'use client';

import React from 'react';
import { Layers, BookOpen, FileCheck, CheckCircle2, TrendingUp } from 'lucide-react';
import { OverallBootcampProgress } from '@/types/lms';

interface ProgressHeroProps {
  progress: OverallBootcampProgress;
}

export function ProgressHero({ progress }: ProgressHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gdg-dark-border bg-gdg-black text-gdg-cream p-5 sm:p-8 lg:p-10 shadow-sm space-y-8">
      {/* Background Subtle Gradient Glows */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-gdg-blue/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-gdg-yellow/10 blur-3xl" />

      {/* Top Header & Percentage */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-gdg-green" />
            <span className="text-xs font-bold uppercase tracking-wider text-gdg-green">
              Curriculum Milestone Pace
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gdg-cream tracking-tight">
            You&apos;re making strong progress. Keep going.
          </h2>

          <p className="text-xs sm:text-sm text-gdg-cream/70 font-normal leading-relaxed">
            Your cumulative completion across all enrolled tracks. Keep completing lessons and submitting assignments to push your progress higher.
          </p>
        </div>

        {/* Large Percentage Metric */}
        <div className="flex items-center gap-6 p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 shrink-0">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gdg-cream/60 block">
              Overall Completion
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-6xl font-black text-gdg-cream tracking-tight">
                {progress.overallPercentage}
              </span>
              <span className="text-xl sm:text-2xl font-black text-gdg-yellow">%</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gdg-green font-bold pt-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Keep going</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-color Segmented Progress Bar */}
      <div className="space-y-2 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold text-gdg-cream/70">
          <span>Bootcamp Milestone Progress</span>
          <span>{progress.completedLessons} of {progress.totalLessons} Lessons Mastered</span>
        </div>

        <div className="h-3.5 w-full bg-gdg-dark-border rounded-full overflow-hidden p-0.5 border border-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gdg-blue via-gdg-yellow to-gdg-green transition-all duration-500"
            style={{ width: `${progress.overallPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 border-t border-white/10 relative z-10">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-gdg-cream/60 uppercase">
            <Layers className="h-3.5 w-3.5 text-gdg-blue" />
            <span>Tracks</span>
          </div>
          <p className="text-lg font-black text-gdg-cream">
            {progress.tracksEnrolled} Active
          </p>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-gdg-cream/60 uppercase">
            <BookOpen className="h-3.5 w-3.5 text-gdg-yellow" />
            <span>Lessons</span>
          </div>
          <p className="text-lg font-black text-gdg-cream">
            {progress.completedLessons} / {progress.totalLessons}
          </p>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-gdg-cream/60 uppercase">
            <CheckCircle2 className="h-3.5 w-3.5 text-gdg-green" />
            <span>Modules</span>
          </div>
          <p className="text-lg font-black text-gdg-cream">
            {progress.completedModules} / {progress.totalModules}
          </p>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-gdg-cream/60 uppercase">
            <FileCheck className="h-3.5 w-3.5 text-gdg-red" />
            <span>Assignments</span>
          </div>
          <p className="text-lg font-black text-gdg-cream">
            {progress.completedAssignments} / {progress.totalAssignments}
          </p>
        </div>

        <div className="space-y-0.5 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-gdg-cream/60 uppercase">
            <span className="h-2 w-2 rounded-full bg-gdg-green" />
            <span>Attendance</span>
          </div>
          <p className="text-lg font-black text-gdg-green">
            {progress.attendanceRate}%
          </p>
        </div>
      </div>
    </div>
  );
}
