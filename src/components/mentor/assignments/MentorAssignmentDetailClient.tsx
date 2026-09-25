'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileCheck,
  Send,
  Users,
  Calendar,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Clock,
  FolderGit2,
  Globe,
  FileText,
  AlertCircle,
  X,
  Sparkles,
  Search,
} from 'lucide-react';
import { MentorSidebar } from '@/components/mentor/MentorSidebar';
import { MentorHeader } from '@/components/mentor/MentorHeader';
import { cn } from '@/lib/utils';

interface MentorAssignmentDetailClientProps {
  assignment: any;
  counts: {
    totalStudents: number;
    submittedCount: number;
    reviewedCount: number;
    pendingCount: number;
    missingCount: number;
  };
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

export function MentorAssignmentDetailClient({
  assignment,
  counts,
  mentor,
  metrics,
}: MentorAssignmentDetailClientProps) {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<any[]>(assignment.submissions || []);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'SUBMITTED' | 'REVIEWED' | 'DRAFT'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Modal State
  const [reviewingSubmission, setReviewingSubmission] = useState<any | null>(null);
  const [reviewScore, setReviewScore] = useState<number>(85);
  const [reviewFeedback, setReviewFeedback] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openReviewModal = (sub: any) => {
    setReviewingSubmission(sub);
    setReviewScore(sub.score ?? Math.min(assignment.points, 85));
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

      showToast(`Graded submission for ${reviewingSubmission.student.firstName}`);
      setReviewingSubmission(null);
      router.refresh();
    } catch (err: any) {
      setReviewError(err.message || 'Review submission failed');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Filter submissions
  const filteredSubmissions = submissions.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const studentName = `${s.student?.firstName || ''} ${s.student?.lastName || ''}`.toLowerCase();
      const studentEmail = (s.student?.email || '').toLowerCase();
      if (!studentName.includes(q) && !studentEmail.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[#FAF7EE] text-[#0D0E11] antialiased selection:bg-[#FBBC04]/30">
      <MentorSidebar
        currentTab="assignments"
        mentor={mentor}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingSubmissionsCount={metrics.pendingSubmissionsCount}
        assignedTracksCount={metrics.assignedTracksCount}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <MentorHeader
          currentTab="assignments"
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

        <main className="flex-1 p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl w-full mx-auto">
          {/* Back link */}
          <Link
            href="/mentor/assignments"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#5F6368] hover:text-[#0D0E11] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Assignments</span>
          </Link>

          {/* Assignment Header Card */}
          <div className="p-8 rounded-3xl bg-white border border-[#E5DFD0] shadow-sm relative overflow-hidden space-y-6">
            <div
              className="absolute top-0 left-0 bottom-0 w-2.5"
              style={{ backgroundColor: assignment.track?.accent || '#4285F4' }}
            />

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pl-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
                    {assignment.track?.name}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#4285F4]/10 text-[#4285F4]">
                    {assignment.type || 'PROJECT'}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-[#0D0E11]">
                  {assignment.title}
                </h1>
                <p className="text-sm text-[#5F6368] max-w-3xl leading-relaxed font-medium">
                  {assignment.description}
                </p>
              </div>

              <div className="flex items-center gap-4 self-start md:self-auto flex-wrap">
                <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-center min-w-[90px]">
                  <span className="text-[10px] font-bold uppercase text-[#5F6368] block">Max Points</span>
                  <span className="text-2xl font-black text-[#0D0E11] font-mono">{assignment.points}</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-center min-w-[110px]">
                  <span className="text-[10px] font-bold uppercase text-[#5F6368] block">Due Date</span>
                  <span className="text-xs font-black text-[#0D0E11]">
                    {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {assignment.instructions && (
              <div className="p-5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-1.5 ml-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#5F6368]">
                  Instructions &amp; Grading Rubric
                </span>
                <p className="text-xs text-[#0D0E11] whitespace-pre-wrap leading-relaxed font-mono">
                  {assignment.instructions}
                </p>
              </div>
            )}
          </div>

          {/* Metric Counts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-[#E5DFD0] text-center">
              <span className="text-[10px] font-bold uppercase text-[#5F6368] block">Enrolled</span>
              <span className="text-xl font-black text-[#0D0E11] font-mono">{counts.totalStudents}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#E5DFD0] text-center">
              <span className="text-[10px] font-bold uppercase text-[#5F6368] block">Submitted</span>
              <span className="text-xl font-black text-[#4285F4] font-mono">{counts.submittedCount}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#E5DFD0] text-center">
              <span className="text-[10px] font-bold uppercase text-[#5F6368] block">Pending Review</span>
              <span className="text-xl font-black text-[#EA4335] font-mono">{counts.pendingCount}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#E5DFD0] text-center">
              <span className="text-[10px] font-bold uppercase text-[#5F6368] block">Reviewed</span>
              <span className="text-xl font-black text-[#34A853] font-mono">{counts.reviewedCount}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#E5DFD0] text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase text-[#5F6368] block">Missing</span>
              <span className="text-xl font-black text-[#5F6368] font-mono">{counts.missingCount}</span>
            </div>
          </div>

          {/* Submissions Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-[#0D0E11]">Student Submissions</h2>
                <p className="text-xs text-[#5F6368]">
                  Inspect student repositories, live deployment URLs, and submit grades with feedback.
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'All Submissions' },
                  { id: 'SUBMITTED', label: 'Pending Review' },
                  { id: 'REVIEWED', label: 'Reviewed' },
                  { id: 'DRAFT', label: 'Drafts' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id as any)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap',
                      statusFilter === f.id
                        ? 'bg-[#0D0E11] text-[#FAF7EE]'
                        : 'bg-white border border-[#E5DFD0] text-[#5F6368] hover:text-[#0D0E11]'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="rounded-3xl bg-white border border-[#E5DFD0] p-12 text-center shadow-sm space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF7EE] text-[#5F6368] flex items-center justify-center mx-auto">
                  <Send className="h-6 w-6" />
                </div>
                <h3 className="text-base font-black text-[#0D0E11]">No Submissions Found</h3>
                <p className="text-xs text-[#5F6368]">
                  No student submissions match the selected filter.
                </p>
              </div>
            ) : (
              <div className="rounded-3xl bg-white border border-[#E5DFD0] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7EE] border-b border-[#E5DFD0] text-[#5F6368] uppercase font-bold text-[10px] tracking-wider">
                      <tr>
                        <th className="py-4 px-6">Student</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-4">Artifacts</th>
                        <th className="py-4 px-4">Submitted Date</th>
                        <th className="py-4 px-4">Score</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DFD0]">
                      {filteredSubmissions.map((sub) => {
                        const isReviewed = sub.status === 'REVIEWED';

                        return (
                          <tr key={sub.id} className="hover:bg-[#FAF7EE]/50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <img
                                  src={sub.student?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                  alt={sub.student?.firstName}
                                  className="w-9 h-9 rounded-full object-cover border border-[#E5DFD0]"
                                />
                                <div>
                                  <span className="font-bold text-[#0D0E11] block text-sm">
                                    {sub.student?.firstName} {sub.student?.lastName}
                                  </span>
                                  <span className="text-[#5F6368] text-[11px]">
                                    {sub.student?.email}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4">
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
                                  {sub.score} / {assignment.points}
                                </span>
                              ) : (
                                <span className="text-[#5F6368] font-mono">—</span>
                              )}
                            </td>

                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => openReviewModal(sub)}
                                className={cn(
                                  'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors',
                                  isReviewed
                                    ? 'border border-[#E5DFD0] text-[#5F6368] hover:text-[#0D0E11] hover:bg-white'
                                    : 'bg-[#0D0E11] text-[#FAF7EE] hover:bg-[#22242B] shadow-xs'
                                )}
                              >
                                {isReviewed ? 'Edit Grade' : 'Review Deliverable'}
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
          </div>
        </main>
      </div>

      {/* REVIEW SUBMISSION MODAL / DRAWER */}
      {reviewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-[#E5DFD0] p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    reviewingSubmission.student?.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                  }
                  alt={reviewingSubmission.student?.firstName}
                  className="w-12 h-12 rounded-2xl object-cover border border-[#E5DFD0]"
                />
                <div>
                  <h3 className="text-xl font-black text-[#0D0E11]">
                    Review {reviewingSubmission.student?.firstName}&apos;s Submission
                  </h3>
                  <p className="text-xs text-[#5F6368]">
                    {reviewingSubmission.student?.email} • {assignment.title}
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

            {/* Student Deliverable Artifact Links */}
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
                    Score (out of {assignment.points}) *
                  </label>
                  <span className="text-xs font-mono font-bold text-[#4285F4]">
                    {reviewScore} / {assignment.points} Points
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  max={assignment.points}
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
                  placeholder="Highlight clean architecture, suggest optimization opportunities, critique security considerations, or commend student creativity..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium resize-none leading-relaxed"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReviewingSubmission(null)}
                  className="px-5 py-2.5 rounded-2xl border border-[#E5DFD0] text-xs font-bold text-[#5F6368] hover:text-[#0D0E11]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-6 py-2.5 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] disabled:opacity-50 transition-colors shadow-sm"
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
