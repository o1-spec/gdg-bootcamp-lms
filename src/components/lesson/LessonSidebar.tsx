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
      <div className="rounded-3xl border border-gdg-border bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray block">
            Lesson Progression
          </span>
          <h4 className="text-base font-black text-gdg-black tracking-tight mt-0.5">
            Track Your Knowledge
          </h4>
        </div>

        <button
          type="button"
          onClick={onToggleComplete}
          className={cn(
            'w-full py-3.5 px-6 rounded-full font-black text-xs tracking-wide transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95',
            isCurrentLessonCompleted
              ? 'bg-gdg-green text-white hover:bg-[#2b8a44]'
              : 'bg-gdg-black text-gdg-cream hover:bg-[#1a1b20]'
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

        <p className="text-[11px] text-gdg-gray text-center font-medium">
          {isCurrentLessonCompleted
            ? '✓ Marked complete in your frontend session'
            : 'Marking complete updates your module completion status'}
        </p>
      </div>

      {/* Module Lessons Curriculum Sidebar Card */}
      <div className="rounded-3xl border border-gdg-border bg-white p-5 sm:p-6 shadow-xs space-y-5">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gdg-gray uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-gdg-blue" />
              Module {moduleOrder}
            </span>
            <span className="font-black text-gdg-black">
              {completedCount} / {lessons.length} Done
            </span>
          </div>

          <h3 className="text-base font-black text-gdg-black tracking-tight mt-1">
            {moduleName}
          </h3>

          {/* Module Progress Bar */}
          <div className="mt-3 h-2 w-full bg-gdg-border rounded-full overflow-hidden">
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
        <div className="space-y-1.5 pt-2 border-t border-gdg-border">
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
                    ? 'bg-gdg-black text-gdg-cream shadow-xs'
                    : 'hover:bg-gdg-cream text-gdg-black'
                )}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2
                      className={cn(
                        'h-4 w-4',
                        lesson.isCurrent ? 'text-gdg-green' : 'text-gdg-green'
                      )}
                    />
                  ) : lesson.isCurrent ? (
                    <PlayCircle
                      className="h-4 w-4 animate-pulse"
                      style={{ color: accentColor }}
                    />
                  ) : (
                    <Circle className="h-4 w-4 text-gdg-gray/60" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-wider',
                        lesson.isCurrent
                          ? 'text-gdg-cream/60'
                          : 'text-gdg-gray'
                      )}
                    >
                      Lesson 0{idx + 1}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-medium',
                        lesson.isCurrent
                          ? 'text-gdg-cream/60'
                          : 'text-gdg-gray'
                      )}
                    >
                      {lesson.durationMinutes}m
                    </span>
                  </div>

                  <p
                    className={cn(
                      'text-xs font-bold truncate mt-0.5',
                      lesson.isCurrent
                        ? 'text-gdg-cream'
                        : 'text-gdg-black group-hover:text-black'
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
        <div className="pt-3 border-t border-gdg-border">
          <div className="rounded-2xl bg-gdg-cream p-3.5 border border-gdg-border space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-gdg-black">
              <Sparkles className="h-3.5 w-3.5 text-gdg-yellow" />
              <span>Need help on this lesson?</span>
            </div>
            <p className="text-[11px] text-gdg-gray leading-relaxed">
              Ask in the #backend-squad Discord channel or join Friday mentor office hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
