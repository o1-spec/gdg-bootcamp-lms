'use client';

import React from 'react';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Layers,
  PlayCircle,
  Eye,
  FileText,
} from 'lucide-react';
import { BootcampSession } from '@/types/lms';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ScheduleCardProps {
  session: BootcampSession;
  onViewDetails: (session: BootcampSession) => void;
}

export function ScheduleCard({ session, onViewDetails }: ScheduleCardProps) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#E5DFD0] bg-white p-6 shadow-xs hover:border-[#0D0E11]/30 hover:shadow-md transition-all duration-200">
      {/* Top track colored border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: session.trackAccentColor }}
      />

      <div className="space-y-4">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold border"
              style={{
                backgroundColor: `${session.trackAccentColor}15`,
                borderColor: `${session.trackAccentColor}30`,
                color: session.trackAccentColor,
              }}
            >
              <Layers className="h-3 w-3" />
              <span>{session.trackName}</span>
            </span>

            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
              {session.mode}
            </span>
          </div>

          {session.isLiveNow ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-[#EA4335]" />
              LIVE NOW
            </span>
          ) : session.isPast ? (
            <div className="flex items-center gap-1.5">
              {session.recordingUrl && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FBBC04]/20 text-[#855B00] border border-[#FBBC04]/40">
                  <PlayCircle className="h-3 w-3" />
                  Recording
                </span>
              )}
              {session.attachedResources.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
                  <FileText className="h-3 w-3" />
                  Notes
                </span>
              )}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
              <Clock className="h-3 w-3 text-[#4285F4]" />
              Upcoming
            </span>
          )}
        </div>

        {/* Topic & Title */}
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-[#5F6368] uppercase tracking-wider">
            Topic: {session.topic}
          </p>

          <h3 className="text-lg sm:text-xl font-black text-[#0D0E11] tracking-tight group-hover:text-black">
            {session.title}
          </h3>
        </div>

        {/* Date, Time & Venue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-[#5F6368] pt-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#4285F4] shrink-0" />
            <span className="font-bold text-[#0D0E11]">
              {session.dayOfWeek}, {session.date}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#FBBC04] shrink-0" />
            <span className="font-bold text-[#0D0E11]">{session.timeRange}</span>
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            {session.mode === 'Virtual' ? (
              <Video className="h-4 w-4 text-[#34A853] shrink-0" />
            ) : (
              <MapPin className="h-4 w-4 text-[#EA4335] shrink-0" />
            )}
            <span className="truncate">{session.venueOrLink}</span>
          </div>
        </div>

        {/* Mentor profile snippet */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0]">
          <Avatar className="h-8 w-8 rounded-xl border border-[#E5DFD0]">
            <AvatarImage src={session.mentor.avatar} />
            <AvatarFallback className="rounded-xl text-[10px] font-bold bg-white text-[#0D0E11]">
              {session.mentor.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xs font-black text-[#0D0E11] truncate">{session.mentor.name}</p>
            <p className="text-[10px] text-[#5F6368] truncate">{session.mentor.role}</p>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="mt-6 pt-4 border-t border-[#E5DFD0] flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onViewDetails(session)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D0E11] hover:text-[#4285F4] transition-colors cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>View Details</span>
        </button>

        {session.isPast && session.recordingUrl ? (
          <a
            href={session.recordingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0D0E11] text-[#FAF7EE] text-xs font-black hover:bg-black transition-all cursor-pointer shadow-xs"
          >
            <PlayCircle className="h-3.5 w-3.5 text-[#FBBC04]" />
            <span>Watch Recording</span>
          </a>
        ) : session.meetUrl ? (
          <a
            href={session.meetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer shadow-xs',
              session.isLiveNow
                ? 'bg-[#EA4335] text-white hover:bg-[#c9302c] animate-bounce'
                : 'bg-[#0D0E11] text-[#FAF7EE] hover:bg-black'
            )}
          >
            <Video className="h-3.5 w-3.5" />
            <span>{session.isLiveNow ? 'Join Live Now' : 'Join Session'}</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}
