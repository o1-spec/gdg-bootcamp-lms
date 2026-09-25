'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Plus,
  Edit2,
  Users,
  ShieldCheck,
  BookOpen,
  CalendarRange,
  ChevronRight,
  Filter,
  X,
  Loader2,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { AdminSidebar, AdminUser } from '../AdminSidebar';
import { AdminHeader } from '../AdminHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TrackItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  accent: string;
  cohortId: string;
  cohortName: string;
  bootcampName: string;
  studentCount: number;
  mentorCount: number;
  moduleCount: number;
  lessonCount: number;
  assignmentCount: number;
  sessionCount: number;
  mentors: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  }[];
}

interface CohortSimple {
  id: string;
  name: string;
  bootcamp: { name: string };
}

interface AdminTracksClientProps {
  tracks: TrackItem[];
  cohorts: CohortSimple[];
  admin: AdminUser;
}

export function AdminTracksClient({
  tracks: initialTracks,
  cohorts,
  admin,
}: AdminTracksClientProps) {
  const router = useRouter();
  const [tracks, setTracks] = useState<TrackItem[]>(initialTracks);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedCohortFilter, setSelectedCohortFilter] = useState<string>('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<TrackItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    cohortId: cohorts[0]?.id || '',
    name: '',
    slug: '',
    description: '',
    accent: '#4285F4',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData({ ...formData, name, slug });
  };

  const openCreateModal = () => {
    setFormData({
      cohortId: cohorts[0]?.id || '',
      name: '',
      slug: '',
      description: '',
      accent: '#4285F4',
    });
    setFormError(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (track: TrackItem) => {
    setEditingTrack(track);
    setFormData({
      cohortId: track.cohortId,
      name: track.name,
      slug: track.slug,
      description: track.description || '',
      accent: track.accent || '#4285F4',
    });
    setFormError(null);
  };

  const handleSaveTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Track name is required.');
      return;
    }
    if (!formData.slug.trim()) {
      setFormError('Slug is required.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const url = editingTrack
        ? `/api/admin/tracks/${editingTrack.id}`
        : '/api/admin/tracks';
      const method = editingTrack ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save track');
      }

      setIsCreateOpen(false);
      setEditingTrack(null);
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTracks = tracks.filter((track) => {
    if (selectedCohortFilter !== 'all' && track.cohortId !== selectedCohortFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gdg-black text-gdg-cream flex">
      <AdminSidebar
        currentTab="tracks"
        admin={admin}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Curriculum Tracks"
          subtitle="Manage all specialized engineering and product tracks across cohorts"
          admin={admin}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          actions={
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gdg-red hover:bg-gdg-red/90 text-xs font-bold text-white shadow-lg shadow-gdg-red/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Track</span>
            </button>
          }
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Filter Bar */}
          <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-white/40 flex items-center gap-1.5 px-1 shrink-0">
                <Filter className="w-3.5 h-3.5 shrink-0" />
                <span>Cohort:</span>
              </span>
              <select
                value={selectedCohortFilter}
                onChange={(e) => setSelectedCohortFilter(e.target.value)}
                className="flex-1 sm:flex-initial min-w-[140px] px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-gdg-blue"
              >
                <option value="all" className="bg-gdg-black">All Cohorts</option>
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id} className="bg-gdg-black">
                    {c.name} ({c.bootcamp.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-white/50 text-right sm:text-left">
              Showing <strong className="text-white">{filteredTracks.length}</strong> of{' '}
              {tracks.length} tracks
            </div>
          </div>

          {/* Tracks Grid */}
          {filteredTracks.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-dashed border-white/15 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gdg-blue/10 text-gdg-blue flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No tracks found</h3>
                <p className="text-xs text-white/50 max-w-md mx-auto mt-1">
                  Create a new curriculum track under an active cohort to start assembling modules.
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gdg-red text-xs font-bold text-white hover:bg-gdg-red/90"
              >
                <Plus className="w-4 h-4" />
                <span>Create Track</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTracks.map((track) => (
                <div
                  key={track.id}
                  className="group relative p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between space-y-6"
                  style={{ borderTopColor: track.accent, borderTopWidth: '4px' }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-mono text-white/40 uppercase">
                        {track.cohortName}
                      </span>
                      <button
                        onClick={() => openEditModal(track)}
                        className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                        title="Edit Track"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <Link
                        href={`/admin/tracks/${track.id}`}
                        className="text-lg font-black text-white hover:text-gdg-blue transition-colors leading-tight inline-block"
                      >
                        {track.name}
                      </Link>
                      <p className="text-[11px] font-mono text-white/40 mt-0.5">/{track.slug}</p>
                      {track.description && (
                        <p className="text-xs text-white/60 line-clamp-2 mt-2">{track.description}</p>
                      )}
                    </div>

                    {/* Mentors Avatar Stack */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <span className="text-[11px] text-white/40 font-medium">Mentors:</span>
                      {track.mentors.length === 0 ? (
                        <span className="text-[11px] text-white/30 italic">None assigned</span>
                      ) : (
                        <div className="flex items-center -space-x-2">
                          {track.mentors.map((m) => (
                            <Avatar key={m.id} className="w-6 h-6 border border-gdg-black">
                              <AvatarImage src={m.avatar || ''} alt={m.name} />
                              <AvatarFallback className="bg-gdg-yellow text-black font-bold text-[9px]">
                                {m.name[0]}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid & Action */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-white/[0.02]">
                        <span className="block font-black text-white">{track.studentCount}</span>
                        <span className="text-[9px] text-white/40">Students</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.02]">
                        <span className="block font-black text-white">{track.moduleCount}</span>
                        <span className="text-[9px] text-white/40">Modules</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.02]">
                        <span className="block font-black text-white">{track.lessonCount}</span>
                        <span className="text-[9px] text-white/40">Lessons</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.02]">
                        <span className="block font-black text-white">{track.assignmentCount}</span>
                        <span className="text-[9px] text-white/40">Tasks</span>
                      </div>
                    </div>

                    <Link
                      href={`/admin/tracks/${track.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/10 transition-colors"
                    >
                      <span>Command Center & Curriculum</span>
                      <ChevronRight className="w-4 h-4 text-white/40" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create / Edit Track Modal */}
      {(isCreateOpen || editingTrack) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-gdg-black border border-white/15 p-5 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">
                  {editingTrack ? 'Edit Track Metadata' : 'Create New Track'}
                </h3>
                <p className="text-xs text-white/50">
                  {editingTrack
                    ? 'Update track properties, accent color, and cohort'
                    : 'Add a new curriculum track to a cohort'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingTrack(null);
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

            <form onSubmit={handleSaveTrack} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Cohort <span className="text-gdg-red">*</span>
                </label>
                <select
                  required
                  value={formData.cohortId}
                  onChange={(e) => setFormData({ ...formData, cohortId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-gdg-blue"
                >
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id} className="bg-gdg-black">
                      {c.name} ({c.bootcamp.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Track Name <span className="text-gdg-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence & ML"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-gdg-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Slug / URL Identifier <span className="text-gdg-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ai-ml"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-mono text-white focus:outline-none focus:border-gdg-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-gdg-blue resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Accent Color
                </label>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {['#4285F4', '#34A853', '#FBBC04', '#EA4335', '#A142F4', '#24C1E0'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, accent: color })}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        formData.accent === color ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="text"
                    value={formData.accent}
                    onChange={(e) => setFormData({ ...formData, accent: e.target.value })}
                    className="w-24 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingTrack(null);
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
                  <span>{editingTrack ? 'Save Changes' : 'Create Track'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
