'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, FolderSearch } from 'lucide-react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EnrolledTrackCard } from '@/components/tracks/EnrolledTrackCard';
import { DetailedTrack, StudentProfile, Track } from '@/types/lms';

interface TracksClientProps {
  tracks: DetailedTrack[];
  student: StudentProfile;
  enrolledTracksSummary: Track[];
}

export function TracksClient({ tracks, student, enrolledTracksSummary }: TracksClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTracks = tracks.filter((track) => {
    return (
      searchQuery === '' ||
      track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.currentModule.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex min-h-screen bg-[#FAF7EE] text-[#0D0E11] antialiased selection:bg-[#FBBC04]/30">
      {/* Sidebar */}
      <DashboardSidebar
        currentTab="my-tracks"
        student={student}
        enrolledTracks={enrolledTracksSummary}
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
          onSearchChange={setSearchQuery}
        />

        {/* Ticker Ribbon */}
        <div className="w-full bg-[#FBBC04] text-[#0D0E11] py-2 px-6 overflow-hidden border-b border-[#0D0E11]/10">
          <div className="flex items-center justify-between text-xs font-black tracking-wider uppercase whitespace-nowrap">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              <span>BUILD ✦</span>
              <span>INNOVATE ✦</span>
              <span>DESIGN ✦</span>
              <span>SHIP ✦</span>
              <span>LEARN ✦</span>
              <span>CONNECT ✦</span>
              <span>GROW ✦</span>
              <span className="hidden sm:inline">BUILD ✦ INNOVATE ✦ SHIP</span>
            </div>
            <span className="hidden lg:inline text-[11px] font-bold tracking-normal opacity-90 pl-4">
              GDG on Campus LASU Career Bootcamp 2026
            </span>
          </div>
        </div>

        <main className="flex-1 p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl w-full mx-auto">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5DFD0] pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#34A853]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
                  Enrolled Curriculum
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#0D0E11] tracking-tight">
                My Tracks
              </h1>
              <p className="text-sm text-[#5F6368] font-medium max-w-xl">
                Continue learning across your enrolled bootcamp tracks. Each track is designed for hands-on portfolio outcomes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-[#E5DFD0] bg-white px-4 py-2.5 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
                  Active Enrolled
                </span>
                <span className="text-lg font-black text-[#0D0E11]">
                  {tracks.length} {tracks.length === 1 ? 'Track' : 'Tracks'}
                </span>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {tracks.length === 0 ? (
            <div className="rounded-3xl border border-[#E5DFD0] bg-white p-12 text-center space-y-4 shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FBBC04]/20 text-[#FBBC04]">
                <FolderSearch className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-[#0D0E11]">
                You haven&apos;t been enrolled in a track yet.
              </h3>
              <p className="text-xs text-[#5F6368] max-w-md mx-auto">
                Once an administrator or mentor approves your cohort enrollment, your assigned engineering tracks will appear here.
              </p>
            </div>
          ) : (
            /* Tracks Grid */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {filteredTracks.map((track, idx) => (
                <EnrolledTrackCard
                  key={track.id}
                  track={track}
                  variant={idx === 0 ? 'dark' : idx === 2 ? 'dark' : 'light'}
                />
              ))}
            </div>
          )}

          {/* Capstone Cohort Callout Card */}
          <div className="rounded-3xl border border-[#22242B] bg-[#0D0E11] text-[#FAF7EE] p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-[#34A853]/15 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#FBBC04]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FBBC04]">
                    Cross-Track Collaboration
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-[#FAF7EE]">
                  Squad Capstone Projects Kickoff in 2 Weeks
                </h3>
                <p className="text-xs sm:text-sm text-[#FAF7EE]/70 font-normal leading-relaxed">
                  Students from Backend, Frontend, and DSA tracks will form squads of 3 to architect and deploy a unified cloud application with mentor code reviews.
                </p>
              </div>

              {tracks[0] && (
                <Link
                  href={`/tracks/${tracks[0].slug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#FAF7EE] text-[#0D0E11] hover:bg-white px-6 py-3 text-xs font-black tracking-wide shrink-0 shadow-md transition-transform active:scale-95"
                >
                  <span>Resume Primary Track</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
