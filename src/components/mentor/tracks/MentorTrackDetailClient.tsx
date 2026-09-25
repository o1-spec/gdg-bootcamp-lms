'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Users,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  FolderGit2,
  FileCheck,
  UserCheck,
} from 'lucide-react';
import { MentorSidebar } from '@/components/mentor/MentorSidebar';
import { MentorHeader } from '@/components/mentor/MentorHeader';
import { ConfirmDialog } from '@/components/mentor/ConfirmDialog';
import { MentorEnrolledStudent } from '@/lib/data/mentor';
import { cn } from '@/lib/utils';
import { MentorTrackCurriculumTab } from './tabs/MentorTrackCurriculumTab';
import { MentorTrackOverviewTab } from './tabs/MentorTrackOverviewTab';
import { MentorTrackResourcesTab } from './tabs/MentorTrackResourcesTab';
import { MentorTrackAssignmentsTab } from './tabs/MentorTrackAssignmentsTab';
import { MentorTrackStudentsTab } from './tabs/MentorTrackStudentsTab';
import { MentorTrackAttendanceTab } from './tabs/MentorTrackAttendanceTab';
import { MentorModuleModal } from './MentorModuleModal';
import { MentorLessonModal } from './MentorLessonModal';
import { MentorStudentProfileModal } from './MentorStudentProfileModal';

