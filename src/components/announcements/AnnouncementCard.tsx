'use client';

import React from 'react';
import {
  Bell,
  AlertTriangle,
  Info,
  Layers,
  Paperclip,
  ArrowRight,
  Pin,
} from 'lucide-react';
import { FullAnnouncement, AnnouncementPriority } from '@/types/lms';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AnnouncementCardProps {
  announcement: FullAnnouncement;
  onSelect: (announcement: FullAnnouncement) => void;
}

export function AnnouncementCard({ announcement, onSelect }: AnnouncementCardProps) {
  const getPriorityBadge = (priority: AnnouncementPriority) => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30">
            <AlertTriangle className="h-3 w-3" />
            URGENT
          </span>
        );
      case 'IMPORTANT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FBBC04]/20 text-[#855B00] border border-[#FBBC04]/40">
            <Bell className="h-3 w-3 text-[#FBBC04]" />
            IMPORTANT
          </span>
        );
      case 'REMINDER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4285F4]/15 text-[#4285F4] border border-[#4285F4]/30">
            <Info className="h-3 w-3" />
            REMINDER
          </span>
        );
      case 'NORMAL':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
            NOTICE
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onSelect(announcement)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#E5DFD0] bg-white p-6 shadow-xs hover:border-[#0D0E11]/30 hover:shadow-md transition-all duration-200 cursor-pointer space-y-4"
    >
      {/* Top track colored border accent */}
      {announcement.trackAccentColor && (
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: announcement.trackAccentColor }}
        />
      )}

      <div className="space-y-3">
        {/* Header tags: Priority, Track, Pin */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {getPriorityBadge(announcement.priority)}

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
              <Layers className="h-3 w-3" />
              <span>{announcement.trackName}</span>
            </span>

            {announcement.attachments && announcement.attachments.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
                <Paperclip className="h-3 w-3" />
                <span>{announcement.attachments.length}</span>
              </span>
            )}
          </div>

          {announcement.isPinned && (
            <div className="flex items-center gap-1 text-[10px] font-black text-[#FBBC04] uppercase tracking-wider">
              <Pin className="h-3 w-3 fill-[#FBBC04]" />
              <span>Pinned</span>
            </div>
          )}
        </div>

        {/* Title & Content */}
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-black text-[#0D0E11] tracking-tight group-hover:text-black line-clamp-2">
            {announcement.title}
          </h3>

          <p className="text-xs sm:text-sm text-[#5F6368] leading-relaxed line-clamp-3">
            {announcement.content}
          </p>
        </div>
      </div>

      {/* Footer Info: Author, Date & View */}
      <div className="pt-3 border-t border-[#E5DFD0] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-7 w-7 rounded-xl border border-[#E5DFD0]">
            <AvatarImage src={announcement.author.avatar} />
            <AvatarFallback className="rounded-xl text-[9px] font-bold bg-[#FAF7EE] text-[#0D0E11]">
              {announcement.author.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#0D0E11] truncate">{announcement.author.name}</p>
            <p className="text-[10px] text-[#5F6368]">{announcement.postedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-black text-[#0D0E11] group-hover:text-[#4285F4] transition-colors">
          <span>Read more</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
