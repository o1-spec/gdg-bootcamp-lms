import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Award,
  CircleDot,
} from 'lucide-react';
import { ExtendedAssignmentStatus } from '@/types/lms';
import { cn } from '@/lib/utils';

interface AssignmentStatusBadgeProps {
  status: ExtendedAssignmentStatus;
  daysRemaining?: number;
  className?: string;
  showDueDateText?: boolean;
}

export function AssignmentStatusBadge({
  status,
  daysRemaining,
  className,
  showDueDateText = false,
}: AssignmentStatusBadgeProps) {
  // Helpful due date copy
  const getDueDateLabel = () => {
    if (daysRemaining === undefined) return null;
    if (daysRemaining < 0) return `Overdue by ${Math.abs(daysRemaining)} ${Math.abs(daysRemaining) === 1 ? 'day' : 'days'}`;
    if (daysRemaining === 0) return 'Due today';
    if (daysRemaining === 1) return 'Due tomorrow';
    return `Due in ${daysRemaining} days`;
  };

  switch (status) {
    case 'completed':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#34A853]/15 text-[#1e7e34] border border-[#34A853]/30',
            className
          )}
        >
          <CheckCircle2 className="h-3 w-3" />
          <span>Completed</span>
        </span>
      );

    case 'reviewed':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#4285F4]/15 text-[#4285F4] border border-[#4285F4]/30',
            className
          )}
        >
          <Award className="h-3 w-3" />
          <span>Reviewed</span>
        </span>
      );

    case 'submitted':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30',
            className
          )}
        >
          <FileCheck className="h-3 w-3" />
          <span>Submitted</span>
        </span>
      );

    case 'overdue':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30',
            className
          )}
        >
          <AlertCircle className="h-3 w-3" />
          <span>{showDueDateText && daysRemaining !== undefined ? getDueDateLabel() : 'Overdue'}</span>
        </span>
      );

    case 'in_progress':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#FBBC04]/20 text-[#855B00] border border-[#FBBC04]/40',
            className
          )}
        >
          <CircleDot className="h-3 w-3 text-[#FBBC04]" />
          <span>{showDueDateText && daysRemaining !== undefined ? getDueDateLabel() : 'In Progress'}</span>
        </span>
      );

    case 'not_started':
    default:
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]',
            className
          )}
        >
          <Clock className="h-3 w-3" />
          <span>{showDueDateText && daysRemaining !== undefined ? getDueDateLabel() : 'Not Started'}</span>
        </span>
      );
  }
}
