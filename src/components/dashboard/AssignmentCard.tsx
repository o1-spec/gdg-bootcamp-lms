import React from 'react';
import Link from 'next/link';
import { AlertCircle, Calendar, CheckCircle2, Clock, Trophy } from 'lucide-react';
import { Assignment } from '@/types/lms';
import { cn } from '@/lib/utils';

interface AssignmentCardProps {
  assignment: Assignment;
  onSubmit?: (assignment: Assignment) => void;
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const getTrackBadgeStyle = () => {
    switch (assignment.trackName) {
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

  const getStatusBadge = () => {
    switch (assignment.status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#34A853]/15 text-[#1e7e34] border border-[#34A853]/30">
            <CheckCircle2 className="h-3 w-3" />
            {assignment.grade ? `Score: ${assignment.grade}/100` : 'Submitted'}
          </span>
        );
      case 'due_soon':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30">
            <AlertCircle className="h-3 w-3" />
            Due in {assignment.daysRemaining} days
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
            <Clock className="h-3 w-3" />
            Due in {assignment.daysRemaining} days
          </span>
        );
    }
  };

  const assignmentSlug =
    assignment.id === 'asg-1'
      ? 'build-a-rest-api'
      : assignment.id === 'asg-2'
      ? 'react-dashboard-challenge'
      : assignment.id === 'asg-3'
      ? 'binary-search-practice-set'
      : assignment.id;
  const assignmentHref = `/assignments/${assignmentSlug}`;

  return (
    <div className="rounded-3xl border border-[#E5DFD0] bg-white p-5 shadow-xs hover:shadow-md transition-all duration-200 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            'inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border',
            getTrackBadgeStyle()
          )}
        >
          {assignment.trackName}
        </span>
        {getStatusBadge()}
      </div>

      <div>
        <Link href={assignmentHref} className="hover:underline">
          <h4 className="text-base font-black text-[#0D0E11] tracking-tight">
            {assignment.title}
          </h4>
        </Link>
        <div className="flex items-center gap-3 text-xs text-[#5F6368] font-medium mt-1.5">
          <span className="flex items-center gap-1 text-[#0D0E11] font-bold">
            <Calendar className="h-3.5 w-3.5 text-[#4285F4]" />
            {assignment.dueDate} • {assignment.dueTime}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-bold text-[#0D0E11]">
            <Trophy className="h-3.5 w-3.5 text-[#FBBC04]" />
            {assignment.points} Points
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#E5DFD0]">
        <div className="text-[11px] font-medium text-[#5F6368]">
          {assignment.submissionCount !== undefined && assignment.totalStudents && (
            <span>
              {assignment.submissionCount} of {assignment.totalStudents} squad peers submitted
            </span>
          )}
        </div>

        <Link
          href={assignmentHref}
          className={cn(
            'inline-flex items-center rounded-full px-4 py-2 text-xs font-black tracking-wide shadow-xs transition-transform active:scale-95 cursor-pointer',
            assignment.status === 'submitted'
              ? 'border border-[#0D0E11] text-[#0D0E11] hover:bg-[#FAF7EE]'
              : 'bg-[#0D0E11] text-[#FAF7EE] hover:bg-[#1f2127]'
          )}
        >
          {assignment.status === 'submitted' ? 'View Review' : 'Submit Challenge'}
        </Link>
      </div>
    </div>
  );
}
