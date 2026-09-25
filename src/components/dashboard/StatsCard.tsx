import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
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
  accentColor?: string; // hex e.g. #4285F4, #34A853, #EA4335, #FBBC04
  href?: string;
}

export function StatsCard({
  title,
  value,
  subtext,
  icon: Icon,
  badge,
  accentColor = '#4285F4',
  href,
}: StatsCardProps) {
  const content = (
    <div className="relative overflow-hidden rounded-3xl border border-[#E5DFD0] bg-white p-6 shadow-xs hover:shadow-md transition-all duration-200">
      {/* Subtle Google accent top border strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
            {title}
          </p>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-gdg-black">
              {value}
            </span>
            {badge && (
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold',
                  badge.variant === 'positive' && 'bg-gdg-green/15 text-[#1e7e34]',
                  badge.variant === 'urgent' && 'bg-gdg-red/15 text-gdg-red',
                  badge.variant === 'neutral' && 'bg-[#E5DFD0] text-gdg-black'
                )}
              >
                {badge.text}
              </span>
            )}
          </div>
          {subtext && (
            <p className="text-xs font-medium text-[#5F6368]">{subtext}</p>
          )}
        </div>

        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border"
          style={{
            borderColor: `${accentColor}40`,
            backgroundColor: `${accentColor}12`,
            color: accentColor,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block group">
        {content}
      </Link>
    );
  }

  return content;
}
