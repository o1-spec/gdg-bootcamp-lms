'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Users,
  BookOpen,
  Calendar,
  Send,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  FolderGit2,
  FileCheck,
  UserCheck,
  ExternalLink,
  Clock,
  Sparkles,
  X,
  FileText,
  Video,
  Code,
  Sliders,
  Check,
} from 'lucide-react';
import { MentorSidebar } from '@/components/mentor/MentorSidebar';
import { MentorHeader } from '@/components/mentor/MentorHeader';
import { ConfirmDialog } from '@/components/mentor/ConfirmDialog';
import { MentorEnrolledStudent } from '@/lib/data/mentor';
import { cn } from '@/lib/utils';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'resources' | 'assignments' | 'students' | 'attendance'>('curriculum');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Curriculum state
  const [modules, setModules] = useState<any[]>(track.modules || []);
  const [resources, setResources] = useState<any[]>(initialResources || []);
  const [expandedModuleIds, setExpandedModuleIds] = useState<Record<string, boolean>>(
    (track.modules || []).reduce((acc: any, m: any) => ({ ...acc, [m.id]: true }), {})
  );

  // Selected student for detail modal
  const [selectedStudent, setSelectedStudent] = useState<MentorEnrolledStudent | null>(null);

  // Alerts & Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Modals state
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any | null>(null);
  const [deletingModule, setDeletingModule] = useState<any | null>(null);

  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [targetModuleForLesson, setTargetModuleForLesson] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<any | null>(null);

  // Module form fields
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleSlug, setModuleSlug] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [moduleOrder, setModuleOrder] = useState<number>(1);

  // Lesson form fields
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonSlug, setLessonSlug] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonDuration, setLessonDuration] = useState<number>(45);
  const [lessonOrder, setLessonOrder] = useState<number>(1);
  const [lessonIsPublished, setLessonIsPublished] = useState<boolean>(true);

  // Auto-slugify helper
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const openAddModule = () => {
    setModuleTitle('');
    setModuleSlug('');
    setModuleDescription('');
    setModuleOrder((modules.length || 0) + 1);
    setFormError(null);
    setIsAddModuleOpen(true);
  };

  const openEditModule = (m: any) => {
    setEditingModule(m);
    setModuleTitle(m.title);
    setModuleSlug(m.slug);
    setModuleDescription(m.description || '');
    setModuleOrder(m.order);
    setFormError(null);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (editingModule) {
        // PATCH
        const res = await fetch(`/api/mentor/modules/${editingModule.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: moduleTitle,
            slug: moduleSlug,
            description: moduleDescription,
            order: Number(moduleOrder),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update module');

        setModules((prev) =>
          prev.map((m) => (m.id === editingModule.id ? { ...m, ...data.module } : m))
        );
        showToast('Module updated successfully');
        setEditingModule(null);
      } else {
        // POST
        const res = await fetch('/api/mentor/modules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trackId: track.id,
            title: moduleTitle,
            slug: moduleSlug,
            description: moduleDescription,
            order: Number(moduleOrder),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create module');

        setModules((prev) => [...prev, { ...data.module, lessons: [] }]);
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

  // Reorder modules
  const handleReorderModule = async (moduleId: string, direction: 'up' | 'down') => {
    const currentIndex = modules.findIndex((m) => m.id === moduleId);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= modules.length) return;

    const currentMod = modules[currentIndex];
    const targetMod = modules[targetIndex];

    const currentOrder = currentMod.order;
    const targetOrder = targetMod.order;

    // Swap orders locally for immediate feedback
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
    } catch (err) {
      showToast('Order update failed, refreshing');
      router.refresh();
    }
  };

  // Lessons handlers
  const openAddLesson = (modId: string) => {
    const mod = modules.find((m) => m.id === modId);
    setTargetModuleForLesson(modId);
    setLessonTitle('');
    setLessonSlug('');
    setLessonDescription('');
    setLessonContent('');
    setLessonDuration(45);
    setLessonOrder((mod?.lessons?.length || 0) + 1);
    setLessonIsPublished(true);
    setFormError(null);
    setIsAddLessonOpen(true);
  };

  const openEditLesson = (lesson: any, modId: string) => {
    setTargetModuleForLesson(modId);
    setEditingLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonSlug(lesson.slug);
    setLessonDescription(lesson.description || '');
    setLessonContent(lesson.content || '');
    setLessonDuration(lesson.durationMinutes || 45);
    setLessonOrder(lesson.order);
    setLessonIsPublished(lesson.isPublished);
    setFormError(null);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetModuleForLesson) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (editingLesson) {
        // PATCH
        const res = await fetch(`/api/mentor/lessons/${editingLesson.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: lessonTitle,
            slug: lessonSlug,
            description: lessonDescription,
            content: lessonContent,
            durationMinutes: Number(lessonDuration),
            order: Number(lessonOrder),
            isPublished: lessonIsPublished,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update lesson');

        setModules((prev) =>
          prev.map((m) => {
            if (m.id !== targetModuleForLesson) return m;
            return {
              ...m,
              lessons: m.lessons.map((l: any) =>
                l.id === editingLesson.id ? { ...l, ...data.lesson } : l
              ),
            };
          })
        );
        showToast('Lesson updated');
        setEditingLesson(null);
      } else {
        // POST
        const res = await fetch('/api/mentor/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moduleId: targetModuleForLesson,
            title: lessonTitle,
            slug: lessonSlug,
            description: lessonDescription,
            content: lessonContent,
            durationMinutes: Number(lessonDuration),
            order: Number(lessonOrder),
            isPublished: lessonIsPublished,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create lesson');

        setModules((prev) =>
          prev.map((m) => {
            if (m.id !== targetModuleForLesson) return m;
            return {
              ...m,
              lessons: [...(m.lessons || []), data.lesson],
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

  // Quick toggle publish status
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
    } catch (err) {
      showToast('Failed to toggle publish status');
    }
  };

  // Reorder lessons
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
    } catch (err) {
      showToast('Failed to reorder lessons');
    }
  };

  const totalLessonsCount = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

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

        {/* Success Toast */}
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

          {/* TAB 1: CURRICULUM MANAGEMENT */}
          {activeTab === 'curriculum' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-[#0D0E11]">Curriculum Management</h2>
                  <p className="text-xs text-[#5F6368] font-medium">
                    Build modules, organize lessons, edit syllabi, and publish live content for students.
                  </p>
                </div>
                <button
                  onClick={openAddModule}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] transition-colors shadow-sm self-start sm:self-auto"
                >
                  <Plus className="h-4 w-4 text-[#FBBC04]" />
                  <span>Add Module</span>
                </button>
              </div>

              {modules.length === 0 ? (
                <div className="rounded-3xl bg-white border border-[#E5DFD0] p-12 text-center shadow-sm space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#4285F4]/10 text-[#4285F4] flex items-center justify-center mx-auto">
                    <Layers className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-black text-[#0D0E11]">No Modules Created</h3>
                  <p className="text-xs text-[#5F6368] max-w-md mx-auto">
                    Start structuring your track syllabus by creating the first module (e.g., &quot;Fundamentals &amp; Setup&quot;).
                  </p>
                  <button
                    onClick={openAddModule}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] transition-colors"
                  >
                    <Plus className="h-4 w-4 text-[#FBBC04]" />
                    <span>Create First Module</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {modules.map((mod, index) => {
                    const isExpanded = expandedModuleIds[mod.id] ?? true;
                    return (
                      <div
                        key={mod.id}
                        className="rounded-3xl bg-white border border-[#E5DFD0] shadow-sm overflow-hidden"
                      >
                        {/* Module Header Bar */}
                        <div className="p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5DFD0]">
                          <div className="flex items-center gap-4">
                            {/* Reorder Module Up/Down */}
                            <div className="flex flex-col items-center gap-1">
                              <button
                                disabled={index === 0}
                                onClick={() => handleReorderModule(mod.id, 'up')}
                                className="p-1 rounded hover:bg-[#FAF7EE] text-[#5F6368] disabled:opacity-25 transition-colors"
                                title="Move Module Up"
                              >
                                <ChevronUp className="h-3.5 w-3.5" />
                              </button>
                              <span className="text-[11px] font-mono font-black text-[#0D0E11] w-5 text-center">
                                #{mod.order}
                              </span>
                              <button
                                disabled={index === modules.length - 1}
                                onClick={() => handleReorderModule(mod.id, 'down')}
                                className="p-1 rounded hover:bg-[#FAF7EE] text-[#5F6368] disabled:opacity-25 transition-colors"
                                title="Move Module Down"
                              >
                                <ChevronDown className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-[#4285F4] bg-[#4285F4]/10 px-2.5 py-0.5 rounded-md">
                                  Module {mod.order}
                                </span>
                                <span className="text-[11px] font-mono text-[#5F6368]">
                                  /{mod.slug}
                                </span>
                              </div>
                              <h3 className="text-lg font-black text-[#0D0E11] mt-0.5">
                                {mod.title}
                              </h3>
                              {mod.description && (
                                <p className="text-xs text-[#5F6368] mt-1 line-clamp-1">
                                  {mod.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Module Controls */}
                          <div className="flex items-center gap-2 self-end md:self-auto">
                            <button
                              onClick={() => openAddLesson(mod.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7EE] hover:bg-[#E5DFD0] text-xs font-bold text-[#0D0E11] border border-[#E5DFD0] transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5 text-[#34A853]" />
                              <span>Add Lesson</span>
                            </button>

                            <button
                              onClick={() => openEditModule(mod)}
                              className="p-2 rounded-xl hover:bg-[#FAF7EE] border border-transparent hover:border-[#E5DFD0] text-[#5F6368] hover:text-[#0D0E11] transition-colors"
                              title="Edit Module"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => setDeletingModule(mod)}
                              className="p-2 rounded-xl hover:bg-[#EA4335]/10 border border-transparent text-[#5F6368] hover:text-[#EA4335] transition-colors"
                              title="Delete Module"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() =>
                                setExpandedModuleIds((prev) => ({
                                  ...prev,
                                  [mod.id]: !isExpanded,
                                }))
                              }
                              className="p-2 rounded-xl hover:bg-[#FAF7EE] text-[#5F6368] transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Lessons List in Module */}
                        {isExpanded && (
                          <div className="p-6 bg-[#FAF7EE]/50 space-y-3">
                            {(!mod.lessons || mod.lessons.length === 0) ? (
                              <div className="p-6 rounded-2xl bg-white border border-dashed border-[#E5DFD0] text-center text-xs text-[#5F6368]">
                                No lessons added to this module yet.{' '}
                                <button
                                  onClick={() => openAddLesson(mod.id)}
                                  className="text-[#4285F4] font-bold underline ml-1 hover:text-[#3367D6]"
                                >
                                  Add one now
                                </button>
                              </div>
                            ) : (
                              mod.lessons.map((lesson: any, lIndex: number) => (
                                <div
                                  key={lesson.id}
                                  className="p-4 rounded-2xl bg-white border border-[#E5DFD0] hover:border-[#0D0E11]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                  <div className="flex items-center gap-3">
                                    {/* Lesson Reorder */}
                                    <div className="flex flex-col items-center gap-0.5">
                                      <button
                                        disabled={lIndex === 0}
                                        onClick={() => handleReorderLesson(mod.id, lesson.id, 'up')}
                                        className="p-0.5 rounded hover:bg-[#FAF7EE] text-[#5F6368] disabled:opacity-20"
                                      >
                                        <ChevronUp className="h-3 w-3" />
                                      </button>
                                      <span className="text-[10px] font-mono font-bold text-[#5F6368]">
                                        {lesson.order}
                                      </span>
                                      <button
                                        disabled={lIndex === mod.lessons.length - 1}
                                        onClick={() => handleReorderLesson(mod.id, lesson.id, 'down')}
                                        className="p-0.5 rounded hover:bg-[#FAF7EE] text-[#5F6368] disabled:opacity-20"
                                      >
                                        <ChevronDown className="h-3 w-3" />
                                      </button>
                                    </div>

                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-[#0D0E11]">
                                          {lesson.title}
                                        </span>
                                        {lesson.isPublished ? (
                                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/30">
                                            Published
                                          </span>
                                        ) : (
                                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#5F6368]/10 text-[#5F6368] border border-[#5F6368]/30">
                                            Draft
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3 text-xs text-[#5F6368] mt-1">
                                        <span className="font-mono text-[11px]">/{lesson.slug}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3 text-[#FBBC04]" />
                                          {lesson.durationMinutes} min
                                        </span>
                                        {lesson._count?.progress !== undefined && (
                                          <>
                                            <span>•</span>
                                            <span>{lesson._count.progress} completed</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Lesson Actions */}
                                  <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <button
                                      onClick={() => handleTogglePublish(lesson, mod.id)}
                                      className={cn(
                                        'px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1',
                                        lesson.isPublished
                                          ? 'border-[#E5DFD0] text-[#5F6368] hover:text-[#EA4335] hover:bg-[#EA4335]/5'
                                          : 'border-[#34A853]/40 bg-[#34A853]/10 text-[#34A853] hover:bg-[#34A853]/20'
                                      )}
                                      title={lesson.isPublished ? 'Unpublish to Draft' : 'Publish Live'}
                                    >
                                      {lesson.isPublished ? (
                                        <>
                                          <EyeOff className="h-3 w-3" />
                                          <span>Unpublish</span>
                                        </>
                                      ) : (
                                        <>
                                          <Eye className="h-3 w-3" />
                                          <span>Publish</span>
                                        </>
                                      )}
                                    </button>

                                    <button
                                      onClick={() => openEditLesson(lesson, mod.id)}
                                      className="p-1.5 rounded-lg hover:bg-[#FAF7EE] text-[#5F6368] hover:text-[#0D0E11] transition-colors"
                                      title="Edit Lesson"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>

                                    <button
                                      onClick={() => setDeletingLesson(lesson)}
                                      className="p-1.5 rounded-lg hover:bg-[#EA4335]/10 text-[#5F6368] hover:text-[#EA4335] transition-colors"
                                      title="Delete Lesson"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="p-8 rounded-3xl bg-white border border-[#E5DFD0] shadow-sm space-y-4">
                  <h2 className="text-xl font-black text-[#0D0E11]">Track Information</h2>
                  <p className="text-sm text-[#5F6368] leading-relaxed">
                    {track.description}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#E5DFD0]">
                    <div>
                      <span className="text-[11px] font-bold uppercase text-[#5F6368] block">Cohort</span>
                      <span className="text-sm font-black text-[#0D0E11]">{track.cohort?.name}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase text-[#5F6368] block">Assigned Mentors</span>
                      <span className="text-sm font-black text-[#0D0E11]">
                        {track.mentorAssignments?.length || 1}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase text-[#5F6368] block">Total Lessons</span>
                      <span className="text-sm font-black text-[#0D0E11]">{totalLessonsCount}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase text-[#5F6368] block">Live Sessions</span>
                      <span className="text-sm font-black text-[#0D0E11]">{track.sessions?.length || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Assigned Mentors Box */}
                <div className="p-8 rounded-3xl bg-white border border-[#E5DFD0] shadow-sm space-y-4">
                  <h3 className="text-base font-black text-[#0D0E11]">Mentor Instructional Staff</h3>
                  <div className="divide-y divide-[#E5DFD0]">
                    {track.mentorAssignments?.map((ma: any) => (
                      <div key={ma.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={ma.mentor.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={ma.mentor.firstName}
                            className="w-9 h-9 rounded-full object-cover border border-[#E5DFD0]"
                          />
                          <div>
                            <span className="text-xs font-black text-[#0D0E11] block">
                              {ma.mentor.firstName} {ma.mentor.lastName}
                            </span>
                            <span className="text-[11px] text-[#5F6368]">{ma.mentor.email}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
                          {ma.mentor.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Quick Access */}
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-white border border-[#E5DFD0] shadow-sm space-y-4">
                  <h3 className="text-base font-black text-[#0D0E11]">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={openAddModule}
                      className="w-full text-left p-3 rounded-2xl bg-[#FAF7EE] hover:bg-[#E5DFD0]/60 transition-colors flex items-center justify-between text-xs font-bold text-[#0D0E11]"
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-[#FBBC04]" />
                        <span>Add New Module</span>
                      </span>
                    </button>
                    <Link
                      href={`/mentor/assignments?trackId=${track.id}`}
                      className="w-full p-3 rounded-2xl bg-[#FAF7EE] hover:bg-[#E5DFD0]/60 transition-colors flex items-center justify-between text-xs font-bold text-[#0D0E11]"
                    >
                      <span className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-[#4285F4]" />
                        <span>Manage Assignments</span>
                      </span>
                    </Link>
                    <Link
                      href={`/mentor/attendance?trackId=${track.id}`}
                      className="w-full p-3 rounded-2xl bg-[#FAF7EE] hover:bg-[#E5DFD0]/60 transition-colors flex items-center justify-between text-xs font-bold text-[#0D0E11]"
                    >
                      <span className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-[#34A853]" />
                        <span>Take Attendance</span>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RESOURCES */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#0D0E11]">Track Learning Resources</h2>
                  <p className="text-xs text-[#5F6368]">Documentation, starter repos, slides, and links for this track.</p>
                </div>
                <Link
                  href={`/mentor/resources?trackId=${track.id}`}
                  className="px-4 py-2.5 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] transition-colors"
                >
                  Manage All Resources
                </Link>
              </div>

              {resources.length === 0 ? (
                <div className="p-8 rounded-3xl bg-white border border-[#E5DFD0] text-center text-xs text-[#5F6368]">
                  No resources uploaded for this track yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map((res: any) => (
                    <div
                      key={res.id}
                      className="p-5 rounded-2xl bg-white border border-[#E5DFD0] hover:border-[#0D0E11] transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
                          {res.type}
                        </span>
                        {res.isRequired && (
                          <span className="text-[10px] font-bold text-[#EA4335]">Required</span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-[#0D0E11] line-clamp-1">{res.title}</h4>
                      {res.description && (
                        <p className="text-xs text-[#5F6368] line-clamp-2">{res.description}</p>
                      )}
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4285F4] hover:underline pt-2"
                      >
                        <span>Access Resource</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#0D0E11]">Track Assignments</h2>
                  <p className="text-xs text-[#5F6368]">Assessments and projects assigned to this track cohort.</p>
                </div>
                <Link
                  href={`/mentor/assignments?trackId=${track.id}`}
                  className="px-4 py-2.5 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] transition-colors"
                >
                  Create &amp; Manage Assignments
                </Link>
              </div>

              {(!track.assignments || track.assignments.length === 0) ? (
                <div className="p-8 rounded-3xl bg-white border border-[#E5DFD0] text-center text-xs text-[#5F6368]">
                  No assignments created for this track yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {track.assignments.map((assignment: any) => {
                    const submittedCount = assignment.submissions?.length || 0;
                    return (
                      <div
                        key={assignment.id}
                        className="p-6 rounded-3xl bg-white border border-[#E5DFD0] shadow-sm hover:border-[#0D0E11] transition-all space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368]">
                              {assignment.type || 'PROJECT'} • {assignment.points} Points
                            </span>
                            <h3 className="text-base font-black text-[#0D0E11] mt-1">{assignment.title}</h3>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
                            Due {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        <p className="text-xs text-[#5F6368] line-clamp-2">{assignment.description}</p>

                        <div className="pt-4 border-t border-[#E5DFD0] flex items-center justify-between">
                          <span className="text-xs text-[#5F6368] font-medium">
                            <strong>{submittedCount}</strong> Submissions
                          </span>
                          <Link
                            href={`/mentor/assignments/${assignment.id}`}
                            className="text-xs font-bold text-[#4285F4] hover:underline"
                          >
                            Review Submissions →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: STUDENTS (Req 15) */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#0D0E11]">Enrolled Students</h2>
                <p className="text-xs text-[#5F6368]">
                  Supervise individual student learning trajectory, submission completions, and session attendance.
                </p>
              </div>

              {students.length === 0 ? (
                <div className="p-8 rounded-3xl bg-white border border-[#E5DFD0] text-center text-xs text-[#5F6368]">
                  No students currently enrolled in this track.
                </div>
              ) : (
                <div className="rounded-3xl bg-white border border-[#E5DFD0] shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF7EE] border-b border-[#E5DFD0] text-[#5F6368] uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="py-4 px-6">Student</th>
                          <th className="py-4 px-4 text-center">Progress</th>
                          <th className="py-4 px-4 text-center">Lessons</th>
                          <th className="py-4 px-4 text-center">Assignments</th>
                          <th className="py-4 px-4 text-center">Attendance</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5DFD0]">
                        {students.map((st) => (
                          <tr
                            key={st.id}
                            className="hover:bg-[#FAF7EE]/50 transition-colors cursor-pointer"
                            onClick={() => setSelectedStudent(st)}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <img
                                  src={st.avatar}
                                  alt={st.name}
                                  className="w-9 h-9 rounded-full object-cover border border-[#E5DFD0]"
                                />
                                <div>
                                  <span className="font-bold text-[#0D0E11] block text-sm">{st.name}</span>
                                  <span className="text-[#5F6368] text-[11px]">{st.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="inline-flex items-center gap-2">
                                <div className="w-16 bg-[#E5DFD0] h-2 rounded-full overflow-hidden">
                                  <div
                                    className="bg-[#34A853] h-full rounded-full"
                                    style={{ width: `${st.progressPercentage}%` }}
                                  />
                                </div>
                                <span className="font-bold text-[#0D0E11] font-mono">{st.progressPercentage}%</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center font-bold text-[#0D0E11]">
                              {st.completedLessons}/{st.totalLessons}
                            </td>
                            <td className="py-4 px-4 text-center font-bold text-[#0D0E11]">
                              {st.completedAssignments}/{st.totalAssignments}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span
                                className={cn(
                                  'px-2.5 py-1 rounded-full text-[10px] font-black font-mono',
                                  st.attendanceRate >= 80
                                    ? 'bg-[#34A853]/10 text-[#34A853]'
                                    : st.attendanceRate >= 60
                                    ? 'bg-[#FBBC04]/20 text-[#0D0E11]'
                                    : 'bg-[#EA4335]/10 text-[#EA4335]'
                                )}
                              >
                                {st.attendanceRate}%
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStudent(st);
                                }}
                                className="px-3 py-1.5 rounded-xl border border-[#E5DFD0] text-xs font-bold text-[#0D0E11] hover:bg-white shadow-xs"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#0D0E11]">Sessions &amp; Attendance</h2>
                  <p className="text-xs text-[#5F6368]">Live workshops, lecture dates, and recorded attendance.</p>
                </div>
                <Link
                  href={`/mentor/attendance?trackId=${track.id}`}
                  className="px-4 py-2.5 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] transition-colors"
                >
                  Record Attendance
                </Link>
              </div>

              {(!track.sessions || track.sessions.length === 0) ? (
                <div className="p-8 rounded-3xl bg-white border border-[#E5DFD0] text-center text-xs text-[#5F6368]">
                  No sessions scheduled for this track yet.
                </div>
              ) : (
                <div className="divide-y divide-[#E5DFD0] bg-white rounded-3xl border border-[#E5DFD0] shadow-sm overflow-hidden">
                  {track.sessions.map((session: any) => (
                    <div key={session.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#4285F4]/10 text-[#4285F4]">
                            {session.mode}
                          </span>
                          <span className="text-xs text-[#5F6368] font-bold">
                            {new Date(session.startTime).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <h4 className="text-base font-black text-[#0D0E11] mt-1">{session.title}</h4>
                        <p className="text-xs text-[#5F6368] mt-0.5">{session.description}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#5F6368] font-medium">
                          {session.attendances?.length || 0} students recorded
                        </span>
                        <Link
                          href={`/mentor/attendance?trackId=${track.id}&sessionId=${session.id}`}
                          className="px-4 py-2 rounded-xl bg-[#FAF7EE] hover:bg-[#E5DFD0] text-xs font-bold text-[#0D0E11] border border-[#E5DFD0] transition-colors"
                        >
                          Mark Attendance
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* STUDENT DETAIL DRAWER / MODAL (Req 15) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[#E5DFD0] p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-[#E5DFD0]"
                />
                <div>
                  <h3 className="text-xl font-black text-[#0D0E11]">{selectedStudent.name}</h3>
                  <p className="text-xs text-[#5F6368]">{selectedStudent.email}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
                    Enrolled {new Date(selectedStudent.enrolledAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-xl hover:bg-[#FAF7EE] text-[#5F6368] hover:text-[#0D0E11]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0]">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#5F6368]">Progress</span>
                <p className="text-xl font-black text-[#0D0E11] font-mono">
                  {selectedStudent.progressPercentage}%
                </p>
              </div>
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#5F6368]">Lessons</span>
                <p className="text-xl font-black text-[#0D0E11] font-mono">
                  {selectedStudent.completedLessons}/{selectedStudent.totalLessons}
                </p>
              </div>
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#5F6368]">Attendance</span>
                <p className="text-xl font-black text-[#0D0E11] font-mono">
                  {selectedStudent.attendanceRate}%
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#5F6368]">
                Student Progress Summary
              </h4>
              <div className="p-4 rounded-2xl bg-white border border-[#E5DFD0] space-y-2 text-xs">
                <div className="flex justify-between text-[#5F6368]">
                  <span>Track Modules Enrolled</span>
                  <span className="font-bold text-[#0D0E11]">{modules.length} Modules</span>
                </div>
                <div className="flex justify-between text-[#5F6368]">
                  <span>Assignments Completed</span>
                  <span className="font-bold text-[#0D0E11]">
                    {selectedStudent.completedAssignments} of {selectedStudent.totalAssignments}
                  </span>
                </div>
                <div className="flex justify-between text-[#5F6368]">
                  <span>Live Sessions Attended</span>
                  <span className="font-bold text-[#0D0E11]">
                    {selectedStudent.sessionsAttended} of {selectedStudent.totalSessions}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedStudent(null)}
              className="w-full py-3 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] transition-colors"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* MODULE CREATE / EDIT MODAL */}
      {(isAddModuleOpen || editingModule) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[#E5DFD0] p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-[#0D0E11]">
                {editingModule ? 'Edit Module' : 'Create New Module'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModuleOpen(false);
                  setEditingModule(null);
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

            <form onSubmit={handleSaveModule} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                  Module Title *
                </label>
                <input
                  type="text"
                  required
                  value={moduleTitle}
                  onChange={(e) => {
                    setModuleTitle(e.target.value);
                    if (!editingModule) setModuleSlug(slugify(e.target.value));
                  }}
                  placeholder="e.g., PostgreSQL & Advanced Schema Design"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={moduleSlug}
                    onChange={(e) => setModuleSlug(slugify(e.target.value))}
                    placeholder="postgresql-schema-design"
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                    Order Number *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={moduleOrder}
                    onChange={(e) => setModuleOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={moduleDescription}
                  onChange={(e) => setModuleDescription(e.target.value)}
                  placeholder="Brief overview of learning outcomes for this module..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModuleOpen(false);
                    setEditingModule(null);
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
                  {isSubmitting ? 'Saving...' : editingModule ? 'Save Changes' : 'Create Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LESSON CREATE / EDIT MODAL */}
      {(isAddLessonOpen || editingLesson) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-[#E5DFD0] p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-[#0D0E11]">
                {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
              </h3>
              <button
                onClick={() => {
                  setIsAddLessonOpen(false);
                  setEditingLesson(null);
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

            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => {
                    setLessonTitle(e.target.value);
                    if (!editingLesson) setLessonSlug(slugify(e.target.value));
                  }}
                  placeholder="e.g., Database Migrations & Relations"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={lessonSlug}
                    onChange={(e) => setLessonSlug(slugify(e.target.value))}
                    placeholder="db-migrations"
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                    Duration (Mins) *
                  </label>
                  <input
                    type="number"
                    min="5"
                    required
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                    Order *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={lessonOrder}
                    onChange={(e) => setLessonOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={lessonDescription}
                  onChange={(e) => setLessonDescription(e.target.value)}
                  placeholder="Summary of core concepts covered in this lesson..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                  Lesson Content / Notes (Markdown supported)
                </label>
                <textarea
                  rows={6}
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  placeholder="Write lesson notes, code samples, commands, or learning guidelines..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-mono resize-y"
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0]">
                <input
                  type="checkbox"
                  id="publishCheckbox"
                  checked={lessonIsPublished}
                  onChange={(e) => setLessonIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-[#4285F4] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="publishCheckbox" className="text-xs font-bold text-[#0D0E11] cursor-pointer">
                  Publish Lesson immediately (visible to enrolled students)
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddLessonOpen(false);
                    setEditingLesson(null);
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
                  {isSubmitting ? 'Saving...' : editingLesson ? 'Save Changes' : 'Create Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
