'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Megaphone,
  Plus,
  Filter,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Calendar,
  Layers,
  Sparkles,
  Send,
} from 'lucide-react';
import { AdminSidebar, AdminUser } from '../AdminSidebar';
import { AdminHeader } from '../AdminHeader';
import { ConfirmDialog } from '@/components/mentor/ConfirmDialog';
import { AnnouncementPriority, Role } from '@prisma/client';
import { format } from '@/lib/date';
import { cn } from '@/lib/utils';

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  trackId: string | null;
  trackName: string | null;
  trackAccent: string | null;
  authorName: string;
  authorEmail: string;
  authorRole: Role;
  createdAt: Date;
}

interface TrackSimple {
  id: string;
  name: string;
  slug: string;
  accent: string | null;
}

interface AdminAnnouncementsClientProps {
  announcements: AnnouncementItem[];
  tracks: TrackSimple[];
  admin: AdminUser;
}

export function AdminAnnouncementsClient({
  announcements: initialAnnouncements,
  tracks,
  admin,
}: AdminAnnouncementsClientProps) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Filters
  const [trackFilter, setTrackFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: AnnouncementPriority.NORMAL,
    trackId: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (!formData.content.trim()) {
      setFormError('Content is required.');
      return;
    }

    setIsCreating(true);
    setFormError(null);

    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          priority: formData.priority,
          trackId: formData.trackId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create announcement');

      setIsCreateOpen(false);
      setFormData({
        title: '',
        content: '',
        priority: AnnouncementPriority.NORMAL,
        trackId: '',
      });
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/announcements/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete announcement');

      setDeleteTarget(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete announcement');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAnnouncements = announcements.filter((ann) => {
    if (trackFilter === 'general' && ann.trackId !== null) return false;
    if (trackFilter !== 'all' && trackFilter !== 'general' && ann.trackId !== trackFilter) {
      return false;
    }
    if (priorityFilter !== 'all' && ann.priority !== priorityFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0D0E11] text-[#FAF7EE] flex">
      <AdminSidebar
        currentTab="announcements"
        admin={admin}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <AdminHeader
          title="Platform Announcements"
          subtitle="Broadcast updates, workshop alerts, and track notices"
          admin={admin}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          actions={
            <button
              onClick={() => {
                setFormError(null);
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#EA4335] hover:bg-[#EA4335]/90 text-xs font-bold text-white shadow-lg shadow-[#EA4335]/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Broadcast Notice</span>
            </button>
          }
        />

        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Filters Bar */}
          <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-white/40 flex items-center gap-1.5 px-2">
                <Filter className="w-3.5 h-3.5" />
                <span>Audience:</span>
              </span>
              <select
                value={trackFilter}
                onChange={(e) => setTrackFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#4285F4]"
              >
                <option value="all" className="bg-[#0D0E11]">All Audiences</option>
                <option value="general" className="bg-[#0D0E11]">General Broadcasts Only</option>
                {tracks.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#0D0E11]">
                    {t.name}
                  </option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#4285F4]"
              >
                <option value="all" className="bg-[#0D0E11]">All Priorities</option>
                <option value="NORMAL" className="bg-[#0D0E11]">NORMAL</option>
                <option value="IMPORTANT" className="bg-[#0D0E11]">IMPORTANT</option>
                <option value="URGENT" className="bg-[#0D0E11]">URGENT</option>
                <option value="REMINDER" className="bg-[#0D0E11]">REMINDER</option>
              </select>
            </div>

            <div className="text-xs text-white/50">
              Showing <strong className="text-white">{filteredAnnouncements.length}</strong> of{' '}
              {announcements.length} announcements
            </div>
          </div>

          {/* Announcements Feed */}
          {filteredAnnouncements.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-dashed border-white/15 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EA4335]/10 text-[#EA4335] flex items-center justify-center mx-auto">
                <Megaphone className="w-6 h-6" />
              </div>
              <p className="text-xs text-white/50">No announcements match the selected filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all space-y-4"
                  style={{
                    borderLeftColor: ann.trackAccent || '#EA4335',
                    borderLeftWidth: '4px',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold',
                            ann.priority === 'URGENT'
                              ? 'bg-[#EA4335]/20 text-[#EA4335] border border-[#EA4335]/30'
                              : ann.priority === 'IMPORTANT'
                              ? 'bg-[#FBBC04]/20 text-[#FBBC04] border border-[#FBBC04]/30'
                              : ann.priority === 'REMINDER'
                              ? 'bg-[#4285F4]/20 text-[#4285F4] border border-[#4285F4]/30'
                              : 'bg-white/10 text-white/70'
                          )}
                        >
                          {ann.priority}
                        </span>

                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold"
                          style={{
                            backgroundColor: ann.trackAccent ? `${ann.trackAccent}20` : '#ffffff10',
                            color: ann.trackAccent || '#FAF7EE',
                          }}
                        >
                          {ann.trackName ? ann.trackName : 'Global (All Students & Mentors)'}
                        </span>

                        <span className="text-[11px] text-white/40 font-mono">
                          {format(new Date(ann.createdAt), 'MMM d, yyyy • h:mm a')}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-white pt-1">{ann.title}</h3>
                    </div>

                    <button
                      onClick={() => setDeleteTarget(ann)}
                      className="p-2 rounded-xl text-white/40 hover:text-[#EA4335] hover:bg-[#EA4335]/10 transition-colors shrink-0"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>

                  <div className="flex items-center gap-2 pt-3 border-t border-white/5 text-xs text-white/40">
                    <span>Published by</span>
                    <strong className="text-white">{ann.authorName}</strong>
                    <span>({ann.authorRole})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* CREATE ANNOUNCEMENT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#0D0E11] border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">Broadcast Announcement</h3>
                <p className="text-xs text-white/50">Send a platform-wide or track-scoped notification</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/20 flex items-center gap-3 text-xs text-[#EA4335]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Target Audience
                </label>
                <select
                  value={formData.trackId}
                  onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                >
                  <option value="" className="bg-[#0D0E11]">
                    All Students & Mentors (General Broadcast)
                  </option>
                  {tracks.map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#0D0E11]">
                      {t.name} Only
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Priority Level
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                >
                  <option value={AnnouncementPriority.NORMAL} className="bg-[#0D0E11]">NORMAL</option>
                  <option value={AnnouncementPriority.IMPORTANT} className="bg-[#0D0E11]">IMPORTANT</option>
                  <option value={AnnouncementPriority.URGENT} className="bg-[#0D0E11]">URGENT</option>
                  <option value={AnnouncementPriority.REMINDER} className="bg-[#0D0E11]">REMINDER</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Headline Title <span className="text-[#EA4335]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Update: Live Technical Architecture Review"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Message Content <span className="text-[#EA4335]">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide all essential details, action items, and relevant URLs..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white/70 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#EA4335] hover:bg-[#EA4335]/90 text-xs font-bold text-white disabled:opacity-50"
                >
                  {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Broadcast Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteAnnouncement}
          title="Delete Platform Announcement?"
          description={`Are you sure you want to delete "${deleteTarget.title}"? It will no longer be visible on student or mentor dashboards.`}
          confirmText="Delete Announcement"
          isDestructive={true}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
