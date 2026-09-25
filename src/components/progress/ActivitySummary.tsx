'use client';

import React from 'react';
import { Calendar, CheckCircle2, FileCheck, Video } from 'lucide-react';
import { OverallBootcampProgress } from '@/types/lms';

interface ActivitySummaryProps {
  activity: OverallBootcampProgress['weeklyActivity'];
}

export function ActivitySummary({ activity }: ActivitySummaryProps) {
  return (
    <div className="rounded-3xl border border-gdg-border bg-white p-6 sm:p-8 space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gdg-blue" />
            <span className="text-xs font-bold uppercase tracking-wider text-gdg-gray">
              Weekly Momentum
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gdg-black tracking-tight">
            Learning Activity This Week
          </h3>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-gdg-cream text-gdg-gray border border-gdg-border self-start sm:self-auto">
          This Week
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Metric 1: Lessons completed */}
        <div className="p-4 rounded-2xl bg-gdg-cream border border-gdg-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gdg-gray uppercase tracking-wider">
              Lessons
            </span>
            <CheckCircle2 className="h-4 w-4 text-gdg-green" />
          </div>
          <div>
            <span className="text-3xl font-black text-gdg-black">
              {activity.lessonsCompletedThisWeek}
            </span>
            <span className="text-xs font-medium text-gdg-gray block mt-0.5">
              Completed this week
            </span>
          </div>
        </div>

        {/* Metric 2: Assignments submitted */}
        <div className="p-4 rounded-2xl bg-gdg-cream border border-gdg-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gdg-gray uppercase tracking-wider">
              Submissions
            </span>
            <FileCheck className="h-4 w-4 text-gdg-red" />
          </div>
          <div>
            <span className="text-3xl font-black text-gdg-black">
              {activity.assignmentsSubmittedThisWeek}
            </span>
            <span className="text-xs font-medium text-gdg-gray block mt-0.5">
              Assignments turned in
            </span>
          </div>
        </div>

        {/* Metric 3: Sessions attended */}
        <div className="p-4 rounded-2xl bg-gdg-cream border border-gdg-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gdg-gray uppercase tracking-wider">
              Attendance
            </span>
            <Video className="h-4 w-4 text-gdg-blue" />
          </div>
          <div>
            <span className="text-3xl font-black text-gdg-black">
              {activity.sessionsAttendedThisWeek}
            </span>
            <span className="text-xs font-medium text-gdg-gray block mt-0.5">
              Live sessions attended
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
