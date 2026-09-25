'use client';

import React, { useState } from 'react';
import {
  GitBranch,
  Globe,
  Upload,
  FileCode2,
  CheckCircle2,
  Trophy,
  MessageSquare,
  Edit3,
  ExternalLink,
  Sparkles,
  Save,
  Send,
  Loader2,
} from 'lucide-react';
import { AssignmentSubmission } from '@/types/lms';

interface SubmissionFormProps {
  assignmentId?: string;
  initialSubmission: AssignmentSubmission;
  maxPoints: number;
  onUpdateSubmission: (submission: AssignmentSubmission) => void;
}

export function SubmissionForm({
  assignmentId,
  initialSubmission,
  maxPoints,
  onUpdateSubmission,
}: SubmissionFormProps) {
  const [submission, setSubmission] = useState<AssignmentSubmission>(initialSubmission);
  const [isEditing, setIsEditing] = useState(
    initialSubmission.status === 'NOT_STARTED' || initialSubmission.status === 'DRAFT'
  );
  const [githubUrl, setGithubUrl] = useState(initialSubmission.githubUrl || '');
  const [liveUrl, setLiveUrl] = useState(initialSubmission.liveUrl || '');
  const [notes, setNotes] = useState(initialSubmission.notes || '');
  const [fileName, setFileName] = useState(initialSubmission.fileName || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (assignmentId) {
        await fetch(`/api/assignments/${assignmentId}/submissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            githubUrl,
            liveUrl,
            notes,
            fileUrl: fileName ? `https://storage.mock/${fileName}` : '',
            action: 'draft',
          }),
        });
      }

      const updated: AssignmentSubmission = {
        ...submission,
        status: 'DRAFT',
        githubUrl,
        liveUrl,
        notes,
        fileName,
      };
      setSubmission(updated);
      onUpdateSubmission(updated);
      setToastMessage('Draft saved successfully!');
    } catch {
      setToastMessage('Unable to sync draft with server. Local draft updated.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim()) {
      setToastMessage('Please provide a valid GitHub repository URL.');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    setIsLoading(true);

    try {
      if (assignmentId) {
        await fetch(`/api/assignments/${assignmentId}/submissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            githubUrl,
            liveUrl,
            notes,
            fileUrl: fileName ? `https://storage.mock/${fileName}` : '',
            action: 'submit',
          }),
        });
      }

      const updated: AssignmentSubmission = {
        ...submission,
        status: 'SUBMITTED',
        githubUrl,
        liveUrl,
        notes,
        fileName,
        submittedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };
      setSubmission(updated);
      setIsEditing(false);
      onUpdateSubmission(updated);
      setToastMessage('Assignment submitted successfully! Mentor review is pending.');
    } catch {
      setToastMessage('Failed to submit assignment. Please try again.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleMockFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  // If submitted or reviewed and not actively editing:
  if (!isEditing && (submission.status === 'SUBMITTED' || submission.status === 'REVIEWED')) {
    return (
      <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        {toastMessage && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-[#34A853]/15 text-[#1e7e34] border border-[#34A853]/30 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD0] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#34A853]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#34A853]">
                {submission.status === 'REVIEWED' ? 'Evaluated by Mentor' : 'Submitted Successfully'}
              </span>
            </div>
            <h4 className="text-xl font-black text-[#0D0E11] tracking-tight">
              {submission.status === 'REVIEWED' ? 'Assessment & Feedback' : 'Submission Details'}
            </h4>
            {submission.submittedAt && (
              <p className="text-xs text-[#5F6368]">
                Submitted on: <strong className="text-[#0D0E11]">{submission.submittedAt}</strong>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#0D0E11] text-xs font-black text-[#0D0E11] hover:bg-[#FAF7EE] transition-all cursor-pointer shadow-2xs"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Submission</span>
          </button>
        </div>

        {/* Reviewed Score & Mentor Feedback Banner */}
        {submission.status === 'REVIEWED' && (
          <div className="rounded-2xl border border-[#22242B] bg-[#0D0E11] text-[#FAF7EE] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#FBBC04]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#FBBC04]">
                  Official Review
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#34A853]">
                  {submission.score}
                </span>
                <span className="text-sm font-bold text-[#FAF7EE]/60"> / {maxPoints}</span>
              </div>
            </div>

            {submission.mentorFeedback && (
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#FAF7EE]/80">
                  <MessageSquare className="h-3.5 w-3.5 text-[#4285F4]" />
                  <span>
                    Mentor Feedback {submission.mentorName ? `— ${submission.mentorName}` : ''}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#FAF7EE]/90 leading-relaxed font-normal bg-white/5 p-3.5 rounded-xl border border-white/10 italic">
                  &ldquo;{submission.mentorFeedback}&rdquo;
                </p>
              </div>
            )}
          </div>
        )}

        {/* Submitted URLs display */}
        <div className="space-y-3">
          {submission.githubUrl && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#0D0E11] border border-[#E5DFD0]">
                  <GitBranch className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368]">
                    GitHub Repository
                  </p>
                  <p className="text-xs font-black text-[#0D0E11] truncate">
                    {submission.githubUrl}
                  </p>
                </div>
              </div>
              <a
                href={submission.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-black text-[#4285F4] hover:underline shrink-0 ml-3"
              >
                <span>Visit Repo</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}

          {submission.liveUrl && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#0D0E11] border border-[#E5DFD0]">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368]">
                    Live Deployed Application
                  </p>
                  <p className="text-xs font-black text-[#0D0E11] truncate">
                    {submission.liveUrl}
                  </p>
                </div>
              </div>
              <a
                href={submission.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-black text-[#34A853] hover:underline shrink-0 ml-3"
              >
                <span>Open URL</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}

          {submission.notes && (
            <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368]">
                Student Implementation Notes
              </p>
              <p className="text-xs text-[#0D0E11] leading-relaxed">
                {submission.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active Submission Editing Form
  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-8 space-y-6 shadow-xs"
    >
      {toastMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-[#34A853]/15 text-[#1e7e34] border border-[#34A853]/30 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#4285F4]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
            Deliverable Submission
          </span>
        </div>
        <h4 className="text-xl sm:text-2xl font-black text-[#0D0E11] tracking-tight">
          Submit Your Work
        </h4>
        <p className="text-xs text-[#5F6368]">
          Provide your public GitHub repository, optional live deployment link, and notes for the mentors.
        </p>
      </div>

      <div className="space-y-4">
        {/* GitHub URL field */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-[#0D0E11] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5 text-[#0D0E11]" />
              GitHub Repository URL <span className="text-[#EA4335]">*</span>
            </span>
            <span className="text-[10px] font-bold text-[#5F6368]">REQUIRED</span>
          </label>
          <input
            type="url"
            required
            placeholder="https://github.com/username/project-repo"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="w-full h-11 rounded-2xl border border-[#E5DFD0] bg-[#FAF7EE]/50 px-4 text-xs font-medium text-[#0D0E11] placeholder:text-[#5F6368] focus:border-[#0D0E11] focus:bg-white focus:outline-none transition-all"
          />
        </div>

        {/* Live URL field */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-[#0D0E11] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-[#4285F4]" />
              Live / Deployed URL (Vercel, Render, Railway)
            </span>
            <span className="text-[10px] font-bold text-[#5F6368]">OPTIONAL</span>
          </label>
          <input
            type="url"
            placeholder="https://your-app.vercel.app"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            className="w-full h-11 rounded-2xl border border-[#E5DFD0] bg-[#FAF7EE]/50 px-4 text-xs font-medium text-[#0D0E11] placeholder:text-[#5F6368] focus:border-[#0D0E11] focus:bg-white focus:outline-none transition-all"
          />
        </div>

        {/* File upload placeholder (UI only) */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-[#0D0E11] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Upload className="h-3.5 w-3.5 text-[#34A853]" />
              Supplementary File / Zip / Architecture Diagram
            </span>
            <span className="text-[10px] font-bold text-[#5F6368]">OPTIONAL</span>
          </label>
          <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-[#E5DFD0] bg-[#FAF7EE]/40 hover:bg-[#FAF7EE] hover:border-[#0D0E11]/30 transition-all cursor-pointer">
            <FileCode2 className="h-6 w-6 text-[#5F6368] mb-1.5" />
            <span className="text-xs font-bold text-[#0D0E11]">
              {fileName ? fileName : 'Click to select or drag and drop files'}
            </span>
            <span className="text-[10px] text-[#5F6368] mt-0.5">
              {fileName ? 'Ready for local attachment' : 'PDF, ZIP, PNG, or JSON up to 25MB'}
            </span>
            <input
              type="file"
              className="hidden"
              onChange={handleMockFileDrop}
            />
          </label>
        </div>

        {/* Notes / explanation */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-[#0D0E11] block">
            Implementation Notes & Trade-offs
          </label>
          <textarea
            rows={3}
            placeholder="Describe your design choices, trade-offs, setup notes, or challenges you encountered..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-2xl border border-[#E5DFD0] bg-[#FAF7EE]/50 p-4 text-xs font-medium text-[#0D0E11] placeholder:text-[#5F6368] focus:border-[#0D0E11] focus:bg-white focus:outline-none transition-all resize-y"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-[#E5DFD0]">
        <button
          type="button"
          disabled={isLoading}
          onClick={handleSaveDraft}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-[#0D0E11] text-xs font-black text-[#0D0E11] hover:bg-[#FAF7EE] transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          <span>Save Draft</span>
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#0D0E11] text-[#FAF7EE] text-xs font-black hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[#34A853]" /> : <Send className="h-3.5 w-3.5 text-[#34A853]" />}
          <span>Submit Assignment</span>
        </button>
      </div>
    </form>
  );
}
