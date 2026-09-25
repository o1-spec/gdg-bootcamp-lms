'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StudentProfile, Track } from '@/types/lms';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { STUDENT_NAV_SECTIONS } from '@/constants/navigation';
import { cn } from '@/lib/utils';

export type DashboardNavTab =
  | 'dashboard'
  | 'my-tracks'
  | 'resources'
  | 'assignments'
  | 'schedule'
  | 'progress'
  | 'attendance'
  | 'announcements';

interface DashboardSidebarProps {
  currentTab?: DashboardNavTab;
  onSelectTab?: (tab: DashboardNavTab) => void;
  student: StudentProfile;
  enrolledTracks?: Track[];
  isMobileOpen: boolean;
  onMobileClose: () => void;
  pendingAssignmentsCount?: number;
  liveClassesCount?: number;
}

export function DashboardSidebar({
  currentTab,
  student,
  enrolledTracks = [],
  isMobileOpen,
  onMobileClose,
  pendingAssignmentsCount = 0,
  liveClassesCount = 0,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const extraContent = (
    <>
      {enrolledTracks.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#22242B]/60">
          <div className="px-3 pb-1 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FAF7EE]/40">
              Enrolled Tracks
            </span>
            <span className="rounded-full bg-[#1A1C23] px-2 py-0.5 text-[10px] font-bold text-[#FAF7EE]/70 border border-[#2D3039]">
              {enrolledTracks.length}
            </span>
          </div>

          <div className="space-y-1.5">
            {enrolledTracks.map((track) => {
              const dotColor =
                track.name === 'Backend Development'
                  ? 'bg-[#4285F4]'
                  : track.name === 'Frontend Development'
                  ? 'bg-[#34A853]'
                  : 'bg-[#EA4335]';

              const isCurrentTrack = pathname === `/tracks/${track.slug}`;

              return (
                <Link
                  key={track.id}
                  href={`/tracks/${track.slug}`}
                  onClick={onMobileClose}
                  className={cn(
                    'group flex w-full items-center justify-between rounded-2xl border p-3 text-left transition-all cursor-pointer',
                    isCurrentTrack
                      ? 'border-[#FAF7EE] bg-[#1C1D22]'
                      : 'border-[#22242B] bg-[#15161A] hover:border-[#383A42] hover:bg-[#1A1B20]'
                  )}
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className={cn('h-2 w-2 rounded-full shrink-0', dotColor)} />
                      <p className="text-xs font-bold text-[#FAF7EE] truncate">
                        {track.name}
                      </p>
                    </div>
                    <p className="text-[10px] text-[#FAF7EE]/60 pl-4 font-medium">
                      {track.progressPercentage}% completed
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[#22242B] bg-[#15161A] p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#34A853] animate-pulse" />
          <span className="text-xs font-bold text-[#FAF7EE]">GDG LASU Chapter</span>
        </div>
        <p className="text-[11px] text-[#FAF7EE]/70 leading-relaxed font-normal">
          Collaborate in squads, request mentor code reviews, and join live pair programming rooms.
        </p>
      </div>
    </>
  );

  return (
    <AppSidebar
      currentTab={currentTab === 'my-tracks' ? 'tracks' : currentTab}
      user={{
        id: student.id,
        name: student.name,
        email: student.email,
        avatar: student.avatar,
        role: student.role,
      }}
      sections={STUDENT_NAV_SECTIONS}
      badges={{
        pendingAssignments: pendingAssignmentsCount,
        liveClasses: liveClassesCount,
      }}
      isMobileOpen={isMobileOpen}
      onMobileClose={onMobileClose}
      portalName="GDG ON CAMPUS LASU"
      portalBadge={student.cohort || 'Bootcamp 2026'}
      extraFooterContent={extraContent}
    />
  );
}
