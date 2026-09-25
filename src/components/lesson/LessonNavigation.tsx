import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface NavItem {
  id: string;
  slug: string;
  title: string;
}

interface LessonNavigationProps {
  trackId: string;
  prevLesson?: NavItem;
  nextLesson?: NavItem;
}

export function LessonNavigation({
  trackId,
  prevLesson,
  nextLesson,
}: LessonNavigationProps) {
  if (!prevLesson && !nextLesson) return null;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-[#E5DFD0]">
      {prevLesson ? (
        <Link
          href={`/tracks/${trackId}/lessons/${prevLesson.slug}`}
          className="group flex-1 flex items-center gap-3 p-4 rounded-3xl border border-[#E5DFD0] bg-white hover:border-[#0D0E11] transition-all duration-200 shadow-xs"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] group-hover:bg-[#0D0E11] group-hover:text-[#FAF7EE] transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
              Previous Lesson
            </span>
            <p className="text-xs sm:text-sm font-black text-[#0D0E11] truncate">
              {prevLesson.title}
            </p>
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {nextLesson ? (
        <Link
          href={`/tracks/${trackId}/lessons/${nextLesson.slug}`}
          className="group flex-1 flex items-center justify-end text-right gap-3 p-4 rounded-3xl border border-[#E5DFD0] bg-white hover:border-[#0D0E11] transition-all duration-200 shadow-xs"
        >
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
              Next Lesson
            </span>
            <p className="text-xs sm:text-sm font-black text-[#0D0E11] truncate">
              {nextLesson.title}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] group-hover:bg-[#0D0E11] group-hover:text-[#FAF7EE] transition-colors">
            <ArrowRight className="h-4 w-4" />
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
}
