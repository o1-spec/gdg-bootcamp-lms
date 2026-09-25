'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Send,
  CheckCircle2,
  Clock,
  FolderGit2,
  Globe,
  FileText,
  AlertCircle,
  X,
  Sparkles,
  Search,
  Filter,
  Layers,
  FileCheck,
  ExternalLink,
} from 'lucide-react';
import { MentorSidebar } from '@/components/mentor/MentorSidebar';
import { MentorHeader } from '@/components/mentor/MentorHeader';
import { cn } from '@/lib/utils';

interface SubmissionItem {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  assignmentPoints: number;
  assignmentDueDate: Date | null;
  trackId: string;
  trackSlug: string;
  trackName: string;
  trackAccent: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  status: string;
  githubUrl: string | null;
  liveUrl: string | null;
  fileUrl: string | null;
  notes: string | null;
  score: number | null;
  feedback: string | null;
}

interface MentorSubmissionsClientProps {
  submissions: SubmissionItem[];
  tracks: any[];
  assignments: any[];
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

export function MentorSubmissionsClient({
  submissions: initialSubmissions,
  tracks,
  assignments,
  mentor,
  metrics,
}: MentorSubmissionsClientProps) {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(initialSubmissions);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'SUBMITTED' | 'REVIEWED' | 'LATE'>('all');
  const [trackFilter, setTrackFilter] = useState<string>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Drawer/Modal
  const [reviewingSubmission, setReviewingSubmission] = useState<SubmissionItem | null>(null);
  const [reviewScore, setReviewScore] = useState<number>(85);
  const [reviewFeedback, setReviewFeedback] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openReviewModal = (sub: SubmissionItem) => {
    setReviewingSubmission(sub);
    setReviewScore(sub.score ?? Math.min(sub.assignmentPoints, 85));
    setReviewFeedback(sub.feedback || '');
    setReviewError(null);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingSubmission) return;

    setIsSubmittingReview(true);
    setReviewError(null);

    try {
      const res = await fetch(`/api/mentor/submissions/${reviewingSubmission.id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Number(reviewScore),
          feedback: reviewFeedback,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === reviewingSubmission.id
            ? {
                ...s,
                score: Number(reviewScore),
                feedback: reviewFeedback,
                status: 'REVIEWED',
                reviewedAt: new Date(),
              }
            : s
        )
      );

      showToast(`Review saved for ${reviewingSubmission.studentName}`);
      setReviewingSubmission(null);
      router.refresh();
    } catch (err: any) {
      setReviewError(err.message || 'Review failed');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Filter logic
  const filteredSubmissions = submissions.filter((sub) => {
    if (trackFilter !== 'all' && sub.trackId !== trackFilter) return false;
    if (assignmentFilter !== 'all' && sub.assignmentId !== assignmentFilter) return false;

    if (statusFilter === 'SUBMITTED' && sub.status !== 'SUBMITTED') return false;
    if (statusFilter === 'REVIEWED' && sub.status !== 'REVIEWED') return false;
    if (statusFilter === 'LATE') {
      if (!sub.submittedAt || !sub.assignmentDueDate) return false;
      const isLate = new Date(sub.submittedAt) > new Date(sub.assignmentDueDate);
      if (!isLate) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchStudent = sub.studentName.toLowerCase().includes(q) || sub.studentEmail.toLowerCase().includes(q);
      const matchAsg = sub.assignmentTitle.toLowerCase().includes(q);
      if (!matchStudent && !matchAsg) return false;
    }

    return true;
  });

  const pendingCount = submissions.filter((s) => s.status === 'SUBMITTED').length;
  const reviewedCount = submissions.filter((s) => s.status === 'REVIEWED').length;

  return (
    <div className="flex min-h-screen bg-[#FAF7EE] text-[#0D0E11] antialiased selection:bg-[#FBBC04]/30">
      <MentorSidebar
        currentTab="submissions"
        mentor={mentor}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingSubmissionsCount={metrics.pendingSubmissionsCount}
        assignedTracksCount={metrics.assignedTracksCount}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <MentorHeader
          currentTab="submissions"
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5DFD0] pb-6 sm:pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#EA4335]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
                  Code Assessment &amp; Grading Queue
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#0D0E11]">
                Student Submissions
              </h1>
              <p className="text-xs sm:text-sm text-[#5F6368] max-w-2xl font-medium">
                Review submitted repositories, inspect live deployed applications, provide architectural critique, and assign numerical grades.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-white border border-[#E5DFD0] shadow-sm flex items-center gap-2 text-xs font-bold text-[#EA4335]">
                <Send className="h-4 w-4" />
                <span>{pendingCount} Pending Review</span>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-[#E5DFD0] shadow-sm">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <Search className="h-4 w-4 text-[#5F6368] shrink-0 ml-2" />
              <input
                type="text"
                placeholder="Search by student name or assignment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-medium bg-transparent outline-none placeholder:text-[#5F6368]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-[#5F6368] hover:text-[#0D0E11]">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Status Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] overflow-x-auto no-scrollbar max-w-full">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'SUBMITTED', label: `Pending (${pendingCount})` },
                  { id: 'REVIEWED', label: `Reviewed (${reviewedCount})` },
                  { id: 'LATE', label: 'Late' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id as any)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer',
                      statusFilter === tab.id
                        ? 'bg-[#0D0E11] text-[#FAF7EE]'
                        : 'text-[#5F6368] hover:text-[#0D0E11]'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Track select */}
              <select
                value={trackFilter}
                onChange={(e) => setTrackFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-xs font-bold text-[#0D0E11] outline-none max-w-full"
              >
                <option value="all">All Tracks</option>
                {tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              {/* Assignment select */}
              <select
                value={assignmentFilter}
                onChange={(e) => setAssignmentFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-xs font-bold text-[#0D0E11] outline-none max-w-full truncate"
              >
                <option value="all">All Assignments</option>
                {assignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submissions Table */}
          {filteredSubmissions.length === 0 ? (
            <div className="rounded-3xl bg-white border border-[#E5DFD0] p-12 text-center shadow-sm max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#EA4335]/10 text-[#EA4335] flex items-center justify-center mx-auto">
                <Send className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-[#0D0E11]">No Submissions Found</h3>
              <p className="text-xs text-[#5F6368]">
                {submissions.length === 0
                  ? 'No submissions have been submitted by students yet.'
                  : 'No submissions match your search or active filter criteria.'}
              </p>
            </div>
          ) : (
            <div className="rounded-3xl bg-white border border-[#E5DFD0] shadow-sm overflow-hidden">
              {/* Mobile Card List (< md) */}
              <div className="md:hidden divide-y divide-[#E5DFD0]">
                {filteredSubmissions.map((sub) => {
                  const isReviewed = sub.status === 'REVIEWED';
                  const isLate =
                    sub.submittedAt &&
                    sub.assignmentDueDate &&
                    new Date(sub.submittedAt) > new Date(sub.assignmentDueDate);

                  return (
                    <div key={sub.id} className="p-4 space-y-3">
                      {/* Top Header: Student & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={sub.studentAvatar}
                            alt={sub.studentName}
                            className="w-10 h-10 rounded-full object-cover border border-[#E5DFD0] shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-[#0D0E11] block text-xs truncate">
                              {sub.studentName}
                            </span>
                            <span className="text-[#5F6368] text-[11px] truncate block">
                              {sub.studentEmail}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider',
                              isReviewed
                                ? 'bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/30'
                                : 'bg-[#EA4335]/10 text-[#EA4335] border border-[#EA4335]/30'
                            )}
                          >
                            {sub.status}
                          </span>
                          {isLate && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#FBBC04]/20 text-[#0D0E11] border border-[#FBBC04]/40">
                              Late
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Assignment Info */}
                      <div className="p-3 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-1">
                        <span className="font-bold text-xs text-[#0D0E11] block">
                          {sub.assignmentTitle}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: sub.trackAccent }}
                          />
                          <span className="text-[11px] text-[#5F6368] font-medium truncate">
                            {sub.trackName}
                          </span>
                        </div>
                      </div>

                      {/* Meta: Score, Deliverables, Time */}
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          {sub.githubUrl && (
                            <a
                              href={sub.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-[#FAF7EE] hover:bg-[#E5DFD0] text-[#0D0E11] transition-colors"
                              title="GitHub Repository"
                            >
                              <FolderGit2 className="h-4 w-4" />
                            </a>
                          )}
                          {sub.liveUrl && (
                            <a
                              href={sub.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-[#4285F4]/10 hover:bg-[#4285F4]/20 text-[#4285F4] transition-colors"
                              title="Live Demo"
                            >
                              <Globe className="h-4 w-4" />
                            </a>
                          )}
                          {sub.fileUrl && (
                            <a
                              href={sub.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-[#FAF7EE] hover:bg-[#E5DFD0] text-[#5F6368] transition-colors"
                              title="Attachment"
                            >
                              <FileText className="h-4 w-4" />
                            </a>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-[#5F6368] block">Score</span>
                          {sub.score !== null ? (
                            <span className="font-mono font-bold text-xs text-[#0D0E11]">
                              {sub.score} / {sub.assignmentPoints}
                            </span>
                          ) : (
                            <span className="text-[#5F6368] font-mono text-xs">Unscored</span>
                          )}
                        </div>
                      </div>

                      {/* Review Action Button */}
                      <button
                        onClick={() => openReviewModal(sub)}
                        className={cn(
                          'w-full py-2.5 rounded-xl text-xs font-bold transition-colors text-center cursor-pointer',
                          isReviewed
                            ? 'border border-[#E5DFD0] text-[#5F6368] hover:text-[#0D0E11] hover:bg-white'
                            : 'bg-[#0D0E11] text-[#FAF7EE] hover:bg-[#22242B] shadow-xs'
                        )}
                      >
                        {isReviewed ? 'Edit Grade' : 'Grade Submission'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7EE] border-b border-[#E5DFD0] text-[#5F6368] uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Student</th>
                      <th className="py-4 px-4">Assignment &amp; Track</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4">Artifacts</th>
                      <th className="py-4 px-4">Submitted At</th>
                      <th className="py-4 px-4">Score</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DFD0]">
                    {filteredSubmissions.map((sub) => {
                      const isReviewed = sub.status === 'REVIEWED';
                      const isLate =
                        sub.submittedAt &&
                        sub.assignmentDueDate &&
                        new Date(sub.submittedAt) > new Date(sub.assignmentDueDate);

                      return (
                        <tr key={sub.id} className="hover:bg-[#FAF7EE]/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={sub.studentAvatar}
                                alt={sub.studentName}
                                className="w-9 h-9 rounded-full object-cover border border-[#E5DFD0]"
                              />
                              <div>
                                <span className="font-bold text-[#0D0E11] block text-sm">
                                  {sub.studentName}
                                </span>
                                <span className="text-[#5F6368] text-[11px]">
                                  {sub.studentEmail}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div>
                              <span className="font-bold text-[#0D0E11] block">
                                {sub.assignmentTitle}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: sub.trackAccent }}
                                />
                                <span className="text-[11px] text-[#5F6368] font-medium">
                                  {sub.trackName}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={cn(
                                  'px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
                                  isReviewed
                                    ? 'bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/30'
                                    : 'bg-[#EA4335]/10 text-[#EA4335] border border-[#EA4335]/30'
                                )}
                              >
                                {sub.status}
                              </span>
                              {isLate && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#FBBC04]/20 text-[#0D0E11] border border-[#FBBC04]/40">
                                  Late
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {sub.githubUrl && (
                                <a
                                  href={sub.githubUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg bg-[#FAF7EE] hover:bg-[#E5DFD0] text-[#0D0E11] transition-colors"
                                  title="GitHub Repository"
                                >
                                  <FolderGit2 className="h-3.5 w-3.5" />
                                </a>
                              )}
                              {sub.liveUrl && (
                                <a
                                  href={sub.liveUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg bg-[#4285F4]/10 hover:bg-[#4285F4]/20 text-[#4285F4] transition-colors"
                                  title="Live Application"
                                >
                                  <Globe className="h-3.5 w-3.5" />
                                </a>
                              )}
                              {sub.fileUrl && (
                                <a
                                  href={sub.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg bg-[#FAF7EE] hover:bg-[#E5DFD0] text-[#5F6368] transition-colors"
                                  title="Attachment"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4 font-mono text-[#5F6368]">
                            {sub.submittedAt
                              ? new Date(sub.submittedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '—'}
                          </td>

                          <td className="py-4 px-4">
                            {sub.score !== null ? (
                              <span className="font-mono font-bold text-sm text-[#0D0E11]">
                                {sub.score} / {sub.assignmentPoints}
                              </span>
                            ) : (
                              <span className="text-[#5F6368] font-mono">—</span>
                            )}
                          </td>

                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => openReviewModal(sub)}
                              className={cn(
                                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer',
                                isReviewed
                                  ? 'border border-[#E5DFD0] text-[#5F6368] hover:text-[#0D0E11] hover:bg-white'
                                  : 'bg-[#0D0E11] text-[#FAF7EE] hover:bg-[#22242B] shadow-xs'
                              )}
                            >
                              {isReviewed ? 'Edit Grade' : 'Grade Submission'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* REVIEW SUBMISSION MODAL / DRAWER */}
      {reviewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-[#E5DFD0] p-5 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={reviewingSubmission.studentAvatar}
                  alt={reviewingSubmission.studentName}
                  className="w-12 h-12 rounded-2xl object-cover border border-[#E5DFD0]"
                />
                <div>
                  <h3 className="text-xl font-black text-[#0D0E11]">
                    Grade {reviewingSubmission.studentName}
                  </h3>
                  <p className="text-xs text-[#5F6368]">
                    {reviewingSubmission.assignmentTitle} • {reviewingSubmission.trackName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewingSubmission(null)}
                className="p-2 rounded-xl hover:bg-[#FAF7EE] text-[#5F6368] hover:text-[#0D0E11]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Artifacts links */}
            <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#5F6368] block">
                Submitted Deliverables
              </span>
              <div className="flex items-center gap-3 flex-wrap">
                {reviewingSubmission.githubUrl ? (
                  <a
                    href={reviewingSubmission.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E5DFD0] text-xs font-bold text-[#0D0E11] hover:border-[#0D0E11] transition-colors"
                  >
                    <FolderGit2 className="h-4 w-4" />
                    <span>View Repository</span>
                    <ExternalLink className="h-3 w-3 text-[#5F6368]" />
                  </a>
                ) : (
                  <span className="text-xs text-[#5F6368]">No GitHub URL provided</span>
                )}

                {reviewingSubmission.liveUrl && (
                  <a
                    href={reviewingSubmission.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E5DFD0] text-xs font-bold text-[#4285F4] hover:border-[#4285F4] transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Live Demo Application</span>
                    <ExternalLink className="h-3 w-3 text-[#4285F4]" />
                  </a>
                )}
              </div>

              {reviewingSubmission.notes && (
                <div className="pt-2 border-t border-[#E5DFD0] text-xs">
                  <span className="font-bold text-[#0D0E11] block mb-0.5">Student Notes:</span>
                  <p className="text-[#5F6368] whitespace-pre-wrap">{reviewingSubmission.notes}</p>
                </div>
              )}
            </div>

            {reviewError && (
              <div className="p-3.5 rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/30 text-xs font-bold text-[#EA4335] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            {/* Grading Form */}
            <form onSubmit={handleSaveReview} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#0D0E11]">
                    Score (out of {reviewingSubmission.assignmentPoints}) *
                  </label>
                  <span className="text-xs font-mono font-bold text-[#4285F4]">
                    {reviewScore} / {reviewingSubmission.assignmentPoints} Points
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  max={reviewingSubmission.assignmentPoints}
                  required
                  value={reviewScore}
                  onChange={(e) => setReviewScore(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                  Mentor Code Review &amp; Qualitative Feedback *
                </label>
                <textarea
                  rows={5}
                  required
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Leave actionable feedback, architectural pointers, and praise for the student..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium resize-none leading-relaxed"
                />
              </div>

              <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReviewingSubmission(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-2xl border border-[#E5DFD0] text-xs font-bold text-[#5F6368] hover:text-[#0D0E11] text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                >
                  {isSubmittingReview ? 'Submitting Review...' : 'Save Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
