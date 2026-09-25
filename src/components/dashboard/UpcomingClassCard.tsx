import React from 'react';
import { Calendar, Clock, Video, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UpcomingClass } from '@/types/lms';
import { cn } from '@/lib/utils';

interface UpcomingClassCardProps {
  upcomingClass: UpcomingClass;
  onJoin?: (classItem: UpcomingClass) => void;
}

export function UpcomingClassCard({
  upcomingClass,
  onJoin,
}: UpcomingClassCardProps) {
  return (
    <Card className="border border-border/80 bg-card hover:border-border transition-all duration-200 shadow-xs">
      <CardContent className="p-4 space-y-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/60">
              {upcomingClass.trackName}
            </span>
            {upcomingClass.isLiveNow && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                LIVE NOW
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{upcomingClass.attendeesCount} joined</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground line-clamp-1">
            {upcomingClass.title}
          </h4>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1 font-medium text-foreground/80">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {upcomingClass.dateTime}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {upcomingClass.duration}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 border border-border">
              <AvatarImage
                src={upcomingClass.instructor.avatar}
                alt={upcomingClass.instructor.name}
              />
              <AvatarFallback className="text-[10px]">
                {upcomingClass.instructor.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-medium text-foreground leading-none">
                {upcomingClass.instructor.name}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {upcomingClass.instructor.role}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant={upcomingClass.isLiveNow ? 'default' : 'outline'}
            className={cn(
              'h-7 px-3 text-xs font-medium gap-1.5',
              upcomingClass.isLiveNow &&
                'bg-rose-600 text-white hover:bg-rose-700 border-rose-600'
            )}
            onClick={() => onJoin?.(upcomingClass)}
          >
            <Video className="h-3.5 w-3.5" />
            {upcomingClass.isLiveNow ? 'Join Live' : 'Details'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
