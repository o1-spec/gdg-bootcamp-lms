'use client';

import React from 'react';
import {
  BookOpen,
  FolderGit2,
  FileCheck,
  TrendingUp,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type TrackTabType =
  | 'overview'
  | 'curriculum'
  | 'resources'
  | 'assignments'
  | 'progress';

interface TrackTabsProps {
  currentTab: TrackTabType;
  onTabChange: (tab: TrackTabType) => void;
  accentColor?: string;
  counts?: {
    curriculumLessons?: number;
    resourcesCount?: number;
    assignmentsCount?: number;
  };
}

export function TrackTabs({
  currentTab,
  onTabChange,
  accentColor = '#4285F4',
  counts,
}: TrackTabsProps) {
  const tabs = [
    {
      id: 'curriculum' as TrackTabType,
      label: 'Curriculum',
      icon: BookOpen,
      badge: counts?.curriculumLessons ? `${counts.curriculumLessons} Lessons` : undefined,
    },
    {
      id: 'overview' as TrackTabType,
      label: 'Overview',
      icon: Info,
    },
    {
      id: 'resources' as TrackTabType,
      label: 'Resources',
      icon: FolderGit2,
      badge: counts?.resourcesCount ? `${counts.resourcesCount}` : undefined,
    },
    {
      id: 'assignments' as TrackTabType,
      label: 'Assignments',
      icon: FileCheck,
      badge: counts?.assignmentsCount ? `${counts.assignmentsCount}` : undefined,
    },
    {
      id: 'progress' as TrackTabType,
      label: 'Progress',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs',
              isActive
                ? 'bg-[#0D0E11] text-[#FAF7EE]'
                : 'bg-white border border-[#E5DFD0] text-[#5F6368] hover:text-[#0D0E11] hover:border-[#0D0E11]/30'
            )}
          >
            <Icon
              className={cn(
                'h-3.5 w-3.5',
                isActive ? 'text-[#FAF7EE]' : 'text-[#5F6368]'
              )}
            />
            <span>{tab.label}</span>

            {tab.badge && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-black',
                  isActive
                    ? 'bg-[#15161A] text-[#FAF7EE]'
                    : 'bg-[#FAF7EE] text-[#0D0E11]'
                )}
                style={isActive ? { color: accentColor } : undefined}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
