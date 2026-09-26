'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  Plus,
  Filter,
  Edit2,
  Trash2,
  Video,
  MapPin,
  Clock,
  ShieldCheck,
  Percent,
  X,
  Loader2,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { AdminSidebar, AdminUser } from '../AdminSidebar';
import { AdminHeader } from '../AdminHeader';
import { ConfirmDialog } from '@/components/mentor/ConfirmDialog';
import { SessionMode } from '@prisma/client';
import { format } from '@/lib/date';

interface SessionRecord {
  id: string;
  trackId: string;
  trackName: string;
  trackAccent: string;
  cohortName: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  mode: SessionMode;
  meetingUrl: string | null;
  location: string | null;
  recordingUrl: string | null;
  mentor: { id: string; name: string } | null;
  attendance: {
    total: number;
    present: number;
    absent: number;
    excused: number;
  };
}

interface TrackOption {
  id: string;
  name: string;
  slug: string;
  accent: string | null;
  cohort?: { name: string };
}

interface MentorOption {
  id: string;
  name: string;
  email: string;
}

interface AdminSessionsClientProps {
  sessions: SessionRecord[];
  tracks: TrackOption[];
  mentors: MentorOption[];
  admin: AdminUser;
}

export function AdminSessionsClient({
  sessions: initialSessions,
  tracks,
  mentors,
  admin,
}: AdminSessionsClientProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionRecord[]>(initialSessions);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Tab view: sessions list vs attendance report
  const [viewMode, setViewMode] = useState<'sessions' | 'attendance'>('sessions');

  // Filters
  const [trackFilter, setTrackFilter] = useState('all');
  const [mentorFilter, setMentorFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionRecord | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    trackId: string;
    mentorId: string;
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    mode: SessionMode;
    meetingUrl: string;
    location: string;
    recordingUrl: string;
  }>({
    trackId: tracks[0]?.id || '',
    mentorId: mentors[0]?.id || '',
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '10:00',
    endTime: '12:00',
    mode: SessionMode.VIRTUAL,
    meetingUrl: '',
    location: '',
    recordingUrl: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<SessionRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      trackId: tracks[0]?.id || '',
      mentorId: mentors[0]?.id || '',
      title: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '10:00',
      endTime: '12:00',
      mode: SessionMode.VIRTUAL,
      meetingUrl: '',
      location: '',
      recordingUrl: '',
    });
    setFormError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditModal = (s: SessionRecord) => {
    setEditingSession(s);
    setFormData({
      trackId: s.trackId,
      mentorId: s.mentor?.id || '',
      title: s.title,
      description: s.description || '',
      date: format(new Date(s.startTime), 'yyyy-MM-dd'),
      startTime: format(new Date(s.startTime), 'HH:mm'),
      endTime: format(new Date(s.endTime), 'HH:mm'),
      mode: s.mode,
      meetingUrl: s.meetingUrl || '',
      location: s.location || '',
      recordingUrl: s.recordingUrl || '',
    });
    setFormError(null);
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Session title is required.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const url = editingSession
        ? `/api/admin/sessions/${editingSession.id}`
        : '/api/admin/sessions';
      const method = editingSession ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save session');

      setIsCreateOpen(false);
      setEditingSession(null);
      resetForm();
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/sessions/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete session');

      setDeleteTarget(null);
      router.refresh();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete session');
    } finally {
      setIsDeleting(false);
    }
  };

  const now = new Date();

  const filteredSessions = sessions.filter((s) => {
    if (trackFilter !== 'all' && s.trackId !== trackFilter) return false;
    if (mentorFilter !== 'all' && s.mentor?.id !== mentorFilter) return false;

    const sessionStart = new Date(s.startTime);
    if (timeFilter === 'upcoming' && sessionStart < now) return false;
    if (timeFilter === 'past' && sessionStart >= now) return false;

    return true;
  });

  // Attendance metrics aggregate
  const totalAttendances = sessions.reduce((acc, s) => acc + s.attendance.total, 0);
  const totalPresents = sessions.reduce((acc, s) => acc + s.attendance.present, 0);
  const totalAbsents = sessions.reduce((acc, s) => acc + s.attendance.absent, 0);
  const totalExcused = sessions.reduce((acc, s) => acc + s.attendance.excused, 0);
  const overallRate =
    totalAttendances > 0 ? Math.round(((totalPresents + totalExcused) / totalAttendances) * 100) : 94;

  return (
    <div className="min-h-screen bg-gdg-black text-gdg-cream flex">
      <AdminSidebar
        currentTab="sessions"
        admin={admin}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Sessions & Attendance"
          subtitle="Manage schedule across all tracks, virtual links, and attendance roll calls"
          admin={admin}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          actions={
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gdg-red hover:bg-gdg-red/90 text-xs font-bold text-white shadow-lg shadow-gdg-red/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Session</span>
            </button>
          }
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* View Mode Toggle & Metrics Banner */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/10">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 w-full sm:w-auto overflow-x-auto scrollbar-none">
              <button
                onClick={() => setViewMode('sessions')}
                className={`flex-1 sm:flex-initial text-center whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'sessions'
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Session Schedules ({sessions.length})
              </button>
              <button
                onClick={() => setViewMode('attendance')}
                className={`flex-1 sm:flex-initial text-center whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'attendance'
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Attendance Reporting ({overallRate}%)
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-white/60">
              <span>Overall Rate: <strong className="text-gdg-green">{overallRate}%</strong></span>
              <span>•</span>
              <span>Total Recorded: <strong className="text-white">{totalAttendances}</strong></span>
            </div>
          </div>

          {/* VIEW 1: SESSIONS SCHEDULE */}
          {viewMode === 'sessions' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-white/40 flex items-center gap-1.5 px-1">
                    <Filter className="w-3.5 h-3.5 shrink-0" />
                    <span>Filter:</span>
                  </span>

                  <select
                    value={trackFilter}
                    onChange={(e) => setTrackFilter(e.target.value)}
                    className="flex-1 sm:flex-initial min-w-[120px] px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-gdg-blue"
                  >
                    <option value="all" className="bg-gdg-black">All Tracks</option>
                    {tracks.map((t) => (
                      <option key={t.id} value={t.id} className="bg-gdg-black">
                        {t.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={mentorFilter}
                    onChange={(e) => setMentorFilter(e.target.value)}
                    className="flex-1 sm:flex-initial min-w-[120px] px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-gdg-blue"
                  >
                    <option value="all" className="bg-gdg-black">All Mentors</option>
                    {mentors.map((m) => (
                      <option key={m.id} value={m.id} className="bg-gdg-black">
                        {m.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value as any)}
                    className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-gdg-blue"
                  >
                    <option value="all" className="bg-gdg-black">All Dates</option>
                    <option value="upcoming" className="bg-gdg-black">Upcoming Only</option>
                    <option value="past" className="bg-gdg-black">Past Only</option>
                  </select>
                </div>

                <div className="text-xs text-white/50">
                  Showing <strong className="text-white">{filteredSessions.length}</strong> of{' '}
                  {sessions.length} sessions
                </div>
              </div>

              {/* Sessions Grid */}
              {filteredSessions.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-dashed border-white/15 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gdg-yellow/10 text-gdg-yellow flex items-center justify-center mx-auto">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-white/50">No sessions match current filter criteria.</p>
                  <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gdg-red text-xs font-bold text-white hover:bg-gdg-red/90"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Session</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredSessions.map((s) => {
                    const isUpcoming = new Date(s.startTime) >= now;

                    return (
                      <div
                        key={s.id}
                        className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-6"
                        style={{ borderLeftColor: s.trackAccent, borderLeftWidth: '4px' }}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span
                                className="text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold"
                                style={{
                                  backgroundColor: `${s.trackAccent}20`,
                                  color: s.trackAccent,
                                }}
                              >
                                {s.trackName}
                              </span>
                              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/60">
                                {s.mode}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditModal(s)}
                                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                                title="Edit Session"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(s)}
                                className="p-1.5 rounded-lg text-white/40 hover:text-gdg-red hover:bg-gdg-red/10 transition-colors"
                                title="Delete Session"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-base font-bold text-white">{s.title}</h3>
                            {s.description && (
                              <p className="text-xs text-white/60 line-clamp-2 mt-1">{s.description}</p>
                            )}
                          </div>

                          <div className="space-y-1 text-xs text-white/50 pt-1">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-gdg-yellow" />
                              <span>
                                {format(new Date(s.startTime), 'EEEE, MMM d, yyyy • h:mm a')} -{' '}
                                {format(new Date(s.endTime), 'h:mm a')}
                              </span>
                            </div>

                            {s.mentor && (
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-gdg-green" />
                                <span>Instructor: {s.mentor.name}</span>
                              </div>
                            )}

                            {s.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-gdg-red" />
                                <span>{s.location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action buttons & recording status */}
                        <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/5 text-xs">
                          <div className="flex items-center gap-2">
                            {s.meetingUrl && (
                              <a
                                href={s.meetingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium"
                              >
                                <Video className="w-3.5 h-3.5 text-gdg-blue" />
                                <span>Join Room</span>
                              </a>
                            )}
                            {s.recordingUrl && (
                              <a
                                href={s.recordingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gdg-red/10 hover:bg-gdg-red/20 text-gdg-red font-semibold"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Watch Recording</span>
                              </a>
                            )}
                          </div>

                          <span className="text-[11px] text-white/40 font-mono">
                            {s.attendance.total > 0
                              ? `${s.attendance.present} checked in`
                              : 'No roll call yet'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: ATTENDANCE REPORTING (Requirement 18) */}
          {viewMode === 'attendance' && (
            <div className="space-y-6">
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 text-center">
                  <span className="block text-2xl font-black text-gdg-green">{overallRate}%</span>
                  <span className="text-xs text-white/50">Overall Attendance</span>
                </div>
                <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 text-center">
                  <span className="block text-2xl font-black text-white">{totalPresents}</span>
                  <span className="text-xs text-white/50">Present Check-ins</span>
                </div>
                <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 text-center">
                  <span className="block text-2xl font-black text-gdg-red">{totalAbsents}</span>
                  <span className="text-xs text-white/50">Absences Recorded</span>
                </div>
                <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 text-center">
                  <span className="block text-2xl font-black text-gdg-yellow">{totalExcused}</span>
                  <span className="text-xs text-white/50">Excused Records</span>
                </div>
              </div>

              {/* Attendance Breakdown: Mobile Cards + Desktop Table */}
              <div className="rounded-3xl bg-white/[0.02] border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">
                    Session Attendance Breakdown
                  </h3>
                </div>

                {/* Mobile Cards (md:hidden) */}
                <div className="md:hidden divide-y divide-white/5">
                  {sessions.length === 0 ? (
                    <div className="p-6 text-center text-xs text-white/40">No attendance data available.</div>
                  ) : (
                    sessions.map((s) => {
                      const total = s.attendance.total;
                      const rate =
                        total > 0
                          ? Math.round(((s.attendance.present + s.attendance.excused) / total) * 100)
                          : 0;

                      return (
                        <div key={s.id} className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-bold text-white text-sm break-words">{s.title}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span
                                  className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium"
                                  style={{
                                    backgroundColor: `${s.trackAccent}20`,
                                    color: s.trackAccent,
                                  }}
                                >
                                  {s.trackName}
                                </span>
                                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/60">
                                  {s.mode}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs text-white/40 block font-mono">
                                {format(new Date(s.startTime), 'MMM d')}
                              </span>
                              <span className="text-sm font-black text-white">
                                {total > 0 ? `${rate}%` : '-'}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center text-xs">
                            <div className="p-2 rounded-xl bg-white/[0.03]">
                              <span className="block text-[10px] text-white/40 uppercase">Present</span>
                              <span className="font-bold text-gdg-green">{s.attendance.present}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-white/[0.03]">
                              <span className="block text-[10px] text-white/40 uppercase">Absent</span>
                              <span className="font-bold text-gdg-red">{s.attendance.absent}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-white/[0.03]">
                              <span className="block text-[10px] text-white/40 uppercase">Excused</span>
                              <span className="font-bold text-gdg-yellow">{s.attendance.excused}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Desktop Table (hidden md:block) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02] text-white/40 uppercase tracking-wider font-semibold text-[11px]">
                        <th className="py-4 px-6">Session Title</th>
                        <th className="py-4 px-4">Track</th>
                        <th className="py-4 px-4">Date</th>
                        <th className="py-4 px-4">Present</th>
                        <th className="py-4 px-4">Absent</th>
                        <th className="py-4 px-4">Excused</th>
                        <th className="py-4 px-6 text-right">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sessions.map((s) => {
                        const total = s.attendance.total;
                        const rate =
                          total > 0
                            ? Math.round(((s.attendance.present + s.attendance.excused) / total) * 100)
                            : 0;

                        return (
                          <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 px-6">
                              <p className="font-bold text-white">{s.title}</p>
                              <p className="text-[10px] text-white/40 font-mono">{s.mode}</p>
                            </td>

                            <td className="py-4 px-4">
                              <span
                                className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium"
                                style={{
                                  backgroundColor: `${s.trackAccent}20`,
                                  color: s.trackAccent,
                                }}
                              >
                                {s.trackName}
                              </span>
                            </td>

                            <td className="py-4 px-4 text-white/50 text-[11px] font-mono">
                              {format(new Date(s.startTime), 'MMM d, yyyy')}
                            </td>

                            <td className="py-4 px-4 font-bold text-gdg-green">
                              {s.attendance.present}
                            </td>

                            <td className="py-4 px-4 font-bold text-gdg-red">
                              {s.attendance.absent}
                            </td>

                            <td className="py-4 px-4 font-bold text-gdg-yellow">
                              {s.attendance.excused}
                            </td>

                            <td className="py-4 px-6 text-right font-black text-white">
                              {total > 0 ? `${rate}%` : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CREATE / EDIT SESSION MODAL */}
      {(isCreateOpen || editingSession) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-gdg-black border border-white/15 p-5 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">
                  {editingSession ? 'Edit Session' : 'Schedule Bootcamp Session'}
                </h3>
                <p className="text-xs text-white/50">Configure workshop schedule, live links, and instructors</p>
              </div>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingSession(null);
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

            <form onSubmit={handleSaveSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Curriculum Track <span className="text-gdg-red">*</span>
                </label>
                <select
                  value={formData.trackId}
                  onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-gdg-blue"
                >
                  {tracks.map((t) => (
                    <option key={t.id} value={t.id} className="bg-gdg-black">
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Assigned Instructor / Mentor
                </label>
                <select
                  value={formData.mentorId}
                  onChange={(e) => setFormData({ ...formData, mentorId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-gdg-blue"
                >
                  <option value="" className="bg-gdg-black">Unassigned</option>
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id} className="bg-gdg-black">
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Session Title <span className="text-gdg-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masterclass: PostgreSQL Indexes & Query Optimization"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-gdg-blue"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-gdg-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-gdg-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-gdg-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">Mode</label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-gdg-blue"
                  >
                    <option value={SessionMode.VIRTUAL} className="bg-gdg-black">VIRTUAL</option>
                    <option value={SessionMode.PHYSICAL} className="bg-gdg-black">PHYSICAL</option>
                    <option value={SessionMode.HYBRID} className="bg-gdg-black">HYBRID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">Meeting Link</label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={formData.meetingUrl}
                    onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-gdg-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Physical Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. LASU Computer Science Lab 1"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-gdg-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Recording URL (Cloud or YouTube)
                </label>
                <input
                  type="url"
                  placeholder="https://youtu.be/..."
                  value={formData.recordingUrl}
                  onChange={(e) => setFormData({ ...formData, recordingUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-gdg-blue"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingSession(null);
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
                  <span>{editingSession ? 'Save Changes' : 'Schedule Session'}</span>
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
          onConfirm={handleDeleteSession}
          title="Delete Bootcamp Session?"
          description={`Are you sure you want to delete "${deleteTarget.title}"? This cannot be undone.`}
          confirmText="Delete Session"
          isDestructive={true}
          isLoading={isDeleting}
        />
      )}

      {/* Error Alert Dialog */}
      <ConfirmDialog
        isOpen={!!deleteError}
        onClose={() => setDeleteError(null)}
        onConfirm={() => setDeleteError(null)}
        title="Session Action Failed"
        description={deleteError || ''}
        confirmLabel="Dismiss"
        cancelText={null}
        variant="warning"
      />
    </div>
  );
}
