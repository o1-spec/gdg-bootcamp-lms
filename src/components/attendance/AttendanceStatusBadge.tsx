import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { AttendanceStatus } from '@/types/lms';
import { cn } from '@/lib/utils';

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus;
  className?: string;
}

export function AttendanceStatusBadge({ status, className }: AttendanceStatusBadgeProps) {
  switch (status) {
    case 'present':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#34A853]/15 text-[#1e7e34] border border-[#34A853]/30',
            className
          )}
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-[#34A853]" />
          <span>Present</span>
        </span>
      );

    case 'absent':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30',
            className
          )}
        >
          <XCircle className="h-3.5 w-3.5 text-[#EA4335]" />
          <span>Absent</span>
        </span>
      );

    case 'excused':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FBBC04]/20 text-[#855B00] border border-[#FBBC04]/40',
            className
          )}
        >
          <AlertCircle className="h-3.5 w-3.5 text-[#FBBC04]" />
          <span>Excused</span>
        </span>
      );

    default:
      return null;
  }
}
