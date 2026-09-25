'use client';

import React, { useState, useMemo } from 'react';
import {
  Layers,
  CheckCircle2,
  Clock,
  TrendingUp,
  Flame,
  ArrowRight,
  BookOpen,
  FolderGit2,
  Sparkles,
} from 'lucide-react';
import { DashboardSidebar, DashboardNavTab } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { StatsCard } from './StatsCard';
import { TrackCard } from './TrackCard';
import { UpcomingClassCard } from './UpcomingClassCard';
import { AssignmentCard } from './AssignmentCard';
import { ResourceItem } from './ResourceItem';
import { AnnouncementCard } from './AnnouncementCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  mockStudentProfile,
  mockDashboardStats,
  mockTracks,
  mockUpcomingClasses,
  mockAssignments,
  mockResources,
  mockAnnouncements,
} from '@/data/mockData';
import { UpcomingClass, Assignment, Resource, ResourceType } from '@/types/lms';

export function StudentDashboard() {
  const [currentTab, setCurrentTab] = useState<DashboardNavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [resourceFilter, setResourceFilter] = useState<'all' | ResourceType | 'code-all'>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'pending' | 'submitted'>('all');
  const [activeAlert, setActiveAlert] = useState<string | null>(null);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return mockResources.filter((res) => {
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
  }, [searchQuery, resourceFilter]);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return mockAssignments.filter((asg) => {
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
  }, [searchQuery, assignmentFilter]);

  const handleResumeLesson = (trackId: string, lessonId: string) => {
    const track = mockTracks.find((t) => t.id === trackId);
    setActiveAlert(
      `Launching lesson [${lessonId}]: "${track?.nextLesson.title}" (${track?.name}). Video player and interactive sandbox initializing...`
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
      `Opening assignment submission portal for: "${asg.title}" (${asg.trackName}).`
    );
    setTimeout(() => setActiveAlert(null), 5000);
  };

  const handleOpenResource = (res: Resource) => {
    setActiveAlert(`Accessing resource: "${res.title}" (${res.type.toUpperCase()}).`);
    setTimeout(() => setActiveAlert(null), 4000);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Sidebar Navigation */}
      <DashboardSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        student={mockStudentProfile}
        enrolledTracks={mockTracks}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingAssignmentsCount={mockDashboardStats.pendingAssignments}
        liveClassesCount={mockUpcomingClasses.filter((c) => c.isLiveNow).length}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader
          currentTab={currentTab}
          student={mockStudentProfile}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* Interactive toast alert banner if active */}
          {activeAlert && (
            <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-xs sm:text-sm text-foreground shadow-xs animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span>{activeAlert}</span>
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-primary hover:underline ml-4"
                onClick={() => setActiveAlert(null)}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* 1. Welcome Section */}
          <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-linear-to-r from-card via-card to-muted/40 p-6 sm:p-8 shadow-xs">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                    <Flame className="h-3.5 w-3.5 text-amber-500" />
                    {mockStudentProfile.studyStreakDays} Day Streak
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    • {mockStudentProfile.cohort}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Welcome back, {mockStudentProfile.name.split(' ')[0]} 👋
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  You are making strong progress across your 3 enrolled tracks. You completed{' '}
                  <span className="font-semibold text-foreground">12 lessons</span> this week,
                  and your overall completion is at{' '}
                  <span className="font-semibold text-foreground">
                    {mockDashboardStats.overallProgressPercentage}%
                  </span>
                  .
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Button
                  onClick={() =>
                    handleResumeLesson(mockTracks[0].id, mockTracks[0].nextLesson.id)
                  }
                  className="gap-2 shadow-xs font-medium"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Resume Next Lesson</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentTab('resources')}
                  className="gap-2 font-medium"
                >
                  <FolderGit2 className="h-4 w-4 text-muted-foreground" />
                  <span>Browse Resources</span>
                </Button>
              </div>
            </div>
          </div>

          {/* 2. Overview Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Enrolled Tracks"
              value={mockDashboardStats.enrolledTracks}
              subtext="Backend, Frontend & DSA"
              icon={Layers}
              badge={{ text: 'Active', variant: 'positive' }}
              iconColor="text-blue-600 dark:text-blue-400"
              iconBg="bg-blue-500/10"
            />
            <StatsCard
              title="Completed Lessons"
              value={`${mockDashboardStats.completedLessons}/${mockDashboardStats.totalLessons}`}
              subtext="+12 completed this week"
              icon={CheckCircle2}
              badge={{ text: '+14%', variant: 'positive' }}
              iconColor="text-emerald-600 dark:text-emerald-400"
              iconBg="bg-emerald-500/10"
            />
            <StatsCard
              title="Pending Assignments"
              value={mockDashboardStats.pendingAssignments}
              subtext="1 due in next 48 hours"
              icon={Clock}
              badge={{ text: 'Action Needed', variant: 'urgent' }}
              iconColor="text-amber-600 dark:text-amber-400"
              iconBg="bg-amber-500/10"
            />
            <StatsCard
              title="Overall Progress"
              value={`${mockDashboardStats.overallProgressPercentage}%`}
              subtext={`${mockDashboardStats.attendanceRate}% live class attendance`}
              icon={TrendingUp}
              badge={{ text: 'On Track', variant: 'positive' }}
              iconColor="text-purple-600 dark:text-purple-400"
              iconBg="bg-purple-500/10"
            />
          </div>

          {/* 3. Continue Learning: Enrolled Tracks */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                  Continue Learning
                </h3>
                <p className="text-xs text-muted-foreground">
                  Pick up right where you left off in your enrolled tracks
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary gap-1"
                onClick={() => setCurrentTab('my-tracks')}
              >
                <span>View all tracks</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {mockTracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  onResumeLesson={handleResumeLesson}
                />
              ))}
            </div>
          </section>

          {/* 4. Two-Column Layout: Left (Assignments & Resources), Right (Schedule & Announcements) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column (7 cols): Assignments & Resources */}
            <div className="lg:col-span-7 space-y-8">
              {/* Upcoming Assignments */}
              <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                      Upcoming Assignments
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Hands-on projects and coding assessments
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    {(['all', 'pending', 'submitted'] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setAssignmentFilter(filter)}
                        className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${assignmentFilter === filter
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/70 text-muted-foreground hover:text-foreground'
                          }`}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredAssignments.length > 0 ? (
                    filteredAssignments.map((assignment) => (
                      <AssignmentCard
                        key={assignment.id}
                        assignment={assignment}
                        onSubmit={handleSubmitAssignment}
                      />
                    ))
                  ) : (
                    <Card className="border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                      No assignments found matching this filter.
                    </Card>
                  )}
                </div>
              </section>

              {/* Recent Learning Resources */}
              <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                      Recent Resources
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Curated slides, cheatsheets, repos, and study notes
                    </p>
                  </div>

                  {/* Resource quick filters */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setResourceFilter('all')}
                      className={`px-2 py-0.5 text-xs rounded-md font-medium cursor-pointer ${resourceFilter === 'all'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setResourceFilter('pdf')}
                      className={`px-2 py-0.5 text-xs rounded-md font-medium cursor-pointer ${resourceFilter === 'pdf'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      PDFs
                    </button>
                    <button
                      type="button"
                      onClick={() => setResourceFilter('code-all')}
                      className={`px-2 py-0.5 text-xs rounded-md font-medium cursor-pointer ${resourceFilter === 'code-all'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      Code & Sandbox
                    </button>
                    <button
                      type="button"
                      onClick={() => setResourceFilter('figma')}
                      className={`px-2 py-0.5 text-xs rounded-md font-medium cursor-pointer ${resourceFilter === 'figma'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      Figma
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {filteredResources.slice(0, 5).map((resource) => (
                    <ResourceItem
                      key={resource.id}
                      resource={resource}
                      onOpen={handleOpenResource}
                    />
                  ))}
                </div>

                <div className="pt-1">
                  <Button
                    variant="outline"
                    className="w-full text-xs font-medium h-9 gap-1.5"
                    onClick={() => setCurrentTab('resources')}
                  >
                    <span>View All Learning Resources Repository</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </section>
            </div>

            {/* Right Column (5 cols): Upcoming Classes & Announcements */}
            <div className="lg:col-span-5 space-y-8">
              {/* Upcoming Classes */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                      Upcoming Classes
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Live workshops & mentor sessions
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary gap-1"
                    onClick={() => setCurrentTab('schedule')}
                  >
                    <span>Calendar</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {mockUpcomingClasses.map((classItem) => (
                    <UpcomingClassCard
                      key={classItem.id}
                      upcomingClass={classItem}
                      onJoin={handleJoinClass}
                    />
                  ))}
                </div>
              </section>

              {/* Announcements Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                      Cohort Announcements
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Official updates from mentors & admin
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary gap-1"
                    onClick={() => setCurrentTab('announcements')}
                  >
                    <span>All news</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {mockAnnouncements.map((announcement) => (
                    <AnnouncementCard
                      key={announcement.id}
                      announcement={announcement}
                      onReadMore={(anc) => {
                        setActiveAlert(`Announcement: ${anc.title}`);
                      }}
                    />
                  ))}
                </div>
              </section>

              {/* Weekly Goal & Study Hours Summary Card */}
              <Card className="border border-border/80 bg-muted/30 shadow-xs">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Weekly Study Target
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      18 / 25 Hours
                    </span>
                  </div>

                  <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: '72%' }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>7 hours needed by Sunday</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      72% Completed
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <div className="text-xs">
                      <span className="text-muted-foreground">Total logged: </span>
                      <span className="font-semibold text-foreground">
                        {mockStudentProfile.totalHoursSpent} hrs
                      </span>
                    </div>
                    <span className="text-xs text-primary font-medium flex items-center gap-1 cursor-pointer hover:underline">
                      Log hours <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
