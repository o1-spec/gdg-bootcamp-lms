import React from 'react';
import { Pin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
    <Card
      className={cn(
        'border border-border/80 bg-card hover:border-border transition-all duration-200 shadow-xs',
        announcement.isPinned && 'border-primary/30 bg-primary/2'
      )}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {announcement.isPinned && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                <Pin className="h-2.5 w-2.5" />
                PINNED
              </span>
            )}
            <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/60">
              {announcement.category}
            </span>
            {announcement.trackName && (
              <span className="text-[11px] font-medium text-muted-foreground">
                • {announcement.trackName}
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
            {announcement.publishedAt}
          </span>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">
            {announcement.title}
          </h4>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {announcement.content}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 border border-border">
              <AvatarImage
                src={announcement.author.avatar}
                alt={announcement.author.name}
              />
              <AvatarFallback className="text-[10px]">
                {announcement.author.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-foreground">
              {announcement.author.name}
            </span>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              ({announcement.author.role})
            </span>
          </div>

          <button
            type="button"
            className="text-xs font-medium text-primary hover:underline cursor-pointer"
            onClick={() => onReadMore?.(announcement)}
          >
            Read details
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
