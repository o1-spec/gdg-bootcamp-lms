'use client';

import React, { useEffect } from 'react';
import {
  X,
  Calendar,
  Layers,
  FileText,
  ExternalLink,
  Bell,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { FullAnnouncement, AnnouncementPriority } from '@/types/lms';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AnnouncementDetailsProps {
  announcement: FullAnnouncement | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AnnouncementDetails({
  announcement,
  isOpen,
  onClose,
}: AnnouncementDetailsProps) {
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

  if (!isOpen || !announcement) return null;

  const getPriorityBadge = (priority: AnnouncementPriority) => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30">
            <AlertTriangle className="h-3.5 w-3.5" />
            URGENT NOTICE
          </span>
        );
      case 'IMPORTANT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#FBBC04]/20 text-[#855B00] border border-[#FBBC04]/40">
            <Bell className="h-3.5 w-3.5 text-[#FBBC04]" />
            IMPORTANT UPDATE
          </span>
        );
      case 'REMINDER':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#4285F4]/15 text-[#4285F4] border border-[#4285F4]/30">
            <Info className="h-3.5 w-3.5" />
            DEADLINE REMINDER
          </span>
        );
      case 'NORMAL':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-[#5F6368] border border-[#E5DFD0]">
            GENERAL ANNOUNCEMENT
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-[#E5DFD0] bg-[#FAF7EE] p-6 sm:p-8 shadow-2xl z-10 animate-in zoom-in-95 duration-200 space-y-6">
        {/* Top colored accent line */}
        {announcement.trackAccentColor && (
          <div
            className="absolute top-0 left-8 right-8 h-1.5 rounded-b-full"
            style={{ backgroundColor: announcement.trackAccentColor }}
          />
        )}

        {/* Close button */}
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
          {getPriorityBadge(announcement.priority)}

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-[#5F6368] border border-[#E5DFD0]">
            <Layers className="h-3.5 w-3.5" />
            <span>{announcement.trackName}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-[#5F6368] bg-white border border-[#E5DFD0]">
            <Calendar className="h-3.5 w-3.5 text-[#4285F4]" />
            <span>{announcement.postedDate}</span>
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-[#0D0E11] tracking-tight leading-tight">
          {announcement.title}
        </h2>

        {/* Content Body */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E5DFD0]">
          <p className="text-sm sm:text-base text-[#0D0E11] leading-relaxed whitespace-pre-line">
            {announcement.content}
          </p>
        </div>

        {/* Author Info */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#E5DFD0]">
          <Avatar className="h-10 w-10 rounded-xl border border-[#E5DFD0]">
            <AvatarImage src={announcement.author.avatar} />
            <AvatarFallback className="rounded-xl font-bold bg-[#FAF7EE] text-[#0D0E11]">
              {announcement.author.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xs font-black text-[#0D0E11]">{announcement.author.name}</p>
            <p className="text-[11px] text-[#5F6368]">{announcement.author.role}</p>
          </div>
        </div>

        {/* Attachments if present */}
        {announcement.attachments && announcement.attachments.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-black text-[#0D0E11] uppercase tracking-wider block">
              Referenced Resources & Links
            </span>
            <div className="space-y-2">
              {announcement.attachments.map((att, idx) => (
                <a
                  key={idx}
                  href={att.url}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#E5DFD0] hover:border-[#0D0E11]/30 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-[#4285F4]" />
                    <span className="text-xs font-bold text-[#0D0E11] group-hover:text-[#4285F4]">
                      {att.title}
                    </span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-[#5F6368] group-hover:text-[#4285F4]" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-end pt-3 border-t border-[#E5DFD0]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#0D0E11] text-[#FAF7EE] text-xs font-black hover:bg-black transition-all cursor-pointer shadow-xs"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
