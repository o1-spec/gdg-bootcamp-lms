import React from 'react';
import Link from 'next/link';
import { CheckCircle2, PlayCircle, Lock, Clock, FileCode2, Video, Award } from 'lucide-react';
import { DetailedLesson } from '@/types/lms';
import { cn } from '@/lib/utils';

interface LessonItemProps {
  lesson: DetailedLesson;
  trackSlug?: string;
  accentColor?: string;
  onSelectLesson?: (lesson: DetailedLesson) => void;
}

export function LessonItem({
  lesson,
  trackSlug = 'backend-development',
  accentColor = '#4285F4',
  onSelectLesson,
}: LessonItemProps) {
  const getStatusIcon = () => {
    switch (lesson.status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-gdg-green" />;
      case 'current':
        return <PlayCircle className="h-4 w-4 animate-pulse" style={{ color: accentColor }} />;
      case 'locked':
      default:
        return <Lock className="h-4 w-4 text-gdg-gray" />;
    }
  };

  const getTypeIcon = () => {
    switch (lesson.type) {
      case 'exercise':
        return <FileCode2 className="h-3 w-3 text-gdg-gray" />;
      case 'project':
        return <Award className="h-3 w-3 text-gdg-yellow" />;
      case 'lecture':
      default:
        return <Video className="h-3 w-3 text-gdg-gray" />;
    }
  };

  // Convert lesson title to slug e.g. "REST API Design" -> "rest-api-design"
  const lessonSlug =
    lesson.title.toLowerCase().includes('rest api design')
      ? 'rest-api-design'
      : lesson.title.toLowerCase().includes('express fundamentals')
      ? 'express-fundamentals'
      : lesson.title.toLowerCase().includes('middleware')
      ? 'middleware'
      : lesson.title.toLowerCase().includes('validation')
      ? 'validation'
      : lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const lessonHref = `/tracks/${trackSlug}/lessons/${lessonSlug}`;

  return (
    <Link
      href={lessonHref}
      onClick={() => onSelectLesson?.(lesson)}
      className={cn(
        'group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer',
        lesson.status === 'current'
          ? 'bg-white border-gdg-black shadow-xs'
          : lesson.status === 'completed'
          ? 'bg-white/80 border-gdg-border hover:border-gdg-black/30'
          : 'bg-gdg-cream/60 border-gdg-border/60 opacity-80 hover:opacity-100 hover:border-gdg-border'
      )}
    >
      <div className="flex items-start sm:items-center gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gdg-cream border border-gdg-border">
          {getStatusIcon()}
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gdg-gray">
              Lesson {lesson.order}
            </span>
            {lesson.status === 'current' && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-black border"
                style={{
                  backgroundColor: `${accentColor}15`,
                  borderColor: `${accentColor}30`,
                  color: accentColor,
                }}
              >
                CURRENT
              </span>
            )}
            {lesson.status === 'completed' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gdg-green/15 text-gdg-green-dark">
                COMPLETED
              </span>
            )}
          </div>

          <h5
            className={cn(
              'text-xs sm:text-sm font-bold tracking-tight',
              lesson.status === 'locked' ? 'text-gdg-gray' : 'text-gdg-black'
            )}
          >
            {lesson.title}
          </h5>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 pl-10 sm:pl-0">
        <div className="flex items-center gap-2 text-[11px] font-medium text-gdg-gray">
          <span className="flex items-center gap-1">
            {getTypeIcon()}
            <span className="capitalize">{lesson.type || 'lecture'}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {lesson.durationMinutes} min
          </span>
        </div>

        <span
          className={cn(
            'px-3 py-1 rounded-full text-[11px] font-bold transition-all',
            lesson.status === 'current'
              ? 'bg-gdg-black text-gdg-cream group-hover:bg-[#1a1b20]'
              : lesson.status === 'completed'
              ? 'border border-gdg-border text-gdg-black group-hover:bg-gdg-cream'
              : 'border border-transparent text-gdg-gray'
          )}
        >
          {lesson.status === 'completed'
            ? 'Review'
            : lesson.status === 'current'
            ? 'Start Lesson →'
            : 'Preview'}
        </span>
      </div>
    </Link>
  );
}
