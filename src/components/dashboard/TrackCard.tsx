import React from 'react';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Track } from '@/types/lms';
import { cn } from '@/lib/utils';

interface TrackCardProps {
  track: Track;
  onResumeLesson?: (trackId: string, lessonId: string) => void;
}

export function TrackCard({ track, onResumeLesson }: TrackCardProps) {
  const leadInstructor = track.instructors[0];

  return (
    <Card className="group relative flex flex-col justify-between border border-border/80 bg-card hover:border-border transition-all duration-200 shadow-xs hover:shadow-sm">
      <CardContent className="p-5 flex flex-col justify-between h-full gap-5">
        {/* Track header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <span
              className={cn(
                'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold border',
                track.colorTheme.badge
              )}
            >
              {track.name}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {track.cohort}
            </span>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
              {track.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
              {track.description}
            </p>
          </div>
        </div>

        {/* Progress block */}
        <div className="space-y-2 rounded-lg bg-muted/40 p-3.5 border border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">
              Curriculum Progress
            </span>
            <span className="font-semibold text-foreground">
              {track.progressPercentage}%
            </span>
          </div>
          <Progress value={track.progressPercentage} className="h-2" />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
            <span>
              {track.completedLessons} of {track.totalLessons} lessons completed
            </span>
            <span>{track.totalLessons - track.completedLessons} remaining</span>
          </div>
        </div>

        {/* Next lesson & instructor info */}
        <div className="space-y-3 pt-1 border-t border-border/60">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Next Up</span>
            </div>
            <p className="text-xs font-medium text-foreground line-clamp-1">
              {track.nextLesson.title}
            </p>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {track.nextLesson.durationMinutes} mins
              </span>
              <span>•</span>
              <span className="line-clamp-1">{track.currentModule}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {leadInstructor && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 border border-border">
                  <AvatarImage src={leadInstructor.avatar} alt={leadInstructor.name} />
                  <AvatarFallback className="text-[10px]">
                    {leadInstructor.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs">
                  <span className="text-muted-foreground text-[11px]">Mentor: </span>
                  <span className="font-medium text-foreground text-[11px]">
                    {leadInstructor.name}
                  </span>
                </div>
              </div>
            )}

            <Button
              size="sm"
              className="gap-1 text-xs h-8 ml-auto font-medium"
              onClick={() => onResumeLesson?.(track.id, track.nextLesson.id)}
            >
              Resume
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
