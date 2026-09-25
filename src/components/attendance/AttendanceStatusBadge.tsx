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
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gdg-green/15 text-gdg-green-dark border border-gdg-green/30',
            className
          )}
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-gdg-green" />
          <span>Present</span>
        </span>
      );

    case 'absent':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gdg-red/15 text-gdg-red border border-gdg-red/30',
            className
          )}
        >
          <XCircle className="h-3.5 w-3.5 text-gdg-red" />
          <span>Absent</span>
        </span>
      );

    case 'excused':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gdg-yellow/20 text-[#855B00] border border-gdg-yellow/40',
            className
          )}
        >
          <AlertCircle className="h-3.5 w-3.5 text-gdg-yellow" />
          <span>Excused</span>
        </span>
      );

    default:
      return null;
  }
}
