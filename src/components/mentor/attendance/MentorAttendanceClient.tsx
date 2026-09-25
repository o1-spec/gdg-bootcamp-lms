'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Search,
  Users,
  Calendar,
  AlertCircle,
  Sparkles,
  Check,
  Layers,
} from 'lucide-react';
import { MentorSidebar } from '@/components/mentor/MentorSidebar';
import { MentorHeader } from '@/components/mentor/MentorHeader';
import { cn } from '@/lib/utils';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED';

interface StudentAttendanceRecord {
  studentId: string;
  name: string;
  email: string;
  avatar: string;
  status: AttendanceStatus;
  notes: string;
  markedAt: Date | null;
}

interface MentorAttendanceClientProps {
  tracks: any[];
  activeTrack: any;
  activeSession: any;
  initialStudents: StudentAttendanceRecord[];
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

export function MentorAttendanceClient({
  tracks,
  activeTrack,
  activeSession,
  initialStudents,
  mentor,
  metrics,
}: MentorAttendanceClientProps) {
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Current selections
  const [selectedTrackId, setSelectedTrackId] = useState<string>(activeTrack?.id || '');
  const [selectedSessionId, setSelectedSessionId] = useState<string>(activeSession?.id || '');

  // Student Attendance Records in UI state
  const [students, setStudents] = useState<StudentAttendanceRecord[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);



  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTrackChange = (newTrackId: string) => {
    setSelectedTrackId(newTrackId);
    router.push(`/mentor/attendance?trackId=${newTrackId}`);
  };

  const handleSessionChange = (newSessionId: string) => {
    setSelectedSessionId(newSessionId);
    router.push(`/mentor/attendance?trackId=${selectedTrackId}&sessionId=${newSessionId}`);
  };

  // Bulk actions
  const handleMarkAll = (status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        status,
      }))
    );
    showToast(`Marked all students as ${status}`);
  };

  // Single student status toggle
  const handleStudentStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status } : s))
    );
  };

  const handleStudentNoteChange = (studentId: string, notes: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, notes } : s))
    );
  };

  // Submit attendance to API
  const handleSaveAttendance = async () => {
    if (!activeSession) {
      setErrorMessage('No session selected to save attendance for');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const records = students.map((s) => ({
        studentId: s.studentId,
        status: s.status,
        notes: s.notes || undefined,
      }));

      const res = await fetch('/api/mentor/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          records,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save attendance');
      }

      showToast(`Attendance recorded for ${students.length} students!`);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Saving attendance failed');
    } finally {
      setIsSaving(false);
    }
  };

  // Attendance metrics for active session
  const totalStudents = students.length;
  const presentCount = students.filter((s) => s.status === 'PRESENT').length;
  const absentCount = students.filter((s) => s.status === 'ABSENT').length;
  const excusedCount = students.filter((s) => s.status === 'EXCUSED').length;
  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  // Filtered by search
  const filteredStudents = students.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  const availableSessions = activeTrack?.sessions || [];

  return (
    <div className="flex min-h-screen bg-[#FAF7EE] text-[#0D0E11] antialiased selection:bg-[#FBBC04]/30">
      <MentorSidebar
        currentTab="attendance"
        mentor={mentor}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingSubmissionsCount={metrics.pendingSubmissionsCount}
        assignedTracksCount={metrics.assignedTracksCount}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <MentorHeader
          currentTab="attendance"
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5DFD0] pb-6 sm:pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#34A853]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
                  Cohort Attendance &amp; Class Participation
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#0D0E11]">
                Attendance Ledger
              </h1>
              <p className="text-xs sm:text-sm text-[#5F6368] max-w-2xl font-medium">
                Record real-time attendance for live workshops, lectures, and office hours across your assigned tracks.
              </p>
            </div>

            <button
              onClick={handleSaveAttendance}
              disabled={isSaving || !activeSession || students.length === 0}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              <Save className="h-4 w-4 text-[#34A853]" />
              <span>{isSaving ? 'Saving Attendance...' : 'Save Attendance to Database'}</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/30 text-xs font-bold text-[#EA4335] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Track & Session Selector Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 rounded-3xl bg-white border border-[#E5DFD0] shadow-sm">
            <div>
              <label className="text-xs font-bold text-[#0D0E11] block mb-1.5 flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-[#4285F4]" />
                <span>1. Select Assigned Track</span>
              </label>
              <select
                value={selectedTrackId}
                onChange={(e) => handleTrackChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-bold bg-[#FAF7EE]"
              >
                {tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.cohort?.name || 'Cohort 1.0'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#0D0E11] block mb-1.5 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-[#EA4335]" />
                <span>2. Select Workshop Session</span>
              </label>
              <select
                value={selectedSessionId}
                onChange={(e) => handleSessionChange(e.target.value)}
                disabled={availableSessions.length === 0}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-bold bg-[#FAF7EE] disabled:opacity-50"
              >
                {availableSessions.length === 0 ? (
                  <option value="">No sessions scheduled for this track</option>
                ) : (
                  availableSessions.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {new Date(s.startTime).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                      {' — '}
                      {s.title} ({s.mode})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Active Session Info & Metrics */}
          {activeSession ? (
            <div className="space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5DFD0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#4285F4]/10 text-[#4285F4]">
                      {activeSession.mode}
                    </span>
                    <span className="text-xs font-bold text-[#5F6368]">
                      {new Date(activeSession.startTime).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-[#0D0E11]">{activeSession.title}</h2>
                  {activeSession.description && (
                    <p className="text-xs text-[#5F6368] max-w-xl">{activeSession.description}</p>
                  )}
                </div>

                {/* Session Rate Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-center">
                    <span className="text-[10px] font-bold uppercase text-[#5F6368] block">Total</span>
                    <span className="text-xl font-black text-[#0D0E11] font-mono">{totalStudents}</span>
                  </div>
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-[#34A853]/10 border border-[#34A853]/30 text-center">
                    <span className="text-[10px] font-bold uppercase text-[#34A853] block">Present</span>
                    <span className="text-xl font-black text-[#34A853] font-mono">{presentCount}</span>
                  </div>
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/30 text-center">
                    <span className="text-[10px] font-bold uppercase text-[#EA4335] block">Absent</span>
                    <span className="text-xl font-black text-[#EA4335] font-mono">{absentCount}</span>
                  </div>
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-center">
                    <span className="text-[10px] font-bold uppercase text-[#5F6368] block">Rate</span>
                    <span className="text-xl font-black text-[#0D0E11] font-mono">{attendanceRate}%</span>
                  </div>
                </div>
              </div>

              {/* Bulk Actions & Search Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-[#E5DFD0] shadow-sm">
                <div className="flex items-center gap-3 flex-1 max-w-sm">
                  <Search className="h-4 w-4 text-[#5F6368] shrink-0 ml-2" />
                  <input
                    type="text"
                    placeholder="Search enrolled students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs font-medium bg-transparent outline-none placeholder:text-[#5F6368]"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#5F6368] mr-1">Bulk Actions:</span>
                  <button
                    onClick={() => handleMarkAll('PRESENT')}
                    className="px-3.5 py-1.5 rounded-xl bg-[#34A853]/10 hover:bg-[#34A853]/20 text-[#34A853] border border-[#34A853]/30 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Mark All Present
                  </button>
                  <button
                    onClick={() => handleMarkAll('ABSENT')}
                    className="px-3.5 py-1.5 rounded-xl bg-[#EA4335]/10 hover:bg-[#EA4335]/20 text-[#EA4335] border border-[#EA4335]/30 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Mark All Absent
                  </button>
                </div>
              </div>

              {/* Student Attendance Ledger - Mobile Cards (< md) & Desktop Table (>= md) */}
              <div className="rounded-3xl bg-white border border-[#E5DFD0] shadow-sm overflow-hidden">
                {/* Mobile Card List */}
                <div className="md:hidden divide-y divide-[#E5DFD0]">
                  {filteredStudents.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#5F6368]">No students found matching search.</div>
                  ) : (
                    filteredStudents.map((st) => (
                      <div key={st.studentId} className="p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={st.avatar}
                            alt={st.name}
                            className="w-10 h-10 rounded-full object-cover border border-[#E5DFD0] shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-[#0D0E11] block text-xs truncate">
                              {st.name}
                            </span>
                            <span className="text-[#5F6368] text-[11px] truncate block">{st.email}</span>
                          </div>
                        </div>

                        {/* Status Buttons Grid */}
                        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0]">
                          <button
                            onClick={() => handleStudentStatusChange(st.studentId, 'PRESENT')}
                            className={cn(
                              'flex items-center justify-center gap-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all',
                              st.status === 'PRESENT'
                                ? 'bg-[#34A853] text-white shadow-xs'
                                : 'text-[#5F6368] hover:text-[#0D0E11]'
                            )}
                          >
                            <Check className="h-3 w-3 shrink-0" />
                            <span>Present</span>
                          </button>

                          <button
                            onClick={() => handleStudentStatusChange(st.studentId, 'ABSENT')}
                            className={cn(
                              'flex items-center justify-center gap-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all',
                              st.status === 'ABSENT'
                                ? 'bg-[#EA4335] text-white shadow-xs'
                                : 'text-[#5F6368] hover:text-[#0D0E11]'
                            )}
                          >
                            <XCircle className="h-3 w-3 shrink-0" />
                            <span>Absent</span>
                          </button>

                          <button
                            onClick={() => handleStudentStatusChange(st.studentId, 'EXCUSED')}
                            className={cn(
                              'flex items-center justify-center gap-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all',
                              st.status === 'EXCUSED'
                                ? 'bg-[#FBBC04] text-[#0D0E11] shadow-xs'
                                : 'text-[#5F6368] hover:text-[#0D0E11]'
                            )}
                          >
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>Excused</span>
                          </button>
                        </div>

                        {/* Note Input */}
                        <div>
                          <input
                            type="text"
                            value={st.notes}
                            onChange={(e) => handleStudentNoteChange(st.studentId, e.target.value)}
                            placeholder="Add participation notes..."
                            className="w-full px-3 py-2 rounded-xl border border-[#E5DFD0] focus:border-[#0D0E11] bg-[#FAF7EE] focus:bg-white text-xs outline-none transition-all placeholder:text-[#5F6368]"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7EE] border-b border-[#E5DFD0] text-[#5F6368] uppercase font-bold text-[10px] tracking-wider">
                      <tr>
                        <th className="py-4 px-6">Student</th>
                        <th className="py-4 px-4">Attendance Status</th>
                        <th className="py-4 px-6">Participation Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DFD0]">
                      {filteredStudents.map((st) => (
                        <tr key={st.studentId} className="hover:bg-[#FAF7EE]/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={st.avatar}
                                alt={st.name}
                                className="w-9 h-9 rounded-full object-cover border border-[#E5DFD0]"
                              />
                              <div>
                                <span className="font-bold text-[#0D0E11] block text-sm">
                                  {st.name}
                                </span>
                                <span className="text-[#5F6368] text-[11px]">{st.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Attendance Status Buttons */}
                          <td className="py-4 px-4">
                            <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0]">
                              <button
                                onClick={() => handleStudentStatusChange(st.studentId, 'PRESENT')}
                                className={cn(
                                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer',
                                  st.status === 'PRESENT'
                                    ? 'bg-[#34A853] text-white shadow-xs'
                                    : 'text-[#5F6368] hover:text-[#0D0E11]'
                                )}
                              >
                                <Check className="h-3 w-3" />
                                <span>Present</span>
                              </button>

                              <button
                                onClick={() => handleStudentStatusChange(st.studentId, 'ABSENT')}
                                className={cn(
                                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer',
                                  st.status === 'ABSENT'
                                    ? 'bg-[#EA4335] text-white shadow-xs'
                                    : 'text-[#5F6368] hover:text-[#0D0E11]'
                                )}
                              >
                                <XCircle className="h-3 w-3" />
                                <span>Absent</span>
                              </button>

                              <button
                                onClick={() => handleStudentStatusChange(st.studentId, 'EXCUSED')}
                                className={cn(
                                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer',
                                  st.status === 'EXCUSED'
                                    ? 'bg-[#FBBC04] text-[#0D0E11] shadow-xs'
                                    : 'text-[#5F6368] hover:text-[#0D0E11]'
                                )}
                              >
                                <Clock className="h-3 w-3" />
                                <span>Excused</span>
                              </button>
                            </div>
                          </td>

                          {/* Notes */}
                          <td className="py-4 px-6">
                            <input
                              type="text"
                              value={st.notes}
                              onChange={(e) => handleStudentNoteChange(st.studentId, e.target.value)}
                              placeholder="e.g., Active in live lab, asked good queries..."
                              className="w-full px-3 py-1.5 rounded-xl border border-transparent hover:border-[#E5DFD0] focus:border-[#0D0E11] bg-transparent focus:bg-white text-xs outline-none transition-all"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-white border border-[#E5DFD0] p-12 text-center shadow-sm max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FBBC04]/20 text-[#FBBC04] flex items-center justify-center mx-auto">
                <Calendar className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-[#0D0E11]">No Sessions Found</h3>
              <p className="text-xs text-[#5F6368]">
                Please create a workshop or lecture session under the Schedule tab before taking attendance.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
