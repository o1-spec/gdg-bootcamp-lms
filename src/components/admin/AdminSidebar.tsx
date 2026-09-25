'use client';

import React from 'react';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { ADMIN_NAV_SECTIONS } from '@/constants/navigation';

export type AdminNavTab =
  | 'dashboard'
  | 'bootcamps'
  | 'cohorts'
  | 'tracks'
  | 'users'
  | 'enrollments'
  | 'invites'
  | 'mentors'
  | 'sessions'
  | 'announcements';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

interface AdminSidebarProps {
  currentTab?: AdminNavTab;
  admin: AdminUser;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  activeBootcampsCount?: number;
  totalStudentsCount?: number;
}

export function AdminSidebar({
  currentTab,
  admin,
  isMobileOpen,
  onMobileClose,
  activeBootcampsCount = 0,
  totalStudentsCount = 0,
}: AdminSidebarProps) {
  return (
    <AppSidebar
      currentTab={currentTab}
      user={{
        id: admin.id,
        name: admin.name,
        email: admin.email,
        avatar: admin.avatar,
        role: admin.role || 'Administrator',
      }}
      sections={ADMIN_NAV_SECTIONS}
      badges={{
        activeBootcamps: activeBootcampsCount,
        totalStudents: totalStudentsCount,
      }}
      isMobileOpen={isMobileOpen}
      onMobileClose={onMobileClose}
      portalName="GDG ON CAMPUS LASU"
      portalBadge="Admin Console"
    />
  );
}
