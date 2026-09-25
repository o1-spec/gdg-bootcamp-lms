'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Megaphone,
  Plus,
  Trash2,
  Calendar,
  Layers,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  Filter,
  Sparkles,
} from 'lucide-react';
import { MentorSidebar } from '@/components/mentor/MentorSidebar';
import { MentorHeader } from '@/components/mentor/MentorHeader';
import { ConfirmDialog } from '@/components/mentor/ConfirmDialog';
import { cn } from '@/lib/utils';

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  priority: string;
  createdAt: Date;
  trackId: string | null;
  track?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    avatarUrl: string | null;
  } | null;
}

interface MentorAnnouncementsClientProps {
  announcements: AnnouncementItem[];
  tracks: any[];
  mentor: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    rawRole?: string;
  };
  metrics: {
    assignedTracksCount: number;
    pendingSubmissionsCount: number;
  };
}

export function MentorAnnouncementsClient({
  announcements: initialAnnouncements,
  tracks,
  mentor,
  metrics,
}: MentorAnnouncementsClientProps) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filters
  const [trackFilter, setTrackFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<AnnouncementItem | null>(null);

  // Form fields
  const [formTrackId, setFormTrackId] = useState<string>(tracks[0]?.id || '');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formPriority, setFormPriority] = useState<string>('NORMAL');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isAdmin = mentor.rawRole === 'ADMIN' || mentor.rawRole === 'SUPER_ADMIN';

  const openCreateModal = () => {
    setFormTrackId(tracks[0]?.id || '');
    setFormTitle('');
    setFormContent('');
    setFormPriority('NORMAL');
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/mentor/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          content: formContent,
          priority: formPriority,
          trackId: formTrackId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create announcement');
      }

      const assignedTr = tracks.find((t) => t.id === formTrackId);
      setAnnouncements((prev) => [
        {
          ...data.announcement,
          track: assignedTr || null,
          author: {
            id: mentor.id,
            firstName: mentor.name.split(' ')[0] || 'Mentor',
            lastName: mentor.name.split(' ')[1] || '',
            role: mentor.rawRole || 'MENTOR',
            avatarUrl: mentor.avatar,
          },
        },
        ...prev,
      ]);

      showToast('Announcement broadcasted');
      setIsCreateOpen(false);
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!deletingAnnouncement) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/mentor/announcements/${deletingAnnouncement.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete announcement');

      setAnnouncements((prev) => prev.filter((a) => a.id !== deletingAnnouncement.id));
      showToast('Announcement deleted');
      setDeletingAnnouncement(null);
      router.refresh();
    } catch (err: any) {
      showToast(err.message || 'Deletion failed');
      setDeletingAnnouncement(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered announcements
  const filteredAnnouncements = announcements.filter((a) => {
    if (trackFilter !== 'all') {
      if (trackFilter === 'global' && a.trackId !== null) return false;
      if (trackFilter !== 'global' && a.trackId !== trackFilter) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchContent = a.content.toLowerCase().includes(q);
      if (!matchTitle && !matchContent) return false;
    }

    return true;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gdg-red text-white">
            Urgent
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gdg-yellow text-gdg-black">
            High Priority
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gdg-cream text-gdg-gray border border-gdg-border">
            Notice
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gdg-blue/10 text-gdg-blue">
            General Update
          </span>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gdg-cream text-gdg-black antialiased selection:bg-gdg-yellow/30">
      <MentorSidebar
        currentTab="announcements"
        mentor={mentor}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingSubmissionsCount={metrics.pendingSubmissionsCount}
        assignedTracksCount={metrics.assignedTracksCount}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <MentorHeader
          currentTab="announcements"
          mentor={mentor}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        {/* Success Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-gdg-black text-gdg-cream px-5 py-3 shadow-xl border border-gdg-green/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
            <CheckCircle2 className="h-4 w-4 text-gdg-green" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}

        <main className="flex-1 p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gdg-border pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-gdg-red" />
                <span className="text-xs font-bold uppercase tracking-wider text-gdg-gray">
                  Cohort Broadcasts &amp; Track Updates
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gdg-black">
                Announcements
              </h1>
              <p className="text-base text-gdg-gray max-w-2xl font-medium">
                Broadcast urgent schedule adjustments, project milestones, workshop recordings, and reminders to your students.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              disabled={tracks.length === 0}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gdg-black text-gdg-cream text-xs font-bold hover:bg-gdg-dark-border disabled:opacity-50 transition-colors shadow-sm self-start md:self-auto"
            >
              <Plus className="h-4 w-4 text-gdg-yellow" />
              <span>New Announcement</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-gdg-border shadow-sm">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <Search className="h-4 w-4 text-gdg-gray shrink-0 ml-2" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-medium bg-transparent outline-none placeholder:text-gdg-gray"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gdg-gray hover:text-gdg-black">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-gdg-cream border border-gdg-border text-xs font-bold text-gdg-black outline-none"
            >
              <option value="all">All Announcements</option>
              <option value="global">Cohort Global</option>
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Announcements List */}
          {filteredAnnouncements.length === 0 ? (
            <div className="rounded-3xl bg-white border border-gdg-border p-12 text-center shadow-sm max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gdg-red/10 text-gdg-red flex items-center justify-center mx-auto">
                <Megaphone className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-gdg-black">No Announcements Found</h3>
              <p className="text-xs text-gdg-gray">
                {announcements.length === 0
                  ? 'No announcements have been published yet.'
                  : 'No announcements match your search or track filter.'}
              </p>
              {announcements.length === 0 && (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gdg-black text-gdg-cream text-xs font-bold hover:bg-gdg-dark-border transition-colors"
                >
                  <Plus className="h-4 w-4 text-gdg-yellow" />
                  <span>Broadcast First Announcement</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-6 sm:p-8 rounded-3xl bg-white border border-gdg-border hover:border-gdg-black transition-all shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gdg-border pb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getPriorityBadge(ann.priority)}

                      {ann.track ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gdg-cream text-gdg-gray border border-gdg-border">
                          {ann.track.name}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gdg-blue/10 text-gdg-blue border border-gdg-blue/30">
                          Cohort-Wide Global
                        </span>
                      )}

                      <span className="text-xs text-gdg-gray font-mono">
                        {new Date(ann.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {ann.author && (
                        <div className="flex items-center gap-2">
                          {ann.author.avatarUrl ? (
                            <img
                              src={ann.author.avatarUrl}
                              alt={ann.author.firstName}
                              className="w-6 h-6 rounded-full object-cover border border-gdg-border"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gdg-black text-gdg-cream text-[10px] font-black flex items-center justify-center border border-gdg-border">
                              {ann.author.firstName?.[0] || 'U'}
                            </div>
                          )}
                          <span className="text-xs font-bold text-gdg-black">
                            {ann.author.firstName} {ann.author.lastName}
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => setDeletingAnnouncement(ann)}
                        className="p-1.5 rounded-lg hover:bg-gdg-red/10 text-gdg-gray hover:text-gdg-red transition-colors"
                        title="Delete Announcement"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-gdg-black">{ann.title}</h3>
                    <p className="text-sm text-gdg-gray mt-2 whitespace-pre-wrap leading-relaxed font-medium">
                      {ann.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* CREATE ANNOUNCEMENT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-gdg-border p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-gdg-black">
                Broadcast Track Announcement
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-2 rounded-xl hover:bg-gdg-cream text-gdg-gray hover:text-gdg-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-2xl bg-gdg-red/10 border border-gdg-red/30 text-xs font-bold text-gdg-red flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gdg-black block mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Live Coding Session Postponed by 30 Minutes"
                  className="w-full px-4 py-2.5 rounded-2xl border border-gdg-border focus:border-gdg-black outline-none text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gdg-black block mb-1">
                    Target Track *
                  </label>
                  <select
                    value={formTrackId}
                    onChange={(e) => setFormTrackId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gdg-border focus:border-gdg-black outline-none text-xs font-medium bg-white"
                  >
                    {isAdmin && <option value="">Global (All Cohort Tracks)</option>}
                    {tracks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  {!isAdmin && (
                    <span className="text-[10px] text-gdg-gray block mt-1">
                      Mentors broadcast only to their assigned tracks.
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gdg-black block mb-1">
                    Priority *
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gdg-border focus:border-gdg-black outline-none text-xs font-medium bg-white"
                  >
                    <option value="NORMAL">Normal Update</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent Alert</option>
                    <option value="LOW">Low Notice</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gdg-black block mb-1">
                  Message Content *
                </label>
                <textarea
                  rows={5}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write clear instructions, links, or expectations for the cohort..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-gdg-border focus:border-gdg-black outline-none text-xs font-medium resize-none leading-relaxed"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-2.5 rounded-2xl border border-gdg-border text-xs font-bold text-gdg-gray hover:text-gdg-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-gdg-black text-gdg-cream text-xs font-bold hover:bg-gdg-dark-border disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSubmitting ? 'Broadcasting...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE ANNOUNCEMENT */}
      <ConfirmDialog
        isOpen={!!deletingAnnouncement}
        title="Delete Announcement"
        description={`Are you sure you want to permanently delete "${deletingAnnouncement?.title}"?`}
        confirmLabel="Delete Announcement"
        isDestructive={true}
        onConfirm={handleDeleteAnnouncement}
        onCancel={() => setDeletingAnnouncement(null)}
      />
    </div>
  );
}
