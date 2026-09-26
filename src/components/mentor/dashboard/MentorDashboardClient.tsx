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
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

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
  const [reviewError, setReviewError] = useState<string | null>(null);

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
      setReviewError(err.message || 'Error saving review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gdg-cream text-gdg-black antialiased selection:bg-gdg-yellow/30">
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
          <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-gdg-black text-gdg-cream px-5 py-3 shadow-xl border border-gdg-green/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
            <CheckCircle2 className="h-4 w-4 text-gdg-green" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}

        {/* Ticker Ribbon */}
        <div className="w-full bg-gdg-black text-gdg-cream py-2 px-6 overflow-hidden border-b border-gdg-dark-border">
          <div className="flex items-center justify-between text-xs font-black tracking-wider uppercase whitespace-nowrap">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              <span className="text-gdg-blue">TRACK OVERSIGHT ✦</span>
              <span className="text-gdg-green">STUDENT CODE REVIEW ✦</span>
              <span className="text-gdg-yellow">LIVE WORKSHOPS ✦</span>
              <span className="text-gdg-red">CAPSTONE ASSESSMENTS ✦</span>
              <span>GDG ON CAMPUS LASU ✦</span>
            </div>
            <span className="hidden lg:inline text-[11px] font-bold text-zinc-400">
              Welcome back, {mentor.name.split(' ')[0]} • Instructor Panel
            </span>
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 sm:space-y-10 max-w-7xl w-full mx-auto">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gdg-border pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-gdg-blue" />
                <span className="text-xs font-bold uppercase tracking-wider text-gdg-gray">
                  Cohort 1 Instruction
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-gdg-black tracking-tight">
                Instructor Command Center
              </h1>
              <p className="text-sm text-gdg-gray font-medium max-w-2xl">
                Guide your bootcamp students, review engineering deliverables, manage curriculum modules, and record live attendance.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/mentor/tracks"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gdg-black text-white text-xs font-black hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md"
              >
                <span>Manage Tracks</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* 6 Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="rounded-3xl border border-gdg-border bg-white p-4 sm:p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gdg-gray uppercase tracking-wider">Tracks</span>
                <Layers className="h-4 w-4 text-gdg-blue" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-gdg-black">{metrics.assignedTracksCount}</p>
              <span className="text-[11px] text-gdg-gray">Assigned tracks</span>
            </div>

            <div className="rounded-3xl border border-gdg-border bg-white p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gdg-gray uppercase tracking-wider">Students</span>
                <Users className="h-4 w-4 text-gdg-green" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-gdg-black">{metrics.totalStudentsCount}</p>
              <span className="text-[11px] text-gdg-gray">Total enrolled</span>
            </div>

            <div className="rounded-3xl border border-gdg-red/30 bg-gdg-red/5 p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gdg-red uppercase tracking-wider">Submissions</span>
                <Send className="h-4 w-4 text-gdg-red" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-gdg-red">{metrics.pendingSubmissionsCount}</p>
              <span className="text-[11px] text-gdg-red font-bold">Needs your review</span>
            </div>

            <div className="rounded-3xl border border-gdg-border bg-white p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gdg-gray uppercase tracking-wider">Sessions</span>
                <Calendar className="h-4 w-4 text-gdg-yellow" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-gdg-black">{metrics.upcomingSessionsCount}</p>
              <span className="text-[11px] text-gdg-gray">Upcoming classes</span>
            </div>

            <div className="rounded-3xl border border-gdg-border bg-white p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gdg-gray uppercase tracking-wider">Resources</span>
                <FolderGit2 className="h-4 w-4 text-gdg-blue" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-gdg-black">{metrics.resourcesCount}</p>
              <span className="text-[11px] text-gdg-gray">Curated assets</span>
            </div>

            <div className="rounded-3xl border border-gdg-border bg-white p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gdg-gray uppercase tracking-wider">Attendance</span>
                <UserCheck className="h-4 w-4 text-gdg-green" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-gdg-green-dark">{metrics.averageAttendanceRate}%</p>
              <span className="text-[11px] text-gdg-gray">Average presence</span>
            </div>
          </div>

          {/* Section 1: Assigned Tracks */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gdg-gray">Curriculum Hub</span>
                <h2 className="text-2xl font-black text-gdg-black tracking-tight">My Assigned Tracks</h2>
              </div>
              <Link href="/mentor/tracks" className="text-xs font-bold text-gdg-blue hover:underline flex items-center gap-1">
                <span>View all tracks</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {assignedTracks.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gdg-border p-10 text-center bg-white space-y-2">
                <Layers className="h-8 w-8 text-gdg-gray mx-auto opacity-60" />
                <h3 className="text-base font-bold text-gdg-black">No Assigned Tracks</h3>
                <p className="text-xs text-gdg-gray max-w-sm mx-auto">
                  You are not currently assigned to any bootcamp tracks. Contact the lead administrator to assign tracks to your profile.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignedTracks.map((track) => (
                  <div
                    key={track.id}
                    className="rounded-3xl border border-gdg-border bg-white p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: track.accent }} />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gdg-cream text-gdg-gray border border-gdg-border">
                          {track.cohortName}
                        </span>
                        {track.pendingSubmissionsCount > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gdg-red/10 text-gdg-red border border-gdg-red/20">
                            {track.pendingSubmissionsCount} pending review
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-black text-gdg-black tracking-tight">{track.name}</h3>
                      <p className="text-xs text-gdg-gray line-clamp-2 leading-relaxed">{track.description}</p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gdg-border">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-2xl bg-gdg-cream p-2">
                          <span className="block text-[10px] font-bold text-gdg-gray">Students</span>
                          <span className="text-sm font-black text-gdg-black">{track.studentCount}</span>
                        </div>
                        <div className="rounded-2xl bg-gdg-cream p-2">
                          <span className="block text-[10px] font-bold text-gdg-gray">Modules</span>
                          <span className="text-sm font-black text-gdg-black">{track.moduleCount}</span>
                        </div>
                        <div className="rounded-2xl bg-gdg-cream p-2">
                          <span className="block text-[10px] font-bold text-gdg-gray">Lessons</span>
                          <span className="text-sm font-black text-gdg-black">{track.lessonCount}</span>
                        </div>
                      </div>

                      <Link
                        href={`/mentor/tracks/${track.slug || track.id}`}
                        className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-gdg-black text-white text-xs font-black hover:bg-black transition-all shadow-xs"
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
                <span className="text-xs font-bold uppercase tracking-wider text-gdg-red">Action Required</span>
                <h2 className="text-2xl font-black text-gdg-black tracking-tight">Pending Deliverables Review</h2>
              </div>
              <Link href="/mentor/submissions" className="text-xs font-bold text-gdg-blue hover:underline flex items-center gap-1">
                <span>View all submissions</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {pendingSubmissions.length === 0 ? (
              <div className="rounded-3xl border border-gdg-border bg-white p-8 text-center shadow-xs space-y-2">
                <CheckCircle2 className="h-8 w-8 text-gdg-green mx-auto" />
                <h3 className="text-base font-bold text-gdg-black">All Deliverables Reviewed!</h3>
                <p className="text-xs text-gdg-gray max-w-sm mx-auto">
                  You are all caught up on submissions across your assigned tracks. New submissions will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="rounded-3xl border border-gdg-border bg-white shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gdg-cream border-b border-gdg-border text-gdg-gray font-black uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-6">Student</th>
                        <th className="py-3.5 px-6">Deliverable</th>
                        <th className="py-3.5 px-6">Track</th>
                        <th className="py-3.5 px-6">Submitted</th>
                        <th className="py-3.5 px-6">Repository</th>
                        <th className="py-3.5 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gdg-border/60">
                      {pendingSubmissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-gdg-cream/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={sub.studentAvatar}
                                alt={sub.studentName}
                                className="h-8 w-8 rounded-full object-cover border border-gdg-border"
                              />
                              <div>
                                <span className="font-bold text-gdg-black block">{sub.studentName}</span>
                                <span className="text-[10px] text-gdg-gray">{sub.studentEmail}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-bold text-gdg-black">{sub.assignmentTitle}</td>
                          <td className="py-4 px-6">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gdg-cream text-gdg-gray border border-gdg-border">
                              {sub.trackName}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gdg-gray font-medium">
                            {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Recent'}
                          </td>
                          <td className="py-4 px-6">
                            {sub.githubUrl ? (
                              <a
                                href={sub.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-gdg-blue font-bold hover:underline"
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
                              className="px-4 py-1.5 rounded-full bg-gdg-black text-gdg-cream text-[11px] font-bold hover:bg-black transition-all cursor-pointer shadow-xs"
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
                  <span className="text-xs font-bold uppercase tracking-wider text-gdg-yellow">Live Schedule</span>
                  <h3 className="text-xl font-black text-gdg-black tracking-tight">Upcoming Masterclasses</h3>
                </div>
                <Link href="/mentor/schedule" className="text-xs font-bold text-gdg-blue hover:underline">
                  Manage schedule
                </Link>
              </div>

              <div className="space-y-3">
                {upcomingSessions.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-gdg-border p-6 text-center bg-white">
                    <p className="text-xs text-gdg-gray">No upcoming sessions scheduled.</p>
                  </div>
                ) : (
                  upcomingSessions.map((ses) => (
                    <div
                      key={ses.id}
                      className="rounded-2xl border border-gdg-border bg-white p-4 flex items-center justify-between gap-4 shadow-2xs hover:shadow-xs transition-all"
                    >
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-gdg-yellow/20 text-gdg-black">
                          {ses.mode}
                        </span>
                        <h4 className="text-sm font-bold text-gdg-black">{ses.title}</h4>
                        <p className="text-[11px] text-gdg-gray flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(ses.startTime).toLocaleString()}</span>
                        </p>
                      </div>

                      {ses.meetingUrl && (
                        <a
                          href={ses.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-full bg-gdg-blue text-white text-[10px] font-black hover:bg-gdg-blue-dark transition-all shrink-0"
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
                  <span className="text-xs font-bold uppercase tracking-wider text-gdg-green">Dispatches</span>
                  <h3 className="text-xl font-black text-gdg-black tracking-tight">Broadcast Feed</h3>
                </div>
                <Link href="/mentor/announcements" className="text-xs font-bold text-gdg-blue hover:underline">
                  New broadcast
                </Link>
              </div>

              <div className="space-y-3">
                {recentAnnouncements.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-gdg-border p-6 text-center bg-white">
                    <p className="text-xs text-gdg-gray">No recent announcements published.</p>
                  </div>
                ) : (
                  recentAnnouncements.map((anc) => (
                    <div key={anc.id} className="rounded-2xl border border-gdg-border bg-white p-4 shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gdg-gray">
                          {anc.track ? anc.track.name : 'All Cohort'}
                        </span>
                        <span className="text-[10px] font-bold text-gdg-gray">
                          {new Date(anc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gdg-black">{anc.title}</h4>
                      <p className="text-xs text-gdg-gray line-clamp-2 leading-relaxed">{anc.content}</p>
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

          <div className="relative w-full max-w-xl rounded-3xl border border-gdg-border bg-white p-6 sm:p-8 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-gdg-border pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gdg-blue">
                  {activeReviewSub.trackName} Deliverable
                </span>
                <h3 className="text-xl font-black text-gdg-black tracking-tight">
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
            <div className="rounded-2xl bg-gdg-cream p-4 flex items-center gap-3 border border-gdg-border">
              <img
                src={activeReviewSub.studentAvatar}
                alt={activeReviewSub.studentName}
                className="h-10 w-10 rounded-full object-cover border border-gdg-border"
              />
              <div>
                <span className="text-xs font-black text-gdg-black block">{activeReviewSub.studentName}</span>
                <span className="text-[10px] text-gdg-gray">{activeReviewSub.studentEmail}</span>
              </div>
            </div>

            {/* Deliverable Links */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gdg-gray block">
                Deliverable Links
              </label>
              <div className="flex flex-wrap gap-2">
                {activeReviewSub.githubUrl && (
                  <a
                    href={activeReviewSub.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gdg-black text-gdg-cream text-xs font-bold hover:bg-black transition-all"
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
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gdg-border text-gdg-black text-xs font-bold hover:bg-gdg-cream transition-all"
                  >
                    <span>Inspect Live Demo</span>
                    <ExternalLink className="h-3 w-3 text-gdg-blue" />
                  </a>
                )}
              </div>
            </div>

            {/* Student Implementation Notes */}
            {activeReviewSub.notes && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gdg-gray block">
                  Student Implementation Notes
                </label>
                <div className="p-3.5 rounded-2xl bg-gdg-cream/60 border border-gdg-border text-xs text-gdg-black leading-relaxed">
                  {activeReviewSub.notes}
                </div>
              </div>
            )}

            {/* Grading Form */}
            <form onSubmit={handleSaveReview} className="space-y-4 pt-4 border-t border-gdg-border">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gdg-black flex items-center justify-between">
                  <span>Score (out of 100)</span>
                  <span className="text-[10px] font-bold text-gdg-blue">Required</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={reviewScore}
                  onChange={(e) => setReviewScore(Number(e.target.value))}
                  className="w-full h-11 rounded-2xl border border-gdg-border bg-gdg-cream/40 px-4 text-xs font-bold text-gdg-black focus:border-gdg-black focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-gdg-black flex items-center justify-between">
                  <span>Mentor Feedback & Assessment Notes</span>
                  <span className="text-[10px] font-bold text-gdg-blue">Required</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share constructive feedback, strengths in architecture, areas for optimization..."
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  className="w-full rounded-2xl border border-gdg-border bg-gdg-cream/40 p-4 text-xs font-medium text-gdg-black focus:border-gdg-black focus:bg-white focus:outline-none transition-all resize-y"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveReviewSub(null)}
                  disabled={isSubmittingReview}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-gdg-border text-xs font-bold text-gdg-gray hover:bg-gdg-cream text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gdg-black text-gdg-cream text-xs font-black hover:bg-black transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmittingReview ? <span>Saving Review...</span> : <span>Save Review</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ERROR ALERT DIALOG */}
      <ConfirmDialog
        isOpen={!!reviewError}
        onClose={() => setReviewError(null)}
        onConfirm={() => setReviewError(null)}
        title="Review Submission Error"
        description={reviewError || ''}
        confirmLabel="Dismiss"
        cancelText={null}
        variant="warning"
      />
    </div>
  );
}
