'use client';

import React from 'react';
import Link from 'next/link';
import { UserCheck, ArrowRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { AttendanceSummaryData } from '@/types/lms';

interface AttendanceSummaryCardProps {
  summary: AttendanceSummaryData;
}

export function AttendanceSummaryCard({ summary }: AttendanceSummaryCardProps) {
  return (
    <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-8 space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-[#34A853]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
              Participation & Presence
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#0D0E11] tracking-tight">
            Bootcamp Attendance Summary
          </h3>
          <p className="text-xs text-[#5F6368]">
            Attendance is factored into your final capstone readiness score and certificate eligibility.
          </p>
        </div>

        <Link
          href="/attendance"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0D0E11] text-[#FAF7EE] text-xs font-black hover:bg-black transition-all cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
        >
          <span>View Full Attendance Log</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Attendance Rate */}
        <div className="p-4 rounded-2xl bg-[#34A853]/10 border border-[#34A853]/25 space-y-1">
          <span className="text-[10px] font-bold text-[#1e7e34] uppercase tracking-wider block">
            Attendance Rate
          </span>
          <p className="text-3xl font-black text-[#1e7e34]">
            {summary.attendanceRate}%
          </p>
          <span className="text-[11px] font-medium text-[#1e7e34]/80 block">
            Target benchmark: &gt;80%
          </span>
        </div>

        {/* Present Count */}
        <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider">
              Present
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 text-[#34A853]" />
          </div>
          <p className="text-2xl font-black text-[#0D0E11]">
            {summary.presentCount}
          </p>
          <span className="text-[11px] font-medium text-[#5F6368] block">
            Live sessions attended
          </span>
        </div>

        {/* Absent Count */}
        <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider">
              Absent
            </span>
            <XCircle className="h-3.5 w-3.5 text-[#EA4335]" />
          </div>
          <p className="text-2xl font-black text-[#0D0E11]">
            {summary.absentCount}
          </p>
          <span className="text-[11px] font-medium text-[#5F6368] block">
            Unexcused absences
          </span>
        </div>

        {/* Excused Count */}
        <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider">
              Excused
            </span>
            <AlertCircle className="h-3.5 w-3.5 text-[#FBBC04]" />
          </div>
          <p className="text-2xl font-black text-[#0D0E11]">
            {summary.excusedCount}
          </p>
          <span className="text-[11px] font-medium text-[#5F6368] block">
            Approved leaves
          </span>
        </div>
      </div>
    </div>
  );
}
