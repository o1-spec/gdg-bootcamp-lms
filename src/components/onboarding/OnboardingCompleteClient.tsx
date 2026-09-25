'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { OnboardingStepIndicator } from './OnboardingStepIndicator';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  FileCheck2,
  CalendarDays,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

export function OnboardingCompleteClient() {
  const searchParams = useSearchParams();
  const trackParam = searchParams.get('tracks') || 'Backend Development';
  const bootcampName = searchParams.get('bootcamp') || 'GDG LASU Bootcamp 2026';
  const enrolledTracks = trackParam.split(',').filter(Boolean);

  return (
    <div className="min-h-screen bg-gdg-cream text-gdg-black py-12 px-4 sm:px-6 lg:px-8 selection:bg-gdg-yellow/30">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Step Indicator */}
        <OnboardingStepIndicator currentStep={3} />

        {/* Welcome Celebration Card */}
        <div className="rounded-3xl border border-gdg-border bg-white p-6 sm:p-10 shadow-sm space-y-8 text-center relative overflow-hidden">
          {/* Top Google Colors Accent Ribbon */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-gdg-blue via-gdg-red to-gdg-green" />

          <div className="space-y-3 pt-2">
            <div className="w-16 h-16 rounded-full bg-gdg-green/15 border-2 border-gdg-green/30 text-gdg-green flex items-center justify-center mx-auto shadow-sm animate-in zoom-in">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gdg-yellow/20 border border-gdg-yellow/40 text-xs font-black text-gdg-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-gdg-red" />
              <span>Enrollment Confirmed</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-gdg-black tracking-tight">
              You&apos;re in.
            </h1>
            <p className="text-sm text-gdg-gray max-w-md mx-auto">
              Welcome to <strong className="text-gdg-black">{bootcampName}</strong>. Your profile is set up and your curriculum is unlocked.
            </p>
          </div>

          {/* Enrolled Tracks Pill Box */}
          <div className="p-4 rounded-2xl bg-gdg-cream border border-gdg-border text-left space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gdg-gray">
              Enrolled Tracks
            </span>
            <div className="flex flex-wrap gap-2">
              {enrolledTracks.map((name, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-gdg-black/15 text-xs font-black text-gdg-black shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-gdg-blue" />
                  <span>{name}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Roadmap Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-3.5 rounded-2xl bg-gdg-cream border border-gdg-border space-y-1">
              <CalendarDays className="w-4 h-4 text-gdg-blue" />
              <div className="text-[10px] font-bold uppercase text-gdg-gray">Duration</div>
              <div className="text-sm font-black text-gdg-black">6 Weeks</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gdg-cream border border-gdg-border space-y-1">
              <BookOpen className="w-4 h-4 text-gdg-green" />
              <div className="text-[10px] font-bold uppercase text-gdg-gray">Curriculum</div>
              <div className="text-sm font-black text-gdg-black">21 Lessons</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gdg-cream border border-gdg-border space-y-1">
              <FileCheck2 className="w-4 h-4 text-gdg-red" />
              <div className="text-[10px] font-bold uppercase text-gdg-gray">Projects</div>
              <div className="text-sm font-black text-gdg-black">5 Deliverables</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gdg-cream border border-gdg-border space-y-1">
              <UserCheck className="w-4 h-4 text-gdg-yellow" />
              <div className="text-[10px] font-bold uppercase text-gdg-gray">Mentorship</div>
              <div className="text-sm font-black text-gdg-black">1-on-1 Reviews</div>
            </div>
          </div>

          {/* Next Live Session Alert */}
          <div className="p-4 rounded-2xl bg-gdg-blue/10 border border-gdg-blue/20 flex flex-col sm:flex-row sm:items-center justify-between text-left gap-2 sm:gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-gdg-blue">
                Next Live Cohort Session
              </span>
              <p className="text-xs font-bold text-gdg-black">
                Orientation & Track Kickoff · Friday @ 5:00 PM (WAT)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-gdg-blue border border-gdg-blue/30 shrink-0 self-start sm:self-auto">
              Virtual / Google Meet
            </span>
          </div>

          {/* CTA Action */}
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-gdg-black hover:bg-gdg-dark-border text-sm font-black text-gdg-cream shadow-md transition-all cursor-pointer group"
            >
              <span>Go to Your Student Dashboard</span>
              <ArrowRight className="w-4 h-4 text-gdg-yellow transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
