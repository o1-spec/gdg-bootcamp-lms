import React from 'react';
import { Pin, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Announcement } from '@/types/lms';
import { cn } from '@/lib/utils';

interface AnnouncementCardProps {
  announcement: Announcement;
  onReadMore?: (announcement: Announcement) => void;
}

export function AnnouncementCard({
  announcement,
  onReadMore,
}: AnnouncementCardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-gdg-border bg-white p-5 shadow-xs hover:shadow-md transition-all duration-200 space-y-3.5',
        announcement.isPinned && 'border-gdg-yellow ring-1 ring-gdg-yellow/40'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {announcement.isPinned && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black bg-gdg-yellow/20 text-[#9e7000] border border-gdg-yellow/40">
              <Pin className="h-3 w-3" />
              PINNED ANNOUNCEMENT
            </span>
          )}
          <span className="text-[11px] font-bold text-gdg-gray bg-gdg-cream px-3 py-1 rounded-full border border-gdg-border">
            {announcement.category}
          </span>
          {announcement.trackName && (
            <span className="text-[11px] font-bold text-gdg-black">
              • {announcement.trackName}
            </span>
          )}
        </div>
        <span className="text-xs font-medium text-gdg-gray whitespace-nowrap">
          {announcement.publishedAt}
        </span>
      </div>

      <div>
        <h4 className="text-base font-black text-gdg-black tracking-tight">
          {announcement.title}
        </h4>
        <p className="mt-1.5 text-xs text-gdg-gray leading-relaxed font-normal">
          {announcement.content}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gdg-border">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 border border-gdg-border">
            <AvatarImage
              src={announcement.author.avatar}
              alt={announcement.author.name}
            />
            <AvatarFallback className="text-[10px] font-bold bg-gdg-cream text-gdg-black">
              {announcement.author.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs font-bold text-gdg-black leading-none">
              {announcement.author.name}
            </p>
            <p className="text-[10px] text-gdg-gray mt-0.5 font-medium">
              {announcement.author.role}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-black text-gdg-black hover:text-gdg-blue transition-colors cursor-pointer"
          onClick={() => onReadMore?.(announcement)}
        >
          <span>Read details</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
