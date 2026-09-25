import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Layers, Sparkles } from 'lucide-react';
import { FullLesson } from '@/types/lms';

interface LessonHeaderProps {
  lesson: FullLesson;
  isCompleted?: boolean;
}

export function LessonHeader({ lesson, isCompleted }: LessonHeaderProps) {
  return (
    <div className="space-y-4 border-b border-[#E5DFD0] pb-6">
      {/* Breadcrumb row */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#5F6368]">
        <Link
          href={`/tracks/${lesson.trackId}`}
          className="inline-flex items-center gap-1.5 text-[#0D0E11] hover:underline font-bold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{lesson.trackName}</span>
        </Link>
        <span>/</span>
        <span className="text-[#0D0E11] font-bold flex items-center gap-1">
          <Layers className="h-3 w-3 text-[#4285F4]" />
          {lesson.moduleName}
        </span>
        <span>/</span>
        <span className="text-[#5F6368] font-normal truncate max-w-xs">
          {lesson.title}
        </span>
      </div>

      {/* Main Title & Description */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-5xl font-black text-[#0D0E11] tracking-tight">
          {lesson.title}
        </h1>
        <p className="text-sm sm:text-base text-[#5F6368] leading-relaxed max-w-3xl font-normal">
          {lesson.description}
        </p>
      </div>

      {/* Lesson Metadata Pills */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5DFD0] bg-white px-3 py-1 text-xs font-bold text-[#0D0E11] shadow-2xs">
          <Clock className="h-3.5 w-3.5 text-[#4285F4]" />
          <span>{lesson.durationMinutes} mins</span>
        </span>

        <span className="inline-flex items-center rounded-full border border-[#E5DFD0] bg-white px-3 py-1 text-xs font-bold text-[#0D0E11] shadow-2xs">
          Type: {lesson.type}
        </span>

        {isCompleted ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#34A853]/15 text-[#1e7e34] border border-[#34A853]/30 px-3 py-1 text-xs font-black">
            <span className="h-2 w-2 rounded-full bg-[#34A853]" />
            COMPLETED
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4285F4]/15 text-[#4285F4] border border-[#4285F4]/30 px-3 py-1 text-xs font-black">
            <span className="h-2 w-2 rounded-full bg-[#4285F4] animate-pulse" />
            IN PROGRESS
          </span>
        )}

        <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF7EE] border border-[#E5DFD0] px-3 py-1 text-xs font-bold text-[#5F6368]">
          <Sparkles className="h-3 w-3 text-[#FBBC04]" />
          Module {lesson.moduleOrder} Syllabus
        </span>
      </div>
    </div>
  );
}
