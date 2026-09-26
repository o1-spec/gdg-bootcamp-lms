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
  Trash2,
  FileText,
  Download,
  AlertCircle,
} from 'lucide-react';
import { AssignmentSubmission } from '@/types/lms';
import { formatFileSize, MAX_FILE_SIZE_MB } from '@/lib/cloudinary-constants';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

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

  // File state
  const [fileUrl, setFileUrl] = useState(initialSubmission.fileUrl || '');
  const [filePublicId, setFilePublicId] = useState(initialSubmission.filePublicId || '');
  const [fileName, setFileName] = useState(initialSubmission.fileName || '');
  const [fileSize, setFileSize] = useState<number | undefined>(initialSubmission.fileSize);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!assignmentId) {
      showToast('Assignment ID missing', 'error');
      return;
    }

    setIsUploadingFile(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('assignmentId', assignmentId);

    try {
      const res = await fetch('/api/upload/submission', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload attachment');
      }

      setFileUrl(data.fileUrl);
      setFilePublicId(data.filePublicId);
      setFileName(data.fileName);
      setFileSize(data.fileSize);
      showToast(`Uploaded ${data.fileName} successfully`);
    } catch (err: any) {
      console.error('File upload error:', err);
      setUploadError(err.message || 'File upload failed');
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setIsUploadingFile(false);
      // Reset input value so same file can be re-selected if desired
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = () => {
    if (!fileUrl && !fileName) return;
    setIsConfirmRemoveOpen(true);
  };

  const executeRemoveAttachment = async () => {
    setIsConfirmRemoveOpen(false);
    if (!fileUrl && !fileName) return;

    if (assignmentId && submission.filePublicId) {
      try {
        await fetch(`/api/assignments/${assignmentId}/submissions`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.warn('Failed to delete attachment from server:', err);
      }
    }

    setFileUrl('');
    setFilePublicId('');
    setFileName('');
    setFileSize(undefined);
    showToast('Attachment removed');
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingFile) return;

    setIsLoading(true);

    try {
      if (assignmentId) {
        const res = await fetch(`/api/assignments/${assignmentId}/submissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            githubUrl,
            liveUrl,
            notes,
            fileUrl: fileUrl || null,
            filePublicId: filePublicId || null,
            fileName: fileName || null,
            fileSize: fileSize || null,
            action: 'draft',
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to save draft');
        }
      }

      const updated: AssignmentSubmission = {
        ...submission,
        status: 'DRAFT',
        githubUrl,
        liveUrl,
        notes,
        fileUrl,
        filePublicId,
        fileName,
        fileSize,
      };
      setSubmission(updated);
      onUpdateSubmission(updated);
      showToast('Draft saved successfully!');
    } catch (err: any) {
      showToast(err.message || 'Unable to sync draft with server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingFile || isLoading) return;

    if (!githubUrl.trim() && !fileUrl) {
      showToast('Please provide either a GitHub repository URL or upload a project file.', 'error');
      return;
    }

    setIsConfirmSubmitOpen(true);
  };

  const executeSubmit = async () => {
    setIsConfirmSubmitOpen(false);
    setIsLoading(true);

    try {
      if (assignmentId) {
        const res = await fetch(`/api/assignments/${assignmentId}/submissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            githubUrl,
            liveUrl,
            notes,
            fileUrl: fileUrl || null,
            filePublicId: filePublicId || null,
            fileName: fileName || null,
            fileSize: fileSize || null,
            action: 'submit',
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to submit assignment');
        }
      }

      const updated: AssignmentSubmission = {
        ...submission,
        status: 'SUBMITTED',
        githubUrl,
        liveUrl,
        notes,
        fileUrl,
        filePublicId,
        fileName,
        fileSize,
        submittedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };
      setSubmission(updated);
      setIsEditing(false);
      onUpdateSubmission(updated);
      showToast('Assignment submitted successfully! Mentor review is pending.');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit assignment. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // If submitted or reviewed and not actively editing:
  if (!isEditing && (submission.status === 'SUBMITTED' || submission.status === 'REVIEWED')) {
    return (
      <div className="rounded-3xl border border-gdg-border bg-white p-5 sm:p-8 space-y-6 shadow-xs">
        {toastMessage && (
          <div
            className={`flex items-center gap-2 p-3.5 rounded-2xl text-xs font-bold animate-in fade-in ${
              toastType === 'success'
                ? 'bg-gdg-green/15 text-gdg-green-dark border border-gdg-green/30'
                : 'bg-gdg-red/15 text-gdg-red border border-gdg-red/30'
            }`}
          >
            {toastType === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gdg-border pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-gdg-green" />
              <span className="text-xs font-bold uppercase tracking-wider text-gdg-green">
                {submission.status === 'REVIEWED' ? 'Evaluated by Mentor' : 'Submitted Successfully'}
              </span>
            </div>
            <h4 className="text-xl font-black text-gdg-black tracking-tight">
              {submission.status === 'REVIEWED' ? 'Assessment & Feedback' : 'Submission Details'}
            </h4>
            {submission.submittedAt && (
              <p className="text-xs text-gdg-gray">
                Submitted on: <strong className="text-gdg-black">{submission.submittedAt}</strong>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gdg-black text-xs font-black text-gdg-black hover:bg-gdg-cream transition-all cursor-pointer shadow-2xs"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Submission</span>
          </button>
        </div>

        {/* Reviewed Score & Mentor Feedback Banner */}
        {submission.status === 'REVIEWED' && (
          <div className="rounded-2xl border border-gdg-dark-border bg-gdg-black text-gdg-cream p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-gdg-yellow" />
                <span className="text-xs font-bold uppercase tracking-wider text-gdg-yellow">
                  Official Review
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-gdg-green">
                  {submission.score}
                </span>
                <span className="text-sm font-bold text-gdg-cream/60"> / {maxPoints}</span>
              </div>
            </div>

            {submission.mentorFeedback && (
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gdg-cream/80">
                  <MessageSquare className="h-3.5 w-3.5 text-gdg-blue" />
                  <span>
                    Mentor Feedback {submission.mentorName ? `— ${submission.mentorName}` : ''}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gdg-cream/90 leading-relaxed font-normal bg-white/5 p-3.5 rounded-xl border border-white/10 italic">
                  &ldquo;{submission.mentorFeedback}&rdquo;
                </p>
              </div>
            )}
          </div>
        )}

        {/* Submitted Deliverables Display */}
        <div className="space-y-3">
          {submission.githubUrl && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gdg-cream border border-gdg-border">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-gdg-black border border-gdg-border">
                  <GitBranch className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray">
                    GitHub Repository
                  </p>
                  <p className="text-xs font-black text-gdg-black truncate">
                    {submission.githubUrl}
                  </p>
                </div>
              </div>
              <a
                href={submission.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-black text-gdg-blue hover:underline shrink-0 ml-3"
              >
                <span>Visit Repo</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}

          {submission.liveUrl && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gdg-cream border border-gdg-border">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-gdg-black border border-gdg-border">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray">
                    Live Deployed Application
                  </p>
                  <p className="text-xs font-black text-gdg-black truncate">
                    {submission.liveUrl}
                  </p>
                </div>
              </div>
              <a
                href={submission.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-black text-gdg-green hover:underline shrink-0 ml-3"
              >
                <span>Open URL</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}

          {/* Uploaded File Attachment View */}
          {(submission.fileUrl || submission.fileName) && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gdg-cream border border-gdg-border">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-gdg-red border border-gdg-border">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray">
                      Uploaded Project File
                    </p>
                    {submission.fileSize && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gdg-border/60 text-gdg-gray">
                        {formatFileSize(submission.fileSize)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-black text-gdg-black truncate">
                    {submission.fileName || 'Project Deliverable'}
                  </p>
                </div>
              </div>
              {submission.fileUrl && (
                <a
                  href={submission.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={submission.fileName}
                  className="flex items-center gap-1 text-xs font-black text-gdg-red hover:underline shrink-0 ml-3"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </a>
              )}
            </div>
          )}

          {submission.notes && (
            <div className="p-4 rounded-2xl bg-gdg-cream border border-gdg-border space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray">
                Student Implementation Notes
              </p>
              <p className="text-xs text-gdg-black leading-relaxed">
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
      onSubmit={handlePreSubmit}
      className="rounded-3xl border border-gdg-border bg-white p-5 sm:p-8 space-y-6 shadow-xs"
    >
      {toastMessage && (
        <div
          className={`flex items-center gap-2 p-3.5 rounded-2xl text-xs font-bold animate-in fade-in ${
            toastType === 'success'
              ? 'bg-gdg-green/15 text-gdg-green-dark border border-gdg-green/30'
              : 'bg-gdg-red/15 text-gdg-red border border-gdg-red/30'
          }`}
        >
          {toastType === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gdg-blue" />
          <span className="text-xs font-bold uppercase tracking-wider text-gdg-gray">
            Deliverable Submission
          </span>
        </div>
        <h4 className="text-xl sm:text-2xl font-black text-gdg-black tracking-tight">
          Submit Your Work
        </h4>
        <p className="text-xs text-gdg-gray">
          Provide your public GitHub repository, optional live deployment link, and attach any supplementary project files.
        </p>
      </div>

      <div className="space-y-4">
        {/* GitHub URL field */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gdg-black flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5 text-gdg-black" />
              GitHub Repository URL <span className="text-gdg-gray font-normal">(or upload file below)</span>
            </span>
            <span className="text-[10px] font-bold text-gdg-gray">RECOMMENDED</span>
          </label>
          <input
            type="url"
            placeholder="https://github.com/username/project-repo"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="w-full h-11 rounded-2xl border border-gdg-border bg-gdg-cream/50 px-4 text-xs font-medium text-gdg-black placeholder:text-gdg-gray focus:border-gdg-black focus:bg-white focus:outline-none transition-all"
          />
        </div>

        {/* Live URL field */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gdg-black flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-gdg-blue" />
              Live / Deployed URL (Vercel, Render, Railway)
            </span>
            <span className="text-[10px] font-bold text-gdg-gray">OPTIONAL</span>
          </label>
          <input
            type="url"
            placeholder="https://your-app.vercel.app"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            className="w-full h-11 rounded-2xl border border-gdg-border bg-gdg-cream/50 px-4 text-xs font-medium text-gdg-black placeholder:text-gdg-gray focus:border-gdg-black focus:bg-white focus:outline-none transition-all"
          />
        </div>

        {/* Real File Upload Attachment */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gdg-black flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Upload className="h-3.5 w-3.5 text-gdg-green" />
              Upload Project File / ZIP / PDF Deliverable
            </span>
            <span className="text-[10px] font-bold text-gdg-gray">MAX {MAX_FILE_SIZE_MB}MB</span>
          </label>

          {fileName ? (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gdg-cream border border-gdg-border">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-gdg-green border border-gdg-border">
                  <FileCode2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-gdg-black truncate">{fileName}</p>
                    {fileSize && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gdg-border/60 text-gdg-gray">
                        {formatFileSize(fileSize)}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gdg-green font-bold mt-0.5">
                    Ready for submission
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-3">
                {fileUrl && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl text-gdg-gray hover:text-gdg-black hover:bg-white transition-colors"
                    title="View uploaded file"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  className="p-2 rounded-xl text-gdg-red hover:bg-gdg-red/10 transition-colors cursor-pointer"
                  title="Remove attachment"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                  isUploadingFile
                    ? 'border-gdg-blue bg-gdg-blue/5 pointer-events-none'
                    : 'border-gdg-border bg-gdg-cream/40 hover:bg-gdg-cream hover:border-gdg-black/30'
                }`}
              >
                {isUploadingFile ? (
                  <div className="flex flex-col items-center py-2">
                    <Loader2 className="h-6 w-6 text-gdg-blue animate-spin mb-2" />
                    <span className="text-xs font-bold text-gdg-black">
                      Uploading file to Cloudinary...
                    </span>
                    <span className="text-[10px] text-gdg-gray">Please wait</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-gdg-gray mb-1.5" />
                    <span className="text-xs font-bold text-gdg-black">
                      Click to choose or drag & drop file
                    </span>
                    <span className="text-[10px] text-gdg-gray mt-0.5">
                      PDF, ZIP, PNG, JPG, Word, Excel, or Code archives up to {MAX_FILE_SIZE_MB}MB
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploadingFile}
                    />
                  </>
                )}
              </label>
              {uploadError && (
                <p className="text-[11px] text-gdg-red font-bold mt-1.5">{uploadError}</p>
              )}
            </div>
          )}
        </div>

        {/* Notes / explanation */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gdg-black block">
            Implementation Notes & Trade-offs
          </label>
          <textarea
            rows={3}
            placeholder="Describe your design choices, trade-offs, setup notes, or challenges you encountered..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-2xl border border-gdg-border bg-gdg-cream/50 p-4 text-xs font-medium text-gdg-black placeholder:text-gdg-gray focus:border-gdg-black focus:bg-white focus:outline-none transition-all resize-y"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-gdg-border">
        <button
          type="button"
          disabled={isLoading || isUploadingFile}
          onClick={handleSaveDraft}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-gdg-black text-xs font-black text-gdg-black hover:bg-gdg-cream transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          <span>Save Draft</span>
        </button>

        <button
          type="submit"
          disabled={isLoading || isUploadingFile}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gdg-black text-gdg-cream text-xs font-black hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-gdg-green" />
          ) : (
            <Send className="h-3.5 w-3.5 text-gdg-green" />
          )}
          <span>Submit Assignment</span>
        </button>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={isConfirmSubmitOpen}
        onClose={() => setIsConfirmSubmitOpen(false)}
        onConfirm={executeSubmit}
        title="Submit Assignment for Review?"
        description={`Once submitted, your mentor will review your deliverable, grade it out of ${maxPoints} points, and provide constructive feedback. Are you ready to submit now?`}
        confirmLabel="Yes, Submit Assignment"
        cancelText="Review Form"
        variant="info"
        isLoading={isLoading}
      />

      <ConfirmDialog
        isOpen={isConfirmRemoveOpen}
        onClose={() => setIsConfirmRemoveOpen(false)}
        onConfirm={executeRemoveAttachment}
        title="Remove Attached File?"
        description="Are you sure you want to remove this attached file from your submission? This will clear the uploaded project file."
        confirmLabel="Remove File"
        cancelText="Keep File"
        variant="danger"
      />
    </form>
  );
}
