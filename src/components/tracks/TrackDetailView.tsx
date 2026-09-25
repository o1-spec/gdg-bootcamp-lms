'use client';

import React, { useState } from 'react';
import {
  FileText,
  Video,
  GitBranch,
  Presentation,
  ExternalLink,
  ArrowUpRight,
  Clock,
  Calendar,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { DetailedTrack, DetailedLesson, ResourceType } from '@/types/lms';
import { TrackHero } from './TrackHero';
import { TrackTabs, TrackTabType } from './TrackTabs';
import { CurriculumModule } from './CurriculumModule';
import { ProgressOverview } from './ProgressOverview';
import { cn } from '@/lib/utils';

interface TrackDetailViewProps {
  track: DetailedTrack;
}

export function TrackDetailView({ track }: TrackDetailViewProps) {
  const [currentTab, setCurrentTab] = useState<TrackTabType>('curriculum');
  const [activeAlert, setActiveAlert] = useState<string | null>(null);

  const handleSelectLesson = (lesson: DetailedLesson) => {
    setActiveAlert(
      `Accessing lesson: "${lesson.title}" (${lesson.durationMinutes} min). Interactive player initialized.`
    );
    setTimeout(() => setActiveAlert(null), 5000);
  };

  const handleResumeCurrent = () => {
    setActiveAlert(
      `Resuming ${track.name}: Module 4 • "Database Relationships". Synchronizing code workspace...`
    );
    setTimeout(() => setActiveAlert(null), 5000);
  };

  // Helper for resource icon and colors
  const getResourceMeta = (type: ResourceType) => {
    switch (type) {
      case 'pdf':
        return { icon: FileText, color: 'text-gdg-red', bg: 'bg-gdg-red/12 border-gdg-red/25', action: 'Download' };
      case 'video':
        return { icon: Video, color: 'text-gdg-blue', bg: 'bg-gdg-blue/12 border-gdg-blue/25', action: 'Watch' };
      case 'github':
        return { icon: GitBranch, color: 'text-gdg-black', bg: 'bg-gdg-black/10 border-gdg-black/20', action: 'View Repo' };
      case 'slides':
        return { icon: Presentation, color: 'text-gdg-yellow', bg: 'bg-gdg-yellow/15 border-gdg-yellow/30', action: 'View Slides' };
      case 'article':
      default:
        return { icon: ExternalLink, color: 'text-gdg-green', bg: 'bg-gdg-green/15 border-gdg-green/30', action: 'Open' };
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast alert if active */}
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

      {/* A. Track Hero / Overview */}
      <TrackHero track={track} onResumeLesson={handleResumeCurrent} />

      {/* B. Tab Navigation */}
      <div className="pt-2">
        <TrackTabs
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          accentColor={track.accentColor}
          counts={{
            curriculumLessons: track.progress.totalLessons,
            resourcesCount: track.resources.length,
            assignmentsCount: track.assignments.length,
          }}
        />
      </div>

      {/* C. Tab Content Panes */}

      {/* 1. CURRICULUM TAB (Default) */}
      {currentTab === 'curriculum' && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-gdg-black tracking-tight">
                Curriculum Modules
              </h3>
              <p className="text-xs text-gdg-gray font-medium mt-0.5">
                Structured {track.duration} roadmap • {track.modules.length} modules • {track.progress.totalLessons} lessons
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gdg-gray">
                {track.progress.completedLessons} of {track.progress.totalLessons} completed
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {track.modules.map((mod) => (
              <CurriculumModule
                key={mod.id}
                module={mod}
                trackSlug={track.slug}
                accentColor={track.accentColor}
                defaultOpen={mod.status === 'in_progress' || mod.order === 1}
                onSelectLesson={handleSelectLesson}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. OVERVIEW TAB */}
      {currentTab === 'overview' && (
        <section className="space-y-8">
          <div className="rounded-3xl border border-gdg-border bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-gdg-black tracking-tight">
                About this Learning Track
              </h3>
              <p className="mt-3 text-sm text-gdg-gray leading-relaxed font-normal">
                {track.fullDescription}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gdg-border">
              <div className="space-y-3">
                <h4 className="text-sm font-black text-gdg-black uppercase tracking-wider">
                  What you will build
                </h4>
                <ul className="space-y-2 text-xs text-gdg-gray">
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gdg-green mt-1.5 shrink-0" />
                    <span>Production-ready, highly resilient fullstack REST APIs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gdg-green mt-1.5 shrink-0" />
                    <span>PostgreSQL database schemas with indexing and relations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gdg-green mt-1.5 shrink-0" />
                    <span>JWT-based authentication and role-based access controls</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gdg-green mt-1.5 shrink-0" />
                    <span>Capstone project deployed on Google Cloud Platform</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-black text-gdg-black uppercase tracking-wider">
                  Weekly Commitment
                </h4>
                <div className="space-y-2 text-xs text-gdg-gray">
                  <p>• <strong>2 Live workshops</strong> per week with lead mentors</p>
                  <p>• <strong>1 Hands-on assignment sprint</strong> every Sunday</p>
                  <p>• <strong>Peer squad code reviews</strong> in Discord lounge</p>
                  <p>• <strong>Office hours:</strong> Every Friday 5:00 PM WAT</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. RESOURCES TAB */}
      {currentTab === 'resources' && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-gdg-black tracking-tight">
                Curated Track Resources
              </h3>
              <p className="text-xs text-gdg-gray font-medium mt-0.5">
                Downloadable guides, repositories, slides, and cheat sheets
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {track.resources.map((res) => {
              const meta = getResourceMeta(res.type);
              const IconComp = meta.icon;

              return (
                <div
                  key={res.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl border border-gdg-border bg-white hover:border-gdg-black/30 transition-all duration-200 shadow-xs"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border',
                        meta.bg,
                        meta.color
                      )}
                    >
                      <IconComp className="h-6 w-6" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gdg-gray">
                          {res.type.toUpperCase()}
                        </span>
                        <span className="text-gdg-gray/40">•</span>
                        <span className="text-xs font-bold text-gdg-black">
                          {res.moduleTitle}
                        </span>
                        {res.isRequired ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gdg-red/15 text-gdg-red border border-gdg-red/25">
                            REQUIRED
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gdg-cream text-gdg-gray border border-gdg-border">
                            OPTIONAL
                          </span>
                        )}
                        {res.fileSize && (
                          <span className="text-xs text-gdg-gray font-medium">
                            ({res.fileSize})
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-black text-gdg-black tracking-tight">
                        {res.title}
                      </h4>

                      {res.description && (
                        <p className="text-xs text-gdg-gray leading-relaxed max-w-2xl font-normal">
                          {res.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end shrink-0 pt-2 sm:pt-0">
                    <a
                      href={res.url}
                      target={res.url.startsWith('http') ? '_blank' : '_self'}
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-gdg-black bg-white text-gdg-black hover:bg-gdg-black hover:text-gdg-cream px-5 py-2 text-xs font-bold tracking-wide transition-all shadow-2xs"
                      onClick={() =>
                        setActiveAlert(`Opening resource: "${res.title}"`)
                      }
                    >
                      <span>{meta.action}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. ASSIGNMENTS TAB */}
      {currentTab === 'assignments' && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-gdg-black tracking-tight">
                Track Assignments & Challenges
              </h3>
              <p className="text-xs text-gdg-gray font-medium mt-0.5">
                Submit hands-on code reviews to earn verified bootcamp badges
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {track.assignments.map((asg) => (
              <div
                key={asg.id}
                className="rounded-3xl border border-gdg-border bg-white p-6 shadow-xs hover:shadow-md transition-all duration-200 space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-gdg-cream text-gdg-gray border border-gdg-border">
                    {asg.moduleTitle}
                  </span>

                  {asg.status === 'in_progress' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-gdg-yellow/20 text-[#8c6500] border border-gdg-yellow/40">
                      <Clock className="h-3.5 w-3.5" /> IN PROGRESS
                    </span>
                  )}
                  {asg.status === 'not_started' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gdg-cream text-gdg-gray border border-gdg-border">
                      NOT STARTED
                    </span>
                  )}
                  {asg.status === 'submitted' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gdg-green/15 text-gdg-green-dark border border-gdg-green/30">
                      <CheckCircle2 className="h-3.5 w-3.5" /> SUBMITTED
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-base sm:text-lg font-black text-gdg-black tracking-tight">
                    {asg.title}
                  </h4>
                  {asg.description && (
                    <p className="text-xs text-gdg-gray mt-1 leading-relaxed font-normal">
                      {asg.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gdg-gray font-medium mt-3">
                    <span className="flex items-center gap-1 font-bold text-gdg-black">
                      <Calendar className="h-3.5 w-3.5 text-gdg-blue" /> Due: {asg.dueDate}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-bold text-gdg-black">
                      <Trophy className="h-3.5 w-3.5 text-gdg-yellow" /> {asg.points} Points
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gdg-border flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveAlert(`Opening assignment portal for: "${asg.title}"`)
                    }
                    className="inline-flex items-center gap-1.5 rounded-full bg-gdg-black text-gdg-cream hover:bg-[#1a1b20] px-5 py-2 text-xs font-black tracking-wide shadow-xs transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>View Assignment</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. PROGRESS TAB */}
      {currentTab === 'progress' && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-gdg-black tracking-tight">
                Progress & Metrics
              </h3>
              <p className="text-xs text-gdg-gray font-medium mt-0.5">
                Comprehensive analytics for your {track.name} performance
              </p>
            </div>
          </div>

          <ProgressOverview
            progress={track.progress}
            accentColor={track.accentColor}
          />
        </section>
      )}
    </div>
  );
}
