'use client';

import React from 'react';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { MENTOR_NAV_SECTIONS } from '@/constants/navigation';

export type MentorNavTab =
  | 'dashboard'
  | 'tracks'
  | 'resources'
  | 'assignments'
  | 'submissions'
  | 'schedule'
  | 'attendance'
  | 'announcements';

export interface MentorUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

interface MentorSidebarProps {
  currentTab?: MentorNavTab;
  mentor: MentorUser;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  pendingSubmissionsCount?: number;
  assignedTracksCount?: number;
}

export function MentorSidebar({
  currentTab,
  mentor,
  isMobileOpen,
  onMobileClose,
  pendingSubmissionsCount = 0,
  assignedTracksCount = 1,
}: MentorSidebarProps) {
  return (
    <AppSidebar
      currentTab={currentTab}
      user={{
        id: mentor.id,
        name: mentor.name,
        email: mentor.email,
        avatar: mentor.avatar,
        role: mentor.role || 'Mentor / Tutor',
      }}
      sections={MENTOR_NAV_SECTIONS}
      badges={{
        pendingSubmissions: pendingSubmissionsCount,
        assignedTracks: assignedTracksCount,
      }}
      isMobileOpen={isMobileOpen}
      onMobileClose={onMobileClose}
      portalName="GDG ON CAMPUS LASU"
      portalBadge="Mentor Portal"
    />
  );
}
