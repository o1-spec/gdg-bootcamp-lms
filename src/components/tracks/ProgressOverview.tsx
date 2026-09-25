import React from 'react';
import { BookOpen, CheckCircle2, Layers, Users } from 'lucide-react';
import { DetailedTrackProgress } from '@/types/lms';

interface ProgressOverviewProps {
  progress: DetailedTrackProgress;
  accentColor?: string;
}

export function ProgressOverview({
  progress,
  accentColor = '#4285F4',
}: ProgressOverviewProps) {
  return (
    <div className="space-y-8">
      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Overall Percentage */}
        <div className="rounded-3xl border border-gdg-border bg-white p-6 shadow-xs relative overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ backgroundColor: accentColor }}
          />
          <span className="text-xs font-bold uppercase tracking-wider text-gdg-gray">
            Overall Progress
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span
              className="text-4xl font-black tracking-tight"
              style={{ color: accentColor }}
            >
              {progress.overallPercentage}%
            </span>
            <span className="text-xs font-bold text-gdg-green bg-gdg-green/15 px-2.5 py-0.5 rounded-full">
              On Track
            </span>
          </div>
          <p className="text-xs text-gdg-gray mt-2 font-medium">
            Based on completed lessons & assignments
          </p>
        </div>

        {/* Lessons Completed */}
        <div className="rounded-3xl border border-gdg-border bg-white p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gdg-green" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gdg-gray">
              Lessons
            </span>
            <BookOpen className="h-4 w-4 text-gdg-green" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gdg-black tracking-tight">
              {progress.completedLessons}
            </span>
            <span className="text-xs font-bold text-gdg-gray">
              / {progress.totalLessons} Total
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-gdg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gdg-green rounded-full"
              style={{
                width: `${Math.round(
                  (progress.completedLessons / progress.totalLessons) * 100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Modules Completed */}
        <div className="rounded-3xl border border-gdg-border bg-white p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gdg-yellow" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gdg-gray">
              Modules
            </span>
            <Layers className="h-4 w-4 text-gdg-yellow" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gdg-black tracking-tight">
              {progress.completedModules}
            </span>
            <span className="text-xs font-bold text-gdg-gray">
              / {progress.totalModules} Completed
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-gdg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gdg-yellow rounded-full"
              style={{
                width: `${Math.round(
                  (progress.completedModules / progress.totalModules) * 100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="rounded-3xl border border-gdg-border bg-white p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gdg-red" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gdg-gray">
              Attendance
            </span>
            <Users className="h-4 w-4 text-gdg-red" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gdg-black tracking-tight">
              {progress.attendanceRate}%
            </span>
            <span className="text-xs font-bold text-gdg-gray">
              Live Workshops
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-gdg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gdg-red rounded-full"
              style={{ width: `${progress.attendanceRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Module-by-Module Progress Bars */}
      <div className="rounded-3xl border border-gdg-border bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h4 className="text-lg font-black text-gdg-black tracking-tight">
            Curriculum Module Breakdown
          </h4>
          <p className="text-xs text-gdg-gray font-medium mt-0.5">
            Step-by-step completion rate for each syllabus sprint
          </p>
        </div>

        <div className="space-y-4">
          {progress.moduleProgress.map((mod) => (
            <div
              key={mod.moduleOrder}
              className="p-4 rounded-2xl border border-gdg-border bg-gdg-cream/50 space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-gdg-border font-black text-[11px] text-gdg-black">
                    0{mod.moduleOrder}
                  </span>
                  <span className="font-bold text-gdg-black">
                    {mod.moduleTitle}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {mod.percentage === 100 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gdg-green-dark">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Done
                    </span>
                  )}
                  <span className="font-black text-xs text-gdg-black">
                    {mod.percentage}%
                  </span>
                </div>
              </div>

              <div className="h-2 w-full bg-gdg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${mod.percentage}%`,
                    backgroundColor:
                      mod.percentage === 100 ? '#34A853' : accentColor,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
