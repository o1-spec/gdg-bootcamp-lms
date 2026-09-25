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
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gdg-green/15 text-gdg-green-dark border border-gdg-green/30',
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
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gdg-blue/15 text-gdg-blue border border-gdg-blue/30',
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
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gdg-green/15 text-gdg-green border border-gdg-green/30',
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
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gdg-red/15 text-gdg-red border border-gdg-red/30',
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
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gdg-yellow/20 text-[#855B00] border border-gdg-yellow/40',
            className
          )}
        >
          <CircleDot className="h-3 w-3 text-gdg-yellow" />
          <span>{showDueDateText && daysRemaining !== undefined ? getDueDateLabel() : 'In Progress'}</span>
        </span>
      );

    case 'not_started':
    default:
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gdg-cream text-gdg-gray border border-gdg-border',
            className
          )}
        >
          <Clock className="h-3 w-3" />
          <span>{showDueDateText && daysRemaining !== undefined ? getDueDateLabel() : 'Not Started'}</span>
        </span>
      );
  }
}
