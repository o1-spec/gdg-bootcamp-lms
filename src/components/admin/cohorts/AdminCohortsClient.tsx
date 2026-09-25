'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarRange,
  Plus,
  Calendar,
  Layers,
  Users,
  ShieldCheck,
  Edit2,
  Power,
  ChevronRight,
  X,
  Loader2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { AdminSidebar, AdminUser } from '../AdminSidebar';
import { AdminHeader } from '../AdminHeader';
import { ConfirmDialog } from '@/components/mentor/ConfirmDialog';
import { format } from '@/lib/date';

interface CohortItem {
  id: string;
  name: string;
  bootcampId: string;
  bootcampName: string;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  trackCount: number;
  studentCount: number;
  mentorCount: number;
  tracks: {
    id: string;
    name: string;
    slug: string;
    accent: string;
    studentCount: number;
  }[];
}

interface BootcampSimple {
  id: string;
  name: string;
  isActive: boolean;
}

interface AdminCohortsClientProps {
  cohorts: CohortItem[];
  bootcamps: BootcampSimple[];
  admin: AdminUser;
}

export function AdminCohortsClient({
  cohorts: initialCohorts,
  bootcamps,
  admin,
}: AdminCohortsClientProps) {
  const router = useRouter();
  const [cohorts, setCohorts] = useState<CohortItem[]>(initialCohorts);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Filters
  const [selectedBootcampFilter, setSelectedBootcampFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState<CohortItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    bootcampId: bootcamps[0]?.id || '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    isActive: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Deactivate dialog
  const [deactivateTarget, setDeactivateTarget] = useState<CohortItem | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      bootcampId: bootcamps[0]?.id || '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      isActive: true,
    });
    setFormError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditModal = (cohort: CohortItem) => {
    setEditingCohort(cohort);
    setFormData({
      name: cohort.name,
      bootcampId: cohort.bootcampId,
      startDate: format(new Date(cohort.startDate), 'yyyy-MM-dd'),
      endDate: cohort.endDate ? format(new Date(cohort.endDate), 'yyyy-MM-dd') : '',
      isActive: cohort.isActive,
    });
    setFormError(null);
  };

  const handleSaveCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Cohort name is required.');
      return;
    }
    if (!formData.bootcampId) {
      setFormError('Please select a parent bootcamp.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const url = editingCohort
        ? `/api/admin/cohorts/${editingCohort.id}`
        : '/api/admin/cohorts';
      const method = editingCohort ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save cohort');
      }

      setIsCreateOpen(false);
      setEditingCohort(null);
      resetForm();
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (cohort: CohortItem) => {
    setIsDeactivating(true);
    try {
      const res = await fetch(`/api/admin/cohorts/${cohort.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !cohort.isActive }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update cohort status');
      }
      setDeactivateTarget(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update cohort status');
    } finally {
      setIsDeactivating(false);
    }
  };

  const filteredCohorts = cohorts.filter((cohort) => {
    if (selectedBootcampFilter !== 'all' && cohort.bootcampId !== selectedBootcampFilter) {
      return false;
    }
    if (statusFilter === 'active' && !cohort.isActive) return false;
    if (statusFilter === 'inactive' && cohort.isActive) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gdg-black text-gdg-cream flex">
      <AdminSidebar
        currentTab="cohorts"
        admin={admin}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Cohorts Management"
          subtitle="Manage student batches, tracks, schedules, and active learning cycles"
          admin={admin}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          actions={
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gdg-red hover:bg-gdg-red/90 text-xs font-bold text-white shadow-lg shadow-gdg-red/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Cohort</span>
            </button>
          }
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Filter Bar */}
          <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-white/40 flex items-center gap-1.5 px-1">
                <Filter className="w-3.5 h-3.5 shrink-0" />
                <span>Filter:</span>
              </span>
              <select
                value={selectedBootcampFilter}
                onChange={(e) => setSelectedBootcampFilter(e.target.value)}
                className="flex-1 sm:flex-initial min-w-[130px] px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-gdg-blue"
              >
                <option value="all" className="bg-gdg-black">All Bootcamps</option>
                {bootcamps.map((b) => (
                  <option key={b.id} value={b.id} className="bg-gdg-black">
                    {b.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-gdg-blue"
              >
                <option value="all" className="bg-gdg-black">All Statuses</option>
                <option value="active" className="bg-gdg-black">Active Only</option>
                <option value="inactive" className="bg-gdg-black">Archived / Inactive</option>
              </select>
            </div>

            <div className="text-xs text-white/50 text-right sm:text-left">
              Showing <strong className="text-white">{filteredCohorts.length}</strong> of{' '}
              {cohorts.length} cohorts
            </div>
          </div>

          {/* Cohorts Grid */}
          {filteredCohorts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-dashed border-white/15 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gdg-yellow/10 text-gdg-yellow flex items-center justify-center mx-auto">
                <CalendarRange className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No cohorts found</h3>
                <p className="text-xs text-white/50 max-w-md mx-auto mt-1">
                  There are no cohorts matching the current filter criteria or created yet.
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gdg-red text-xs font-bold text-white hover:bg-gdg-red/90"
              >
                <Plus className="w-4 h-4" />
                <span>Create Cohort</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCohorts.map((cohort) => (
                <div
                  key={cohort.id}
                  className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            cohort.isActive ? 'bg-gdg-green' : 'bg-white/30'
                          }`}
                        />
                        <span className="text-xs font-mono uppercase text-white/50">
                          {cohort.isActive ? 'Active Cohort' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(cohort)}
                          className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                          title="Edit Cohort"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeactivateTarget(cohort)}
                          className={`p-2 rounded-xl transition-colors ${
                            cohort.isActive
                              ? 'text-white/50 hover:text-gdg-red hover:bg-gdg-red/10'
                              : 'text-white/50 hover:text-gdg-green hover:bg-gdg-green/10'
                          }`}
                          title={cohort.isActive ? 'Deactivate Cohort' : 'Activate Cohort'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-mono text-gdg-yellow uppercase font-semibold">
                        {cohort.bootcampName}
                      </div>
                      <Link
                        href={`/admin/cohorts/${cohort.id}`}
                        className="text-lg font-black text-white hover:text-gdg-blue transition-colors leading-tight inline-block mt-0.5"
                      >
                        {cohort.name}
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Calendar className="w-3.5 h-3.5 text-gdg-yellow" />
                      <span>
                        {format(new Date(cohort.startDate), 'MMM d, yyyy')}
                        {cohort.endDate && ` - ${format(new Date(cohort.endDate), 'MMM d, yyyy')}`}
                      </span>
                    </div>

                    {/* Tracks Badges */}
                    {cohort.tracks.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {cohort.tracks.map((t) => (
                          <span
                            key={t.id}
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium"
                            style={{
                              backgroundColor: `${t.accent}20`,
                              color: t.accent,
                            }}
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cohort Stats & Navigation */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <span className="block font-black text-white text-sm">
                          {cohort.trackCount}
                        </span>
                        <span className="text-[10px] text-white/40">Tracks</span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <span className="block font-black text-white text-sm">
                          {cohort.studentCount}
                        </span>
                        <span className="text-[10px] text-white/40">Students</span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <span className="block font-black text-white text-sm">
                          {cohort.mentorCount}
                        </span>
                        <span className="text-[10px] text-white/40">Mentors</span>
                      </div>
                    </div>

                    <Link
                      href={`/admin/cohorts/${cohort.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/10 transition-colors"
                    >
                      <span>Cohort Command Center</span>
                      <ChevronRight className="w-4 h-4 text-white/40" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create / Edit Cohort Modal */}
      {(isCreateOpen || editingCohort) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-gdg-black border border-white/15 p-5 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">
                  {editingCohort ? 'Edit Cohort' : 'Create New Cohort'}
                </h3>
                <p className="text-xs text-white/50">
                  {editingCohort
                    ? 'Update cohort metadata and dates'
                    : 'Add a new cohort batch to a master bootcamp'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingCohort(null);
                }}
                className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-2xl bg-gdg-red/10 border border-gdg-red/20 flex items-center gap-3 text-xs text-gdg-red">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCohort} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Parent Bootcamp Program <span className="text-gdg-red">*</span>
                </label>
                <select
                  required
                  value={formData.bootcampId}
                  onChange={(e) => setFormData({ ...formData, bootcampId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-gdg-blue"
                >
                  {bootcamps.map((b) => (
                    <option key={b.id} value={b.id} className="bg-gdg-black">
                      {b.name} {!b.isActive ? '(Archived)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Cohort Name <span className="text-gdg-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cohort 1.0 (Alpha)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-gdg-blue"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Start Date <span className="text-gdg-red">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-gdg-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-gdg-blue"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="cohortActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-gdg-blue focus:ring-0"
                />
                <label htmlFor="cohortActive" className="text-xs font-medium text-white/80 cursor-pointer">
                  Cohort is active for learning and attendance
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingCohort(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-2xl text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gdg-red hover:bg-gdg-red/90 text-xs font-bold text-white disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCohort ? 'Save Changes' : 'Create Cohort'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivation Dialog */}
      {deactivateTarget && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={() => handleToggleActive(deactivateTarget)}
          title={deactivateTarget.isActive ? 'Deactivate Cohort?' : 'Activate Cohort?'}
          description={
            deactivateTarget.isActive
              ? `Deactivating "${deactivateTarget.name}" keeps all student enrollments, submissions, and session attendance records safe while marking the cohort inactive.`
              : `Activating "${deactivateTarget.name}" restores the cohort to active rosters.`
          }
          confirmText={deactivateTarget.isActive ? 'Deactivate' : 'Activate'}
          isDestructive={deactivateTarget.isActive}
          isLoading={isDeactivating}
        />
      )}
    </div>
  );
}
