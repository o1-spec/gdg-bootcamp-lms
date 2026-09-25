'use client';

import React, { useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Video,
  MapPin,
  Layers,
  BookOpen,
  PlayCircle,
  FileText,
} from 'lucide-react';
import { BootcampSession } from '@/types/lms';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SessionDetailsProps {
  session: BootcampSession | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SessionDetails({ session, isOpen, onClose }: SessionDetailsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-[#E5DFD0] bg-[#FAF7EE] p-6 sm:p-8 shadow-2xl z-10 animate-in zoom-in-95 duration-200 space-y-6">
        {/* Top colored accent line */}
        <div
          className="absolute top-0 left-8 right-8 h-1.5 rounded-b-full"
          style={{ backgroundColor: session.trackAccentColor }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-[#5F6368] hover:text-[#0D0E11] hover:bg-[#E5DFD0]/50 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        {/* Header Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
            style={{
              backgroundColor: `${session.trackAccentColor}15`,
              borderColor: `${session.trackAccentColor}30`,
              color: session.trackAccentColor,
            }}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{session.trackName}</span>
          </span>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#5F6368] border border-[#E5DFD0]">
            {session.mode} Mode
          </span>

          {session.isLiveNow && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-[#EA4335]" />
              LIVE NOW
            </span>
          )}

          {session.isPast && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0D0E11]/10 text-[#0D0E11] border border-[#0D0E11]/20">
              PAST SESSION
            </span>
          )}
        </div>

        {/* Title & Topic */}
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-[#5F6368] uppercase tracking-wider">
            Curriculum Topic: {session.topic}
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0D0E11] tracking-tight leading-tight">
            {session.title}
          </h2>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white border border-[#E5DFD0]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF7EE] text-[#4285F4] border border-[#E5DFD0]">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368]">
                Date & Day
              </p>
              <p className="text-xs font-black text-[#0D0E11]">
                {session.dayOfWeek}, {session.date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF7EE] text-[#FBBC04] border border-[#E5DFD0]">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368]">
                Session Time
              </p>
              <p className="text-xs font-black text-[#0D0E11]">{session.timeRange}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-xl border border-[#E5DFD0]">
              <AvatarImage src={session.mentor.avatar} />
              <AvatarFallback className="rounded-xl font-bold bg-[#FAF7EE] text-[#0D0E11]">
                {session.mentor.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368]">
                Instructor / Mentor
              </p>
              <p className="text-xs font-black text-[#0D0E11]">{session.mentor.name}</p>
              <p className="text-[10px] text-[#5F6368]">{session.mentor.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF7EE] text-[#34A853] border border-[#E5DFD0]">
              {session.mode === 'Virtual' ? (
                <Video className="h-5 w-5" />
              ) : (
                <MapPin className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368]">
                Venue / Platform
              </p>
              <p className="text-xs font-black text-[#0D0E11]">{session.venueOrLink}</p>
            </div>
          </div>
        </div>

        {/* Topics Covered */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#0D0E11] uppercase tracking-wider">
            <BookOpen className="h-3.5 w-3.5 text-[#4285F4]" />
            <span>Topics & Outcomes to be Covered</span>
          </div>
          <div className="space-y-1.5 bg-white p-4 rounded-2xl border border-[#E5DFD0]">
            {session.topicsCovered.map((tpc, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-[#0D0E11]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FBBC04]" />
                <span>{tpc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Attached Resources or Recording */}
        {session.attachedResources.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-black text-[#0D0E11] uppercase tracking-wider block">
              Attached Learning Resources
            </span>
            <div className="space-y-2">
              {session.attachedResources.map((res, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E5DFD0]"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-[#5F6368]" />
                    <span className="text-xs font-bold text-[#0D0E11]">{res.title}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF7EE] text-[#5F6368]">
                    {res.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-[#E5DFD0]">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-bold text-[#5F6368] hover:text-[#0D0E11] cursor-pointer"
          >
            Dismiss
          </button>

          {session.isPast && session.recordingUrl ? (
            <a
              href={session.recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#0D0E11] text-[#FAF7EE] text-xs font-black hover:bg-black transition-all cursor-pointer shadow-md"
            >
              <PlayCircle className="h-4 w-4 text-[#FBBC04]" />
              <span>Watch Recording</span>
            </a>
          ) : session.meetUrl ? (
            <a
              href={session.meetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#0D0E11] text-[#FAF7EE] text-xs font-black hover:bg-black transition-all cursor-pointer shadow-md"
            >
              <Video className="h-4 w-4 text-[#34A853]" />
              <span>{session.isLiveNow ? 'Join Live Room' : 'Join Google Meet Session'}</span>
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
