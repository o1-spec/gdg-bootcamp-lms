'use client';

import React, { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { TrackDetailView } from '@/components/tracks/TrackDetailView';
import { DetailedTrack, StudentProfile, Track } from '@/types/lms';

const fallbackStudent: StudentProfile = {
  id: '',
  name: 'Student',
  firstName: 'Student',
  lastName: '',
  email: '',
  avatar: '',
  cohort: 'Bootcamp 2026',
  role: 'Student',
  enrolledTracksCount: 0,
  studyStreakDays: 0,
  totalHoursSpent: 0,
  onboardingCompleted: true,
};

interface TrackDetailClientProps {
  track: DetailedTrack;
  student?: StudentProfile;
  enrolledTracks?: Track[];
}

export function TrackDetailClient({ track, student = fallbackStudent, enrolledTracks = [] }: TrackDetailClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gdg-cream text-gdg-black antialiased selection:bg-gdg-yellow/30">
      {/* Sidebar */}
      <DashboardSidebar
        currentTab="my-tracks"
        student={student}
        enrolledTracks={enrolledTracks}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingAssignmentsCount={0}
        liveClassesCount={0}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader
          currentTab="my-tracks"
          student={student}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />


        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto">
          <TrackDetailView track={track} />
        </main>
      </div>
    </div>
  );
}
