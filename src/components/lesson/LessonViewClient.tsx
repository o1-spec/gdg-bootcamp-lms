'use client';

import React, { useState } from 'react';
import { FullLesson, LessonResourceItem, StudentProfile, Track } from '@/types/lms';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { LessonHeader } from './LessonHeader';
import { LessonVideo } from './LessonVideo';
import { LessonObjectives } from './LessonObjectives';
import { LessonContent } from './LessonContent';
import { LessonResources } from './LessonResources';
import { LessonNavigation } from './LessonNavigation';
import { LessonSidebar } from './LessonSidebar';
import { mockStudentProfile, mockDashboardStats, mockUpcomingClasses, mockTracks } from '@/data/mockData';
import { Sparkles } from 'lucide-react';

interface LessonViewClientProps {
  lesson: FullLesson;
  moduleLessons: {
    id: string;
    slug: string;
    title: string;
    durationMinutes: number;
    isCompleted: boolean;
    isCurrent: boolean;
  }[];
  student?: StudentProfile;
  enrolledTracks?: Track[];
}

export function LessonViewClient({
  lesson,
  moduleLessons,
  student = mockStudentProfile,
  enrolledTracks = mockTracks,
}: LessonViewClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(lesson.status === 'completed');
  const [activeAlert, setActiveAlert] = useState<string | null>(null);

  const handleToggleComplete = async () => {
    const previousState = isCompleted;
    setIsCompleted(!previousState);

    try {
      const res = await fetch(`/api/lessons/${lesson.id}/progress`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        setIsCompleted(previousState);
        setActiveAlert('Failed to update progress on the server.');
        return;
      }

      setIsCompleted(data.completed);
      setActiveAlert(
        data.completed
          ? `Great job! "${lesson.title}" marked as completed. Progress updated.`
          : `Marked "${lesson.title}" as incomplete.`
      );
    } catch {
      setIsCompleted(previousState);
      setActiveAlert('Unable to connect to progress service.');
    }

    setTimeout(() => setActiveAlert(null), 4000);
  };

  const handleOpenResource = (res: LessonResourceItem) => {
    setActiveAlert(`Accessing resource: "${res.title}" (${res.type.toUpperCase()})`);
    setTimeout(() => setActiveAlert(null), 4000);
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7EE] text-[#0D0E11] antialiased selection:bg-[#FBBC04]/30">
      {/* App Sidebar */}
      <DashboardSidebar
        currentTab="my-tracks"
        student={student}
        enrolledTracks={enrolledTracks}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingAssignmentsCount={mockDashboardStats.pendingAssignments}
        liveClassesCount={mockUpcomingClasses.filter((c) => c.isLiveNow).length}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader
          currentTab="my-tracks"
          student={student}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        {/* Ticker Ribbon */}
        <div className="w-full bg-[#FBBC04] text-[#0D0E11] py-2 px-6 overflow-hidden border-b border-[#0D0E11]/10">
          <div className="flex items-center justify-between text-xs font-black tracking-wider uppercase whitespace-nowrap">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              <span>BUILD ✦</span>
              <span>INNOVATE ✦</span>
              <span>DESIGN ✦</span>
              <span>SHIP ✦</span>
              <span>LEARN ✦</span>
              <span>CONNECT ✦</span>
              <span>GROW ✦</span>
              <span className="hidden sm:inline">BUILD ✦ INNOVATE ✦ SHIP</span>
            </div>
            <span className="hidden lg:inline text-[11px] font-bold tracking-normal opacity-90 pl-4">
              GDG on Campus LASU Career Bootcamp 2026
            </span>
          </div>
        </div>

        <main className="flex-1 p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl w-full mx-auto">
          {/* Toast Notification */}
          {activeAlert && (
            <div className="flex items-center justify-between rounded-2xl border border-[#0D0E11] bg-[#0D0E11] text-[#FAF7EE] px-5 py-4 text-xs sm:text-sm shadow-md animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-[#FBBC04] shrink-0" />
                <span className="font-semibold">{activeAlert}</span>
              </div>
              <button
                type="button"
                className="text-xs font-black text-[#FBBC04] hover:underline ml-4 cursor-pointer"
                onClick={() => setActiveAlert(null)}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Two-Column Lesson Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left / Main Content (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Lesson Header */}
              <LessonHeader lesson={lesson} isCompleted={isCompleted} />

              {/* Lesson Video */}
              {lesson.video && (
                <LessonVideo
                  title={lesson.video.title}
                  duration={lesson.video.duration}
                  accentColor={lesson.trackAccentColor}
                />
              )}

              {/* Learning Objectives */}
              <LessonObjectives
                objectives={lesson.learningObjectives}
                accentColor={lesson.trackAccentColor}
              />

              {/* Lesson Content Notes, Code Blocks, Tables */}
              <LessonContent sections={lesson.sections} />

              {/* Lesson Resources */}
              <LessonResources
                resources={lesson.resources}
                onOpenResource={handleOpenResource}
              />

              {/* Previous / Next Lesson Navigation */}
              <LessonNavigation
                trackId={lesson.trackId}
                prevLesson={lesson.prevLesson}
                nextLesson={lesson.nextLesson}
              />
            </div>

            {/* Right Sidebar: Module Progress & Lesson List (4 cols) */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
              <LessonSidebar
                trackId={lesson.trackId}
                moduleName={lesson.moduleName}
                moduleOrder={lesson.moduleOrder}
                lessons={moduleLessons}
                isCurrentLessonCompleted={isCompleted}
                onToggleComplete={handleToggleComplete}
                accentColor={lesson.trackAccentColor}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
