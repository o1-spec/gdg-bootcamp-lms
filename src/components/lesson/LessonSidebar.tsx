'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  PlayCircle,
  Circle,
  Check,
  Layers,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleLessonItem {
  id: string;
  slug: string;
  title: string;
  durationMinutes: number;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface LessonSidebarProps {
  trackId: string;
  moduleName: string;
  moduleOrder: number;
  lessons: ModuleLessonItem[];
  isCurrentLessonCompleted: boolean;
  onToggleComplete: () => void;
  accentColor?: string;
}

export function LessonSidebar({
  trackId,
  moduleName,
  moduleOrder,
  lessons,
  isCurrentLessonCompleted,
  onToggleComplete,
  accentColor = '#4285F4',
}: LessonSidebarProps) {
  const completedCount = lessons.filter(
    (l) => l.isCompleted || (l.isCurrent && isCurrentLessonCompleted)
  ).length;

  const progressPercent = Math.round((completedCount / lessons.length) * 100);

  return (
    <div className="space-y-6">
      {/* Mark As Complete Primary Action Card */}
      <div className="rounded-3xl border border-[#E5DFD0] bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
            Lesson Progression
          </span>
          <h4 className="text-base font-black text-[#0D0E11] tracking-tight mt-0.5">
            Track Your Knowledge
          </h4>
        </div>

        <button
          type="button"
          onClick={onToggleComplete}
          className={cn(
            'w-full py-3.5 px-6 rounded-full font-black text-xs tracking-wide transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95',
            isCurrentLessonCompleted
              ? 'bg-[#34A853] text-white hover:bg-[#2b8a44]'
              : 'bg-[#0D0E11] text-[#FAF7EE] hover:bg-[#1a1b20]'
          )}
        >
          {isCurrentLessonCompleted ? (
            <>
              <Check className="h-4 w-4 stroke-[3]" />
              <span>Completed • Click to Undo</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>Mark Lesson as Complete</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-[#5F6368] text-center font-medium">
          {isCurrentLessonCompleted
            ? '✓ Marked complete in your frontend session'
            : 'Marking complete updates your module completion status'}
        </p>
      </div>

      {/* Module Lessons Curriculum Sidebar Card */}
      <div className="rounded-3xl border border-[#E5DFD0] bg-white p-5 sm:p-6 shadow-xs space-y-5">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#5F6368] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-[#4285F4]" />
              Module {moduleOrder}
            </span>
            <span className="font-black text-[#0D0E11]">
              {completedCount} / {lessons.length} Done
            </span>
          </div>

          <h3 className="text-base font-black text-[#0D0E11] tracking-tight mt-1">
            {moduleName}
          </h3>

          {/* Module Progress Bar */}
          <div className="mt-3 h-2 w-full bg-[#E5DFD0] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
                backgroundColor:
                  progressPercent === 100 ? '#34A853' : accentColor,
              }}
            />
          </div>
        </div>

        {/* Lesson List */}
        <div className="space-y-1.5 pt-2 border-t border-[#E5DFD0]">
          {lessons.map((lesson, idx) => {
            const isCompleted =
              lesson.isCompleted ||
              (lesson.isCurrent && isCurrentLessonCompleted);

            return (
              <Link
                key={lesson.id}
                href={`/tracks/${trackId}/lessons/${lesson.slug}`}
                className={cn(
                  'group flex items-start gap-3 p-3 rounded-2xl transition-all duration-200 text-left',
                  lesson.isCurrent
                    ? 'bg-[#0D0E11] text-[#FAF7EE] shadow-xs'
                    : 'hover:bg-[#FAF7EE] text-[#0D0E11]'
                )}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2
                      className={cn(
                        'h-4 w-4',
                        lesson.isCurrent ? 'text-[#34A853]' : 'text-[#34A853]'
                      )}
                    />
                  ) : lesson.isCurrent ? (
                    <PlayCircle
                      className="h-4 w-4 animate-pulse"
                      style={{ color: accentColor }}
                    />
                  ) : (
                    <Circle className="h-4 w-4 text-[#5F6368]/60" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-wider',
                        lesson.isCurrent
                          ? 'text-[#FAF7EE]/60'
                          : 'text-[#5F6368]'
                      )}
                    >
                      Lesson 0{idx + 1}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-medium',
                        lesson.isCurrent
                          ? 'text-[#FAF7EE]/60'
                          : 'text-[#5F6368]'
                      )}
                    >
                      {lesson.durationMinutes}m
                    </span>
                  </div>

                  <p
                    className={cn(
                      'text-xs font-bold truncate mt-0.5',
                      lesson.isCurrent
                        ? 'text-[#FAF7EE]'
                        : 'text-[#0D0E11] group-hover:text-black'
                    )}
                  >
                    {lesson.title}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Squad Office Hours callout */}
        <div className="pt-3 border-t border-[#E5DFD0]">
          <div className="rounded-2xl bg-[#FAF7EE] p-3.5 border border-[#E5DFD0] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#0D0E11]">
              <Sparkles className="h-3.5 w-3.5 text-[#FBBC04]" />
              <span>Need help on this lesson?</span>
            </div>
            <p className="text-[11px] text-[#5F6368] leading-relaxed">
              Ask in the #backend-squad Discord channel or join Friday mentor office hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
