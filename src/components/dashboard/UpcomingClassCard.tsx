import React from 'react';
import { Calendar, Clock, Video, Users } from 'lucide-react';
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
  // Track color badge mapping
  const getTrackBadgeStyle = () => {
    switch (upcomingClass.trackName) {
      case 'Backend Development':
        return 'bg-gdg-blue/15 text-gdg-blue border-gdg-blue/30';
      case 'Frontend Development':
        return 'bg-gdg-green/15 text-gdg-green border-gdg-green/30';
      case 'DSA / Interview Preparation':
        return 'bg-gdg-red/15 text-gdg-red border-gdg-red/30';
      default:
        return 'bg-gdg-yellow/15 text-gdg-yellow border-gdg-yellow/30';
    }
  };

  return (
    <div className="rounded-3xl border border-gdg-border bg-white p-5 shadow-xs hover:shadow-md transition-all duration-200 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border',
              getTrackBadgeStyle()
            )}
          >
            {upcomingClass.trackName}
          </span>

          {upcomingClass.isLiveNow && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-gdg-red/15 text-gdg-red border border-gdg-red/30 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-gdg-red" />
              LIVE WORKSHOP
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gdg-gray">
          <Users className="h-3.5 w-3.5" />
          <span>{upcomingClass.attendeesCount} enrolled</span>
        </div>
      </div>

      <div>
        <h4 className="text-base font-black text-gdg-black tracking-tight">
          {upcomingClass.title}
        </h4>
        <div className="flex items-center gap-3 text-xs text-gdg-gray font-medium mt-1.5">
          <span className="flex items-center gap-1 text-gdg-black font-bold">
            <Calendar className="h-3.5 w-3.5 text-gdg-blue" />
            {upcomingClass.dateTime}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-gdg-gray" />
            {upcomingClass.duration}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gdg-border">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 border border-gdg-border">
            <AvatarImage
              src={upcomingClass.instructor.avatar}
              alt={upcomingClass.instructor.name}
            />
            <AvatarFallback className="text-[10px] font-bold bg-gdg-cream text-gdg-black">
              {upcomingClass.instructor.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs font-bold text-gdg-black leading-none">
              {upcomingClass.instructor.name}
            </p>
            <p className="text-[10px] text-gdg-gray mt-0.5 font-medium">
              {upcomingClass.instructor.role}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onJoin?.(upcomingClass)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-black tracking-wide shadow-xs transition-transform active:scale-95 cursor-pointer',
            upcomingClass.isLiveNow
              ? 'bg-gdg-red text-white hover:bg-[#d6382a]'
              : 'bg-gdg-black text-gdg-cream hover:bg-[#1f2127]'
          )}
        >
          <Video className="h-3.5 w-3.5" />
          <span>{upcomingClass.isLiveNow ? 'Join Live Room' : 'Add to Calendar'}</span>
        </button>
      </div>
    </div>
  );
}
