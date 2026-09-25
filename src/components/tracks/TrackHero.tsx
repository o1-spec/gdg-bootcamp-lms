import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, Calendar, Clock, Layers, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DetailedTrack } from '@/types/lms';

interface TrackHeroProps {
  track: DetailedTrack;
  onResumeLesson?: () => void;
}

export function TrackHero({ track, onResumeLesson }: TrackHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#22242B] bg-[#0D0E11] text-[#FAF7EE] p-6 sm:p-10 shadow-sm">
      {/* Google accent blur shapes */}
      <div
        className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: track.accentColor }}
      />

      <div className="relative z-10 space-y-6">
        {/* Back Link & Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/tracks"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#FAF7EE]/70 hover:text-[#FAF7EE] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to My Tracks</span>
          </Link>

          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black border"
              style={{
                backgroundColor: `${track.accentColor}18`,
                borderColor: `${track.accentColor}40`,
                color: track.accentColor,
              }}
            >
              {track.cohort}
            </span>
          </div>
        </div>

        {/* Hero Title & Description */}
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: track.accentColor }}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-[#FAF7EE]/60">
              Track Overview
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#FAF7EE] leading-tight">
            {track.name}
          </h1>

          <p className="text-sm sm:text-base text-[#FAF7EE]/80 leading-relaxed font-normal">
            {track.shortDescription}
          </p>
        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Progress */}
          <div className="rounded-2xl border border-[#22242B] bg-[#15161A] p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FAF7EE]/50">
              Track Progress
            </span>
            <div className="flex items-baseline justify-between">
              <span
                className="text-2xl font-black"
                style={{ color: track.accentColor }}
              >
                {track.progress.overallPercentage}%
              </span>
              <span className="text-xs text-[#FAF7EE]/60 font-medium">
                {track.progress.completedLessons}/{track.progress.totalLessons}
              </span>
            </div>
            <div className="h-1.5 w-full bg-[#22242B] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${track.progress.overallPercentage}%`,
                  backgroundColor: track.accentColor,
                }}
              />
            </div>
          </div>

          {/* Current Module */}
          <div className="rounded-2xl border border-[#22242B] bg-[#15161A] p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FAF7EE]/50 flex items-center gap-1">
              <Layers className="h-3 w-3" /> Current Module
            </span>
            <p className="text-xs sm:text-sm font-bold text-[#FAF7EE] line-clamp-2">
              {track.currentModule}
            </p>
            <p className="text-[10px] text-[#FAF7EE]/60 font-medium">
              {track.progress.totalModules} modules total
            </p>
          </div>

          {/* Duration & Next Class */}
          <div className="rounded-2xl border border-[#22242B] bg-[#15161A] p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FAF7EE]/50 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Duration
            </span>
            <p className="text-xs sm:text-sm font-bold text-[#FAF7EE]">
              {track.duration} Sprint
            </p>
            <p className="text-[10px] text-[#FAF7EE]/60 font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {track.nextClass}
            </p>
          </div>

          {/* Mentor */}
          <div className="rounded-2xl border border-[#22242B] bg-[#15161A] p-4 flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-[#22242B] shrink-0">
              <AvatarImage src={track.mentor.avatar} alt={track.mentor.name} />
              <AvatarFallback className="text-xs font-bold bg-[#FAF7EE] text-[#0D0E11]">
                {track.mentor.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FAF7EE]/50">
                Track Mentor
              </span>
              <p className="text-xs font-bold text-[#FAF7EE] truncate">
                {track.mentor.name}
              </p>
              <p className="text-[10px] text-[#FAF7EE]/60 truncate font-medium">
                GDG LASU Lead
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#22242B]">
          <div className="flex items-center gap-2 text-xs font-medium text-[#FAF7EE]/70">
            <Sparkles className="h-4 w-4 text-[#FBBC04]" />
            <span>
              Next up: Module 4 • Lesson 3 ({track.currentModule})
            </span>
          </div>

          <button
            type="button"
            onClick={onResumeLesson}
            className="inline-flex items-center gap-2 rounded-full bg-[#FAF7EE] text-[#0D0E11] hover:bg-white px-7 py-3 text-xs font-black tracking-wide shadow-md transition-transform active:scale-95 cursor-pointer ml-auto"
          >
            <BookOpen className="h-4 w-4" />
            <span>Resume Current Lesson</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
