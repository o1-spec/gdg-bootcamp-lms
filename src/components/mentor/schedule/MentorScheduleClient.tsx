'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Video,
  MapPin,
  ExternalLink,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { MentorSidebar } from '@/components/mentor/MentorSidebar';
import { MentorHeader } from '@/components/mentor/MentorHeader';
import { ConfirmDialog } from '@/components/mentor/ConfirmDialog';
import { cn } from '@/lib/utils';

interface SessionItem {
  id: string;
  trackId: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  mode: string;
  meetingUrl: string | null;
  location: string | null;
  recordingUrl: string | null;
  track: {
    id: string;
    name: string;
    slug: string;
    accent: string | null;
  };
  mentor?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  _count?: {
    attendances: number;
  };
}

interface MentorScheduleClientProps {
  sessions: SessionItem[];
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

export function MentorScheduleClient({
  sessions: initialSessions,
  tracks,
  mentor,
  metrics,
}: MentorScheduleClientProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionItem[]>(initialSessions);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filters
  const [trackFilter, setTrackFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionItem | null>(null);
  const [deletingSession, setDeletingSession] = useState<SessionItem | null>(null);

  // Form fields
  const [formTrackId, setFormTrackId] = useState<string>(tracks[0]?.id || '');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('14:00');
  const [formEndTime, setFormEndTime] = useState('16:00');
  const [formMode, setFormMode] = useState<string>('VIRTUAL');
  const [formMeetingUrl, setFormMeetingUrl] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formRecordingUrl, setFormRecordingUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openCreateModal = () => {
    setFormTrackId(tracks[0]?.id || '');
    setFormTitle('');
    setFormDescription('');
    const today = new Date().toISOString().split('T')[0];
    setFormDate(today);
    setFormStartTime('14:00');
    setFormEndTime('16:00');
    setFormMode('VIRTUAL');
    setFormMeetingUrl('https://meet.google.com/');
    setFormLocation('');
    setFormRecordingUrl('');
    setFormError(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (s: SessionItem) => {
    setEditingSession(s);
    setFormTrackId(s.trackId);
    setFormTitle(s.title);
    setFormDescription(s.description || '');

    const start = new Date(s.startTime);
    const end = new Date(s.endTime);

    setFormDate(start.toISOString().split('T')[0]);
    setFormStartTime(start.toTimeString().slice(0, 5));
    setFormEndTime(end.toTimeString().slice(0, 5));
    setFormMode(s.mode);
    setFormMeetingUrl(s.meetingUrl || '');
    setFormLocation(s.location || '');
    setFormRecordingUrl(s.recordingUrl || '');
    setFormError(null);
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (editingSession) {
        // PATCH
        const res = await fetch(`/api/mentor/sessions/${editingSession.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle,
            description: formDescription,
            date: formDate,
            startTime: formStartTime,
            endTime: formEndTime,
            mode: formMode,
            meetingUrl: formMeetingUrl || null,
            location: formLocation || null,
            recordingUrl: formRecordingUrl || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update session');

        setSessions((prev) =>
          prev.map((s) =>
            s.id === editingSession.id
              ? {
                  ...s,
                  ...data.session,
                  startTime: new Date(`${formDate}T${formStartTime}`),
                  endTime: new Date(`${formDate}T${formEndTime}`),
                }
              : s
          )
        );
        showToast('Session updated');
        setEditingSession(null);
      } else {
        // POST
        const res = await fetch('/api/mentor/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trackId: formTrackId,
            title: formTitle,
            description: formDescription,
            date: formDate,
            startTime: formStartTime,
            endTime: formEndTime,
            mode: formMode,
            meetingUrl: formMeetingUrl || null,
            location: formLocation || null,
            recordingUrl: formRecordingUrl || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to schedule session');

        const tr = tracks.find((t) => t.id === formTrackId);
        setSessions((prev) => [
          ...prev,
          {
            ...data.session,
            track: tr || { id: formTrackId, name: 'Assigned Track', slug: 'track', accent: '#4285F4' },
            startTime: new Date(`${formDate}T${formStartTime}`),
            endTime: new Date(`${formDate}T${formEndTime}`),
            _count: { attendances: 0 },
          },
        ]);
        showToast('New session scheduled');
        setIsCreateOpen(false);
      }
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!deletingSession) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/mentor/sessions/${deletingSession.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete session');

      setSessions((prev) => prev.filter((s) => s.id !== deletingSession.id));
      showToast('Session removed');
      setDeletingSession(null);
      router.refresh();
    } catch (err: any) {
      showToast(err.message || 'Deletion failed');
      setDeletingSession(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const now = new Date();

  // Filtered sessions
  const filteredSessions = sessions.filter((s) => {
    if (trackFilter !== 'all' && s.trackId !== trackFilter) return false;
    const isUpcoming = new Date(s.startTime) >= now;
    if (timeFilter === 'upcoming' && !isUpcoming) return false;
    if (timeFilter === 'past' && isUpcoming) return false;
    return true;
  });

  const upcomingCount = sessions.filter((s) => new Date(s.startTime) >= now).length;
  const pastCount = sessions.filter((s) => new Date(s.startTime) < now).length;

  return (
    <div className="flex min-h-screen bg-[#FAF7EE] text-[#0D0E11] antialiased selection:bg-[#FBBC04]/30">
      <MentorSidebar
        currentTab="schedule"
        mentor={mentor}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingSubmissionsCount={metrics.pendingSubmissionsCount}
        assignedTracksCount={metrics.assignedTracksCount}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <MentorHeader
          currentTab="schedule"
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
                <span className="h-2.5 w-2.5 rounded-full bg-[#4285F4]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
                  Workshops, Live Labs &amp; Office Hours
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0D0E11]">
                Schedule Management
              </h1>
              <p className="text-base text-[#5F6368] max-w-2xl font-medium">
                Organize upcoming synchronous workshops, update Google Meet / physical venue coordinates, and track student attendance records.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              disabled={tracks.length === 0}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] disabled:opacity-50 transition-colors shadow-sm self-start md:self-auto"
            >
              <Plus className="h-4 w-4 text-[#FBBC04]" />
              <span>Schedule Session</span>
            </button>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-white border border-[#E5DFD0] shadow-sm">
              <span className="text-[10px] font-bold uppercase text-[#5F6368] block">Total Sessions</span>
              <p className="text-3xl font-black text-[#0D0E11] font-mono mt-1">{sessions.length}</p>
              <span className="text-[11px] text-[#5F6368] font-medium block mt-1">Assigned tracks</span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E5DFD0] shadow-sm">
              <span className="text-[10px] font-bold uppercase text-[#4285F4] block">Upcoming</span>
              <p className="text-3xl font-black text-[#4285F4] font-mono mt-1">{upcomingCount}</p>
              <span className="text-[11px] text-[#5F6368] font-medium block mt-1">Scheduled ahead</span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E5DFD0] shadow-sm">
              <span className="text-[10px] font-bold uppercase text-[#5F6368] block">Past Workshops</span>
              <p className="text-3xl font-black text-[#0D0E11] font-mono mt-1">{pastCount}</p>
              <span className="text-[11px] text-[#5F6368] font-medium block mt-1">Concluded classes</span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E5DFD0] shadow-sm">
              <span className="text-[10px] font-bold uppercase text-[#34A853] block">Active Tracks</span>
              <p className="text-3xl font-black text-[#34A853] font-mono mt-1">{tracks.length}</p>
              <span className="text-[11px] text-[#5F6368] font-medium block mt-1">Supervised cohorts</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-[#E5DFD0] shadow-sm">
            <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0]">
              {[
                { id: 'all', label: `All (${sessions.length})` },
                { id: 'upcoming', label: `Upcoming (${upcomingCount})` },
                { id: 'past', label: `Past (${pastCount})` },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTimeFilter(t.id as any)}
                  className={cn(
                    'px-4 py-1.5 rounded-xl text-xs font-bold transition-colors',
                    timeFilter === t.id
                      ? 'bg-[#0D0E11] text-[#FAF7EE]'
                      : 'text-[#5F6368] hover:text-[#0D0E11]'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
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

          {/* Sessions List */}
          {filteredSessions.length === 0 ? (
            <div className="rounded-3xl bg-white border border-[#E5DFD0] p-12 text-center shadow-sm max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#4285F4]/10 text-[#4285F4] flex items-center justify-center mx-auto">
                <CalendarDays className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-[#0D0E11]">No Sessions Found</h3>
              <p className="text-xs text-[#5F6368]">
                {sessions.length === 0
                  ? 'No workshop sessions have been scheduled yet.'
                  : 'No sessions match your active filter options.'}
              </p>
              {sessions.length === 0 && (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] transition-colors"
                >
                  <Plus className="h-4 w-4 text-[#FBBC04]" />
                  <span>Schedule First Session</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((s) => {
                const isUpcoming = new Date(s.startTime) >= now;

                return (
                  <div
                    key={s.id}
                    className="p-6 rounded-3xl bg-white border border-[#E5DFD0] hover:border-[#0D0E11] transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="flex items-start gap-4">
                      {/* Date Badge Box */}
                      <div className="p-3.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-center min-w-[75px] shrink-0">
                        <span className="text-[10px] font-black uppercase text-[#EA4335] block">
                          {new Date(s.startTime).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-2xl font-black text-[#0D0E11] font-mono leading-none mt-0.5 block">
                          {new Date(s.startTime).getDate()}
                        </span>
                        <span className="text-[9px] font-bold text-[#5F6368] block mt-0.5 uppercase">
                          {new Date(s.startTime).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#4285F4]/10 text-[#4285F4]">
                            {s.mode}
                          </span>
                          <span className="text-xs font-bold text-[#5F6368] flex items-center gap-1">
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: s.track.accent || '#4285F4' }}
                            />
                            {s.track.name}
                          </span>
                          {isUpcoming ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/30">
                              Upcoming
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#5F6368]/10 text-[#5F6368] border border-[#E5DFD0]">
                              Concluded
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-black text-[#0D0E11]">{s.title}</h3>
                        {s.description && (
                          <p className="text-xs text-[#5F6368] line-clamp-1 max-w-xl">
                            {s.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-[#5F6368] pt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-mono font-medium">
                            <Clock className="h-3.5 w-3.5 text-[#FBBC04]" />
                            {new Date(s.startTime).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                            {' - '}
                            {new Date(s.endTime).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>

                          {s.meetingUrl && (
                            <a
                              href={s.meetingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-bold text-[#4285F4] hover:underline"
                            >
                              <Video className="h-3.5 w-3.5" />
                              <span>Join Meeting</span>
                            </a>
                          )}

                          {s.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-[#EA4335]" />
                              {s.location}
                            </span>
                          )}

                          <span className="flex items-center gap-1 text-[#5F6368]">
                            <UserCheck className="h-3.5 w-3.5 text-[#34A853]" />
                            {s._count?.attendances || 0} marked attendance
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <Link
                        href={`/mentor/attendance?trackId=${s.trackId}&sessionId=${s.id}`}
                        className="px-4 py-2 rounded-xl bg-[#FAF7EE] hover:bg-[#E5DFD0] text-xs font-bold text-[#0D0E11] border border-[#E5DFD0] transition-colors"
                      >
                        Attendance
                      </Link>

                      <button
                        onClick={() => openEditModal(s)}
                        className="p-2 rounded-xl hover:bg-[#FAF7EE] text-[#5F6368] hover:text-[#0D0E11] transition-colors"
                        title="Edit Session"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => setDeletingSession(s)}
                        className="p-2 rounded-xl hover:bg-[#EA4335]/10 text-[#5F6368] hover:text-[#EA4335] transition-colors"
                        title="Delete Session"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* CREATE / EDIT MODAL */}
      {(isCreateOpen || editingSession) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-[#E5DFD0] p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-[#0D0E11]">
                {editingSession ? 'Edit Session' : 'Schedule Live Workshop Session'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingSession(null);
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

            <form onSubmit={handleSaveSession} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Live Code Review & Architecture Q&A"
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
                    disabled={!!editingSession}
                    onChange={(e) => setFormTrackId(e.target.value)}
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
                    Mode *
                  </label>
                  <select
                    value={formMode}
                    onChange={(e) => setFormMode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium bg-white"
                  >
                    <option value="VIRTUAL">Virtual (Online)</option>
                    <option value="IN_PERSON">In Person</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                  Meeting URL (Google Meet / Zoom)
                </label>
                <input
                  type="url"
                  value={formMeetingUrl}
                  onChange={(e) => setFormMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                  Location / Physical Venue
                </label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="LASU Tech Hub, Room 102 (if physical/hybrid)"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                  Recording URL (Optional)
                </label>
                <input
                  type="url"
                  value={formRecordingUrl}
                  onChange={(e) => setFormRecordingUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                  Description &amp; Agenda
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Workshop agenda, preparation items, questions to discuss..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingSession(null);
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
                  {isSubmitting ? 'Saving...' : editingSession ? 'Save Changes' : 'Schedule Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE SESSION */}
      <ConfirmDialog
        isOpen={!!deletingSession}
        title="Cancel & Delete Session"
        description={`Are you sure you want to cancel "${deletingSession?.title}"? Any attendance records for this session will be removed.`}
        confirmLabel="Delete Session"
        isDestructive={true}
        onConfirm={handleDeleteSession}
        onCancel={() => setDeletingSession(null)}
      />
    </div>
  );
}
