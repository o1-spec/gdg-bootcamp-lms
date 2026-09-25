'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  BookOpen,
  FolderGit2,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { DashboardSidebar, DashboardNavTab } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { StatsCard } from './StatsCard';
import { TrackCard } from './TrackCard';
import { UpcomingClassCard } from './UpcomingClassCard';
import { AssignmentCard } from './AssignmentCard';
import { ResourceItem } from './ResourceItem';
import { AnnouncementCard } from './AnnouncementCard';
import { UpcomingClass, Assignment, Resource, ResourceType, StudentProfile, DashboardStats } from '@/types/lms';
import { StudentDashboardData } from '@/lib/data/dashboard';
import { cn } from '@/lib/utils';

const defaultStats: DashboardStats = {
  enrolledTracks: 0,
  completedLessons: 0,
  totalLessons: 0,
  pendingAssignments: 0,
  overallProgressPercentage: 0,
  attendanceRate: 100,
};

const defaultStudent: StudentProfile = {
  id: '',
  name: 'Student',
  firstName: 'Student',
  lastName: '',
  email: '',
  avatar: '',
  cohort: 'Bootcamp 2026',
  role: 'Student',
  enrolledTracksCount: 0,
  studyStreakDays: 0,
  totalHoursSpent: 0,
  onboardingCompleted: true,
};

interface StudentDashboardProps {
  initialData?: StudentDashboardData;
}

