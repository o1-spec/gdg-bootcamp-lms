'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileCheck,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Send,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { MentorSidebar } from '@/components/mentor/MentorSidebar';
import { MentorHeader } from '@/components/mentor/MentorHeader';
import { ConfirmDialog } from '@/components/mentor/ConfirmDialog';
import { cn } from '@/lib/utils';

interface MentorAssignmentsClientProps {
  assignments: any[];
  tracks: any[];
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

export function MentorAssignmentsClient({
  assignments: initialAssignments,
  tracks,
  mentor,
  metrics,
}: MentorAssignmentsClientProps) {
  const router = useRouter();
  const [assignments, setAssignments] = useState<any[]>(initialAssignments);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filters
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<any | null>(null);

  // Form fields
  const [formTrackId, setFormTrackId] = useState<string>(tracks[0]?.id || '');
  const [formModuleId, setFormModuleId] = useState<string>('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formInstructions, setFormInstructions] = useState('');
  const [formType, setFormType] = useState<string>('PROJECT');
  const [formDueDate, setFormDueDate] = useState<string>('');
  const [formPoints, setFormPoints] = useState<number>(100);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectedTrackObj = tracks.find((t) => t.id === formTrackId);
  const availableModules = selectedTrackObj?.modules || [];

  const openCreateModal = () => {
    const defaultTrack = tracks[0];
    setFormTrackId(defaultTrack?.id || '');
    setFormModuleId('');
    setFormTitle('');
    setFormDescription('');
    setFormInstructions('');
    setFormType('PROJECT');
    // Default dueDate: 7 days from now
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setFormDueDate(d.toISOString().split('T')[0]);
    setFormPoints(100);
    setFormError(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (asg: any) => {
    setEditingAssignment(asg);
    setFormTrackId(asg.trackId);
    setFormModuleId(asg.moduleId || '');
    setFormTitle(asg.title);
    setFormDescription(asg.description || '');
    setFormInstructions(asg.instructions || '');
    setFormType(asg.type || 'PROJECT');
    setFormDueDate(new Date(asg.dueDate).toISOString().split('T')[0]);
    setFormPoints(asg.points || 100);
    setFormError(null);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (editingAssignment) {
        // PATCH
        const res = await fetch(`/api/mentor/assignments/${editingAssignment.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle,
            description: formDescription,
            instructions: formInstructions,
            type: formType,
            dueDate: new Date(formDueDate).toISOString(),
            points: Number(formPoints),
            moduleId: formModuleId || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update assignment');

        setAssignments((prev) =>
          prev.map((a) =>
            a.id === editingAssignment.id
              ? {
                  ...a,
                  ...data.assignment,
                  dueDate: new Date(formDueDate),
                  points: Number(formPoints),
                }
              : a
          )
        );
        showToast('Assignment updated');
        setEditingAssignment(null);
      } else {
        // POST
        const res = await fetch('/api/mentor/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trackId: formTrackId,
            moduleId: formModuleId || null,
            title: formTitle,
            description: formDescription,
            instructions: formInstructions,
            type: formType,
            dueDate: new Date(formDueDate).toISOString(),
            points: Number(formPoints),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create assignment');

        setAssignments((prev) => [
          {
            ...data.assignment,
            trackName: selectedTrackObj?.name || 'Assigned Track',
            trackAccent: selectedTrackObj?.accent || '#4285F4',
            totalStudents: selectedTrackObj?.studentCount || 0,
            submittedCount: 0,
            reviewedCount: 0,
            pendingCount: 0,
            missingCount: selectedTrackObj?.studentCount || 0,
          },
          ...prev,
        ]);
        showToast('New assignment published');
        setIsCreateOpen(false);
      }
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!deletingAssignment) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/mentor/assignments/${deletingAssignment.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete assignment');
      }

      setAssignments((prev) => prev.filter((a) => a.id !== deletingAssignment.id));
      showToast('Assignment deleted');
      setDeletingAssignment(null);
      router.refresh();
    } catch (err: any) {
      showToast(err.message || 'Deletion failed');
      setDeletingAssignment(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered assignments
  const filteredAssignments = assignments.filter((asg) => {
    if (selectedTrackFilter !== 'all' && asg.trackId !== selectedTrackFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = asg.title.toLowerCase().includes(q);
      const matchDesc = asg.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const totalReviewed = assignments.reduce((acc, a) => acc + (a.reviewedCount || 0), 0);
  const totalPending = assignments.reduce((acc, a) => acc + (a.pendingCount || 0), 0);

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
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5DFD0] pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#EA4335]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
                  Curriculum Deliverables &amp; Code Reviews
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0D0E11]">
                Assignment Management
              </h1>
              <p className="text-base text-[#5F6368] max-w-2xl font-medium">
                Set programming assessments, track student submissions, view completion percentages, and review capstone projects.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              disabled={tracks.length === 0}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] disabled:opacity-50 transition-colors shadow-sm self-start md:self-auto"
            >
              <Plus className="h-4 w-4 text-[#FBBC04]" />
              <span>Create Assignment</span>
            </button>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-white border border-[#E5DFD0] shadow-sm">
              <div className="flex items-center justify-between text-[#5F6368] text-xs font-bold mb-2">
                <span>Total Assignments</span>
                <FileCheck className="h-4 w-4 text-[#4285F4]" />
              </div>
              <p className="text-3xl font-black text-[#0D0E11] font-mono">{assignments.length}</p>
              <span className="text-[11px] text-[#5F6368] font-medium mt-1 block">
                Across {tracks.length} assigned tracks
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E5DFD0] shadow-sm">
              <div className="flex items-center justify-between text-[#5F6368] text-xs font-bold mb-2">
                <span>Pending Reviews</span>
                <Send className="h-4 w-4 text-[#EA4335]" />
              </div>
              <p className="text-3xl font-black text-[#EA4335] font-mono">{totalPending}</p>
              <span className="text-[11px] text-[#5F6368] font-medium mt-1 block">
                Awaiting mentor evaluation
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E5DFD0] shadow-sm">
              <div className="flex items-center justify-between text-[#5F6368] text-xs font-bold mb-2">
                <span>Reviewed &amp; Graded</span>
                <CheckCircle2 className="h-4 w-4 text-[#34A853]" />
              </div>
              <p className="text-3xl font-black text-[#34A853] font-mono">{totalReviewed}</p>
              <span className="text-[11px] text-[#5F6368] font-medium mt-1 block">
                Feedback sent to students
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E5DFD0] shadow-sm">
              <div className="flex items-center justify-between text-[#5F6368] text-xs font-bold mb-2">
                <span>Assigned Tracks</span>
                <Layers className="h-4 w-4 text-[#FBBC04]" />
              </div>
              <p className="text-3xl font-black text-[#0D0E11] font-mono">{tracks.length}</p>
              <span className="text-[11px] text-[#5F6368] font-medium mt-1 block">
                Active mentor oversight
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-[#E5DFD0] shadow-sm">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <Search className="h-4 w-4 text-[#5F6368] shrink-0 ml-2" />
              <input
                type="text"
                placeholder="Search assignments by title or instructions..."
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

            <div className="flex items-center gap-3">
              <select
                value={selectedTrackFilter}
                onChange={(e) => setSelectedTrackFilter(e.target.value)}
                className="px-3.5 py-2 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-xs font-bold text-[#0D0E11] outline-none"
              >
                <option value="all">All Tracks</option>
                {tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignments List */}
          {filteredAssignments.length === 0 ? (
            <div className="rounded-3xl bg-white border border-[#E5DFD0] p-12 text-center shadow-sm max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EA4335]/10 text-[#EA4335] flex items-center justify-center mx-auto">
                <FileCheck className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-[#0D0E11]">No Assignments Found</h3>
              <p className="text-xs text-[#5F6368]">
                {assignments.length === 0
                  ? "You haven't created any assignments for your assigned tracks yet."
                  : 'No assignments match your search or track filter.'}
              </p>
              {assignments.length === 0 && (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] transition-colors"
                >
                  <Plus className="h-4 w-4 text-[#FBBC04]" />
                  <span>Create First Assignment</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAssignments.map((asg) => {
                const totalSubs = (asg.submittedCount || 0) + (asg.reviewedCount || 0);

                return (
                  <div
                    key={asg.id}
                    className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5DFD0] hover:border-[#0D0E11] transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-6 group"
                  >
                    <div className="space-y-4">
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: asg.trackAccent || '#4285F4' }}
                          />
                          <span className="text-[11px] font-black uppercase tracking-wider text-[#5F6368]">
                            {asg.trackName}
                          </span>
                        </div>

                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
                          {asg.type || 'PROJECT'} • {asg.points} Pts
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl font-black text-[#0D0E11] group-hover:text-[#4285F4] transition-colors">
                          {asg.title}
                        </h3>
                        <p className="text-xs text-[#5F6368] mt-2 line-clamp-2 leading-relaxed">
                          {asg.description}
                        </p>
                      </div>

                      {/* Submission Progress Bar & Stats */}
                      <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#5F6368]">Student Submissions</span>
                          <span className="font-mono font-bold text-[#0D0E11]">
                            {totalSubs} / {asg.totalStudents} ({asg.totalStudents > 0 ? Math.round((totalSubs / asg.totalStudents) * 100) : 0}%)
                          </span>
                        </div>

                        <div className="w-full h-2 bg-[#E5DFD0] rounded-full overflow-hidden flex">
                          <div
                            className="bg-[#34A853] h-full"
                            style={{
                              width: `${asg.totalStudents > 0 ? ((asg.reviewedCount || 0) / asg.totalStudents) * 100 : 0}%`,
                            }}
                            title={`${asg.reviewedCount} Reviewed`}
                          />
                          <div
                            className="bg-[#EA4335] h-full"
                            style={{
                              width: `${asg.totalStudents > 0 ? ((asg.pendingCount || 0) / asg.totalStudents) * 100 : 0}%`,
                            }}
                            title={`${asg.pendingCount} Pending Review`}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#5F6368] pt-1">
                          <span className="text-[#34A853] font-bold">
                            ✓ {asg.reviewedCount || 0} Reviewed
                          </span>
                          <span className="text-[#EA4335] font-bold">
                            ⏳ {asg.pendingCount || 0} Pending
                          </span>
                          <span>
                            {asg.missingCount || 0} Missing
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#5F6368]">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-[#4285F4]" />
                          Due {new Date(asg.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>

                        <span className="text-[11px] font-mono">
                          Module: {asg.moduleTitle}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-4 border-t border-[#E5DFD0] flex items-center justify-between">
                      <Link
                        href={`/mentor/assignments/${asg.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] transition-colors"
                      >
                        <span>View Submissions</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(asg)}
                          className="p-2 rounded-xl hover:bg-[#FAF7EE] text-[#5F6368] hover:text-[#0D0E11] transition-colors"
                          title="Edit Assignment"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingAssignment(asg)}
                          className="p-2 rounded-xl hover:bg-[#EA4335]/10 text-[#5F6368] hover:text-[#EA4335] transition-colors"
                          title="Delete Assignment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* CREATE / EDIT ASSIGNMENT MODAL */}
      {(isCreateOpen || editingAssignment) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-[#E5DFD0] p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-[#0D0E11]">
                {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingAssignment(null);
                }}
                className="p-2 rounded-xl hover:bg-[#FAF7EE] text-[#5F6368] hover:text-[#0D0E11]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/30 text-xs font-bold text-[#EA4335] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAssignment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Build a Secure REST API with Prisma"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                    Track *
                  </label>
                  <select
                    value={formTrackId}
                    disabled={!!editingAssignment}
                    onChange={(e) => {
                      setFormTrackId(e.target.value);
                      setFormModuleId('');
                    }}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium bg-white disabled:opacity-60"
                  >
                    {tracks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                    Module (Optional)
                  </label>
                  <select
                    value={formModuleId}
                    onChange={(e) => setFormModuleId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium bg-white"
                  >
                    <option value="">General Track Assignment</option>
                    {availableModules.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                    Type *
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium bg-white"
                  >
                    <option value="PROJECT">Project</option>
                    <option value="CHALLENGE">Challenge</option>
                    <option value="QUIZ">Quiz</option>
                    <option value="ESSAY">Essay</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                    Points *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={formPoints}
                    onChange={(e) => setFormPoints(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Overview and objectives of this deliverable..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                  Instructions &amp; Requirements (Markdown supported)
                </label>
                <textarea
                  rows={4}
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  placeholder="Detailed submission guidelines, API requirements, test cases..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-mono resize-y"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingAssignment(null);
                  }}
                  className="px-5 py-2.5 rounded-2xl border border-[#E5DFD0] text-xs font-bold text-[#5F6368] hover:text-[#0D0E11]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : editingAssignment ? 'Save Changes' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE ASSIGNMENT */}
      <ConfirmDialog
        isOpen={!!deletingAssignment}
        title="Delete Assignment"
        description={`Are you sure you want to delete "${deletingAssignment?.title}"? Deletion will be rejected if students have already submitted work.`}
        confirmLabel="Delete Assignment"
        isDestructive={true}
        onConfirm={handleDeleteAssignment}
        onCancel={() => setDeletingAssignment(null)}
      />
    </div>
  );
}
