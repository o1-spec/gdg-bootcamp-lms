'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  CalendarRange,
  Users,
  ShieldCheck,
  Layers,
  CalendarDays,
  FileCheck2,
  Percent,
  ArrowUpRight,
  Plus,
  Megaphone,
  Clock,
  Video,
  MapPin,
  ExternalLink,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { AdminSidebar, AdminUser } from '../AdminSidebar';
import { AdminHeader } from '../AdminHeader';
import {
  AdminDashboardMetrics,
  AdminRecentEnrollment,
  AdminCohortSummary,
  AdminTrackOverview,
} from '@/lib/data/admin';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from '@/lib/date';
import { cn } from '@/lib/utils';

interface AdminDashboardClientProps {
  metrics: AdminDashboardMetrics;
  recentEnrollments: AdminRecentEnrollment[];
  activeCohorts: AdminCohortSummary[];
  upcomingSessions: any[];
  recentAnnouncements: any[];
  trackOverview: AdminTrackOverview[];
  admin: AdminUser;
}

export function AdminDashboardClient({
  metrics,
  recentEnrollments,
  activeCohorts,
  upcomingSessions,
  recentAnnouncements,
  trackOverview,
  admin,
}: AdminDashboardClientProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const statCards = [
    {
      label: 'Active Bootcamps',
      value: metrics.activeBootcampsCount,
      icon: Award,
      color: '#EA4335',
      href: '/admin/bootcamps',
    },
    {
      label: 'Active Cohorts',
      value: metrics.activeCohortsCount,
      icon: CalendarRange,
      color: '#FBBC04',
      href: '/admin/cohorts',
    },
    {
      label: 'Total Students',
      value: metrics.totalStudentsCount,
      icon: Users,
      color: '#4285F4',
      href: '/admin/users?role=STUDENT',
    },
    {
      label: 'Total Mentors',
      value: metrics.totalMentorsCount,
      icon: ShieldCheck,
      color: '#34A853',
      href: '/admin/mentors',
    },
    {
      label: 'Total Tracks',
      value: metrics.totalTracksCount,
      icon: Layers,
      color: '#4285F4',
      href: '/admin/tracks',
    },
    {
      label: 'Upcoming Sessions',
      value: metrics.upcomingSessionsCount,
      icon: CalendarDays,
      color: '#FBBC04',
      href: '/admin/sessions',
    },
    {
      label: 'Pending Reviews',
      value: metrics.pendingReviewsCount,
      icon: FileCheck2,
      color: '#EA4335',
      href: '/mentor/submissions',
    },
    {
      label: 'Overall Attendance',
      value: `${metrics.overallAttendanceRate}%`,
      icon: Percent,
      color: '#34A853',
      href: '/admin/sessions',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0D0E11] text-[#FAF7EE] flex">
      <AdminSidebar
        currentTab="dashboard"
        admin={admin}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
        activeBootcampsCount={metrics.activeBootcampsCount}
        totalStudentsCount={metrics.totalStudentsCount}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Command Dashboard"
          subtitle="GDG on Campus LASU Bootcamp Administration Overview"
          admin={admin}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/admin/bootcamps"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/15 transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-[#4285F4]" />
                <span>New Bootcamp</span>
              </Link>
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#EA4335] hover:bg-[#EA4335]/90 text-xs font-bold text-white shadow-lg shadow-[#EA4335]/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </Link>
            </div>
          }
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto">
          {/* Top 8 Metric Cards Grid */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">
                Platform Statistics
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {statCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={i}
                    href={card.href}
                    className="group relative p-4 sm:p-5 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${card.color}15`, color: card.color }}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                        {card.value}
                      </div>
                      <div className="text-xs font-medium text-white/50 group-hover:text-white/70 transition-colors mt-0.5">
                        {card.label}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Dual Column: Active Cohorts & Upcoming Sessions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Active Cohorts */}
            <section className="p-5 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Active Cohorts</h3>
                  <p className="text-xs text-white/50">Current running bootcamp cohorts</p>
                </div>
                <Link
                  href="/admin/cohorts"
                  className="text-xs font-semibold text-[#4285F4] hover:underline flex items-center gap-1"
                >
                  <span>Manage</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {activeCohorts.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
                  <p className="text-xs text-white/40">No active cohorts configured</p>
                  <Link
                    href="/admin/cohorts"
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Cohort</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeCohorts.map((cohort) => (
                    <Link
                      key={cohort.id}
                      href={`/admin/cohorts/${cohort.id}`}
                      className="group block p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.06] transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#34A853] animate-pulse" />
                          <h4 className="font-bold text-sm text-white group-hover:text-[#4285F4] transition-colors">
                            {cohort.name}
                          </h4>
                        </div>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                          {cohort.bootcampName}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center text-xs">
                        <div className="p-2 rounded-xl bg-white/[0.02]">
                          <span className="block font-bold text-white">{cohort.trackCount}</span>
                          <span className="text-[10px] text-white/40">Tracks</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/[0.02]">
                          <span className="block font-bold text-white">{cohort.studentCount}</span>
                          <span className="text-[10px] text-white/40">Students</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/[0.02]">
                          <span className="block font-bold text-white">{cohort.mentorCount}</span>
                          <span className="text-[10px] text-white/40">Mentors</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Upcoming Sessions */}
            <section className="p-5 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Upcoming Sessions</h3>
                  <p className="text-xs text-white/50">Next scheduled workshops and classes</p>
                </div>
                <Link
                  href="/admin/sessions"
                  className="text-xs font-semibold text-[#FBBC04] hover:underline flex items-center gap-1"
                >
                  <span>All Sessions</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {upcomingSessions.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
                  <p className="text-xs text-white/40">No upcoming sessions scheduled</p>
                  <Link
                    href="/admin/sessions"
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Schedule Session</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold"
                            style={{
                              backgroundColor: `${session.track.accent || '#4285F4'}20`,
                              color: session.track.accent || '#4285F4',
                            }}
                          >
                            {session.track.name}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/60">
                            {session.mode}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white truncate">{session.title}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-white/50 pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#FBBC04]" />
                            {format(new Date(session.startTime), 'EEE, MMM d • h:mm a')}
                          </span>
                          {session.mentor && (
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#34A853]" />
                              {session.mentor.firstName} {session.mentor.lastName}
                            </span>
                          )}
                        </div>
                      </div>
                      {session.meetingUrl && (
                        <a
                          href={session.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
                          title="Join Meeting"
                        >
                          <Video className="w-4 h-4 text-[#4285F4]" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Track Overview Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Track Overview</h3>
                <p className="text-xs text-white/50">Status across all curriculum tracks</p>
              </div>
              <Link
                href="/admin/tracks"
                className="text-xs font-semibold text-[#4285F4] hover:underline flex items-center gap-1"
              >
                <span>View All Tracks</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {trackOverview.map((track) => (
                <Link
                  key={track.id}
                  href={`/admin/tracks/${track.id}`}
                  className="group relative p-5 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.06] transition-all flex flex-col justify-between"
                  style={{ borderLeftColor: track.accent, borderLeftWidth: '4px' }}
                >
                  <div className="space-y-1 mb-4">
                    <span className="text-[10px] font-mono text-white/40 uppercase">
                      {track.cohortName}
                    </span>
                    <h4 className="font-black text-base text-white group-hover:text-[#4285F4] transition-colors leading-tight">
                      {track.name}
                    </h4>
                    {track.description && (
                      <p className="text-xs text-white/50 line-clamp-2 mt-1">
                        {track.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center text-xs">
                    <div>
                      <span className="block font-bold text-white">{track.studentCount}</span>
                      <span className="text-[10px] text-white/40">Students</span>
                    </div>
                    <div>
                      <span className="block font-bold text-white">{track.mentorCount}</span>
                      <span className="text-[10px] text-white/40">Mentors</span>
                    </div>
                    <div>
                      <span className="block font-bold text-white">{track.lessonCount}</span>
                      <span className="text-[10px] text-white/40">Lessons</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Dual Column: Recent Enrollments & Recent Announcements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Enrollments */}
            <section className="p-5 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Recent Enrollments</h3>
                  <p className="text-xs text-white/50">Latest student track registrations</p>
                </div>
                <Link
                  href="/admin/enrollments"
                  className="text-xs font-semibold text-[#34A853] hover:underline flex items-center gap-1"
                >
                  <span>All Enrollments</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentEnrollments.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
                  <p className="text-xs text-white/40">No recent enrollments recorded</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {recentEnrollments.map((enr) => (
                    <div
                      key={enr.id}
                      className="py-3.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="w-9 h-9 border border-white/10">
                          <AvatarImage src={enr.studentAvatar} alt={enr.studentName} />
                          <AvatarFallback className="bg-[#4285F4] text-white text-xs font-bold">
                            {enr.studentName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{enr.studentName}</p>
                          <p className="text-[11px] text-white/40 truncate">{enr.studentEmail}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: `${enr.trackAccent}20`,
                            color: enr.trackAccent,
                          }}
                        >
                          {enr.trackName}
                        </span>
                        <p className="text-[10px] text-white/30 mt-1">
                          {format(new Date(enr.enrolledAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Announcements */}
            <section className="p-5 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Platform Broadcasts</h3>
                  <p className="text-xs text-white/50">Recent announcements sent to students/mentors</p>
                </div>
                <Link
                  href="/admin/announcements"
                  className="text-xs font-semibold text-[#EA4335] hover:underline flex items-center gap-1"
                >
                  <span>Broadcast New</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentAnnouncements.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
                  <p className="text-xs text-white/40">No platform announcements created yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAnnouncements.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold',
                              ann.priority === 'URGENT'
                                ? 'bg-[#EA4335]/20 text-[#EA4335] border border-[#EA4335]/30'
                                : ann.priority === 'IMPORTANT'
                                ? 'bg-[#FBBC04]/20 text-[#FBBC04] border border-[#FBBC04]/30'
                                : 'bg-white/10 text-white/70'
                            )}
                          >
                            {ann.priority}
                          </span>
                          <span className="text-[11px] font-mono text-white/40">
                            {ann.track ? ann.track.name : 'All Tracks (Global)'}
                          </span>
                        </div>
                        <span className="text-[10px] text-white/40">
                          {format(new Date(ann.createdAt), 'MMM d')}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-white">{ann.title}</h4>
                      <p className="text-xs text-white/60 line-clamp-2">{ann.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
