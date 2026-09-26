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
  FolderGit2,
  FileCheck,
  UserCheck,
  ShieldCheck,
  UserPlus,
  Video,
} from 'lucide-react';
import { AdminSidebar, AdminUser } from '../AdminSidebar';
import { AdminHeader } from '../AdminHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from '@/lib/date';
import { ConfirmDialog } from '@/components/mentor/ConfirmDialog';
import { AdminTrackOverviewTab } from './tabs/AdminTrackOverviewTab';
import { AdminTrackCurriculumTab } from './tabs/AdminTrackCurriculumTab';
import { AdminTrackResourcesTab } from './tabs/AdminTrackResourcesTab';
import { AdminCreateModuleModal } from './modals/AdminCreateModuleModal';
import { AdminCreateResourceModal } from './modals/AdminCreateResourceModal';

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

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    [track.modules?.[0]?.id || '']: true,
  });

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);
  const [isSavingModule, setIsSavingModule] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCreateModule = async (title: string, description: string) => {
    setIsSavingModule(true);

    try {
      const slug = title
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
          title,
          slug,
          description,
          order: (track.modules?.length || 0) + 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create module');

      setIsCreateModuleOpen(false);
      router.refresh();
    } catch (err: any) {
      setActionError(err.message || 'Failed to create module');
    } finally {
      setIsSavingModule(false);
    }
  };

  const [resourceList, setResourceList] = useState<any[]>(resources);
  const [isCreateResourceOpen, setIsCreateResourceOpen] = useState(false);
  const [deletingResource, setDeletingResource] = useState<any | null>(null);

  const handleDeleteResource = async () => {
    if (!deletingResource) return;
    try {
      const res = await fetch(`/api/mentor/resources/${deletingResource.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setResourceList((prev) => prev.filter((r) => r.id !== deletingResource.id));
      }
      setDeletingResource(null);
      router.refresh();
    } catch (err) {
      console.error('Delete error:', err);
      setDeletingResource(null);
    }
  };

  const totalLessons =
    track.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0;

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
          title={track.name}
          subtitle={`${track.cohort?.name || 'Cohort'} • Unrestricted Admin Access`}
          admin={admin}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/enrollments"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/15 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5 text-gdg-green" />
                <span>Enroll Student</span>
              </Link>
              <Link
                href="/admin/tracks"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 hover:text-white border border-white/10 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Tracks</span>
              </Link>
            </div>
          }
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Track Summary Banner */}
          <div className="p-5 sm:p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-2 h-full"
              style={{ backgroundColor: track.accent || '#4285F4' }}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-white/80">
                    /{track.slug}
                  </span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-gdg-blue/10 text-gdg-blue">
                    {track.cohort?.name || 'Bootcamp Cohort'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white wrap-break-word">{track.name}</h2>
                <p className="text-xs sm:text-sm text-white/60 max-w-2xl leading-relaxed">
                  {track.description || 'No track description provided.'}
                </p>
              </div>

              {/* Quick Stat Pill Counter */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 shrink-0">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block">
                    Students
                  </span>
                  <span className="text-lg font-black font-mono text-white">{students.length}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block">
                    Modules
                  </span>
                  <span className="text-lg font-black font-mono text-white">
                    {track.modules?.length || 0}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block">
                    Lessons
                  </span>
                  <span className="text-lg font-black font-mono text-white">{totalLessons}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block">
                    Attendance
                  </span>
                  <span className="text-lg font-black font-mono text-gdg-green">
                    {attendanceRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 border-b border-white/10 overflow-x-auto scrollbar-none pb-px">
            {[
              { id: 'overview', label: 'Overview', icon: BookOpen },
              { id: 'curriculum', label: 'Curriculum & Lessons', icon: Layers, count: totalLessons },
              { id: 'resources', label: 'Track Resources', icon: FolderGit2, count: resourceList.length },
              { id: 'assignments', label: 'Assignments', icon: FileCheck, count: assignments.length },
              { id: 'students', label: 'Enrolled Students', icon: Users, count: students.length },
              { id: 'mentors', label: 'Mentors', icon: ShieldCheck, count: mentors.length },
              { id: 'sessions', label: 'Live Sessions', icon: Calendar, count: sessions.length },
              { id: 'attendance', label: 'Attendance', icon: UserCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${isActive
                      ? 'border-gdg-red text-white bg-white/5'
                      : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gdg-red' : 'text-white/40'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isActive ? 'bg-gdg-red/20 text-gdg-red' : 'bg-white/10 text-white/50'
                        }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <AdminTrackOverviewTab mentors={mentors} sessions={sessions} />
          )}

          {/* TAB: CURRICULUM */}
          {activeTab === 'curriculum' && (
            <AdminTrackCurriculumTab
              track={track}
              expandedModules={expandedModules}
              toggleModule={toggleModule}
              openCreateModule={() => setIsCreateModuleOpen(true)}
            />
          )}

          {/* TAB: RESOURCES */}
          {activeTab === 'resources' && (
            <AdminTrackResourcesTab
              track={track}
              resourceList={resourceList}
              openCreateResourceModal={() => setIsCreateResourceOpen(true)}
              setDeletingResource={setDeletingResource}
            />
          )}

          {/* TAB: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Assignments & Submissions</h3>
              {assignments.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white/5 border border-dashed border-white/10">
                  <p className="text-xs text-white/40">No assignments created for this track yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map((asg) => (
                    <div
                      key={asg.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4"
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gdg-green/10 hover:bg-gdg-green/20 text-gdg-green text-xs font-bold border border-gdg-green/20"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Enroll More Students</span>
                </Link>
              </div>

              {students.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white/5 border border-dashed border-white/10">
                  <p className="text-xs text-white/40">No students enrolled in this track.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5 p-4 rounded-3xl bg-white/5 border border-white/10">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="w-9 h-9 border border-white/10">
                          <AvatarImage src={student.avatar} alt={student.name} />
                          <AvatarFallback className="bg-gdg-blue text-white text-xs font-bold">
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
                          <span className="text-xs font-bold text-gdg-green">{student.attendanceRate}%</span>
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gdg-yellow/10 hover:bg-gdg-yellow/20 text-gdg-yellow text-xs font-bold border border-gdg-yellow/20"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Assign / Remove Mentors</span>
                </Link>
              </div>

              {mentors.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white/5 border border-dashed border-white/10">
                  <p className="text-xs text-white/40">No mentors currently assigned to this track.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mentors.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-white/10">
                          <AvatarImage src={m.avatar || ''} alt={m.name} />
                          <AvatarFallback className="bg-gdg-yellow text-black font-bold text-xs">
                            {m.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-bold text-white">{m.name}</p>
                          <p className="text-[11px] text-white/40">{m.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gdg-green/10 text-gdg-green">
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
                  <Calendar className="w-3.5 h-3.5 text-gdg-blue" />
                  <span>Create Session</span>
                </Link>
              </div>

              {sessions.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white/5 border border-dashed border-white/10">
                  <p className="text-xs text-white/40">No sessions scheduled for this track.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-white/10 text-white/60">
                            {session.mode}
                          </span>
                          <span className="text-xs text-white/40">
                            {format(new Date(session.startTime), 'EEE, MMM d, yyyy • h:mm a')}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{session.title}</h4>
                      </div>

                      {session.meetingUrl && (
                        <a
                          href={session.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white"
                        >
                          <Video className="w-3.5 h-3.5 text-gdg-blue" />
                          <span>Join</span>
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
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Track Attendance Records</h3>
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4 text-center">
                <div className="inline-block p-4 rounded-full bg-gdg-green/10 text-gdg-green text-2xl font-mono font-black">
                  {attendanceRate}%
                </div>
                <p className="text-xs text-white/60 max-w-sm mx-auto">
                  Average student attendance across all live sessions conducted for this track cohort.
                </p>
                <div className="pt-2">
                  <Link
                    href="/admin/sessions"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white"
                  >
                    <span>View Attendance Sessions</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CREATE MODULE MODAL */}
      <AdminCreateModuleModal
        isOpen={isCreateModuleOpen}
        onClose={() => setIsCreateModuleOpen(false)}
        onSubmit={handleCreateModule}
        isSaving={isSavingModule}
      />

      {/* CREATE RESOURCE MODAL */}
      <AdminCreateResourceModal
        isOpen={isCreateResourceOpen}
        onClose={() => setIsCreateResourceOpen(false)}
        modules={track.modules || []}
        onResourceCreated={(newRes) => {
          setResourceList((prev) => [newRes, ...prev]);
          router.refresh();
        }}
      />

      {/* CONFIRM DELETE RESOURCE MODAL */}
      <ConfirmDialog
        isOpen={Boolean(deletingResource)}
        title="Remove Track Resource"
        description={`Are you sure you want to remove "${deletingResource?.title}"? If this is an uploaded Cloudinary asset, the file will be safely deleted from storage.`}
        confirmLabel="Delete Resource"
        isDestructive={true}
        onConfirm={handleDeleteResource}
        onCancel={() => setDeletingResource(null)}
      />

      {/* ERROR ALERT DIALOG */}
      <ConfirmDialog
        isOpen={!!actionError}
        title="Module Action Failed"
        description={actionError || ''}
        confirmLabel="Dismiss"
        cancelText={null}
        variant="warning"
        onConfirm={() => setActionError(null)}
        onClose={() => setActionError(null)}
      />
    </div>
  );
}
