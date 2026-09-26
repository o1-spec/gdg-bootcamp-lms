'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Plus,
  Users,
  Layers,
  CalendarDays,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { AdminSidebar, AdminUser } from '../AdminSidebar';
import { AdminHeader } from '../AdminHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ConfirmDialog } from '@/components/mentor/ConfirmDialog';
import { format } from '@/lib/date';

interface MentorItem {
  id: string;
  name: string;
  email: string;
  avatar: string;
  assignedTracks: {
    assignmentId: string;
    trackId: string;
    trackName: string;
    trackAccent: string;
    cohortName: string;
    studentCount: number;
    assignedAt: Date;
  }[];
  totalAssignedTracks: number;
  totalSupervisedStudents: number;
  upcomingSessionsCount: number;
}

interface TrackOption {
  id: string;
  name: string;
  cohort: { name: string };
  assignedMentorIds: string[];
}

interface AdminMentorsClientProps {
  mentors: MentorItem[];
  tracks: any[];
  admin: AdminUser;
}

export function AdminMentorsClient({
  mentors: initialMentors,
  tracks,
  admin,
}: AdminMentorsClientProps) {
  const router = useRouter();
  const [mentors, setMentors] = useState<MentorItem[]>(initialMentors);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Assign modal state
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState(mentors[0]?.id || '');
  const [selectedTrackId, setSelectedTrackId] = useState(tracks[0]?.id || '');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Removal confirmation dialog state
  const [removalTarget, setRemovalTarget] = useState<{
    assignmentId: string;
    mentorName: string;
    trackName: string;
  } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removalError, setRemovalError] = useState<string | null>(null);

  const openAssignModal = (prefillMentorId?: string) => {
    if (prefillMentorId) setSelectedMentorId(prefillMentorId);
    setAssignError(null);
    setIsAssignOpen(true);
  };

  const handleAssignMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAssigning(true);
    setAssignError(null);

    try {
      const res = await fetch('/api/admin/mentors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: selectedMentorId,
          trackId: selectedTrackId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign mentor');

      setIsAssignOpen(false);
      router.refresh();
    } catch (err: any) {
      setAssignError(err.message || 'An error occurred.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveAssignment = async () => {
    if (!removalTarget) return;

    setIsRemoving(true);
    try {
      const res = await fetch(`/api/admin/mentors/${removalTarget.assignmentId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove mentor');

      setRemovalTarget(null);
      router.refresh();
    } catch (err: any) {
      setRemovalError(err.message || 'Failed to remove mentor');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gdg-black text-gdg-cream flex">
      <AdminSidebar
        currentTab="mentors"
        admin={admin}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Mentor Faculty & Workload"
          subtitle="Assign track instructors, balance instructional capacity, and manage leads"
          admin={admin}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          actions={
            <button
              onClick={() => openAssignModal()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gdg-red hover:bg-gdg-red/90 text-xs font-bold text-white shadow-lg shadow-gdg-red/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Mentor</span>
            </button>
          }
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header Summary */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white">Active Mentor Roster</h2>
              <p className="text-xs text-white/50">
                Mentors lead workshop sessions, grade assignment submissions, and mark attendance.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70">
                Mentors: <strong className="text-white">{mentors.length}</strong>
              </span>
            </div>
          </div>

          {/* Mentors Card Grid */}
          {mentors.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/5 border border-dashed border-white/15 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gdg-yellow/10 text-gdg-yellow flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-xs text-white/50">No mentors configured in the platform.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    {/* Mentor Header */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <Avatar className="w-12 h-12 border border-white/15 shrink-0">
                          <AvatarImage src={mentor.avatar} alt={mentor.name} />
                          <AvatarFallback className="bg-gdg-yellow text-black font-bold text-sm">
                            {mentor.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className="font-bold text-base text-white truncate">{mentor.name}</h3>
                          <p className="text-xs text-white/40 truncate">{mentor.email}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => openAssignModal(mentor.id)}
                        className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                        title="Assign to Track"
                      >
                        <Plus className="w-4 h-4 text-gdg-blue" />
                      </button>
                    </div>

                    {/* Workload Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-white/5">
                      <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
                        <span className="block font-black text-white text-sm">
                          {mentor.totalAssignedTracks}
                        </span>
                        <span className="text-[10px] text-white/40">Tracks</span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
                        <span className="block font-black text-white text-sm">
                          {mentor.totalSupervisedStudents}
                        </span>
                        <span className="text-[10px] text-white/40">Students</span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
                        <span className="block font-black text-white text-sm">
                          {mentor.upcomingSessionsCount}
                        </span>
                        <span className="text-[10px] text-white/40">Upcoming</span>
                      </div>
                    </div>

                    {/* Assigned Tracks List */}
                    <div className="space-y-2">
                      <span className="text-[11px] uppercase tracking-wider text-white/40 font-semibold block">
                        Assigned Tracks ({mentor.assignedTracks.length})
                      </span>
                      {mentor.assignedTracks.length === 0 ? (
                        <p className="text-xs text-white/30 italic">No tracks currently assigned.</p>
                      ) : (
                        <div className="space-y-2">
                          {mentor.assignedTracks.map((assignment) => (
                            <div
                              key={assignment.assignmentId}
                              className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 text-xs"
                              style={{ borderLeftColor: assignment.trackAccent, borderLeftWidth: '3px' }}
                            >
                              <div className="min-w-0">
                                <p className="font-bold text-white truncate">{assignment.trackName}</p>
                                <p className="text-[10px] text-white/40">{assignment.cohortName}</p>
                              </div>

                              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                <span className="text-[10px] text-white/50 font-mono">
                                  {assignment.studentCount} students
                                </span>
                                <button
                                  onClick={() =>
                                    setRemovalTarget({
                                      assignmentId: assignment.assignmentId,
                                      mentorName: mentor.name,
                                      trackName: assignment.trackName,
                                    })
                                  }
                                  className="p-1 rounded text-white/30 hover:text-gdg-red transition-colors"
                                  title="Unassign Mentor"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ASSIGN MENTOR MODAL (Requirement 15) */}
      {isAssignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-gdg-black border border-white/15 p-5 sm:p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">Assign Mentor to Track</h3>
                <p className="text-xs text-white/50">Authorize mentor instruction and submission reviews</p>
              </div>
              <button
                onClick={() => setIsAssignOpen(false)}
                className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {assignError && (
              <div className="p-3.5 rounded-2xl bg-gdg-red/10 border border-gdg-red/20 flex items-center gap-3 text-xs text-gdg-red">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{assignError}</span>
              </div>
            )}

            <form onSubmit={handleAssignMentor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Select Mentor <span className="text-gdg-red">*</span>
                </label>
                <select
                  value={selectedMentorId}
                  onChange={(e) => setSelectedMentorId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-gdg-blue"
                >
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id} className="bg-gdg-black">
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Select Curriculum Track <span className="text-gdg-red">*</span>
                </label>
                <select
                  value={selectedTrackId}
                  onChange={(e) => setSelectedTrackId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-gdg-blue"
                >
                  {tracks.map((t) => (
                    <option key={t.id} value={t.id} className="bg-gdg-black">
                      {t.name} ({t.cohort.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAssignOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-2xl text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gdg-red hover:bg-gdg-red/90 text-xs font-bold text-white disabled:opacity-50"
                >
                  {isAssigning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Assign Mentor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REMOVAL CONFIRMATION DIALOG */}
      {removalTarget && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setRemovalTarget(null)}
          onConfirm={handleRemoveAssignment}
          title="Remove Mentor Assignment?"
          description={`Are you sure you want to remove ${removalTarget.mentorName} from ${removalTarget.trackName}? The mentor will no longer have submission review or session grading access for this track.`}
          confirmText="Remove Assignment"
          isDestructive={true}
          isLoading={isRemoving}
        />
      )}

      {/* Error Alert Dialog */}
      <ConfirmDialog
        isOpen={!!removalError}
        onClose={() => setRemovalError(null)}
        onConfirm={() => setRemovalError(null)}
        title="Mentor Assignment Error"
        description={removalError || ''}
        confirmLabel="Dismiss"
        cancelText={null}
        variant="warning"
      />
    </div>
  );
}
