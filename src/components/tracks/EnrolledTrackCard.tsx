import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Calendar, Code2, Cpu, Terminal } from 'lucide-react';
import { DetailedTrack } from '@/types/lms';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface EnrolledTrackCardProps {
  track: DetailedTrack;
  variant?: 'dark' | 'light';
}

export function EnrolledTrackCard({
  track,
  variant = 'light',
}: EnrolledTrackCardProps) {
  const TrackIcon =
    track.slug === 'backend-development'
      ? Cpu
      : track.slug === 'frontend-development'
      ? Code2
      : Terminal;

  const isDark = variant === 'dark';

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border transition-all duration-200 hover:shadow-lg ${
        isDark
          ? 'bg-gdg-black text-gdg-cream border-gdg-dark-border hover:border-[#383A42]'
          : 'bg-white text-gdg-black border-gdg-border hover:border-gdg-black/30'
      }`}
    >
      {/* Signature top Google accent color stroke */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: track.accentColor }}
      />

      <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
        {/* Header badge & icon */}
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl border"
            style={{
              borderColor: `${track.accentColor}40`,
              backgroundColor: `${track.accentColor}15`,
              color: track.accentColor,
            }}
          >
            <TrackIcon className="h-6 w-6" />
          </div>

          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-black border"
            style={{
              borderColor: `${track.accentColor}40`,
              backgroundColor: `${track.accentColor}15`,
              color: track.accentColor,
            }}
          >
            {track.cohort}
          </span>
        </div>

        {/* Title & Short Description */}
        <div className="space-y-2">
          <h3
            className={`text-xl sm:text-2xl font-black tracking-tight transition-colors ${
              isDark ? 'text-gdg-cream group-hover:text-white' : 'text-gdg-black'
            }`}
          >
            {track.name}
          </h3>
          <p
            className={`text-xs sm:text-sm leading-relaxed font-normal line-clamp-2 ${
              isDark ? 'text-gdg-cream/70' : 'text-gdg-gray'
            }`}
          >
            {track.shortDescription}
          </p>
        </div>

        {/* Progress Container */}
        <div
          className={`space-y-2.5 rounded-2xl p-4 border ${
            isDark
              ? 'bg-[#15161A] border-gdg-dark-border'
              : 'bg-gdg-cream/70 border-gdg-border'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span
              className={`font-bold ${
                isDark ? 'text-gdg-cream' : 'text-gdg-black'
              }`}
            >
              Curriculum Progress
            </span>
            <span
              className="text-sm font-black"
              style={{ color: track.accentColor }}
            >
              {track.progress.overallPercentage}%
            </span>
          </div>

          <div
            className={`h-2 w-full rounded-full overflow-hidden ${
              isDark ? 'bg-gdg-dark-border' : 'bg-gdg-border'
            }`}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${track.progress.overallPercentage}%`,
                backgroundColor: track.accentColor,
              }}
            />
          </div>

          <div
            className={`flex items-center justify-between text-[11px] font-medium ${
              isDark ? 'text-gdg-cream/60' : 'text-gdg-gray'
            }`}
          >
            <span>
              {track.progress.completedLessons} of {track.progress.totalLessons} lessons completed
            </span>
            <span>
              {track.progress.totalLessons - track.progress.completedLessons} remaining
            </span>
          </div>
        </div>

        {/* Current Module & Next Class Metadata */}
        <div
          className={`space-y-3 pt-3 border-t ${
            isDark ? 'border-gdg-dark-border' : 'border-gdg-border'
          }`}
        >
          <div className="space-y-1">
            <div
              className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'text-gdg-cream/50' : 'text-gdg-gray'
              }`}
            >
              <BookOpen className="h-3 w-3" style={{ color: track.accentColor }} />
              <span>Current Module</span>
            </div>
            <p
              className={`text-xs sm:text-sm font-bold truncate ${
                isDark ? 'text-gdg-cream' : 'text-gdg-black'
              }`}
            >
              {track.currentModule}
            </p>
          </div>

          <div
            className={`flex items-center gap-2 text-xs font-semibold ${
              isDark ? 'text-gdg-cream/70' : 'text-gdg-black'
            }`}
          >
            <Calendar className="h-3.5 w-3.5 text-gdg-blue" />
            <span>Next Class: <strong>{track.nextClass}</strong></span>
          </div>
        </div>
      </div>

      {/* Footer with Mentor and Action Button */}
      <div
        className={`p-4 sm:px-8 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t ${
          isDark
            ? 'border-gdg-dark-border bg-[#111215]'
            : 'border-gdg-border bg-gdg-cream/40'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Avatar
            className={`h-8 w-8 border ${
              isDark ? 'border-gdg-dark-border' : 'border-gdg-border'
            }`}
          >
            <AvatarImage src={track.mentor.avatar} alt={track.mentor.name} />
            <AvatarFallback
              className={`text-[10px] font-bold ${
                isDark
                  ? 'bg-[#1C1D22] text-gdg-cream'
                  : 'bg-white text-gdg-black'
              }`}
            >
              {track.mentor.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="text-xs">
            <span
              className={`text-[10px] uppercase font-bold tracking-wider ${
                isDark ? 'text-gdg-cream/50' : 'text-gdg-gray'
              }`}
            >
              Mentor
            </span>
            <p
              className={`font-bold leading-none ${
                isDark ? 'text-gdg-cream' : 'text-gdg-black'
              }`}
            >
              {track.mentor.name}
            </p>
          </div>
        </div>

        <Link
          href={`/tracks/${track.slug}`}
          className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-black tracking-wide shadow-xs transition-transform active:scale-95 cursor-pointer w-full sm:w-auto ${
            isDark
              ? 'bg-gdg-cream text-gdg-black hover:bg-white'
              : 'bg-gdg-black text-gdg-cream hover:bg-[#1a1b20]'
          }`}
        >
          <span>Continue Learning</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
