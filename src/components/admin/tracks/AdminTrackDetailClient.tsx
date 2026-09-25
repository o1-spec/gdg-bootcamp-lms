'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Users,
  BookOpen,
  Calendar,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  FileCheck,
  UserCheck,
  ExternalLink,
  Clock,
  Video,
  ChevronDown,
  ChevronUp,
  FileText,
  Sliders,
  ShieldCheck,
  X,
  Loader2,
  UserPlus,
} from 'lucide-react';
import { AdminSidebar, AdminUser } from '../AdminSidebar';
import { AdminHeader } from '../AdminHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from '@/lib/date';

interface AdminTrackDetailProps {
  track: any;
  resources: any[];
  students: any[];
  mentors: any[];
  sessions: any[];
  assignments: any[];
  attendanceRate: number;
  admin: AdminUser;
}

export function AdminTrackDetailClient({
  track,
  resources,
  students,
  mentors,
  sessions,
  assignments,
  attendanceRate,
  admin,
}: AdminTrackDetailProps) {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'curriculum' | 'resources' | 'assignments' | 'students' | 'mentors' | 'sessions' | 'attendance'
  >('overview');

  // Expanded module accordion
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    [track.modules?.[0]?.id || '']: true,
  });

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Create module modal
  const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [isSavingModule, setIsSavingModule] = useState(false);
  const [moduleError, setModuleError] = useState<string | null>(null);

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim()) {
      setModuleError('Module title is required.');
      return;
    }

    setIsSavingModule(true);
    setModuleError(null);

    try {
      const slug = moduleTitle
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const res = await fetch('/api/mentor/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId: track.id,
          title: moduleTitle,
          slug,
          description: moduleDescription,
          order: (track.modules?.length || 0) + 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create module');

      setIsCreateModuleOpen(false);
      setModuleTitle('');
      setModuleDescription('');
      router.refresh();
    } catch (err: any) {
      setModuleError(err.message || 'An error occurred.');
    } finally {
      setIsSavingModule(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0E11] text-[#FAF7EE] flex">
      <AdminSidebar
        currentTab="tracks"
        admin={admin}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <AdminHeader
          title={track.name}
          subtitle={`${track.cohort?.name || 'Cohort'} • Unrestricted Admin Access`}
          admin={admin}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/admin/enrollments"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/15 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#34A853]" />
                <span>Enroll Students</span>
              </Link>
              <Link
                href="/admin/mentors"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/15 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#FBBC04]" />
                <span>Assign Mentor</span>
              </Link>
            </div>
          }
        />

        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Back link */}
          <Link
            href="/admin/tracks"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Tracks</span>
          </Link>

          {/* Track Banner */}
          <div
            className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10 space-y-6"
            style={{ borderLeftColor: track.accent || '#4285F4', borderLeftWidth: '6px' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase text-white/40">
                  {track.cohort?.bootcamp?.name} • {track.cohort?.name}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">{track.name}</h2>
                <p className="text-xs font-mono text-white/50 mt-0.5">/{track.slug}</p>
                {track.description && (
                  <p className="text-xs sm:text-sm text-white/60 max-w-2xl mt-2">{track.description}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80">
                  Attendance: <strong className="text-[#34A853]">{attendanceRate}%</strong>
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 border-t border-white/5 text-center text-xs">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="block text-xl font-black text-white">{students.length}</span>
                <span className="text-[10px] text-white/40">Enrolled Students</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="block text-xl font-black text-white">{mentors.length}</span>
                <span className="text-[10px] text-white/40">Assigned Mentors</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="block text-xl font-black text-white">{track.modules?.length || 0}</span>
                <span className="text-[10px] text-white/40">Modules</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="block text-xl font-black text-white">
                  {track.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0)}
                </span>
                <span className="text-[10px] text-white/40">Lessons</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 col-span-2 sm:col-span-1">
                <span className="block text-xl font-black text-white">{assignments.length}</span>
                <span className="text-[10px] text-white/40">Assignments</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (8 tabs for comprehensive track management) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-white/10 scrollbar-none">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'curriculum', label: `Curriculum (${track.modules?.length || 0})` },
              { id: 'resources', label: `Resources (${resources.length})` },
              { id: 'assignments', label: `Assignments (${assignments.length})` },
              { id: 'students', label: `Students (${students.length})` },
              { id: 'mentors', label: `Mentors (${mentors.length})` },
              { id: 'sessions', label: `Sessions (${sessions.length})` },
              { id: 'attendance', label: `Attendance (${attendanceRate}%)` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/15 text-white border border-white/10'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mentors on Track */}
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Track Mentors</h3>
                  <Link
                    href="/admin/mentors"
                    className="text-xs text-[#FBBC04] hover:underline"
                  >
                    Manage
                  </Link>
                </div>
                {mentors.length === 0 ? (
                  <p className="text-xs text-white/40 italic">No mentors assigned to this track.</p>
                ) : (
                  <div className="space-y-3">
                    {mentors.map((m) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={m.avatar || ''} alt={m.name} />
                            <AvatarFallback className="bg-[#FBBC04] text-black text-xs font-bold">
                              {m.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-bold text-white">{m.name}</p>
                            <p className="text-[10px] text-white/40">{m.email}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FBBC04]/10 text-[#FBBC04]">
                          Assigned Mentor
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Sessions on Track */}
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Track Sessions</h3>
                  <Link
                    href="/admin/sessions"
                    className="text-xs text-[#4285F4] hover:underline"
                  >
                    View All
                  </Link>
                </div>
                {sessions.length === 0 ? (
                  <p className="text-xs text-white/40 italic">No sessions scheduled.</p>
                ) : (
                  <div className="space-y-3">
                    {sessions.slice(0, 3).map((s) => (
                      <div
                        key={s.id}
                        className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-white">{s.title}</p>
                          <p className="text-[10px] text-white/40">
                            {format(new Date(s.startTime), 'EEE, MMM d • h:mm a')}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/60">
                          {s.mode}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: CURRICULUM */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Syllabus & Lesson Plan</h3>
                  <p className="text-xs text-white/50">Manage modules, lessons, and student walkthroughs</p>
                </div>
                <button
                  onClick={() => setIsCreateModuleOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white"
                >
                  <Plus className="w-3.5 h-3.5 text-[#4285F4]" />
                  <span>Add Module</span>
                </button>
              </div>

              {(!track.modules || track.modules.length === 0) ? (
                <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-dashed border-white/10 space-y-3">
                  <p className="text-xs text-white/40">No modules created yet for this track.</p>
                  <button
                    onClick={() => setIsCreateModuleOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#EA4335] text-xs font-bold text-white"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Module</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {track.modules.map((mod: any, index: number) => {
                    const isExpanded = expandedModules[mod.id] ?? false;
                    return (
                      <div
                        key={mod.id}
                        className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden"
                      >
                        <div
                          onClick={() => toggleModule(mod.id)}
                          className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.04] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-white">
                              {index + 1}
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-white">{mod.title}</h4>
                              <p className="text-[11px] text-white/40">{mod.lessons?.length || 0} lessons</p>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-white/40" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-white/40" />
                          )}
                        </div>

                        {isExpanded && mod.lessons && mod.lessons.length > 0 && (
                          <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
                            {mod.lessons.map((lesson: any, lIndex: number) => (
                              <div
                                key={lesson.id}
                                className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-xs"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-[11px] font-mono text-white/30">
                                    {index + 1}.{lIndex + 1}
                                  </span>
                                  <span className="font-semibold text-white truncate">{lesson.title}</span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <span className="text-[10px] text-white/40">
                                    {lesson.duration || '45 mins'}
                                  </span>
                                  <Link
                                    href={`/tracks/${track.id}/lessons/${lesson.id}`}
                                    target="_blank"
                                    className="p-1 rounded text-white/40 hover:text-white"
                                    title="View Student Lesson Page"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: RESOURCES */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Track Resources & Course Materials</h3>
              {resources.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-dashed border-white/10">
                  <p className="text-xs text-white/40">No uploaded resource links or files for this track yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map((res) => (
                    <div
                      key={res.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-white/10 text-white/60">
                          {res.type}
                        </span>
                        <h4 className="font-bold text-sm text-white truncate">{res.title}</h4>
                        {res.description && (
                          <p className="text-xs text-white/50 line-clamp-2">{res.description}</p>
                        )}
                      </div>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Assignments & Submissions</h3>
              {assignments.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-dashed border-white/10">
                  <p className="text-xs text-white/40">No assignments created for this track yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map((asg) => (
                    <div
                      key={asg.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <h4 className="font-bold text-sm text-white">{asg.title}</h4>
                        <p className="text-xs text-white/50">
                          Due: {asg.dueDate ? format(new Date(asg.dueDate), 'MMM d, yyyy') : 'No deadline'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-white">
                          {asg.submissions?.length || 0} Submissions
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: STUDENTS */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Enrolled Students ({students.length})</h3>
                <Link
                  href="/admin/enrollments"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#34A853]/10 hover:bg-[#34A853]/20 text-[#34A853] text-xs font-bold border border-[#34A853]/20"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Enroll More Students</span>
                </Link>
              </div>

              {students.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-dashed border-white/10">
                  <p className="text-xs text-white/40">No students enrolled in this track.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5 p-4 rounded-3xl bg-white/[0.02] border border-white/10">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="w-9 h-9 border border-white/10">
                          <AvatarImage src={student.avatar} alt={student.name} />
                          <AvatarFallback className="bg-[#4285F4] text-white text-xs font-bold">
                            {student.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{student.name}</p>
                          <p className="text-[11px] text-white/40 truncate">{student.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="hidden sm:block text-right">
                          <span className="text-xs font-bold text-white">{student.progressPercentage}%</span>
                          <span className="text-[10px] text-white/40 block">Course Progress</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-[#34A853]">{student.attendanceRate}%</span>
                          <span className="text-[10px] text-white/40 block">Attendance</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: MENTORS */}
          {activeTab === 'mentors' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Track Mentors ({mentors.length})</h3>
                <Link
                  href="/admin/mentors"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FBBC04]/10 hover:bg-[#FBBC04]/20 text-[#FBBC04] text-xs font-bold border border-[#FBBC04]/20"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Assign / Remove Mentors</span>
                </Link>
              </div>

              {mentors.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-dashed border-white/10">
                  <p className="text-xs text-white/40">No mentors currently assigned to this track.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mentors.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-white/10">
                          <AvatarImage src={m.avatar || ''} alt={m.name} />
                          <AvatarFallback className="bg-[#FBBC04] text-black font-bold text-xs">
                            {m.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-bold text-white">{m.name}</p>
                          <p className="text-[11px] text-white/40">{m.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#34A853]/10 text-[#34A853]">
                        Active Lead
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: SESSIONS */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Track Sessions ({sessions.length})</h3>
                <Link
                  href="/admin/sessions"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white"
                >
                  <Plus className="w-3.5 h-3.5 text-[#FBBC04]" />
                  <span>Schedule Session</span>
                </Link>
              </div>

              {sessions.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-dashed border-white/10">
                  <p className="text-xs text-white/40">No sessions scheduled for this track yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/60">
                            {s.mode}
                          </span>
                          <span className="text-xs text-white/40">
                            {format(new Date(s.startTime), 'EEE, MMM d • h:mm a')}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white">{s.title}</h4>
                      </div>

                      {s.meetingUrl && (
                        <a
                          href={s.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white shrink-0"
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

          {/* TAB: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Track Attendance Rate</h3>
                  <p className="text-xs text-white/50">Overall presence and session engagement metrics</p>
                </div>
                <div className="text-2xl font-black text-[#34A853]">{attendanceRate}%</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-white/60 space-y-2">
                <p>
                  Attendance is computed from student roll calls marked by mentors during live virtual and physical sessions.
                </p>
                <Link
                  href="/admin/sessions"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4285F4] hover:underline"
                >
                  <span>Explore full cross-track attendance report</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create Module Modal */}
      {isCreateModuleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#0D0E11] border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">Create Curriculum Module</h3>
                <p className="text-xs text-white/50">Add a course section to {track.name}</p>
              </div>
              <button
                onClick={() => setIsCreateModuleOpen(false)}
                className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {moduleError && (
              <div className="p-3.5 rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/20 flex items-center gap-3 text-xs text-[#EA4335]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{moduleError}</span>
              </div>
            )}

            <form onSubmit={handleCreateModule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Module Title <span className="text-[#EA4335]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Module 1: Foundations & Architecture"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Overview of concepts covered in this module..."
                  value={moduleDescription}
                  onChange={(e) => setModuleDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModuleOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white/70 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingModule}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#EA4335] hover:bg-[#EA4335]/90 text-xs font-bold text-white disabled:opacity-50"
                >
                  {isSavingModule && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Module</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
