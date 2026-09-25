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
    <div className="rounded-3xl border border-gdg-border bg-white p-6 sm:p-8 space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-gdg-green" />
            <span className="text-xs font-bold uppercase tracking-wider text-gdg-gray">
              Participation & Presence
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gdg-black tracking-tight">
            Bootcamp Attendance Summary
          </h3>
          <p className="text-xs text-gdg-gray">
            Attendance is factored into your final capstone readiness score and certificate eligibility.
          </p>
        </div>

        <Link
          href="/attendance"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gdg-black text-gdg-cream text-xs font-black hover:bg-black transition-all cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
        >
          <span>View Full Attendance Log</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Attendance Rate */}
        <div className="p-4 rounded-2xl bg-gdg-green/10 border border-gdg-green/25 space-y-1">
          <span className="text-[10px] font-bold text-gdg-green-dark uppercase tracking-wider block">
            Attendance Rate
          </span>
          <p className="text-3xl font-black text-gdg-green-dark">
            {summary.attendanceRate}%
          </p>
          <span className="text-[11px] font-medium text-gdg-green-dark/80 block">
            Target benchmark: &gt;80%
          </span>
        </div>

        {/* Present Count */}
        <div className="p-4 rounded-2xl bg-gdg-cream border border-gdg-border space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gdg-gray uppercase tracking-wider">
              Present
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 text-gdg-green" />
          </div>
          <p className="text-2xl font-black text-gdg-black">
            {summary.presentCount}
          </p>
          <span className="text-[11px] font-medium text-gdg-gray block">
            Live sessions attended
          </span>
        </div>

        {/* Absent Count */}
        <div className="p-4 rounded-2xl bg-gdg-cream border border-gdg-border space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gdg-gray uppercase tracking-wider">
              Absent
            </span>
            <XCircle className="h-3.5 w-3.5 text-gdg-red" />
          </div>
          <p className="text-2xl font-black text-gdg-black">
            {summary.absentCount}
          </p>
          <span className="text-[11px] font-medium text-gdg-gray block">
            Unexcused absences
          </span>
        </div>

        {/* Excused Count */}
        <div className="p-4 rounded-2xl bg-gdg-cream border border-gdg-border space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gdg-gray uppercase tracking-wider">
              Excused
            </span>
            <AlertCircle className="h-3.5 w-3.5 text-gdg-yellow" />
          </div>
          <p className="text-2xl font-black text-gdg-black">
            {summary.excusedCount}
          </p>
          <span className="text-[11px] font-medium text-gdg-gray block">
            Approved leaves
          </span>
        </div>
      </div>
    </div>
  );
}
