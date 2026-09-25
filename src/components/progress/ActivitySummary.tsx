'use client';

import React from 'react';
import { Calendar, CheckCircle2, FileCheck, Video } from 'lucide-react';
import { OverallBootcampProgress } from '@/types/lms';

interface ActivitySummaryProps {
  activity: OverallBootcampProgress['weeklyActivity'];
}

export function ActivitySummary({ activity }: ActivitySummaryProps) {
  return (
    <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-8 space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#4285F4]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
              Weekly Momentum
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#0D0E11] tracking-tight">
            Learning Activity This Week
          </h3>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0] self-start sm:self-auto">
          This Week
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Metric 1: Lessons completed */}
        <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5F6368] uppercase tracking-wider">
              Lessons
            </span>
            <CheckCircle2 className="h-4 w-4 text-[#34A853]" />
          </div>
          <div>
            <span className="text-3xl font-black text-[#0D0E11]">
              {activity.lessonsCompletedThisWeek}
            </span>
            <span className="text-xs font-medium text-[#5F6368] block mt-0.5">
              Completed this week
            </span>
          </div>
        </div>

        {/* Metric 2: Assignments submitted */}
        <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5F6368] uppercase tracking-wider">
              Submissions
            </span>
            <FileCheck className="h-4 w-4 text-[#EA4335]" />
          </div>
          <div>
            <span className="text-3xl font-black text-[#0D0E11]">
              {activity.assignmentsSubmittedThisWeek}
            </span>
            <span className="text-xs font-medium text-[#5F6368] block mt-0.5">
              Assignments turned in
            </span>
          </div>
        </div>

        {/* Metric 3: Sessions attended */}
        <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5F6368] uppercase tracking-wider">
              Attendance
            </span>
            <Video className="h-4 w-4 text-[#4285F4]" />
          </div>
          <div>
            <span className="text-3xl font-black text-[#0D0E11]">
              {activity.sessionsAttendedThisWeek}
            </span>
            <span className="text-xs font-medium text-[#5F6368] block mt-0.5">
              Live sessions attended
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
