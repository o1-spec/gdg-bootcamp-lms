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
      <div className="relative w-full max-w-2xl rounded-3xl border border-gdg-border bg-gdg-cream p-6 sm:p-8 shadow-2xl z-10 animate-in zoom-in-95 duration-200 space-y-6">
        {/* Top colored accent line */}
        <div
          className="absolute top-0 left-8 right-8 h-1.5 rounded-b-full"
          style={{ backgroundColor: session.trackAccentColor }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-gdg-gray hover:text-gdg-black hover:bg-gdg-border/50 transition-colors cursor-pointer"
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

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-gdg-gray border border-gdg-border">
            {session.mode} Mode
          </span>

          {session.isLiveNow && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gdg-red/15 text-gdg-red border border-gdg-red/30 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-gdg-red" />
              LIVE NOW
            </span>
          )}

          {session.isPast && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gdg-black/10 text-gdg-black border border-gdg-black/20">
              PAST SESSION
            </span>
          )}
        </div>

        {/* Title & Topic */}
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-gdg-gray uppercase tracking-wider">
            Curriculum Topic: {session.topic}
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-gdg-black tracking-tight leading-tight">
            {session.title}
          </h2>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white border border-gdg-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gdg-cream text-gdg-blue border border-gdg-border">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray">
                Date & Day
              </p>
              <p className="text-xs font-black text-gdg-black">
                {session.dayOfWeek}, {session.date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gdg-cream text-gdg-yellow border border-gdg-border">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray">
                Session Time
              </p>
              <p className="text-xs font-black text-gdg-black">{session.timeRange}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-xl border border-gdg-border">
              <AvatarImage src={session.mentor.avatar} />
              <AvatarFallback className="rounded-xl font-bold bg-gdg-cream text-gdg-black">
                {session.mentor.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray">
                Instructor / Mentor
              </p>
              <p className="text-xs font-black text-gdg-black">{session.mentor.name}</p>
              <p className="text-[10px] text-gdg-gray">{session.mentor.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gdg-cream text-gdg-green border border-gdg-border">
              {session.mode === 'Virtual' ? (
                <Video className="h-5 w-5" />
              ) : (
                <MapPin className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray">
                Venue / Platform
              </p>
              <p className="text-xs font-black text-gdg-black">{session.venueOrLink}</p>
            </div>
          </div>
        </div>

        {/* Topics Covered */}
        {session.topicsCovered && session.topicsCovered.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-gdg-black uppercase tracking-wider">
              <BookOpen className="h-3.5 w-3.5 text-gdg-blue" />
              <span>Topics & Outcomes to be Covered</span>
            </div>
            <div className="space-y-1.5 bg-white p-4 rounded-2xl border border-gdg-border">
              {session.topicsCovered.map((tpc, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-gdg-black">
                  <span className="h-1.5 w-1.5 rounded-full bg-gdg-yellow" />
                  <span>{tpc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attached Resources or Recording */}
        {session.attachedResources.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-black text-gdg-black uppercase tracking-wider block">
              Attached Learning Resources
            </span>
            <div className="space-y-2">
              {session.attachedResources.map((res, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white border border-gdg-border"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-gdg-gray" />
                    <span className="text-xs font-bold text-gdg-black">{res.title}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-gdg-cream text-gdg-gray">
                    {res.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-gdg-border">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-bold text-gdg-gray hover:text-gdg-black cursor-pointer"
          >
            Dismiss
          </button>

          {session.isPast && session.recordingUrl ? (
            <a
              href={session.recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gdg-black text-gdg-cream text-xs font-black hover:bg-black transition-all cursor-pointer shadow-md"
            >
              <PlayCircle className="h-4 w-4 text-gdg-yellow" />
              <span>Watch Recording</span>
            </a>
          ) : session.meetUrl ? (
            <a
              href={session.meetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gdg-black text-gdg-cream text-xs font-black hover:bg-black transition-all cursor-pointer shadow-md"
            >
              <Video className="h-4 w-4 text-gdg-green" />
              <span>{session.isLiveNow ? 'Join Live Room' : 'Join Google Meet Session'}</span>
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