export function StudentDashboard({ initialData }: StudentDashboardProps) {
  const [currentTab, setCurrentTab] = useState<DashboardNavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [resourceFilter, setResourceFilter] = useState<'all' | ResourceType | 'code-all'>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'pending' | 'submitted'>('all');
  const [activeAlert, setActiveAlert] = useState<string | null>(null);

  const student = initialData?.student || defaultStudent;
  const enrolledTracks = initialData?.enrolledTracks || [];
  const stats = initialData?.stats || defaultStats;
  const upcomingClasses = initialData?.upcomingClasses || [];
  const assignmentsList = initialData?.assignments || [];
  const resourcesList = initialData?.resources || [];
  const announcementsList = initialData?.announcements || [];

  const firstName = student.name.split(' ')[0] || 'Student';
  const currentHour = new Date().getHours();
  const timeGreeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resourcesList.filter((res) => {
      const matchesSearch =
        searchQuery === '' ||
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.trackName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.description?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (resourceFilter === 'all') return true;
      if (resourceFilter === 'code-all') {
        return res.type === 'github' || res.type === 'code' || res.type === 'exercise';
      }
      return res.type === resourceFilter;
    });
  }, [resourcesList, searchQuery, resourceFilter]);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return assignmentsList.filter((asg) => {
      const matchesSearch =
        searchQuery === '' ||
        asg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asg.trackName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (assignmentFilter === 'all') return true;
      if (assignmentFilter === 'submitted') return asg.status === 'submitted';
      if (assignmentFilter === 'pending') return asg.status === 'pending' || asg.status === 'due_soon';
      return true;
    });
  }, [assignmentsList, searchQuery, assignmentFilter]);

  const handleResumeLesson = (trackId: string, lessonId: string) => {
    const track = enrolledTracks.find((t) => t.id === trackId || t.slug === trackId);
    setActiveAlert(
      `Launching lesson [${lessonId}]: "${track?.nextLesson?.title || 'Lesson'}" (${track?.name || 'Track'}). Video classroom initializing...`
    );
    setTimeout(() => setActiveAlert(null), 5000);
  };

  const handleJoinClass = (classItem: UpcomingClass) => {
    setActiveAlert(
      `Connecting to live classroom: "${classItem.title}" with ${classItem.instructor.name}...`
    );
    setTimeout(() => setActiveAlert(null), 5000);
  };

  const handleSubmitAssignment = (asg: Assignment) => {
    setActiveAlert(
      `Opening submission challenge portal for: "${asg.title}" (${asg.trackName}).`
    );
    setTimeout(() => setActiveAlert(null), 5000);
  };

  const handleOpenResource = (res: Resource) => {
    setActiveAlert(`Accessing resource: "${res.title}" (${res.type.toUpperCase()}).`);
    setTimeout(() => setActiveAlert(null), 4000);
  };

  return (
    <div className="flex min-h-screen bg-gdg-cream text-gdg-black antialiased selection:bg-gdg-yellow/30">
      {/* Sidebar Navigation: Near-black with cream text */}
      <DashboardSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        student={student}
        enrolledTracks={enrolledTracks}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingAssignmentsCount={stats.pendingAssignments}
        liveClassesCount={upcomingClasses.filter((c) => c.isLiveNow).length}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader
          currentTab={currentTab}
          student={student}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onSearchChange={setSearchQuery}
        />

        {/* GDG LASU Signature Ticker Ribbon */}
        <div className="w-full bg-gdg-yellow text-gdg-black py-2 px-6 overflow-hidden border-b border-gdg-black/10">
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 sm:space-y-10 max-w-7xl w-full mx-auto">
          {/* Interactive alert toast */}
          {activeAlert && (
            <div className="flex items-center justify-between rounded-2xl border border-gdg-black bg-gdg-black text-gdg-cream px-5 py-4 text-xs sm:text-sm shadow-md animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-gdg-yellow shrink-0" />
                <span className="font-semibold">{activeAlert}</span>
              </div>
              <button
                type="button"
                className="text-xs font-black text-gdg-yellow hover:underline ml-4 cursor-pointer"
                onClick={() => setActiveAlert(null)}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* 1. Welcome Section: High-contrast GDG LASU dark card */}
          <section className="relative overflow-hidden rounded-3xl border border-gdg-dark-border bg-gdg-black text-gdg-cream p-5 sm:p-8 lg:p-12 shadow-sm">
            {/* Top right Google accent geometric glow */}
            <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-gdg-blue/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-gdg-yellow/10 blur-3xl" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                {/* Google 4-color dots + cohort tag */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center -space-x-1">
                    <span className="h-3 w-3 rounded-full bg-gdg-blue ring-2 ring-gdg-black" />
                    <span className="h-3 w-3 rounded-full bg-gdg-red ring-2 ring-gdg-black" />
                    <span className="h-3 w-3 rounded-full bg-gdg-yellow ring-2 ring-gdg-black" />
                    <span className="h-3 w-3 rounded-full bg-gdg-green ring-2 ring-gdg-black" />
                  </div>
                  <span className="text-xs font-bold text-gdg-cream/70 uppercase tracking-wider">
                    {student.cohort}
                  </span>
                  <span className="rounded-full bg-gdg-green/20 text-gdg-green border border-gdg-green/30 px-3 py-0.5 text-xs font-bold">
                    Active Student
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gdg-cream leading-tight">
                  {timeGreeting}, {firstName}
                </h2>

                <p className="text-sm sm:text-base text-gdg-cream/80 leading-relaxed font-normal">
                  Connect with mentors, build impactful fullstack products with Google technologies, and ship verifiable capstone projects at Lagos State University.
                </p>

                <div className="flex items-center gap-2 pt-2 text-xs font-bold text-gdg-cream/60">
                  <span className="h-2 w-2 rounded-full bg-gdg-green" />
                  <span>
                    You completed <strong className="text-gdg-cream">{stats.completedLessons} lessons</strong> • Overall progress is at{' '}
                    <strong className="text-gdg-green">{stats.overallProgressPercentage}%</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons: Solid cream pill + Outlined cream pill */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                <Link
                  href={enrolledTracks[0]?.slug ? `/tracks/${enrolledTracks[0].slug}` : '/tracks'}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gdg-cream text-gdg-black hover:bg-white px-7 py-3.5 text-xs font-black tracking-wide shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Resume Next Lesson</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => setCurrentTab('resources')}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-gdg-cream/30 text-gdg-cream hover:bg-gdg-cream/10 px-7 py-3.5 text-xs font-bold tracking-wide transition-all active:scale-95 cursor-pointer"
                >
                  <FolderGit2 className="h-4 w-4 text-gdg-yellow" />
                  <span>Browse Repository</span>
                </button>
              </div>
            </div>
          </section>

          {/* 2. Overview Stats Cards with Google-inspired accent strips */}
          <section className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatsCard
                title="Enrolled Tracks"
                value={stats.enrolledTracks}
                subtext={enrolledTracks.map(t => t.name.split(' ')[0]).join(', ')}
                icon={Layers}
                badge={{ text: 'Active', variant: 'positive' }}
                accentColor="#4285F4" // Google Blue
                href="/tracks"
              />
              <StatsCard
                title="Completed Lessons"
                value={`${stats.completedLessons}/${stats.totalLessons}`}
                subtext="Real curriculum progress"
                icon={CheckCircle2}
                badge={{ text: '+14% Week', variant: 'positive' }}
                accentColor="#34A853" // Google Green
                href="/progress"
              />
              <StatsCard
                title="Pending Assignments"
                value={stats.pendingAssignments}
                subtext={`${stats.pendingAssignments} action required`}
                icon={Clock}
                badge={{ text: stats.pendingAssignments > 0 ? 'Action Needed' : 'Completed', variant: stats.pendingAssignments > 0 ? 'urgent' : 'positive' }}
                accentColor="#EA4335" // Google Red
                href="/assignments"
              />
              <StatsCard
                title="Overall Progress"
                value={`${stats.overallProgressPercentage}%`}
                subtext={`${stats.attendanceRate}% live class attendance`}
                icon={TrendingUp}
                badge={{ text: 'On Track', variant: 'positive' }}
                accentColor="#FBBC04" // Google Yellow
                href="/progress"
              />
            </div>
          </section>

          {/* 3. Continue Learning: Signature GDG LASU Dark Track Cards */}
          <section className="space-y-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gdg-gray">
                  Learning Pathways
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-gdg-black tracking-tight mt-1">
                  Continue Learning
                </h3>
              </div>
              <Link
                href="/tracks"
                className="inline-flex items-center gap-1.5 text-xs font-black text-gdg-black hover:text-gdg-blue transition-colors cursor-pointer"
              >
                <span>View all tracks</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {enrolledTracks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledTracks.map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    onResumeLesson={handleResumeLesson}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-gdg-border bg-white p-8 sm:p-12 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-gdg-blue/10 text-gdg-blue border border-gdg-blue/20 flex items-center justify-center mx-auto">
                  <Ticket className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-black text-gdg-black">
                    You haven&apos;t joined a bootcamp track yet.
                  </h4>
                  <p className="text-xs sm:text-sm text-gdg-gray max-w-md mx-auto">
                    Use an invite code provided by your organizers or contact an admin to unlock your track curriculum and lessons.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link
                    href="/onboarding/join"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gdg-black hover:bg-gdg-dark-border text-xs font-black text-gdg-cream shadow-sm transition-all"
                  >
                    <Ticket className="w-4 h-4 text-gdg-yellow" />
                    <span>Enter Invite Code</span>
                  </Link>
                  <a
                    href="mailto:lead@gdglasu.org"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gdg-cream hover:bg-gdg-border border border-gdg-border text-xs font-bold text-gdg-black transition-all"
                  >
                    <span>Contact Admin</span>
                  </a>
                </div>
              </div>
            )}
          </section>

          {/* 4. Two-Column Layout: Left (Assignments & Resources), Right (Schedule & Announcements) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column (7 cols): Assignments & Resources */}
            <div className="lg:col-span-7 space-y-10">
              {/* Upcoming Assignments */}
              <section className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gdg-gray">
                      Sprint Tasks
                    </p>
                    <Link href="/assignments" className="group inline-flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-gdg-black tracking-tight mt-1 group-hover:text-gdg-blue transition-colors">
                        Upcoming Assignments
                      </h3>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-gdg-blue" />
                    </Link>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Filter pills */}
                    <div className="flex items-center gap-1.5 p-1 rounded-full bg-white border border-gdg-border">
                      {(['all', 'pending', 'submitted'] as const).map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setAssignmentFilter(filter)}
                          className={cn(
                            'px-3 py-1 text-xs rounded-full font-bold transition-all cursor-pointer',
                            assignmentFilter === filter
                              ? 'bg-gdg-black text-gdg-cream'
                              : 'text-gdg-gray hover:text-gdg-black'
                          )}
                        >
                          {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                      ))}
                    </div>

                    <Link
                      href="/assignments"
                      className="hidden sm:inline-flex items-center gap-1 text-xs font-black text-gdg-black hover:text-gdg-blue transition-colors"
                    >
                      <span>View all</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredAssignments.length > 0 ? (
                    filteredAssignments.map((assignment) => (
                      <AssignmentCard
                        key={assignment.id}
                        assignment={assignment}
                        onSubmit={handleSubmitAssignment}
                      />
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed border-gdg-border p-8 text-center text-xs font-semibold text-gdg-gray bg-white">
                      No assignments found matching this filter.
                    </div>
                  )}
                </div>
              </section>

              {/* Recent Learning Resources */}
              <section className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gdg-gray">
                      Curated Knowledge
                    </p>
                    <Link href="/resources" className="group inline-flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-gdg-black tracking-tight mt-1 group-hover:text-gdg-blue transition-colors">
                        Recent Resources
                      </h3>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-gdg-blue" />
                    </Link>
                  </div>

                  {/* Resource quick filter pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setResourceFilter('all')}
                      className={cn(
                        'px-3 py-1 text-xs rounded-full font-bold transition-all cursor-pointer',
                        resourceFilter === 'all'
                          ? 'bg-gdg-black text-gdg-cream'
                          : 'bg-white border border-gdg-border text-gdg-gray hover:text-gdg-black'
                      )}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setResourceFilter('pdf')}
                      className={cn(
                        'px-3 py-1 text-xs rounded-full font-bold transition-all cursor-pointer',
                        resourceFilter === 'pdf'
                          ? 'bg-gdg-black text-gdg-cream'
                          : 'bg-white border border-gdg-border text-gdg-gray hover:text-gdg-black'
                      )}
                    >
                      PDFs
                    </button>
                    <button
                      type="button"
                      onClick={() => setResourceFilter('code-all')}
                      className={cn(
                        'px-3 py-1 text-xs rounded-full font-bold transition-all cursor-pointer',
                        resourceFilter === 'code-all'
                          ? 'bg-gdg-black text-gdg-cream'
                          : 'bg-white border border-gdg-border text-gdg-gray hover:text-gdg-black'
                      )}
                    >
                      Code & Sandbox
                    </button>
                    <button
                      type="button"
                      onClick={() => setResourceFilter('figma')}
                      className={cn(
                        'px-3 py-1 text-xs rounded-full font-bold transition-all cursor-pointer',
                        resourceFilter === 'figma'
                          ? 'bg-gdg-black text-gdg-cream'
                          : 'bg-white border border-gdg-border text-gdg-gray hover:text-gdg-black'
                      )}
                    >
                      Figma
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredResources.slice(0, 5).map((resource) => (
                    <ResourceItem
                      key={resource.id}
                      resource={resource}
                      onOpen={handleOpenResource}
                    />
                  ))}
                </div>

                <div className="pt-2">
                  <Link
                    href="/resources"
                    className="w-full py-3 rounded-full border border-gdg-black text-xs font-black text-gdg-black hover:bg-gdg-black hover:text-gdg-cream transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>View All Learning Resources Repository</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </section>
            </div>

            {/* Right Column (5 cols): Upcoming Classes & Announcements */}
            <div className="lg:col-span-5 space-y-10">
              {/* Upcoming Classes */}
              <section className="space-y-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gdg-gray">
                      Live Sessions
                    </p>
                    <Link href="/schedule" className="group inline-flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-gdg-black tracking-tight mt-1 group-hover:text-gdg-blue transition-colors">
                        Upcoming Classes
                      </h3>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-gdg-blue" />
                    </Link>
                  </div>
                  <Link
                    href="/schedule"
                    className="inline-flex items-center gap-1 text-xs font-black text-gdg-black hover:text-gdg-blue transition-colors cursor-pointer"
                  >
                    <span>Full Schedule</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {upcomingClasses.length > 0 ? (
                    upcomingClasses.map((classItem) => (
                      <UpcomingClassCard
                        key={classItem.id}
                        upcomingClass={classItem}
                        onJoin={handleJoinClass}
                      />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gdg-border bg-white/50 p-6 text-center text-xs font-medium text-gdg-gray">
                      No upcoming live sessions scheduled.
                    </div>
                  )}
                </div>
              </section>

              {/* Announcements Section */}
              <section className="space-y-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gdg-gray">
                      Cohort News
                    </p>
                    <Link href="/announcements" className="group inline-flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-gdg-black tracking-tight mt-1 group-hover:text-gdg-blue transition-colors">
                        Announcements
                      </h3>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-gdg-blue" />
                    </Link>
                  </div>
                  <Link
                    href="/announcements"
                    className="inline-flex items-center gap-1 text-xs font-black text-gdg-black hover:text-gdg-blue transition-colors cursor-pointer"
                  >
                    <span>All news</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {announcementsList.length > 0 ? (
                    announcementsList.map((announcement) => (
                      <AnnouncementCard
                        key={announcement.id}
                        announcement={announcement}
                        onReadMore={(anc) => {
                          setActiveAlert(`Announcement: ${anc.title}`);
                        }}
                      />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gdg-border bg-white/50 p-6 text-center text-xs font-medium text-gdg-gray">
                      No announcements posted yet.
                    </div>
                  )}
                </div>
              </section>

              {/* Curriculum Progress & Attendance Card */}
              <div className="rounded-3xl border border-gdg-dark-border bg-gdg-black text-gdg-cream p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gdg-cream/60">
                    Curriculum Progress
                  </span>
                  <span className="text-sm font-black text-gdg-cream">
                    {stats.completedLessons} / {stats.totalLessons} Lessons
                  </span>
                </div>

                <div className="h-2.5 w-full bg-gdg-dark-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gdg-yellow rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, stats.overallProgressPercentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-medium text-gdg-cream/70">
                  <span>{Math.max(0, stats.totalLessons - stats.completedLessons)} lessons remaining</span>
                  <span className="font-bold text-gdg-green">{stats.overallProgressPercentage}% Completed</span>
                </div>

                <div className="pt-3 border-t border-gdg-dark-border flex items-center justify-between">
                  <Link
                    href="/attendance"
                    className="text-xs text-gdg-cream/80 hover:text-white flex items-center gap-1 font-bold transition-colors"
                  >
                    <span className="h-2 w-2 rounded-full bg-gdg-green" />
                    <span>{stats.attendanceRate}% Attendance Record</span>
                  </Link>

                  <Link
                    href="/progress"
                    className="text-xs text-gdg-yellow font-black flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <span>View Analytics</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
