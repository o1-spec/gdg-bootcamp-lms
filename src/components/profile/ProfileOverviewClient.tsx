'use client';

import React from 'react';
import Link from 'next/link';
import {
  User,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  ArrowLeft,
  Settings,
  ExternalLink,
  BookOpen,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GithubIcon, LinkedinIcon } from '@/components/ui/social-icons';
import { cn } from '@/lib/utils';

export interface ProfileOverviewUser {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  email: string;
  role: string;
  avatarUrl: string | null;
  bio: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  createdAt: string;
}

export interface StudentTrackSummary {
  id: string;
  name: string;
  slug: string;
  accent?: string | null;
  cohortName?: string | null;
  completedLessons?: number;
  totalLessons?: number;
}

export interface MentorTrackSummary {
  id: string;
  name: string;
  slug: string;
  accent?: string | null;
}

interface ProfileOverviewClientProps {
  user: ProfileOverviewUser;
  studentTracks?: StudentTrackSummary[];
  mentorTracks?: MentorTrackSummary[];
}

export function ProfileOverviewClient({
  user,
  studentTracks = [],
  mentorTracks = [],
}: ProfileOverviewClientProps) {
  const roleName = user.role.replace('_', ' ');

  const backLink =
    user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
      ? '/admin'
      : user.role === 'MENTOR'
      ? '/mentor'
      : '/';

  return (
    <div className="min-h-screen bg-gdg-cream text-gdg-black antialiased selection:bg-gdg-yellow/30">
      {/* Top Banner Ribbon */}
      <div className="w-full bg-gdg-black text-gdg-cream py-2 px-6 overflow-hidden border-b border-gdg-black/10">
        <div className="flex items-center justify-between text-xs font-black tracking-wider uppercase whitespace-nowrap">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            <span>BUILD ✦</span>
            <span>INNOVATE ✦</span>
            <span>DESIGN ✦</span>
            <span>SHIP ✦</span>
            <span>LEARN ✦</span>
          </div>
          <span className="hidden lg:inline text-[11px] font-semibold text-gdg-cream/70">
            GDG on Campus LASU · Engineering Community Profile
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href={backLink}
            className="inline-flex items-center gap-2 text-sm font-bold text-gdg-gray hover:text-gdg-black transition-colors rounded-xl px-3 py-2 -ml-3 hover:bg-black/5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>

          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gdg-black text-gdg-cream hover:bg-gdg-black/85 transition-all shadow-2xs"
          >
            <Settings className="h-3.5 w-3.5 text-gdg-yellow" />
            <span>Edit Profile & Settings</span>
          </Link>
        </div>

        {/* Profile Hero Card */}
        <div className="rounded-3xl border border-gdg-border bg-white p-6 sm:p-10 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <Avatar className="h-28 w-28 border-4 border-gdg-cream shadow-md shrink-0">
              <AvatarImage src={user.avatarUrl || ''} />
              <AvatarFallback className="bg-gdg-blue text-white font-black text-3xl">
                {user.firstName?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-gdg-black tracking-tight">
                  {user.displayName || `${user.firstName} ${user.lastName}`}
                </h1>
                <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-gdg-blue/10 text-gdg-blue border border-gdg-blue/20">
                  {roleName}
                </span>
              </div>

              <p className="text-xs text-gdg-gray font-semibold">
                {user.email} • Joined{' '}
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>

              {user.bio ? (
                <p className="text-xs sm:text-sm text-gdg-black font-normal leading-relaxed max-w-2xl pt-1">
                  {user.bio}
                </p>
              ) : (
                <p className="text-xs text-gdg-gray italic pt-1">
                  No biographical summary provided yet. Add one in Account Settings.
                </p>
              )}

              {/* Social links */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-3">
                {user.githubUrl && (
                  <a
                    href={user.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gdg-border bg-gdg-cream hover:bg-white text-xs font-bold text-gdg-black transition-colors"
                  >
                    <GithubIcon className="h-3.5 w-3.5" />
                    <span>GitHub Profile</span>
                    <ExternalLink className="h-3 w-3 text-gdg-gray" />
                  </a>
                )}

                {user.linkedinUrl && (
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gdg-border bg-gdg-cream hover:bg-white text-xs font-bold text-gdg-black transition-colors"
                  >
                    <LinkedinIcon className="h-3.5 w-3.5" />
                    <span>LinkedIn Profile</span>
                    <ExternalLink className="h-3 w-3 text-gdg-gray" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Role-Specific Overview Section */}
        {user.role === 'STUDENT' && (
          <div className="rounded-3xl border border-gdg-border bg-white p-6 sm:p-8 shadow-2xs space-y-4">
            <div className="border-b border-gdg-border pb-3">
              <h2 className="text-base sm:text-lg font-black text-gdg-black flex items-center gap-2">
                <Layers className="h-4 w-4 text-gdg-blue" />
                <span>Enrolled Tracks & Progress Summary</span>
              </h2>
              <p className="text-xs text-gdg-gray font-medium">
                Active engineering tracks and module completion milestones.
              </p>
            </div>

            {studentTracks.length === 0 ? (
              <p className="text-xs text-gdg-gray">Not currently enrolled in any tracks.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {studentTracks.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl border border-gdg-border bg-gdg-cream space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-gdg-black">{t.name}</span>
                      {t.cohortName && (
                        <span className="text-[10px] font-bold text-gdg-gray">
                          {t.cohortName}
                        </span>
                      )}
                    </div>

                    {t.totalLessons !== undefined && t.totalLessons > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold text-gdg-gray">
                          <span>Progress</span>
                          <span>
                            {Math.round(((t.completedLessons || 0) / t.totalLessons) * 100)}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-gdg-border">
                          <div
                            className="h-full bg-gdg-green rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round(((t.completedLessons || 0) / t.totalLessons) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {user.role === 'MENTOR' && (
          <div className="rounded-3xl border border-gdg-border bg-white p-6 sm:p-8 shadow-2xs space-y-4">
            <div className="border-b border-gdg-border pb-3">
              <h2 className="text-base sm:text-lg font-black text-gdg-black flex items-center gap-2">
                <Award className="h-4 w-4 text-gdg-yellow" />
                <span>Assigned Mentorship Tracks</span>
              </h2>
              <p className="text-xs text-gdg-gray font-medium">
                Tracks where you guide students, curate modules, and evaluate submissions.
              </p>
            </div>

            {mentorTracks.length === 0 ? (
              <p className="text-xs text-gdg-gray">No tracks assigned yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mentorTracks.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl border border-gdg-border bg-gdg-cream flex items-center gap-3"
                  >
                    <div className="h-8 w-8 rounded-xl bg-gdg-yellow/15 flex items-center justify-center text-[#B08800]">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-black text-gdg-black">{t.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
          <div className="rounded-3xl border border-gdg-border bg-white p-6 sm:p-8 shadow-2xs space-y-4">
            <div className="border-b border-gdg-border pb-3">
              <h2 className="text-base sm:text-lg font-black text-gdg-black flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gdg-green" />
                <span>Administrative Access & Privileges</span>
              </h2>
              <p className="text-xs text-gdg-gray font-medium">
                Platform-wide control over cohorts, tracks, curriculum modules, and user rosters.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gdg-cream border border-gdg-border space-y-2 text-xs text-gdg-gray">
              <div className="flex items-center gap-2 text-gdg-black font-bold">
                <CheckCircle2 className="h-4 w-4 text-gdg-green" />
                <span>Platform Superuser Authorization</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                You have elevated permissions to inspect system analytics, manage invites, publish general bulletins, and moderate submissions across all tracks.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
