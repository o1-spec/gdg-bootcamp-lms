import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: 'positive' | 'neutral' | 'urgent';
  };
  iconColor?: string;
  iconBg?: string;
}

export function StatsCard({
  title,
  value,
  subtext,
  icon: Icon,
  badge,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
}: StatsCardProps) {
  return (
    <Card className="border border-border/80 bg-card/60 backdrop-blur-xs shadow-xs hover:border-border transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {value}
              </span>
              {badge && (
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                    badge.variant === 'positive' &&
                      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                    badge.variant === 'neutral' &&
                      'bg-muted text-muted-foreground border-border',
                    badge.variant === 'urgent' &&
                      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  )}
                >
                  {badge.text}
                </span>
              )}
            </div>
            {subtext && (
              <p className="text-xs text-muted-foreground/90">{subtext}</p>
            )}
          </div>
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border/60',
              iconBg,
              iconColor
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
