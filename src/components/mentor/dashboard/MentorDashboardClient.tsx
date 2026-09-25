'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Users,
  Send,
  Calendar,
  FolderGit2,
  UserCheck,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Clock,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { MentorSidebar } from '@/components/mentor/MentorSidebar';
import { MentorHeader } from '@/components/mentor/MentorHeader';
import { MentorPendingSubmission, MentorTrackSummary } from '@/lib/data/mentor';
import { cn } from '@/lib/utils';

interface MentorDashboardClientProps {
  metrics: {
    assignedTracksCount: number;
    totalStudentsCount: number;
    pendingSubmissionsCount: number;
    upcomingSessionsCount: number;
    resourcesCount: number;
    averageAttendanceRate: number;
  };
  assignedTracks: MentorTrackSummary[];
  pendingSubmissions: MentorPendingSubmission[];
  upcomingSessions: any[];
  recentAnnouncements: any[];
  mentor: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
  };
}

export function MentorDashboardClient({
  metrics,
  assignedTracks,
  pendingSubmissions,
  upcomingSessions,
  recentAnnouncements,
  mentor,
}: MentorDashboardClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeReviewSub, setActiveReviewSub] = useState<MentorPendingSubmission | null>(null);
  const [reviewScore, setReviewScore] = useState<number>(90);
  const [reviewFeedback, setReviewFeedback] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewSub) return;
    setIsSubmittingReview(true);

    try {
      const res = await fetch(`/api/mentor/submissions/${activeReviewSub.id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Number(reviewScore),
          feedback: reviewFeedback,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save review');
      }

      setToastMessage(`Graded deliverable for ${activeReviewSub.studentName} with score ${reviewScore}/100.`);
      setTimeout(() => setToastMessage(null), 4000);
      setActiveReviewSub(null);
      setReviewFeedback('');
    } catch (err: any) {
      alert(err.message || 'Error saving review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7EE] text-[#0D0E11] antialiased selection:bg-[#FBBC04]/30">
      <MentorSidebar
        currentTab="dashboard"
        mentor={mentor}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingSubmissionsCount={metrics.pendingSubmissionsCount}
        assignedTracksCount={metrics.assignedTracksCount}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <MentorHeader
          currentTab="dashboard"
          mentor={mentor}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        {/* Success Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] px-5 py-3 shadow-xl border border-[#34A853]/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
            <CheckCircle2 className="h-4 w-4 text-[#34A853]" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}

        {/* Ticker Ribbon */}
        <div className="w-full bg-[#0D0E11] text-[#FAF7EE] py-2 px-6 overflow-hidden border-b border-[#22242B]">
          <div className="flex items-center justify-between text-xs font-black tracking-wider uppercase whitespace-nowrap">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              <span className="text-[#4285F4]">TRACK OVERSIGHT ✦</span>
              <span className="text-[#34A853]">STUDENT CODE REVIEW ✦</span>
              <span className="text-[#FBBC04]">LIVE WORKSHOPS ✦</span>
              <span className="text-[#EA4335]">CAPSTONE ASSESSMENTS ✦</span>
              <span>GDG ON CAMPUS LASU ✦</span>
            </div>
            <span className="hidden lg:inline text-[11px] font-bold text-zinc-400">
              Welcome back, {mentor.name.split(' ')[0]} • Instructor Panel
            </span>
          </div>
        </div>

        <main className="flex-1 p-6 sm:p-8 lg:p-10 space-y-10 max-w-7xl w-full mx-auto">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5DFD0] pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#4285F4]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
                  Cohort 1 Instruction
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#0D0E11] tracking-tight">
                Instructor Command Center
              </h1>
              <p className="text-sm text-[#5F6368] font-medium max-w-2xl">
                Guide your bootcamp students, review engineering deliverables, manage curriculum modules, and record live attendance.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/mentor/tracks"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0D0E11] text-white text-xs font-black hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md"
              >
                <span>Manage Tracks</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* 6 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="rounded-3xl border border-[#E5DFD0] bg-white p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider">Tracks</span>
                <Layers className="h-4 w-4 text-[#4285F4]" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[#0D0E11]">{metrics.assignedTracksCount}</p>
              <span className="text-[11px] text-[#5F6368]">Assigned tracks</span>
            </div>

            <div className="rounded-3xl border border-[#E5DFD0] bg-white p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider">Students</span>
                <Users className="h-4 w-4 text-[#34A853]" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[#0D0E11]">{metrics.totalStudentsCount}</p>
              <span className="text-[11px] text-[#5F6368]">Total enrolled</span>
            </div>

            <div className="rounded-3xl border border-[#EA4335]/30 bg-[#EA4335]/5 p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#EA4335] uppercase tracking-wider">Submissions</span>
                <Send className="h-4 w-4 text-[#EA4335]" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[#EA4335]">{metrics.pendingSubmissionsCount}</p>
              <span className="text-[11px] text-[#EA4335] font-bold">Needs your review</span>
            </div>

            <div className="rounded-3xl border border-[#E5DFD0] bg-white p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider">Sessions</span>
                <Calendar className="h-4 w-4 text-[#FBBC04]" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[#0D0E11]">{metrics.upcomingSessionsCount}</p>
              <span className="text-[11px] text-[#5F6368]">Upcoming classes</span>
            </div>

            <div className="rounded-3xl border border-[#E5DFD0] bg-white p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider">Resources</span>
                <FolderGit2 className="h-4 w-4 text-[#4285F4]" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[#0D0E11]">{metrics.resourcesCount}</p>
              <span className="text-[11px] text-[#5F6368]">Curated assets</span>
            </div>

            <div className="rounded-3xl border border-[#E5DFD0] bg-white p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider">Attendance</span>
                <UserCheck className="h-4 w-4 text-[#34A853]" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[#1e7e34]">{metrics.averageAttendanceRate}%</p>
              <span className="text-[11px] text-[#5F6368]">Average presence</span>
            </div>
          </div>

          {/* Section 1: Assigned Tracks */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">Curriculum Hub</span>
                <h2 className="text-2xl font-black text-[#0D0E11] tracking-tight">My Assigned Tracks</h2>
              </div>
              <Link href="/mentor/tracks" className="text-xs font-bold text-[#4285F4] hover:underline flex items-center gap-1">
                <span>View all tracks</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {assignedTracks.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#E5DFD0] p-10 text-center bg-white space-y-2">
                <Layers className="h-8 w-8 text-[#5F6368] mx-auto opacity-60" />
                <h3 className="text-base font-bold text-[#0D0E11]">No Assigned Tracks</h3>
                <p className="text-xs text-[#5F6368] max-w-sm mx-auto">
                  You are not currently assigned to any bootcamp tracks. Contact the lead administrator to assign tracks to your profile.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignedTracks.map((track) => (
                  <div
                    key={track.id}
                    className="rounded-3xl border border-[#E5DFD0] bg-white p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: track.accent }} />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
                          {track.cohortName}
                        </span>
                        {track.pendingSubmissionsCount > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#EA4335]/10 text-[#EA4335] border border-[#EA4335]/20">
                            {track.pendingSubmissionsCount} pending review
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-black text-[#0D0E11] tracking-tight">{track.name}</h3>
                      <p className="text-xs text-[#5F6368] line-clamp-2 leading-relaxed">{track.description}</p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-[#E5DFD0]">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-2xl bg-[#FAF7EE] p-2">
                          <span className="block text-[10px] font-bold text-[#5F6368]">Students</span>
                          <span className="text-sm font-black text-[#0D0E11]">{track.studentCount}</span>
                        </div>
                        <div className="rounded-2xl bg-[#FAF7EE] p-2">
                          <span className="block text-[10px] font-bold text-[#5F6368]">Modules</span>
                          <span className="text-sm font-black text-[#0D0E11]">{track.moduleCount}</span>
                        </div>
                        <div className="rounded-2xl bg-[#FAF7EE] p-2">
                          <span className="block text-[10px] font-bold text-[#5F6368]">Lessons</span>
                          <span className="text-sm font-black text-[#0D0E11]">{track.lessonCount}</span>
                        </div>
                      </div>

                      <Link
                        href={`/mentor/tracks/${track.slug || track.id}`}
                        className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-[#0D0E11] text-white text-xs font-black hover:bg-black transition-all shadow-xs"
                      >
                        <span>Manage Track</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 2: Pending Student Reviews */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#EA4335]">Action Required</span>
                <h2 className="text-2xl font-black text-[#0D0E11] tracking-tight">Pending Deliverables Review</h2>
              </div>
              <Link href="/mentor/submissions" className="text-xs font-bold text-[#4285F4] hover:underline flex items-center gap-1">
                <span>View all submissions</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {pendingSubmissions.length === 0 ? (
              <div className="rounded-3xl border border-[#E5DFD0] bg-white p-8 text-center shadow-xs space-y-2">
                <CheckCircle2 className="h-8 w-8 text-[#34A853] mx-auto" />
                <h3 className="text-base font-bold text-[#0D0E11]">All Deliverables Reviewed!</h3>
                <p className="text-xs text-[#5F6368] max-w-sm mx-auto">
                  You are all caught up on submissions across your assigned tracks. New submissions will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="rounded-3xl border border-[#E5DFD0] bg-white shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7EE] border-b border-[#E5DFD0] text-[#5F6368] font-black uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-6">Student</th>
                        <th className="py-3.5 px-6">Deliverable</th>
                        <th className="py-3.5 px-6">Track</th>
                        <th className="py-3.5 px-6">Submitted</th>
                        <th className="py-3.5 px-6">Repository</th>
                        <th className="py-3.5 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DFD0]/60">
                      {pendingSubmissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-[#FAF7EE]/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={sub.studentAvatar}
                                alt={sub.studentName}
                                className="h-8 w-8 rounded-full object-cover border border-[#E5DFD0]"
                              />
                              <div>
                                <span className="font-bold text-[#0D0E11] block">{sub.studentName}</span>
                                <span className="text-[10px] text-[#5F6368]">{sub.studentEmail}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-bold text-[#0D0E11]">{sub.assignmentTitle}</td>
                          <td className="py-4 px-6">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
                              {sub.trackName}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-[#5F6368] font-medium">
                            {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Recent'}
                          </td>
                          <td className="py-4 px-6">
                            {sub.githubUrl ? (
                              <a
                                href={sub.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[#4285F4] font-bold hover:underline"
                              >
                                <span>GitHub</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-zinc-400">None</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveReviewSub(sub);
                                setReviewScore(sub.score || 90);
                                setReviewFeedback(sub.feedback || '');
                              }}
                              className="px-4 py-1.5 rounded-full bg-[#0D0E11] text-[#FAF7EE] text-[11px] font-bold hover:bg-black transition-all cursor-pointer shadow-xs"
                            >
                              Review & Grade
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* Section 3: Upcoming Classes & Announcements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Sessions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FBBC04]">Live Schedule</span>
                  <h3 className="text-xl font-black text-[#0D0E11] tracking-tight">Upcoming Masterclasses</h3>
                </div>
                <Link href="/mentor/schedule" className="text-xs font-bold text-[#4285F4] hover:underline">
                  Manage schedule
                </Link>
              </div>

              <div className="space-y-3">
                {upcomingSessions.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#E5DFD0] p-6 text-center bg-white">
                    <p className="text-xs text-[#5F6368]">No upcoming sessions scheduled.</p>
                  </div>
                ) : (
                  upcomingSessions.map((ses) => (
                    <div
                      key={ses.id}
                      className="rounded-2xl border border-[#E5DFD0] bg-white p-4 flex items-center justify-between gap-4 shadow-2xs hover:shadow-xs transition-all"
                    >
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-[#FBBC04]/20 text-[#0D0E11]">
                          {ses.mode}
                        </span>
                        <h4 className="text-sm font-bold text-[#0D0E11]">{ses.title}</h4>
                        <p className="text-[11px] text-[#5F6368] flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(ses.startTime).toLocaleString()}</span>
                        </p>
                      </div>

                      {ses.meetingUrl && (
                        <a
                          href={ses.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-full bg-[#4285F4] text-white text-[10px] font-black hover:bg-[#3367D6] transition-all shrink-0"
                        >
                          Join Meet
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Announcements */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#34A853]">Dispatches</span>
                  <h3 className="text-xl font-black text-[#0D0E11] tracking-tight">Broadcast Feed</h3>
                </div>
                <Link href="/mentor/announcements" className="text-xs font-bold text-[#4285F4] hover:underline">
                  New broadcast
                </Link>
              </div>

              <div className="space-y-3">
                {recentAnnouncements.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#E5DFD0] p-6 text-center bg-white">
                    <p className="text-xs text-[#5F6368]">No recent announcements published.</p>
                  </div>
                ) : (
                  recentAnnouncements.map((anc) => (
                    <div key={anc.id} className="rounded-2xl border border-[#E5DFD0] bg-white p-4 shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#5F6368]">
                          {anc.track ? anc.track.name : 'All Cohort'}
                        </span>
                        <span className="text-[10px] font-bold text-[#5F6368]">
                          {new Date(anc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#0D0E11]">{anc.title}</h4>
                      <p className="text-xs text-[#5F6368] line-clamp-2 leading-relaxed">{anc.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Quick Submission Review Modal */}
      {activeReviewSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => !isSubmittingReview && setActiveReviewSub(null)}
          />

          <div className="relative w-full max-w-xl rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-8 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#E5DFD0] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4285F4]">
                  {activeReviewSub.trackName} Deliverable
                </span>
                <h3 className="text-xl font-black text-[#0D0E11] tracking-tight">
                  Review Submission: {activeReviewSub.assignmentTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveReviewSub(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-black"
              >
                ✕
              </button>
            </div>

            {/* Student Info Card */}
            <div className="rounded-2xl bg-[#FAF7EE] p-4 flex items-center gap-3 border border-[#E5DFD0]">
              <img
                src={activeReviewSub.studentAvatar}
                alt={activeReviewSub.studentName}
                className="h-10 w-10 rounded-full object-cover border border-[#E5DFD0]"
              />
              <div>
                <span className="text-xs font-black text-[#0D0E11] block">{activeReviewSub.studentName}</span>
                <span className="text-[10px] text-[#5F6368]">{activeReviewSub.studentEmail}</span>
              </div>
            </div>

            {/* Deliverable Links */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368] block">
                Deliverable Links
              </label>
              <div className="flex flex-wrap gap-2">
                {activeReviewSub.githubUrl && (
                  <a
                    href={activeReviewSub.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-black transition-all"
                  >
                    <span>View GitHub Repo</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {activeReviewSub.liveUrl && (
                  <a
                    href={activeReviewSub.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#E5DFD0] text-[#0D0E11] text-xs font-bold hover:bg-[#FAF7EE] transition-all"
                  >
                    <span>Inspect Live Demo</span>
                    <ExternalLink className="h-3 w-3 text-[#4285F4]" />
                  </a>
                )}
              </div>
            </div>

            {/* Student Implementation Notes */}
            {activeReviewSub.notes && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368] block">
                  Student Implementation Notes
                </label>
                <div className="p-3.5 rounded-2xl bg-[#FAF7EE]/60 border border-[#E5DFD0] text-xs text-[#0D0E11] leading-relaxed">
                  {activeReviewSub.notes}
                </div>
              </div>
            )}

            {/* Grading Form */}
            <form onSubmit={handleSaveReview} className="space-y-4 pt-4 border-t border-[#E5DFD0]">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#0D0E11] flex items-center justify-between">
                  <span>Score (out of 100)</span>
                  <span className="text-[10px] font-bold text-[#4285F4]">Required</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={reviewScore}
                  onChange={(e) => setReviewScore(Number(e.target.value))}
                  className="w-full h-11 rounded-2xl border border-[#E5DFD0] bg-[#FAF7EE]/40 px-4 text-xs font-bold text-[#0D0E11] focus:border-[#0D0E11] focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#0D0E11] flex items-center justify-between">
                  <span>Mentor Feedback & Assessment Notes</span>
                  <span className="text-[10px] font-bold text-[#4285F4]">Required</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share constructive feedback, strengths in architecture, areas for optimization..."
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  className="w-full rounded-2xl border border-[#E5DFD0] bg-[#FAF7EE]/40 p-4 text-xs font-medium text-[#0D0E11] focus:border-[#0D0E11] focus:bg-white focus:outline-none transition-all resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveReviewSub(null)}
                  disabled={isSubmittingReview}
                  className="px-5 py-2.5 rounded-full border border-[#E5DFD0] text-xs font-bold text-[#5F6368] hover:bg-[#FAF7EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0D0E11] text-[#FAF7EE] text-xs font-black hover:bg-black transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmittingReview ? <span>Saving Review...</span> : <span>Save Review</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
