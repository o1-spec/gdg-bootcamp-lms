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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gdg-red/15 text-gdg-red border border-gdg-red/30">
            <AlertTriangle className="h-3.5 w-3.5" />
            URGENT NOTICE
          </span>
        );
      case 'IMPORTANT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gdg-yellow/20 text-[#855B00] border border-gdg-yellow/40">
            <Bell className="h-3.5 w-3.5 text-gdg-yellow" />
            IMPORTANT UPDATE
          </span>
        );
      case 'REMINDER':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gdg-blue/15 text-gdg-blue border border-gdg-blue/30">
            <Info className="h-3.5 w-3.5" />
            DEADLINE REMINDER
          </span>
        );
      case 'NORMAL':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-gdg-gray border border-gdg-border">
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
      <div className="relative w-full max-w-2xl rounded-3xl border border-gdg-border bg-gdg-cream p-5 sm:p-8 shadow-2xl z-10 animate-in zoom-in-95 duration-200 space-y-6 max-h-[90vh] overflow-y-auto">
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
          className="absolute right-5 top-5 p-2 rounded-full text-gdg-gray hover:text-gdg-black hover:bg-gdg-border/50 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        {/* Header Tags */}
        <div className="flex flex-wrap items-center gap-2">
          {getPriorityBadge(announcement.priority)}

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-gdg-gray border border-gdg-border">
            <Layers className="h-3.5 w-3.5" />
            <span>{announcement.trackName}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-gdg-gray bg-white border border-gdg-border">
            <Calendar className="h-3.5 w-3.5 text-gdg-blue" />
            <span>{announcement.postedDate}</span>
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-3xl font-black text-gdg-black tracking-tight leading-tight">
          {announcement.title}
        </h2>

        {/* Content Body */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white border border-gdg-border">
          <p className="text-sm sm:text-base text-gdg-black leading-relaxed whitespace-pre-line">
            {announcement.content}
          </p>
        </div>

        {/* Author Info */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gdg-border">
          <Avatar className="h-10 w-10 rounded-xl border border-gdg-border">
            <AvatarImage src={announcement.author.avatar} />
            <AvatarFallback className="rounded-xl font-bold bg-gdg-cream text-gdg-black">
              {announcement.author.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xs font-black text-gdg-black">{announcement.author.name}</p>
            <p className="text-[11px] text-gdg-gray">{announcement.author.role}</p>
          </div>
        </div>

        {/* Attachments if present */}
        {announcement.attachments && announcement.attachments.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-black text-gdg-black uppercase tracking-wider block">
              Referenced Resources & Links
            </span>
            <div className="space-y-2">
              {announcement.attachments.map((att, idx) => (
                <a
                  key={idx}
                  href={att.url}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-gdg-border hover:border-gdg-black/30 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-gdg-blue" />
                    <span className="text-xs font-bold text-gdg-black group-hover:text-gdg-blue">
                      {att.title}
                    </span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-gdg-gray group-hover:text-gdg-blue" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-end pt-3 border-t border-gdg-border">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gdg-black text-gdg-cream text-xs font-black hover:bg-black transition-all cursor-pointer shadow-xs text-center"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
