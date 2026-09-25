import React from 'react';
import { AlertCircle, Calendar, CheckCircle2, Clock, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Assignment } from '@/types/lms';

interface AssignmentCardProps {
  assignment: Assignment;
  onSubmit?: (assignment: Assignment) => void;
}

export function AssignmentCard({ assignment, onSubmit }: AssignmentCardProps) {
  const getStatusBadge = () => {
    switch (assignment.status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            {assignment.grade ? `Graded: ${assignment.grade}/100` : 'Submitted'}
          </span>
        );
      case 'due_soon':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertCircle className="h-3 w-3" />
            Due in {assignment.daysRemaining} days
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
            <Clock className="h-3 w-3" />
            Due in {assignment.daysRemaining} days
          </span>
        );
    }
  };

  return (
    <Card className="border border-border/80 bg-card hover:border-border transition-all duration-200 shadow-xs">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/60">
            {assignment.trackName}
          </span>
          {getStatusBadge()}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground line-clamp-1">
            {assignment.title}
          </h4>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {assignment.dueDate} • {assignment.dueTime}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              {assignment.points} pts
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <div className="text-[11px] text-muted-foreground">
            {assignment.submissionCount !== undefined && assignment.totalStudents && (
              <span>
                {assignment.submissionCount} of {assignment.totalStudents} peers submitted
              </span>
            )}
          </div>

          <Button
            size="sm"
            variant={assignment.status === 'submitted' ? 'outline' : 'default'}
            className="h-7 px-3 text-xs font-medium"
            onClick={() => onSubmit?.(assignment)}
          >
            {assignment.status === 'submitted' ? 'View Feedback' : 'Submit Work'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
