'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarRange,
  Layers,
  Users,
  ShieldCheck,
  CalendarDays,
  Plus,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  X,
  Loader2,
  AlertCircle,
  Video,
  UserPlus,
} from 'lucide-react';
import { AdminSidebar, AdminUser } from '../AdminSidebar';
import { AdminHeader } from '../AdminHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from '@/lib/date';

interface CohortDetailProps {
  cohort: {
    id: string;
    name: string;
    bootcampId: string;
    bootcamp: { id: string; name: string };
    startDate: Date;
    endDate: Date | null;
    isActive: boolean;
    totalStudents: number;
    totalMentors: number;
    tracks: any[];
  };
  admin: AdminUser;
}

export function AdminCohortDetailClient({ cohort, admin }: CohortDetailProps) {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracks' | 'students' | 'mentors' | 'sessions'>('tracks');

  // Create track modal state
  const [isCreateTrackOpen, setIsCreateTrackOpen] = useState(false);
  const [trackFormData, setTrackFormData] = useState({
    name: '',
    slug: '',
    description: '',
    accent: '#4285F4',
  });
  const [isSavingTrack, setIsSavingTrack] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Auto generate slug
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setTrackFormData({ ...trackFormData, name, slug });
  };

  const handleCreateTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackFormData.name.trim()) {
      setTrackError('Track name is required.');
      return;
    }
    if (!trackFormData.slug.trim()) {
      setTrackError('Track slug is required.');
      return;
    }

    setIsSavingTrack(true);
    setTrackError(null);

    try {
      const res = await fetch('/api/admin/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cohortId: cohort.id,
          ...trackFormData,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create track');

      setIsCreateTrackOpen(false);
      setTrackFormData({ name: '', slug: '', description: '', accent: '#4285F4' });
      router.refresh();
    } catch (err: any) {
      setTrackError(err.message || 'An error occurred.');
    } finally {
      setIsSavingTrack(false);
    }
  };

  // Collect all students across tracks
  const allStudentsMap = new Map<string, any>();
  cohort.tracks.forEach((track) => {
    track.enrollments?.forEach((enr: any) => {
      if (enr.user) {
        if (!allStudentsMap.has(enr.user.id)) {
          allStudentsMap.set(enr.user.id, {
            ...enr.user,
            enrolledTracks: [{ trackId: track.id, trackName: track.name, accent: track.accent }],
          });
        } else {
          allStudentsMap
            .get(enr.user.id)
            .enrolledTracks.push({ trackId: track.id, trackName: track.name, accent: track.accent });
        }
      }
    });
  });
  const allStudents = Array.from(allStudentsMap.values());

  // Collect all mentors across tracks
  const allMentorsMap = new Map<string, any>();
  cohort.tracks.forEach((track) => {
    track.mentorAssignments?.forEach((ma: any) => {
      if (ma.mentor) {
        if (!allMentorsMap.has(ma.mentor.id)) {
          allMentorsMap.set(ma.mentor.id, {
            ...ma.mentor,
            assignedTracks: [{ trackId: track.id, trackName: track.name, accent: track.accent }],
          });
        } else {
          allMentorsMap
            .get(ma.mentor.id)
            .assignedTracks.push({ trackId: track.id, trackName: track.name, accent: track.accent });
        }
      }
    });
  });
  const allMentors = Array.from(allMentorsMap.values());

  // Collect all sessions across tracks
  const allSessions = cohort.tracks.flatMap((track) =>
    (track.sessions || []).map((s: any) => ({
      ...s,
      trackName: track.name,
      trackAccent: track.accent,
    }))
  );

  return (
    <div className="min-h-screen bg-[#0D0E11] text-[#FAF7EE] flex">
      <AdminSidebar
        currentTab="cohorts"
        admin={admin}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title={cohort.name}
          subtitle={`Under ${cohort.bootcamp?.name || 'Bootcamp'}`}
          admin={admin}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/admin/enrollments"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/15 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#34A853]" />
                <span>Add Students</span>
              </Link>
              <Link
                href="/admin/mentors"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/15 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#FBBC04]" />
                <span>Assign Mentors</span>
              </Link>
              <button
                onClick={() => setIsCreateTrackOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#EA4335] hover:bg-[#EA4335]/90 text-xs font-bold text-white shadow-lg shadow-[#EA4335]/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Track</span>
              </button>
            </div>
          }
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Back link */}
          <Link
            href="/admin/cohorts"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Cohorts</span>
          </Link>

          {/* Cohort Overview Card */}
          <div className="p-5 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      cohort.isActive ? 'bg-[#34A853]' : 'bg-white/30'
                    }`}
                  />
                  <span className="text-xs uppercase font-mono tracking-wider text-white/50">
                    {cohort.isActive ? 'Active Cohort Session' : 'Inactive Cohort'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white break-words">{cohort.name}</h2>
                <p className="text-xs text-white/60 font-mono mt-1">
                  Master Program:{' '}
                  <Link
                    href={`/admin/bootcamps/${cohort.bootcampId}`}
                    className="text-[#4285F4] hover:underline"
                  >
                    {cohort.bootcamp?.name}
                  </Link>
                </p>
              </div>

              <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-white/60">
                <Calendar className="w-4 h-4 text-[#FBBC04] shrink-0" />
                <span>
                  {format(new Date(cohort.startDate), 'MMM d, yyyy')}
                  {cohort.endDate && ` - ${format(new Date(cohort.endDate), 'MMM d, yyyy')}`}
                </span>
              </div>
            </div>

            {/* Metric counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 border-t border-white/5">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
                  <Layers className="w-4 h-4 text-[#4285F4]" />
                  <span>Tracks</span>
                </div>
                <span className="text-2xl font-black text-white">{cohort.tracks.length}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
                  <Users className="w-4 h-4 text-[#34A853]" />
                  <span>Students</span>
                </div>
                <span className="text-2xl font-black text-white">{cohort.totalStudents}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#EA4335]" />
                  <span>Mentors</span>
                </div>
                <span className="text-2xl font-black text-white">{cohort.totalMentors}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
                  <CalendarDays className="w-4 h-4 text-[#FBBC04]" />
                  <span>Sessions</span>
                </div>
                <span className="text-2xl font-black text-white">{allSessions.length}</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 sm:gap-2 border-b border-white/10 pb-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'tracks', label: `Tracks (${cohort.tracks.length})` },
              { id: 'students', label: `Students (${allStudents.length})` },
              { id: 'mentors', label: `Mentors (${allMentors.length})` },
              { id: 'sessions', label: `Sessions (${allSessions.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap px-3 sm:px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/15 text-white border border-white/10'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: TRACKS */}
          {activeTab === 'tracks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Active Curriculum Tracks</h3>
                <button
                  onClick={() => setIsCreateTrackOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white"
                >
                  <Plus className="w-3.5 h-3.5 text-[#EA4335]" />
                  <span>Create Track</span>
                </button>
              </div>

              {cohort.tracks.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-dashed border-white/10 space-y-3">
                  <p className="text-xs text-white/40">No tracks added to this cohort yet.</p>
                  <button
                    onClick={() => setIsCreateTrackOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#EA4335] text-xs font-bold text-white"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Track</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cohort.tracks.map((track) => (
                    <div
                      key={track.id}
                      className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
                      style={{ borderLeftColor: track.accent || '#4285F4', borderLeftWidth: '4px' }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono text-white/40 uppercase">
                            /{track.slug}
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-white">{track.name}</h4>
                        {track.description && (
                          <p className="text-xs text-white/50 line-clamp-2 mt-1">{track.description}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center text-xs">
                        <div className="p-2 rounded-xl bg-white/[0.02]">
                          <span className="block font-bold text-white">
                            {track.enrollments?.length || 0}
                          </span>
                          <span className="text-[10px] text-white/40">Students</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/[0.02]">
                          <span className="block font-bold text-white">
                            {track.mentorAssignments?.length || 0}
                          </span>
                          <span className="text-[10px] text-white/40">Mentors</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/[0.02]">
                          <span className="block font-bold text-white">
                            {track.modules?.length || 0}
                          </span>
                          <span className="text-[10px] text-white/40">Modules</span>
                        </div>
                      </div>

                      <Link
                        href={`/admin/tracks/${track.id}`}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/10 transition-colors"
                      >
                        <span>Manage Track Curriculum & Roster</span>
                        <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STUDENTS */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Enrolled Students in Cohort</h3>
                <Link
                  href="/admin/enrollments"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#34A853]/10 hover:bg-[#34A853]/20 text-[#34A853] text-xs font-bold border border-[#34A853]/20"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Bulk Enroll</span>
                </Link>
              </div>

              {allStudents.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-dashed border-white/10">
                  <p className="text-xs text-white/40">No students are currently enrolled in any track of this cohort.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5 p-4 rounded-3xl bg-white/[0.02] border border-white/10">
                  {allStudents.map((student) => (
                    <div
                      key={student.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="w-9 h-9 border border-white/10 shrink-0">
                          <AvatarImage src={student.avatarUrl} alt={student.firstName} />
                          <AvatarFallback className="bg-[#4285F4] text-white text-xs font-bold">
                            {student.firstName[0]}
                            {student.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-[11px] text-white/40 truncate">{student.email}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 justify-start sm:justify-end">
                        {student.enrolledTracks.map((t: any) => (
                          <span
                            key={t.trackId}
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium"
                            style={{ backgroundColor: `${t.accent}20`, color: t.accent }}
                          >
                            {t.trackName}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MENTORS */}
          {activeTab === 'mentors' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Assigned Track Mentors</h3>
                <Link
                  href="/admin/mentors"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FBBC04]/10 hover:bg-[#FBBC04]/20 text-[#FBBC04] text-xs font-bold border border-[#FBBC04]/20"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Manage Mentors</span>
                </Link>
              </div>

              {allMentors.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-dashed border-white/10">
                  <p className="text-xs text-white/40">No mentors assigned to this cohort yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allMentors.map((mentor) => (
                    <div
                      key={mentor.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="w-10 h-10 border border-white/10 shrink-0">
                          <AvatarImage src={mentor.avatarUrl} alt={mentor.firstName} />
                          <AvatarFallback className="bg-[#FBBC04] text-black font-bold text-xs">
                            {mentor.firstName[0]}
                            {mentor.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {mentor.firstName} {mentor.lastName}
                          </p>
                          <p className="text-[11px] text-white/40 truncate">{mentor.email}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1">
                        {mentor.assignedTracks.map((t: any) => (
                          <span
                            key={t.trackId}
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium"
                            style={{ backgroundColor: `${t.accent}20`, color: t.accent }}
                          >
                            {t.trackName}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SESSIONS */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Cohort Sessions</h3>
                <Link
                  href="/admin/sessions"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white"
                >
                  <Plus className="w-3.5 h-3.5 text-[#FBBC04]" />
                  <span>Schedule Session</span>
                </Link>
              </div>

              {allSessions.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-dashed border-white/10">
                  <p className="text-xs text-white/40">No sessions scheduled in this cohort yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-3 sm:gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold"
                            style={{
                              backgroundColor: `${session.trackAccent || '#4285F4'}20`,
                              color: session.trackAccent || '#4285F4',
                            }}
                          >
                            {session.trackName}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/60">
                            {session.mode}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white break-words">{session.title}</h4>
                        <p className="text-xs text-white/50">
                          {format(new Date(session.startTime), 'EEE, MMM d • h:mm a')}
                        </p>
                      </div>

                      {session.meetingUrl && (
                        <a
                          href={session.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white shrink-0"
                          title="Join Meeting"
                        >
                          <Video className="w-4 h-4 text-[#4285F4]" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Create Track Modal */}
      {isCreateTrackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#0D0E11] border border-white/15 p-5 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">Create Curriculum Track</h3>
                <p className="text-xs text-white/50">Add a new learning track under {cohort.name}</p>
              </div>
              <button
                onClick={() => setIsCreateTrackOpen(false)}
                className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {trackError && (
              <div className="p-3.5 rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/20 flex items-center gap-3 text-xs text-[#EA4335]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{trackError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTrack} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Track Name <span className="text-[#EA4335]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud & DevOps Engineering"
                  value={trackFormData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Slug / URL Identifier <span className="text-[#EA4335]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="cloud-devops"
                  value={trackFormData.slug}
                  onChange={(e) => setTrackFormData({ ...trackFormData, slug: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-mono text-white focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Summary of track syllabus and objectives..."
                  value={trackFormData.description}
                  onChange={(e) => setTrackFormData({ ...trackFormData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Theme Accent Color
                </label>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {['#4285F4', '#34A853', '#FBBC04', '#EA4335', '#A142F4', '#24C1E0'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setTrackFormData({ ...trackFormData, accent: color })}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        trackFormData.accent === color ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="text"
                    value={trackFormData.accent}
                    onChange={(e) => setTrackFormData({ ...trackFormData, accent: e.target.value })}
                    className="w-24 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateTrackOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-2xl text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTrack}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#EA4335] hover:bg-[#EA4335]/90 text-xs font-bold text-white disabled:opacity-50"
                >
                  {isSavingTrack && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Track</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
