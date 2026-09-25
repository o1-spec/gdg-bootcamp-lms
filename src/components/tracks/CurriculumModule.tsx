'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, Clock } from 'lucide-react';
import { DetailedModule, DetailedLesson } from '@/types/lms';
import { LessonItem } from './LessonItem';

interface CurriculumModuleProps {
  module: DetailedModule;
  trackSlug?: string;
  accentColor?: string;
  defaultOpen?: boolean;
  onSelectLesson?: (lesson: DetailedLesson) => void;
}

export function CurriculumModule({
  module,
  trackSlug = 'backend-development',
  accentColor = '#4285F4',
  defaultOpen = false,
  onSelectLesson,
}: CurriculumModuleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const completionPercent = Math.round(
    (module.completedLessons / module.totalLessons) * 100
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-gdg-border bg-white shadow-xs transition-all duration-200">
      {/* Module Header / Toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 sm:p-6 cursor-pointer select-none hover:bg-gdg-cream/50 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-black border"
              style={{
                backgroundColor: `${accentColor}12`,
                borderColor: `${accentColor}30`,
                color: accentColor,
              }}
            >
              0{module.order}
            </span>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gdg-gray">
                  Module {module.order}
                </span>
                {module.status === 'completed' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gdg-green/15 px-2.5 py-0.5 text-[10px] font-bold text-gdg-green-dark">
                    <CheckCircle2 className="h-3 w-3" />
                    Completed
                  </span>
                )}
                {module.status === 'in_progress' && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black border"
                    style={{
                      backgroundColor: `${accentColor}15`,
                      borderColor: `${accentColor}30`,
                      color: accentColor,
                    }}
                  >
                    In Progress
                  </span>
                )}
                {module.status === 'upcoming' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gdg-cream border border-gdg-border px-2.5 py-0.5 text-[10px] font-bold text-gdg-gray">
                    <Clock className="h-3 w-3" />
                    Upcoming
                  </span>
                )}
              </div>

              <h4 className="text-base sm:text-lg font-black text-gdg-black tracking-tight">
                {module.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-5">
            <div className="text-right">
              <span className="text-xs font-bold text-gdg-black">
                {module.completedLessons} / {module.totalLessons} Lessons
              </span>
              <div className="mt-1 h-1.5 w-24 sm:w-28 bg-gdg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${completionPercent}%`,
                    backgroundColor:
                      module.status === 'completed' ? '#34A853' : accentColor,
                  }}
                />
              </div>
            </div>

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gdg-border bg-gdg-cream text-gdg-black"
              aria-label={isOpen ? 'Collapse module' : 'Expand module'}
            >
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <p className="mt-2.5 text-xs text-gdg-gray leading-relaxed max-w-3xl">
          {module.description}
        </p>
      </div>

      {/* Module Lessons List */}
      {isOpen && (
        <div className="border-t border-gdg-border bg-gdg-cream/30 p-4 sm:p-6 space-y-2.5 animate-in fade-in-50 duration-200">
          {module.lessons.map((lesson) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              trackSlug={trackSlug}
              accentColor={accentColor}
              onSelectLesson={onSelectLesson}
            />
          ))}
        </div>
      )}
    </div>
  );
}
