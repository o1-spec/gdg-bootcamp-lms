'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Trophy, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { FullAssignment } from '@/types/lms';
import { AssignmentStatusBadge } from '@/components/assignments/AssignmentStatusBadge';

interface AssignmentCardProps {
  assignment: FullAssignment;
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  // Score display helper
  const getScoreDisplay = () => {
    if (assignment.submission?.score !== undefined) {
      return (
        <span className="inline-flex items-center gap-1 font-bold text-gdg-green-dark">
          <Trophy className="h-3.5 w-3.5 text-gdg-green" />
          Score: {assignment.submission.score} / {assignment.points}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 font-bold text-gdg-black">
        <Trophy className="h-3.5 w-3.5 text-gdg-yellow" />
        {assignment.points} Points
      </span>
    );
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gdg-border bg-white p-6 shadow-xs hover:border-gdg-black/30 hover:shadow-md transition-all duration-200">
      {/* Top track accent color bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: assignment.trackAccentColor }}
      />

      <div className="space-y-4">
        {/* Header tags: Track + Type + Status */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold border"
              style={{
                backgroundColor: `${assignment.trackAccentColor}15`,
                borderColor: `${assignment.trackAccentColor}30`,
                color: assignment.trackAccentColor,
              }}
            >
              <Layers className="h-3 w-3" />
              <span>{assignment.trackName}</span>
            </span>

            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gdg-cream text-gdg-gray border border-gdg-border">
              {assignment.type}
            </span>
          </div>

          <AssignmentStatusBadge
            status={assignment.status}
            daysRemaining={assignment.daysRemaining}
            showDueDateText={false}
          />
        </div>

        {/* Module & Title */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gdg-gray">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{assignment.moduleName}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-gdg-black tracking-tight group-hover:text-black">
            {assignment.title}
          </h3>

          <p className="text-xs sm:text-sm text-gdg-gray font-normal leading-relaxed line-clamp-2">
            {assignment.shortDescription}
          </p>
        </div>
      </div>

      {/* Footer Info & View Action */}
      <div className="mt-6 pt-4 border-t border-gdg-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-gdg-gray font-medium">
            <Calendar className="h-3.5 w-3.5 text-gdg-blue" />
            <span>Due {assignment.dueDate}</span>
          </div>

          <span className="text-gdg-border">•</span>

          {getScoreDisplay()}
        </div>

        <Link
          href={`/assignments/${assignment.id}`}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-gdg-black text-gdg-cream text-xs font-black hover:bg-black group-hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
        >
          <span>View Assignment</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
