'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Award,
  Plus,
  Calendar,
  Layers,
  Users,
  Edit2,
  Power,
  ChevronRight,
  Sparkles,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { AdminSidebar, AdminUser } from '../AdminSidebar';
import { AdminHeader } from '../AdminHeader';
import { ConfirmDialog } from '@/components/mentor/ConfirmDialog';
import { format } from '@/lib/date';

interface BootcampItem {
  id: string;
  name: string;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  cohortCount: number;
  trackCount: number;
  studentCount: number;
  mentorCount: number;
  cohorts: {
    id: string;
    name: string;
    isActive: boolean;
    startDate: Date;
    endDate: Date | null;
    trackCount: number;
  }[];
}

interface AdminBootcampsClientProps {
  bootcamps: BootcampItem[];
  admin: AdminUser;
}

export function AdminBootcampsClient({ bootcamps: initialBootcamps, admin }: AdminBootcampsClientProps) {
  const router = useRouter();
  const [bootcamps, setBootcamps] = useState<BootcampItem[]>(initialBootcamps);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBootcamp, setEditingBootcamp] = useState<BootcampItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Deactivate confirmation
  const [deactivateTarget, setDeactivateTarget] = useState<BootcampItem | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      isActive: true,
    });
    setFormError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditModal = (bootcamp: BootcampItem) => {
    setEditingBootcamp(bootcamp);
    setFormData({
      name: bootcamp.name,
      description: bootcamp.description || '',
      startDate: bootcamp.startDate ? format(new Date(bootcamp.startDate), 'yyyy-MM-dd') : '',
      endDate: bootcamp.endDate ? format(new Date(bootcamp.endDate), 'yyyy-MM-dd') : '',
      isActive: bootcamp.isActive,
    });
    setFormError(null);
  };

  const handleSaveBootcamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Bootcamp name is required.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const url = editingBootcamp
        ? `/api/admin/bootcamps/${editingBootcamp.id}`
        : '/api/admin/bootcamps';
      const method = editingBootcamp ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save bootcamp');
      }

      setIsCreateOpen(false);
      setEditingBootcamp(null);
      resetForm();
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (bootcamp: BootcampItem) => {
    setIsDeactivating(true);
    try {
      const res = await fetch(`/api/admin/bootcamps/${bootcamp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !bootcamp.isActive }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }
      setDeactivateTarget(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to change bootcamp status');
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gdg-black text-gdg-cream flex">
      <AdminSidebar
        currentTab="bootcamps"
        admin={admin}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Bootcamp Programs"
          subtitle="Manage master learning programs and editions"
          admin={admin}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          actions={
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gdg-red hover:bg-gdg-red/90 text-xs font-bold text-white shadow-lg shadow-gdg-red/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Bootcamp</span>
            </button>
          }
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto">
          {/* Header Summary */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white">Programs Directory</h2>
              <p className="text-xs text-white/50">
                Top-level bootcamp containers containing cohorts, tracks, and student cohorts.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70">
                Total: <strong className="text-white">{bootcamps.length}</strong>
              </span>
              <span className="px-3 py-1 rounded-xl bg-gdg-green/10 border border-gdg-green/20 text-xs text-gdg-green">
                Active: <strong className="text-gdg-green">{bootcamps.filter((b) => b.isActive).length}</strong>
              </span>
            </div>
          </div>

          {/* Bootcamps Grid */}
          {bootcamps.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-dashed border-white/15 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gdg-red/10 text-gdg-red flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No bootcamps created yet</h3>
                <p className="text-xs text-white/50 max-w-md mx-auto mt-1">
                  Create your first master bootcamp program to begin setting up cohorts, tracks, and student enrollments.
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gdg-red text-xs font-bold text-white hover:bg-gdg-red/90"
              >
                <Plus className="w-4 h-4" />
                <span>Create Bootcamp</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bootcamps.map((bootcamp) => (
                <div
                  key={bootcamp.id}
                  className="group relative p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            bootcamp.isActive ? 'bg-gdg-green' : 'bg-white/30'
                          }`}
                        />
                        <span className="text-xs font-mono uppercase tracking-wider text-white/50">
                          {bootcamp.isActive ? 'Active Program' : 'Archived / Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(bootcamp)}
                          className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                          title="Edit Bootcamp"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeactivateTarget(bootcamp)}
                          className={`p-2 rounded-xl transition-colors ${
                            bootcamp.isActive
                              ? 'text-white/50 hover:text-gdg-red hover:bg-gdg-red/10'
                              : 'text-white/50 hover:text-gdg-green hover:bg-gdg-green/10'
                          }`}
                          title={bootcamp.isActive ? 'Deactivate Bootcamp' : 'Activate Bootcamp'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <Link
                        href={`/admin/bootcamps/${bootcamp.id}`}
                        className="text-lg font-black text-white hover:text-gdg-blue transition-colors leading-tight inline-block"
                      >
                        {bootcamp.name}
                      </Link>
                      {bootcamp.description && (
                        <p className="text-xs text-white/60 line-clamp-2 mt-1">
                          {bootcamp.description}
                        </p>
                      )}
                    </div>

                    {bootcamp.startDate && (
                      <div className="flex items-center gap-2 text-xs text-white/50 pt-1">
                        <Calendar className="w-3.5 h-3.5 text-gdg-yellow" />
                        <span>
                          {format(new Date(bootcamp.startDate), 'MMM yyyy')}
                          {bootcamp.endDate && ` - ${format(new Date(bootcamp.endDate), 'MMM yyyy')}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Summary Stats & CTA */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <span className="block font-black text-white text-sm">
                          {bootcamp.cohortCount}
                        </span>
                        <span className="text-[10px] text-white/40">Cohorts</span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <span className="block font-black text-white text-sm">
                          {bootcamp.trackCount}
                        </span>
                        <span className="text-[10px] text-white/40">Tracks</span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <span className="block font-black text-white text-sm">
                          {bootcamp.studentCount}
                        </span>
                        <span className="text-[10px] text-white/40">Students</span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <span className="block font-black text-white text-sm">
                          {bootcamp.mentorCount}
                        </span>
                        <span className="text-[10px] text-white/40">Mentors</span>
                      </div>
                    </div>

                    <Link
                      href={`/admin/bootcamps/${bootcamp.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/10 transition-colors"
                    >
                      <span>Explore Bootcamp Details</span>
                      <ChevronRight className="w-4 h-4 text-white/40" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create / Edit Bootcamp Modal */}
      {(isCreateOpen || editingBootcamp) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-gdg-black border border-white/15 p-5 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">
                  {editingBootcamp ? 'Edit Bootcamp Program' : 'Create New Bootcamp'}
                </h3>
                <p className="text-xs text-white/50">
                  {editingBootcamp
                    ? 'Update metadata and program schedules'
                    : 'Add a new master training edition to the platform'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingBootcamp(null);
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

            <form onSubmit={handleSaveBootcamp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Bootcamp Name <span className="text-gdg-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GDG LASU Tech Accelerator 2026"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gdg-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Overview of this bootcamp edition, goals, and focus tracks..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gdg-blue resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
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
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-gdg-blue focus:ring-0"
                />
                <label htmlFor="isActive" className="text-xs font-medium text-white/80 cursor-pointer">
                  Active (enables cohort creation and student viewing)
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingBootcamp(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-2xl text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 transition-colors text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gdg-red hover:bg-gdg-red/90 text-xs font-bold text-white transition-all disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingBootcamp ? 'Save Changes' : 'Create Bootcamp'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate/Activate Confirmation Dialog */}
      {deactivateTarget && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={() => handleToggleActive(deactivateTarget)}
          title={deactivateTarget.isActive ? 'Deactivate Bootcamp?' : 'Activate Bootcamp?'}
          description={
            deactivateTarget.isActive
              ? `Deactivating "${deactivateTarget.name}" preserves all student cohorts, tracks, and progress while archiving it from active rosters.`
              : `Activating "${deactivateTarget.name}" makes it active again for students, mentors, and administrators.`
          }
          confirmText={deactivateTarget.isActive ? 'Deactivate' : 'Activate'}
          isDestructive={deactivateTarget.isActive}
          isLoading={isDeactivating}
        />
      )}
    </div>
  );
}