interface TrackDetailProps {
  track: any;
  resources: any[];
  students: MentorEnrolledStudent[];
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

export function MentorTrackDetailClient({
  track,
  resources: initialResources,
  students,
  mentor,
  metrics,
}: TrackDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'curriculum' | 'resources' | 'assignments' | 'students' | 'attendance'
  >('curriculum');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [modules, setModules] = useState<any[]>(track.modules || []);
  const [resources] = useState<any[]>(initialResources || []);
  const [expandedModuleIds, setExpandedModuleIds] = useState<Record<string, boolean>>(
    (track.modules || []).reduce((acc: any, m: any) => ({ ...acc, [m.id]: true }), {})
  );

  const [selectedStudent, setSelectedStudent] = useState<MentorEnrolledStudent | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any | null>(null);
  const [deletingModule, setDeletingModule] = useState<any | null>(null);

  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [targetModuleForLesson, setTargetModuleForLesson] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<any | null>(null);

  const openAddModule = () => {
    setFormError(null);
    setIsAddModuleOpen(true);
  };

  const openEditModule = (m: any) => {
    setEditingModule(m);
    setFormError(null);
  };

  const handleSaveModule = async (data: {
    title: string;
    slug: string;
    order: number;
    description: string;
  }) => {
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (editingModule) {
        const res = await fetch(`/api/mentor/modules/${editingModule.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || 'Failed to update module');

        setModules((prev) =>
          prev.map((m) => (m.id === editingModule.id ? { ...m, ...resData.module } : m))
        );
        showToast('Module updated successfully');
        setEditingModule(null);
      } else {
        const res = await fetch('/api/mentor/modules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trackId: track.id,
            ...data,
          }),
        });
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || 'Failed to create module');

        setModules((prev) => [...prev, { ...resData.module, lessons: [] }]);
        showToast('New module created');
        setIsAddModuleOpen(false);
      }
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModule = async () => {
    if (!deletingModule) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/mentor/modules/${deletingModule.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete module');

      setModules((prev) => prev.filter((m) => m.id !== deletingModule.id));
      showToast('Module removed');
      setDeletingModule(null);
      router.refresh();
    } catch (err: any) {
      showToast(err.message || 'Deletion failed');
      setDeletingModule(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReorderModule = async (moduleId: string, direction: 'up' | 'down') => {
    const currentIndex = modules.findIndex((m) => m.id === moduleId);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= modules.length) return;

    const currentMod = modules[currentIndex];
    const targetMod = modules[targetIndex];

    const currentOrder = currentMod.order;
    const targetOrder = targetMod.order;

    const updated = [...modules];
    updated[currentIndex] = { ...currentMod, order: targetOrder };
    updated[targetIndex] = { ...targetMod, order: currentOrder };
    updated.sort((a, b) => a.order - b.order);
    setModules(updated);

    try {
      await Promise.all([
        fetch(`/api/mentor/modules/${currentMod.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: targetOrder }),
        }),
        fetch(`/api/mentor/modules/${targetMod.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: currentOrder }),
        }),
      ]);
      showToast('Module order updated');
    } catch {
      showToast('Order update failed, refreshing');
      router.refresh();
    }
  };

  const openAddLesson = (modId: string) => {
    setTargetModuleForLesson(modId);
    setFormError(null);
    setIsAddLessonOpen(true);
  };

  const openEditLesson = (lesson: any, modId: string) => {
    setTargetModuleForLesson(modId);
    setEditingLesson(lesson);
    setFormError(null);
  };

  const handleSaveLesson = async (data: {
    title: string;
    slug: string;
    duration: number;
    order: number;
    description: string;
    content: string;
    isPublished: boolean;
  }) => {
    if (!targetModuleForLesson) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (editingLesson) {
        const res = await fetch(`/api/mentor/lessons/${editingLesson.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: data.title,
            slug: data.slug,
            description: data.description,
            content: data.content,
            durationMinutes: data.duration,
            order: data.order,
            isPublished: data.isPublished,
          }),
        });
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || 'Failed to update lesson');

        setModules((prev) =>
          prev.map((m) => {
            if (m.id !== targetModuleForLesson) return m;
            return {
              ...m,
              lessons: m.lessons.map((l: any) =>
                l.id === editingLesson.id ? { ...l, ...resData.lesson } : l
              ),
            };
          })
        );
        showToast('Lesson updated');
        setEditingLesson(null);
      } else {
        const res = await fetch('/api/mentor/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moduleId: targetModuleForLesson,
            title: data.title,
            slug: data.slug,
            description: data.description,
            content: data.content,
            durationMinutes: data.duration,
            order: data.order,
            isPublished: data.isPublished,
          }),
        });
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || 'Failed to create lesson');

        setModules((prev) =>
          prev.map((m) => {
            if (m.id !== targetModuleForLesson) return m;
            return {
              ...m,
              lessons: [...(m.lessons || []), resData.lesson],
            };
          })
        );
        showToast('New lesson created');
        setIsAddLessonOpen(false);
      }
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!deletingLesson) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/mentor/lessons/${deletingLesson.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete lesson');

      setModules((prev) =>
        prev.map((m) => ({
          ...m,
          lessons: (m.lessons || []).filter((l: any) => l.id !== deletingLesson.id),
        }))
      );
      showToast('Lesson deleted');
      setDeletingLesson(null);
      router.refresh();
    } catch (err: any) {
      showToast(err.message || 'Deletion failed');
      setDeletingLesson(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (lesson: any, modId: string) => {
    const newStatus = !lesson.isPublished;
    try {
      const res = await fetch(`/api/mentor/lessons/${lesson.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');

      setModules((prev) =>
        prev.map((m) => {
          if (m.id !== modId) return m;
          return {
            ...m,
            lessons: m.lessons.map((l: any) =>
              l.id === lesson.id ? { ...l, isPublished: newStatus } : l
            ),
          };
        })
      );
      showToast(newStatus ? 'Lesson published to students' : 'Lesson unpublished (draft)');
    } catch {
      showToast('Failed to toggle publish status');
    }
  };

  const handleReorderLesson = async (modId: string, lessonId: string, direction: 'up' | 'down') => {
    const targetMod = modules.find((m) => m.id === modId);
    if (!targetMod || !targetMod.lessons) return;

    const currentIndex = targetMod.lessons.findIndex((l: any) => l.id === lessonId);
    if (currentIndex === -1) return;
    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= targetMod.lessons.length) return;

    const curLesson = targetMod.lessons[currentIndex];
    const nxtLesson = targetMod.lessons[nextIndex];

    const curOrder = curLesson.order;
    const nxtOrder = nxtLesson.order;

    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== modId) return m;
        const updatedLessons = [...m.lessons];
        updatedLessons[currentIndex] = { ...curLesson, order: nxtOrder };
        updatedLessons[nextIndex] = { ...nxtLesson, order: curOrder };
        updatedLessons.sort((a: any, b: any) => a.order - b.order);
        return { ...m, lessons: updatedLessons };
      })
    );

    try {
      await Promise.all([
        fetch(`/api/mentor/lessons/${curLesson.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: nxtOrder }),
        }),
        fetch(`/api/mentor/lessons/${nxtLesson.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: curOrder }),
        }),
      ]);
      showToast('Lesson order updated');
    } catch {
      showToast('Failed to reorder lessons');
    }
  };

  const totalLessonsCount = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const targetMod = modules.find((m) => m.id === targetModuleForLesson);

  return (
    <div className="flex min-h-screen bg-[#FAF7EE] text-[#0D0E11] antialiased selection:bg-[#FBBC04]/30">
      <MentorSidebar
        currentTab="tracks"
        mentor={mentor}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingSubmissionsCount={metrics.pendingSubmissionsCount}
        assignedTracksCount={metrics.assignedTracksCount}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <MentorHeader
          currentTab="tracks"
          mentor={mentor}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] px-5 py-3 shadow-xl border border-[#34A853]/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
            <CheckCircle2 className="h-4 w-4 text-[#34A853]" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}

        <main className="flex-1 p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl w-full mx-auto">
          {/* Back Button & Track Title Banner */}
          <div className="space-y-6">
            <Link
              href="/mentor/tracks"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#5F6368] hover:text-[#0D0E11] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to All Assigned Tracks</span>
            </Link>

            <div className="p-8 rounded-3xl bg-white border border-[#E5DFD0] shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div
                className="absolute top-0 left-0 bottom-0 w-2.5"
                style={{ backgroundColor: track.accent || '#4285F4' }}
              />

              <div className="space-y-2 pl-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
                    {track.cohort?.name || 'Cohort 1.0'}
                  </span>
                  <span className="text-xs text-[#5F6368] font-bold">Track ID: {track.slug}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-[#0D0E11]">
                  {track.name}
                </h1>
                <p className="text-sm text-[#5F6368] max-w-2xl font-medium">
                  {track.description}
                </p>
              </div>

              {/* Header Quick Metrics */}
              <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
                <div className="px-4 py-2.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-center">
                  <span className="text-[10px] font-bold uppercase text-[#5F6368] block">Students</span>
                  <span className="text-lg font-black text-[#0D0E11]">{students.length}</span>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-center">
                  <span className="text-[10px] font-bold uppercase text-[#5F6368] block">Modules</span>
                  <span className="text-lg font-black text-[#0D0E11]">{modules.length}</span>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-center">
                  <span className="text-[10px] font-bold uppercase text-[#5F6368] block">Lessons</span>
                  <span className="text-lg font-black text-[#0D0E11]">{totalLessonsCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[#E5DFD0] overflow-x-auto no-scrollbar pb-px">
            {[
              { id: 'curriculum', label: 'Curriculum & Modules', icon: Layers, badge: modules.length },
              { id: 'overview', label: 'Overview', icon: BookOpen },
              { id: 'resources', label: 'Track Resources', icon: FolderGit2, badge: resources.length },
              { id: 'assignments', label: 'Assignments', icon: FileCheck, badge: track.assignments?.length || 0 },
              { id: 'students', label: 'Enrolled Students', icon: Users, badge: students.length },
              { id: 'attendance', label: 'Sessions & Attendance', icon: UserCheck, badge: track.sessions?.length || 0 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors rounded-t-xl',
                    isActive
                      ? 'border-[#0D0E11] text-[#0D0E11] bg-white'
                      : 'border-transparent text-[#5F6368] hover:text-[#0D0E11] hover:bg-white/50'
                  )}
                >
                  <Icon className={cn('h-4 w-4', isActive ? 'text-[#4285F4]' : 'text-[#5F6368]')} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold',
                        isActive ? 'bg-[#0D0E11] text-white' : 'bg-[#E5DFD0] text-[#5F6368]'
                      )}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: CURRICULUM */}
          {activeTab === 'curriculum' && (
            <MentorTrackCurriculumTab
              modules={modules}
              expandedModuleIds={expandedModuleIds}
              setExpandedModuleIds={setExpandedModuleIds}
              openAddModule={openAddModule}
              openEditModule={openEditModule}
              setDeletingModule={setDeletingModule}
              handleReorderModule={handleReorderModule}
              openAddLesson={openAddLesson}
              openEditLesson={openEditLesson}
              setDeletingLesson={setDeletingLesson}
              handleReorderLesson={handleReorderLesson}
              handleTogglePublish={handleTogglePublish}
            />
          )}

          {/* TAB 2: OVERVIEW */}
          {activeTab === 'overview' && (
            <MentorTrackOverviewTab
              track={track}
              totalLessonsCount={totalLessonsCount}
              openAddModule={openAddModule}
            />
          )}

          {/* TAB 3: RESOURCES */}
          {activeTab === 'resources' && (
            <MentorTrackResourcesTab trackId={track.id} resources={resources} />
          )}

          {/* TAB 4: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <MentorTrackAssignmentsTab trackId={track.id} assignments={track.assignments} />
          )}

          {/* TAB 5: STUDENTS */}
          {activeTab === 'students' && (
            <MentorTrackStudentsTab
              students={students}
              onSelectStudent={(st) => setSelectedStudent(st)}
            />
          )}

          {/* TAB 6: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <MentorTrackAttendanceTab trackId={track.id} sessions={track.sessions} />
          )}
        </main>
      </div>

      {/* STUDENT DETAIL MODAL */}
      <MentorStudentProfileModal
        selectedStudent={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        modulesCount={modules.length}
      />

      {/* MODULE MODAL */}
      <MentorModuleModal
        isOpen={isAddModuleOpen || !!editingModule}
        onClose={() => {
          setIsAddModuleOpen(false);
          setEditingModule(null);
        }}
        editingModule={editingModule}
        defaultOrder={(modules.length || 0) + 1}
        onSave={handleSaveModule}
        isSubmitting={isSubmitting}
        formError={formError}
      />

      {/* LESSON MODAL */}
      <MentorLessonModal
        isOpen={isAddLessonOpen || !!editingLesson}
        onClose={() => {
          setIsAddLessonOpen(false);
          setEditingLesson(null);
        }}
        editingLesson={editingLesson}
        defaultOrder={(targetMod?.lessons?.length || 0) + 1}
        onSave={handleSaveLesson}
        isSubmitting={isSubmitting}
        formError={formError}
      />

      {/* CONFIRM DELETE MODULE */}
      <ConfirmDialog
        isOpen={!!deletingModule}
        title="Delete Module"
        description={`Are you sure you want to delete "${deletingModule?.title}"? This action cannot be undone if the module has active lessons.`}
        confirmLabel="Delete Module"
        isDestructive={true}
        onConfirm={handleDeleteModule}
        onCancel={() => setDeletingModule(null)}
      />

      {/* CONFIRM DELETE LESSON */}
      <ConfirmDialog
        isOpen={!!deletingLesson}
        title="Delete Lesson"
        description={`Are you sure you want to permanently delete lesson "${deletingLesson?.title}"?`}
        confirmLabel="Delete Lesson"
        isDestructive={true}
        onConfirm={handleDeleteLesson}
        onCancel={() => setDeletingLesson(null)}
      />
    </div>
  );
}
