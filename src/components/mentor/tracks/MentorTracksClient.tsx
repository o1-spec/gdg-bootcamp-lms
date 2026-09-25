'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Users,
  BookOpen,
  Calendar,
  Send,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Clock,
  CheckCircle2,
  FolderGit2,
} from 'lucide-react';
import { MentorSidebar } from '@/components/mentor/MentorSidebar';
import { MentorHeader } from '@/components/mentor/MentorHeader';
import { MentorTrackSummary } from '@/lib/data/mentor';
import { cn } from '@/lib/utils';

interface MentorTracksClientProps {
  tracks: MentorTrackSummary[];
  mentor: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
  };
  metrics: {
    assignedTracksCount: number;
    pendingSubmissionsCount: number;
  };
}

export function MentorTracksClient({
  tracks,
  mentor,
  metrics,
}: MentorTracksClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FAF7EE] text-[#0D0E11] antialiased selection:bg-[#FBBC04]/30">
      <MentorSidebar
        currentTab="tracks"
        mentor={mentor}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingSubmissionsCount={metrics.pendingSubmissionsCount}
        assignedTracksCount={metrics.assignedTracksCount}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <MentorHeader
          currentTab="tracks"
          mentor={mentor}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-6 sm:p-8 lg:p-10 space-y-10 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5DFD0] pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#4285F4]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
                  Curriculum & Cohort Supervision
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0D0E11]">
                My Assigned Tracks
              </h1>
              <p className="text-base text-[#5F6368] max-w-2xl font-medium">
                Manage curriculum modules, supervise student progress, publish lessons, and review code deliverables for your assigned bootcamp tracks.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-white border border-[#E5DFD0] shadow-sm flex items-center gap-2 text-xs font-bold text-[#0D0E11]">
                <Layers className="h-4 w-4 text-[#4285F4]" />
                <span>{tracks.length} {tracks.length === 1 ? 'Track' : 'Tracks'} Assigned</span>
              </div>
            </div>
          </div>

          {/* Tracks List / Grid */}
          {tracks.length === 0 ? (
            <div className="rounded-3xl bg-white border border-[#E5DFD0] p-12 text-center shadow-sm max-w-2xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FBBC04]/20 border border-[#FBBC04]/40 flex items-center justify-center mx-auto text-[#FBBC04]">
                <Layers className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-black text-[#0D0E11]">No Tracks Assigned Yet</h2>
              <p className="text-sm text-[#5F6368] leading-relaxed">
                You haven&apos;t been assigned to any bootcamp tracks as a mentor yet. Please contact the program administrator to assign you to your respective cohort track.
              </p>
              <div className="pt-2">
                <Link
                  href="/mentor/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] transition-colors"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="group relative rounded-3xl bg-white border border-[#E5DFD0] hover:border-[#0D0E11] p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-6">
                    {/* Top Row: Cohort Badge & Accent */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-12 rounded-full"
                          style={{ backgroundColor: track.accent || '#4285F4' }}
                        />
                        <div>
                          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
                            {track.cohortName}
                          </span>
                          <h2 className="text-2xl font-black text-[#0D0E11] group-hover:text-[#4285F4] transition-colors mt-1">
                            {track.name}
                          </h2>
                        </div>
                      </div>

                      {track.pendingSubmissionsCount > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EA4335]/10 border border-[#EA4335]/30 text-[#EA4335] text-xs font-bold animate-pulse">
                          <Send className="h-3 w-3" />
                          {track.pendingSubmissionsCount} pending
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-[#5F6368] line-clamp-2 leading-relaxed">
                      {track.description}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0]">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase text-[#5F6368] flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-[#4285F4]" />
                          Students
                        </span>
                        <p className="text-lg font-black text-[#0D0E11]">{track.studentCount}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase text-[#5F6368] flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-[#34A853]" />
                          Modules
                        </span>
                        <p className="text-lg font-black text-[#0D0E11]">{track.moduleCount}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase text-[#5F6368] flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-[#FBBC04]" />
                          Lessons
                        </span>
                        <p className="text-lg font-black text-[#0D0E11]">{track.lessonCount}</p>
                      </div>
                    </div>

                    {/* Upcoming Session */}
                    {track.upcomingSession ? (
                      <div className="rounded-2xl p-4 bg-white border border-[#E5DFD0] flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-[#4285F4]/10 text-[#4285F4]">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368]">
                              Upcoming Class
                            </span>
                            <p className="font-bold text-[#0D0E11] line-clamp-1">
                              {track.upcomingSession.title}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono font-medium text-[#5F6368] whitespace-nowrap">
                          {new Date(track.upcomingSession.startTime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    ) : (
                      <div className="rounded-2xl p-3 bg-white/50 border border-dashed border-[#E5DFD0] text-center text-xs text-[#5F6368]">
                        No upcoming sessions scheduled
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-6 border-t border-[#E5DFD0] flex items-center justify-between gap-4 mt-6">
                    <Link
                      href={`/mentor/tracks/${track.id}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] transition-all duration-200 group-hover:scale-[1.02] shadow-sm flex-1 sm:flex-initial"
                    >
                      <span>Manage Track</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/mentor/assignments?trackId=${track.id}`}
                        className="px-3.5 py-2.5 rounded-xl border border-[#E5DFD0] text-xs font-bold text-[#5F6368] hover:text-[#0D0E11] hover:bg-[#FAF7EE] transition-colors"
                        title="Assignments"
                      >
                        Assignments
                      </Link>
                      <Link
                        href={`/mentor/attendance?trackId=${track.id}`}
                        className="px-3.5 py-2.5 rounded-xl border border-[#E5DFD0] text-xs font-bold text-[#5F6368] hover:text-[#0D0E11] hover:bg-[#FAF7EE] transition-colors"
                        title="Attendance"
                      >
                        Attendance
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
