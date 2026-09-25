import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock, Code2, Cpu, Terminal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Track } from '@/types/lms';

interface TrackCardProps {
  track: Track;
  onResumeLesson?: (trackId: string, lessonId: string) => void;
}

export function TrackCard({ track }: TrackCardProps) {
  const leadInstructor = track.instructors[0];

  const accentColor =
    track.name === 'Backend Development'
      ? '#4285F4'
      : track.name === 'Frontend Development'
      ? '#34A853'
      : '#EA4335';

  const TrackIcon =
    track.name === 'Backend Development'
      ? Cpu
      : track.name === 'Frontend Development'
      ? Code2
      : Terminal;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#22242B] bg-[#0D0E11] text-[#FAF7EE] p-5 sm:p-7 shadow-sm hover:border-[#383A42] transition-all duration-200">
      {/* Signature top accent border stroke */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: accentColor }}
      />

      <div className="space-y-5">
        {/* Track header with Icon and Pills */}
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl border"
            style={{
              borderColor: `${accentColor}40`,
              backgroundColor: `${accentColor}15`,
              color: accentColor,
            }}
          >
            <TrackIcon className="h-6 w-6" />
          </div>

          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold border"
              style={{
                borderColor: `${accentColor}40`,
                backgroundColor: `${accentColor}15`,
                color: accentColor,
              }}
            >
              {track.name}
            </span>
          </div>
        </div>

        {/* Title & Description with Link */}
        <div>
          <Link href={`/tracks/${track.slug}`}>
            <h3 className="text-xl font-black text-[#FAF7EE] tracking-tight hover:underline transition-colors">
              {track.name}
            </h3>
          </Link>
          <p className="mt-2 text-xs text-[#FAF7EE]/70 leading-relaxed font-normal">
            {track.description}
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-2 rounded-2xl bg-[#15161A] p-4 border border-[#22242B]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#FAF7EE]">Curriculum Progress</span>
            <span
              className="font-black text-sm"
              style={{ color: accentColor }}
            >
              {track.progressPercentage}%
            </span>
          </div>

          {/* Custom colored progress bar */}
          <div className="h-2 w-full bg-[#22242B] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${track.progressPercentage}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#FAF7EE]/60 pt-1 font-medium">
            <span>{track.completedLessons} of {track.totalLessons} lessons completed</span>
            <span>{track.totalLessons - track.completedLessons} left</span>
          </div>
        </div>

        {/* Next lesson block */}
        {track.nextLesson && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#FAF7EE]/50">
              <BookOpen className="h-3.5 w-3.5" style={{ color: accentColor }} />
              <span>Up Next</span>
            </div>
            <p className="text-xs font-bold text-[#FAF7EE] line-clamp-1">
              {track.nextLesson.title}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#FAF7EE]/60">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {track.nextLesson.durationMinutes} mins
              </span>
              <span>•</span>
              <span className="truncate">{track.currentModule}</span>
            </div>
          </div>
        )}
      </div>

      {/* Mentor and Resume Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 mt-5 border-t border-[#22242B]">
        {leadInstructor && (
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 border border-[#22242B]">
              <AvatarImage src={leadInstructor.avatar} alt={leadInstructor.name} />
              <AvatarFallback className="text-[10px] font-bold bg-[#1C1D22] text-[#FAF7EE]">
                {leadInstructor.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-bold text-[#FAF7EE] leading-none">
                {leadInstructor.name}
              </p>
              <p className="text-[10px] text-[#FAF7EE]/60 mt-0.5 font-medium">
                Lead Mentor
              </p>
            </div>
          </div>
        )}

        <Link
          href={`/tracks/${track.slug}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#FAF7EE] text-[#0D0E11] hover:bg-white px-4 py-2 text-xs font-black tracking-wide shadow-xs transition-transform active:scale-95 cursor-pointer w-full sm:w-auto sm:ml-auto"
        >
          <span>Continue Learning</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
