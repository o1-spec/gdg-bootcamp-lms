'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Award,
  CalendarRange,
  Layers,
  Users,
  ShieldCheck,
  Calendar,
  ArrowLeft,
  Plus,
  Edit2,
  ChevronRight,
  X,
  Loader2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { AdminSidebar, AdminUser } from '../AdminSidebar';
import { AdminHeader } from '../AdminHeader';
import { format } from '@/lib/date';

interface BootcampDetailProps {
  bootcamp: any;
  admin: AdminUser;
}

export function AdminBootcampDetailClient({ bootcamp, admin }: BootcampDetailProps) {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Edit bootcamp modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: bootcamp.name,
    description: bootcamp.description || '',
    startDate: bootcamp.startDate ? format(new Date(bootcamp.startDate), 'yyyy-MM-dd') : '',
    endDate: bootcamp.endDate ? format(new Date(bootcamp.endDate), 'yyyy-MM-dd') : '',
    isActive: bootcamp.isActive,
  });
  const [isSavingBootcamp, setIsSavingBootcamp] = useState(false);
  const [bootcampError, setBootcampError] = useState<string | null>(null);

  // Create cohort modal state
  const [isCreateCohortOpen, setIsCreateCohortOpen] = useState(false);
  const [cohortFormData, setCohortFormData] = useState({
    name: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    isActive: true,
  });
  const [isSavingCohort, setIsSavingCohort] = useState(false);
  const [cohortError, setCohortError] = useState<string | null>(null);

  const handleUpdateBootcamp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBootcamp(true);
    setBootcampError(null);

    try {
      const res = await fetch(`/api/admin/bootcamps/${bootcamp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update bootcamp');

      setIsEditOpen(false);
      router.refresh();
    } catch (err: any) {
      setBootcampError(err.message || 'An error occurred.');
    } finally {
      setIsSavingBootcamp(false);
    }
  };

  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cohortFormData.name.trim()) {
      setCohortError('Cohort name is required.');
      return;
    }

    setIsSavingCohort(true);
    setCohortError(null);

    try {
      const res = await fetch('/api/admin/cohorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bootcampId: bootcamp.id,
          ...cohortFormData,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create cohort');

      setIsCreateCohortOpen(false);
      setCohortFormData({
        name: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: '',
        isActive: true,
      });
      router.refresh();
    } catch (err: any) {
      setCohortError(err.message || 'An error occurred.');
    } finally {
      setIsSavingCohort(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0E11] text-[#FAF7EE] flex">
      <AdminSidebar
        currentTab="bootcamps"
        admin={admin}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <AdminHeader
          title={bootcamp.name}
          subtitle="Program Details, Cohorts & Metrics"
          admin={admin}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/15 transition-all"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#FBBC04]" />
                <span>Edit Bootcamp</span>
              </button>
              <button
                onClick={() => setIsCreateCohortOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#EA4335] hover:bg-[#EA4335]/90 text-xs font-bold text-white shadow-lg shadow-[#EA4335]/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Cohort</span>
              </button>
            </div>
          }
        />

        <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* Back button */}
          <Link
            href="/admin/bootcamps"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Bootcamps</span>
          </Link>

          {/* Program Overview Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      bootcamp.isActive ? 'bg-[#34A853]' : 'bg-white/30'
                    }`}
                  />
                  <span className="text-xs uppercase font-mono tracking-wider text-white/50">
                    {bootcamp.isActive ? 'Active Master Program' : 'Archived Program'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">{bootcamp.name}</h2>
                {bootcamp.description && (
                  <p className="text-sm text-white/60 max-w-2xl">{bootcamp.description}</p>
                )}
              </div>

              {bootcamp.startDate && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs space-y-1 sm:text-right shrink-0">
                  <span className="text-white/40 block">Program Duration</span>
                  <div className="flex items-center sm:justify-end gap-1.5 font-mono text-white font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-[#FBBC04]" />
                    <span>
                      {format(new Date(bootcamp.startDate), 'MMM yyyy')}
                      {bootcamp.endDate && ` - ${format(new Date(bootcamp.endDate), 'MMM yyyy')}`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/5">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
                  <CalendarRange className="w-4 h-4 text-[#FBBC04]" />
                  <span>Cohorts</span>
                </div>
                <span className="text-2xl font-black text-white">{bootcamp.cohortCount}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
                  <Layers className="w-4 h-4 text-[#4285F4]" />
                  <span>Tracks</span>
                </div>
                <span className="text-2xl font-black text-white">{bootcamp.trackCount}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
                  <Users className="w-4 h-4 text-[#34A853]" />
                  <span>Students</span>
                </div>
                <span className="text-2xl font-black text-white">{bootcamp.studentCount}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#EA4335]" />
                  <span>Mentors</span>
                </div>
                <span className="text-2xl font-black text-white">{bootcamp.mentorCount}</span>
              </div>
            </div>
          </div>

          {/* Cohorts Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Cohorts in Program</h3>
                <p className="text-xs text-white/50">Manage running cohorts, tracks and student bodies</p>
              </div>
              <button
                onClick={() => setIsCreateCohortOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white"
              >
                <Plus className="w-3.5 h-3.5 text-[#EA4335]" />
                <span>Add Cohort</span>
              </button>
            </div>

            {bootcamp.cohorts.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-dashed border-white/10 space-y-3">
                <p className="text-xs text-white/40">No cohorts have been created in this bootcamp yet.</p>
                <button
                  onClick={() => setIsCreateCohortOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#EA4335] text-xs font-bold text-white"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Cohort</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bootcamp.cohorts.map((cohort: any) => (
                  <div
                    key={cohort.id}
                    className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all space-y-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            cohort.isActive ? 'bg-[#34A853]' : 'bg-white/30'
                          }`}
                        />
                        <h4 className="font-bold text-base text-white">{cohort.name}</h4>
                      </div>
                      <span className="text-xs text-white/40 font-mono">
                        {format(new Date(cohort.startDate), 'MMM d, yyyy')}
                      </span>
                    </div>

                    {/* Tracks Pill List */}
                    <div className="space-y-2">
                      <span className="text-[11px] uppercase tracking-wider text-white/40 font-semibold block">
                        Curriculum Tracks ({cohort.tracks.length})
                      </span>
                      {cohort.tracks.length === 0 ? (
                        <p className="text-xs text-white/40 italic">No tracks created in this cohort.</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {cohort.tracks.map((t: any) => (
                            <Link
                              key={t.id}
                              href={`/admin/tracks/${t.id}`}
                              className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.05] transition-all flex items-center justify-between gap-3 text-xs"
                              style={{ borderLeftColor: t.accent || '#4285F4', borderLeftWidth: '3px' }}
                            >
                              <span className="font-bold text-white">{t.name}</span>
                              <div className="flex items-center gap-3 text-white/50 text-[11px]">
                                <span>{t.studentCount} students</span>
                                <span>•</span>
                                <span>{t.mentorCount} mentors</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/admin/cohorts/${cohort.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/10 transition-colors"
                    >
                      <span>Manage Cohort</span>
                      <ChevronRight className="w-4 h-4 text-white/40" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Edit Bootcamp Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#0D0E11] border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">Edit Bootcamp Program</h3>
                <p className="text-xs text-white/50">Update program parameters and dates</p>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bootcampError && (
              <div className="p-3.5 rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/20 flex items-center gap-3 text-xs text-[#EA4335]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bootcampError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateBootcamp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Bootcamp Name <span className="text-[#EA4335]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.startDate}
                    onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.endDate}
                    onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editFormData.isActive}
                  onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#4285F4] focus:ring-0"
                />
                <label htmlFor="editIsActive" className="text-xs font-medium text-white/80 cursor-pointer">
                  Active Program Status
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white/70 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingBootcamp}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#EA4335] hover:bg-[#EA4335]/90 text-xs font-bold text-white disabled:opacity-50"
                >
                  {isSavingBootcamp && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Cohort Modal */}
      {isCreateCohortOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#0D0E11] border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">Create New Cohort</h3>
                <p className="text-xs text-white/50">Add a student cohort under {bootcamp.name}</p>
              </div>
              <button
                onClick={() => setIsCreateCohortOpen(false)}
                className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cohortError && (
              <div className="p-3.5 rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/20 flex items-center gap-3 text-xs text-[#EA4335]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cohortError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCohort} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Cohort Name <span className="text-[#EA4335]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cohort 2.0 (Beta)"
                  value={cohortFormData.name}
                  onChange={(e) => setCohortFormData({ ...cohortFormData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Start Date <span className="text-[#EA4335]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={cohortFormData.startDate}
                    onChange={(e) => setCohortFormData({ ...cohortFormData, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={cohortFormData.endDate}
                    onChange={(e) => setCohortFormData({ ...cohortFormData, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="cohortIsActive"
                  checked={cohortFormData.isActive}
                  onChange={(e) => setCohortFormData({ ...cohortFormData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#4285F4] focus:ring-0"
                />
                <label htmlFor="cohortIsActive" className="text-xs font-medium text-white/80 cursor-pointer">
                  Activate cohort immediately
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateCohortOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white/70 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCohort}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#EA4335] hover:bg-[#EA4335]/90 text-xs font-bold text-white disabled:opacity-50"
                >
                  {isSavingCohort && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Cohort</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
