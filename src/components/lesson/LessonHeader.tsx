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
    <div className="space-y-4 border-b border-gdg-border pb-6">
      {/* Breadcrumb row */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gdg-gray">
        <Link
          href={`/tracks/${lesson.trackId}`}
          className="inline-flex items-center gap-1.5 text-gdg-black hover:underline font-bold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{lesson.trackName}</span>
        </Link>
        <span>/</span>
        <span className="text-gdg-black font-bold flex items-center gap-1">
          <Layers className="h-3 w-3 text-gdg-blue" />
          {lesson.moduleName}
        </span>
        <span>/</span>
        <span className="text-gdg-gray font-normal truncate max-w-xs">
          {lesson.title}
        </span>
      </div>

      {/* Main Title & Description */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gdg-black tracking-tight">
          {lesson.title}
        </h1>
        <p className="text-sm sm:text-base text-gdg-gray leading-relaxed max-w-3xl font-normal">
          {lesson.description}
        </p>
      </div>

      {/* Lesson Metadata Pills */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gdg-border bg-white px-3 py-1 text-xs font-bold text-gdg-black shadow-2xs">
          <Clock className="h-3.5 w-3.5 text-gdg-blue" />
          <span>{lesson.durationMinutes} mins</span>
        </span>

        <span className="inline-flex items-center rounded-full border border-gdg-border bg-white px-3 py-1 text-xs font-bold text-gdg-black shadow-2xs">
          Type: {lesson.type}
        </span>

        {isCompleted ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gdg-green/15 text-gdg-green-dark border border-gdg-green/30 px-3 py-1 text-xs font-black">
            <span className="h-2 w-2 rounded-full bg-gdg-green" />
            COMPLETED
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gdg-blue/15 text-gdg-blue border border-gdg-blue/30 px-3 py-1 text-xs font-black">
            <span className="h-2 w-2 rounded-full bg-gdg-blue animate-pulse" />
            IN PROGRESS
          </span>
        )}

        <span className="inline-flex items-center gap-1 rounded-full bg-gdg-cream border border-gdg-border px-3 py-1 text-xs font-bold text-gdg-gray">
          <Sparkles className="h-3 w-3 text-gdg-yellow" />
          Module {lesson.moduleOrder} Syllabus
        </span>
      </div>
    </div>
  );
}
