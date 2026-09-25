'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  BookOpen,
  FileCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import { TrackProgressSummary } from '@/types/lms';
import { cn } from '@/lib/utils';

interface TrackProgressCardProps {
  trackProgress: TrackProgressSummary;
}

export function TrackProgressCard({ trackProgress }: TrackProgressCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="overflow-hidden rounded-3xl border border-gdg-border bg-white p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-200 space-y-6">
      {/* Top track header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
            style={{
              backgroundColor: `${trackProgress.trackAccentColor}15`,
              borderColor: `${trackProgress.trackAccentColor}30`,
              color: trackProgress.trackAccentColor,
            }}
          >
            <Layers className="h-5 w-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: trackProgress.trackAccentColor }}
              />
              <span className="text-[11px] font-bold uppercase tracking-wider text-gdg-gray">
                Enrolled Track
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gdg-black tracking-tight">
              {trackProgress.trackName}
            </h3>
          </div>
        </div>

        {/* Big percentage & Continue Learning Action */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-3xl font-black text-gdg-black">
              {trackProgress.overallPercentage}%
            </span>
            <span className="text-[10px] text-gdg-gray font-bold block uppercase tracking-wider">
              Completed
            </span>
          </div>

          <Link
            href={trackProgress.nextLessonHref}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gdg-black text-gdg-cream text-xs font-black hover:bg-black transition-all cursor-pointer shadow-xs shrink-0"
          >
            <span>Continue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Track Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-2.5 w-full bg-gdg-cream rounded-full overflow-hidden border border-gdg-border">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${trackProgress.overallPercentage}%`,
              backgroundColor: trackProgress.trackAccentColor,
            }}
          />
        </div>
      </div>

      {/* Summary Pills */}
      <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-gdg-cream border border-gdg-border text-xs font-medium">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-gdg-gray uppercase tracking-wider flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-gdg-blue" />
            Lessons
          </span>
          <p className="font-black text-gdg-black">
            {trackProgress.completedLessons} / {trackProgress.totalLessons}
          </p>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-gdg-gray uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-gdg-green" />
            Modules
          </span>
          <p className="font-black text-gdg-black">
            {trackProgress.completedModules} / {trackProgress.totalModules}
          </p>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-gdg-gray uppercase tracking-wider flex items-center gap-1">
            <FileCheck className="h-3 w-3 text-gdg-red" />
            Assignments
          </span>
          <p className="font-black text-gdg-black">
            {trackProgress.completedAssignments} / {trackProgress.totalAssignments}
          </p>
        </div>
      </div>

      {/* Expand/Collapse Module Breakdown Controller */}
      <div className="pt-2 border-t border-gdg-border">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-xs font-bold text-gdg-gray hover:text-gdg-black transition-colors cursor-pointer py-1"
        >
          <span className="uppercase tracking-wider text-[11px]">
            {isExpanded ? 'Hide' : 'Show'} Module Breakdown ({trackProgress.modules.length} Modules)
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {/* Module progress items */}
        {isExpanded && (
          <div className="space-y-3 pt-3 mt-2">
            {trackProgress.modules.map((mod) => (
              <div
                key={mod.id}
                className="p-3.5 rounded-2xl bg-white border border-gdg-border space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gdg-cream text-gdg-gray border border-gdg-border">
                      Mod {mod.moduleOrder}
                    </span>
                    <span className="font-bold text-gdg-black">{mod.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-gdg-gray">
                      {mod.completedLessons} / {mod.totalLessons} lessons
                    </span>
                    <span
                      className={cn(
                        'text-xs font-black',
                        mod.percentage === 100
                          ? 'text-gdg-green-dark'
                          : mod.percentage > 0
                          ? 'text-gdg-black'
                          : 'text-gdg-gray'
                      )}
                    >
                      {mod.percentage}%
                    </span>
                  </div>
                </div>

                {/* Module bar */}
                <div className="h-2 w-full bg-gdg-cream rounded-full overflow-hidden border border-gdg-border">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      mod.percentage === 100 ? 'bg-gdg-green' : 'bg-gdg-black'
                    )}
                    style={{ width: `${mod.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
