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
        return 'bg-[#4285F4]/15 text-[#4285F4] border-[#4285F4]/30';
      case 'Frontend Development':
        return 'bg-[#34A853]/15 text-[#34A853] border-[#34A853]/30';
      case 'DSA / Interview Preparation':
        return 'bg-[#EA4335]/15 text-[#EA4335] border-[#EA4335]/30';
      default:
        return 'bg-[#FBBC04]/15 text-[#FBBC04] border-[#FBBC04]/30';
    }
  };

  return (
    <div className="rounded-3xl border border-[#E5DFD0] bg-white p-5 shadow-xs hover:shadow-md transition-all duration-200 space-y-4">
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-[#EA4335]" />
              LIVE WORKSHOP
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5F6368]">
          <Users className="h-3.5 w-3.5" />
          <span>{upcomingClass.attendeesCount} enrolled</span>
        </div>
      </div>

      <div>
        <h4 className="text-base font-black text-[#0D0E11] tracking-tight">
          {upcomingClass.title}
        </h4>
        <div className="flex items-center gap-3 text-xs text-[#5F6368] font-medium mt-1.5">
          <span className="flex items-center gap-1 text-[#0D0E11] font-bold">
            <Calendar className="h-3.5 w-3.5 text-[#4285F4]" />
            {upcomingClass.dateTime}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-[#5F6368]" />
            {upcomingClass.duration}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#E5DFD0]">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 border border-[#E5DFD0]">
            <AvatarImage
              src={upcomingClass.instructor.avatar}
              alt={upcomingClass.instructor.name}
            />
            <AvatarFallback className="text-[10px] font-bold bg-[#FAF7EE] text-[#0D0E11]">
              {upcomingClass.instructor.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs font-bold text-[#0D0E11] leading-none">
              {upcomingClass.instructor.name}
            </p>
            <p className="text-[10px] text-[#5F6368] mt-0.5 font-medium">
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
              ? 'bg-[#EA4335] text-white hover:bg-[#d6382a]'
              : 'bg-[#0D0E11] text-[#FAF7EE] hover:bg-[#1f2127]'
          )}
        >
          <Video className="h-3.5 w-3.5" />
          <span>{upcomingClass.isLiveNow ? 'Join Live Room' : 'Add to Calendar'}</span>
        </button>
      </div>
    </div>
  );
}
