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
        return 'bg-gdg-blue/15 text-gdg-blue border-gdg-blue/30';
      case 'Frontend Development':
        return 'bg-gdg-green/15 text-gdg-green border-gdg-green/30';
      case 'DSA / Interview Preparation':
        return 'bg-gdg-red/15 text-gdg-red border-gdg-red/30';
      default:
        return 'bg-gdg-yellow/15 text-gdg-yellow border-gdg-yellow/30';
    }
  };

  const getStatusBadge = () => {
    switch (assignment.status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gdg-green/15 text-gdg-green-dark border border-gdg-green/30">
            <CheckCircle2 className="h-3 w-3" />
            {assignment.grade ? `Score: ${assignment.grade}/100` : 'Submitted'}
          </span>
        );
      case 'due_soon':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gdg-red/15 text-gdg-red border border-gdg-red/30">
            <AlertCircle className="h-3 w-3" />
            Due in {assignment.daysRemaining} days
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gdg-cream text-gdg-gray border border-gdg-border">
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
    <div className="rounded-3xl border border-gdg-border bg-white p-5 shadow-xs hover:shadow-md transition-all duration-200 space-y-4">
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
          <h4 className="text-base font-black text-gdg-black tracking-tight">
            {assignment.title}
          </h4>
        </Link>
        <div className="flex items-center gap-3 text-xs text-gdg-gray font-medium mt-1.5">
          <span className="flex items-center gap-1 text-gdg-black font-bold">
            <Calendar className="h-3.5 w-3.5 text-gdg-blue" />
            {assignment.dueDate} • {assignment.dueTime}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-bold text-gdg-black">
            <Trophy className="h-3.5 w-3.5 text-gdg-yellow" />
            {assignment.points} Points
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gdg-border">
        <div className="text-[11px] font-medium text-gdg-gray">
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
              ? 'border border-gdg-black text-gdg-black hover:bg-gdg-cream'
              : 'bg-gdg-black text-gdg-cream hover:bg-[#1f2127]'
          )}
        >
          {assignment.status === 'submitted' ? 'View Review' : 'Submit Challenge'}
        </Link>
      </div>
    </div>
  );
}
