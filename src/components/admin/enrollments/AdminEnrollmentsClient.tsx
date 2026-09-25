'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  Users,
  Search,
  Filter,
  Check,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
  Power,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AdminSidebar, AdminUser } from '../AdminSidebar';
import { AdminHeader } from '../AdminHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ConfirmDialog } from '@/components/mentor/ConfirmDialog';
import { format } from '@/lib/date';

interface EnrollmentRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string | null;
  trackId: string;
  trackName: string;
  trackAccent: string;
  cohortName: string;
  enrolledAt: Date;
  isActive: boolean;
}

interface TrackOption {
  id: string;
  name: string;
  accent: string;
  cohortName: string;
  enrolledStudentIds: string[];
}

interface StudentOption {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  enrolledTrackIds: string[];
}

interface AdminEnrollmentsClientProps {
  enrollments: EnrollmentRecord[];
  tracks: TrackOption[];
  students: StudentOption[];
  admin: AdminUser;
}

export function AdminEnrollmentsClient({
  enrollments: initialEnrollments,
  tracks,
  students,
  admin,
}: AdminEnrollmentsClientProps) {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>(initialEnrollments);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrackFilter, setSelectedTrackFilter] = useState('all');

  // Single enroll modal
  const [isSingleOpen, setIsSingleOpen] = useState(false);
  const [singleStudentId, setSingleStudentId] = useState(students[0]?.id || '');
  const [singleTrackId, setSingleTrackId] = useState(tracks[0]?.id || '');
  const [isSingleSaving, setIsSingleSaving] = useState(false);
  const [singleError, setSingleError] = useState<string | null>(null);

  // Bulk enrollment panel state (Requirement 13)
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkTrackId, setBulkTrackId] = useState(tracks[0]?.id || '');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkSuccessMessage, setBulkSuccessMessage] = useState<string | null>(null);

  // Deactivate enrollment dialog
  const [deactivateTarget, setDeactivateTarget] = useState<EnrollmentRecord | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Filter students who are NOT already enrolled in bulkTrackId
  const currentBulkTrack = tracks.find((t) => t.id === bulkTrackId);
  const enrolledInBulkTrack = new Set(currentBulkTrack?.enrolledStudentIds || []);

  const handleSelectAllBulk = () => {
    const unEnrolled = students.filter((s) => !enrolledInBulkTrack.has(s.id)).map((s) => s.id);
    setSelectedStudentIds(unEnrolled);
  };

  const handleDeselectAllBulk = () => {
    setSelectedStudentIds([]);
  };

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSingleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSingleSaving(true);
    setSingleError(null);

    try {
      const res = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: singleStudentId,
          trackId: singleTrackId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to enroll student');

      setIsSingleOpen(false);
      router.refresh();
    } catch (err: any) {
      setSingleError(err.message || 'An error occurred.');
    } finally {
      setIsSingleSaving(false);
    }
  };

  const handleBulkEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0) {
      setBulkError('Please select at least one student to enroll.');
      return;
    }

    setIsBulkSaving(true);
    setBulkError(null);
    setBulkSuccessMessage(null);

    try {
      const res = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId: bulkTrackId,
          studentIds: selectedStudentIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete bulk enrollment');

      setBulkSuccessMessage(data.message || 'Bulk enrollment completed successfully!');
      setSelectedStudentIds([]);
      setTimeout(() => {
        setIsBulkOpen(false);
        setBulkSuccessMessage(null);
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setBulkError(err.message || 'An error occurred.');
    } finally {
      setIsBulkSaving(false);
    }
  };

  const handleToggleActive = async (record: EnrollmentRecord) => {
    setIsDeactivating(true);
    try {
      const res = await fetch(`/api/admin/enrollments/${record.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !record.isActive }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change enrollment status');

      setDeactivateTarget(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    } finally {
      setIsDeactivating(false);
    }
  };

  // Filter list
  const filteredEnrollments = enrollments.filter((e) => {
    if (selectedTrackFilter !== 'all' && e.trackId !== selectedTrackFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.studentName.toLowerCase().includes(q) ||
        e.studentEmail.toLowerCase().includes(q) ||
        e.trackName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0D0E11] text-[#FAF7EE] flex">
      <AdminSidebar
        currentTab="enrollments"
        admin={admin}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <AdminHeader
          title="Student Enrollments"
          subtitle="Track admissions, bulk enrollment checklist, and active rosters"
          admin={admin}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSingleOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/15 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#4285F4]" />
                <span>Single Enroll</span>
              </button>
              <button
                onClick={() => setIsBulkOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#EA4335] hover:bg-[#EA4335]/90 text-xs font-bold text-white shadow-lg shadow-[#EA4335]/20 transition-all"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Bulk Enrollment</span>
              </button>
            </div>
          }
        />

        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Controls: Search & Track Filter */}
          <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search student or track..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#4285F4]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-white/40 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                <span>Track:</span>
              </span>
              <select
                value={selectedTrackFilter}
                onChange={(e) => setSelectedTrackFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#4285F4]"
              >
                <option value="all" className="bg-[#0D0E11]">All Tracks</option>
                {tracks.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#0D0E11]">
                    {t.name} ({t.cohortName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Enrollments Table */}
          <div className="rounded-3xl bg-white/[0.02] border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-white/40 uppercase tracking-wider font-semibold text-[11px]">
                    <th className="py-4 px-6">Student</th>
                    <th className="py-4 px-4">Track & Cohort</th>
                    <th className="py-4 px-4">Enrolled Date</th>
                    <th className="py-4 px-4">Roster Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-white/40">
                        No enrollments found matching current criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredEnrollments.map((enr) => (
                      <tr key={enr.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9 border border-white/10">
                              <AvatarImage src={enr.studentAvatar || ''} alt={enr.studentName} />
                              <AvatarFallback className="bg-[#4285F4] text-white font-bold text-xs">
                                {enr.studentName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-white">{enr.studentName}</p>
                              <p className="text-[11px] text-white/40">{enr.studentEmail}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <span
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold"
                              style={{
                                backgroundColor: `${enr.trackAccent}20`,
                                color: enr.trackAccent,
                              }}
                            >
                              {enr.trackName}
                            </span>
                            <p className="text-[10px] text-white/40 font-mono">{enr.cohortName}</p>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-white/50 text-[11px] font-mono">
                          {format(new Date(enr.enrolledAt), 'MMM d, yyyy')}
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                              enr.isActive
                                ? 'bg-[#34A853]/20 text-[#34A853] border border-[#34A853]/30'
                                : 'bg-white/10 text-white/40 border border-white/10'
                            }`}
                          >
                            {enr.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setDeactivateTarget(enr)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              enr.isActive
                                ? 'text-white/40 hover:text-[#EA4335] hover:bg-[#EA4335]/10'
                                : 'text-white/40 hover:text-[#34A853] hover:bg-[#34A853]/10'
                            }`}
                            title={enr.isActive ? 'Deactivate Student Enrollment' : 'Reactivate Student Enrollment'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* SINGLE ENROLLMENT MODAL */}
      {isSingleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#0D0E11] border border-white/15 p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">Enroll Student</h3>
                <p className="text-xs text-white/50">Register an individual student into a curriculum track</p>
              </div>
              <button
                onClick={() => setIsSingleOpen(false)}
                className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {singleError && (
              <div className="p-3.5 rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/20 flex items-center gap-3 text-xs text-[#EA4335]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{singleError}</span>
              </div>
            )}

            <form onSubmit={handleSingleEnroll} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Select Student
                </label>
                <select
                  value={singleStudentId}
                  onChange={(e) => setSingleStudentId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#0D0E11]">
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Select Curriculum Track
                </label>
                <select
                  value={singleTrackId}
                  onChange={(e) => setSingleTrackId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                >
                  {tracks.map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#0D0E11]">
                      {t.name} • {t.cohortName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsSingleOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white/70 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSingleSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#EA4335] hover:bg-[#EA4335]/90 text-xs font-bold text-white disabled:opacity-50"
                >
                  {isSingleSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Enroll Student</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK ENROLLMENT MODAL (Requirement 13) */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-[#0D0E11] border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Bulk Student Enrollment</h3>
                  <p className="text-xs text-white/50">Select target track and check off multiple students to enroll</p>
                </div>
                <button
                  onClick={() => setIsBulkOpen(false)}
                  className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {bulkError && (
                <div className="p-3.5 rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/20 flex items-center gap-3 text-xs text-[#EA4335]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{bulkError}</span>
                </div>
              )}

              {bulkSuccessMessage && (
                <div className="p-3.5 rounded-2xl bg-[#34A853]/10 border border-[#34A853]/20 flex items-center gap-3 text-xs text-[#34A853]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{bulkSuccessMessage}</span>
                </div>
              )}

              {/* 1. Track Selector */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Choose Target Track <span className="text-[#EA4335]">*</span>
                </label>
                <select
                  value={bulkTrackId}
                  onChange={(e) => {
                    setBulkTrackId(e.target.value);
                    setSelectedStudentIds([]);
                  }}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                >
                  {tracks.map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#0D0E11]">
                      {t.name} ({t.cohortName})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Checklist Header */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-white/70">
                  Select Students ({selectedStudentIds.length} chosen)
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAllBulk}
                    className="text-[#4285F4] hover:underline"
                  >
                    Select Eligible
                  </button>
                  <span className="text-white/30">•</span>
                  <button
                    type="button"
                    onClick={handleDeselectAllBulk}
                    className="text-white/40 hover:text-white"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* 3. Students Checklist */}
              <div className="max-h-60 overflow-y-auto space-y-1.5 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                {students.map((student) => {
                  const isAlreadyEnrolled = enrolledInBulkTrack.has(student.id);
                  const isChecked = selectedStudentIds.includes(student.id);

                  return (
                    <label
                      key={student.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        isAlreadyEnrolled
                          ? 'opacity-40 bg-white/[0.01] border-transparent cursor-not-allowed'
                          : isChecked
                          ? 'bg-[#4285F4]/15 border-[#4285F4]/40 cursor-pointer'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/15 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          disabled={isAlreadyEnrolled}
                          checked={isChecked || isAlreadyEnrolled}
                          onChange={() => !isAlreadyEnrolled && toggleStudentSelection(student.id)}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#4285F4] focus:ring-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{student.name}</p>
                          <p className="text-[10px] text-white/40">{student.email}</p>
                        </div>
                      </div>
                      {isAlreadyEnrolled && (
                        <span className="text-[10px] font-mono text-white/50">Already Enrolled</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsBulkOpen(false)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white/70 hover:text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkEnroll}
                disabled={isBulkSaving || selectedStudentIds.length === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#EA4335] hover:bg-[#EA4335]/90 text-xs font-bold text-white disabled:opacity-50 transition-all"
              >
                {isBulkSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Enroll Selected ({selectedStudentIds.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEACTIVATE CONFIRMATION DIALOG */}
      {deactivateTarget && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={() => handleToggleActive(deactivateTarget)}
          title={deactivateTarget.isActive ? 'Deactivate Enrollment?' : 'Reactivate Enrollment?'}
          description={
            deactivateTarget.isActive
              ? `Deactivating ${deactivateTarget.studentName}'s enrollment in ${deactivateTarget.trackName} preserves their assignment submissions and past attendance while removing them from active track rosters.`
              : `Reactivating ${deactivateTarget.studentName}'s enrollment restores active access to ${deactivateTarget.trackName}.`
          }
          confirmText={deactivateTarget.isActive ? 'Deactivate' : 'Reactivate'}
          isDestructive={deactivateTarget.isActive}
          isLoading={isDeactivating}
        />
      )}
    </div>
  );
}
