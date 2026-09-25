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
    <div className="min-h-screen bg-[#FAF7EE] text-[#0D0E11] py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#FBBC04]/30">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Step Indicator */}
        <OnboardingStepIndicator currentStep={3} />

        {/* Welcome Celebration Card */}
        <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-10 shadow-sm space-y-8 text-center relative overflow-hidden">
          {/* Top Google Colors Accent Ribbon */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC04] to-[#34A853]" />

          <div className="space-y-3 pt-2">
            <div className="w-16 h-16 rounded-full bg-[#34A853]/15 border-2 border-[#34A853]/30 text-[#34A853] flex items-center justify-center mx-auto shadow-sm animate-in zoom-in">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBBC04]/20 border border-[#FBBC04]/40 text-xs font-black text-[#0D0E11] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#EA4335]" />
              <span>Enrollment Confirmed</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-[#0D0E11] tracking-tight">
              You&apos;re in.
            </h1>
            <p className="text-sm text-[#5F6368] max-w-md mx-auto">
              Welcome to <strong className="text-[#0D0E11]">{bootcampName}</strong>. Your profile is set up and your curriculum is unlocked.
            </p>
          </div>

          {/* Enrolled Tracks Pill Box */}
          <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-left space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
              Enrolled Tracks
            </span>
            <div className="flex flex-wrap gap-2">
              {enrolledTracks.map((name, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#0D0E11]/15 text-xs font-black text-[#0D0E11] shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
                  <span>{name}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Roadmap Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-3.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-1">
              <CalendarDays className="w-4 h-4 text-[#4285F4]" />
              <div className="text-[10px] font-bold uppercase text-[#5F6368]">Duration</div>
              <div className="text-sm font-black text-[#0D0E11]">6 Weeks</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-1">
              <BookOpen className="w-4 h-4 text-[#34A853]" />
              <div className="text-[10px] font-bold uppercase text-[#5F6368]">Curriculum</div>
              <div className="text-sm font-black text-[#0D0E11]">21 Lessons</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-1">
              <FileCheck2 className="w-4 h-4 text-[#EA4335]" />
              <div className="text-[10px] font-bold uppercase text-[#5F6368]">Projects</div>
              <div className="text-sm font-black text-[#0D0E11]">5 Deliverables</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-1">
              <UserCheck className="w-4 h-4 text-[#FBBC04]" />
              <div className="text-[10px] font-bold uppercase text-[#5F6368]">Mentorship</div>
              <div className="text-sm font-black text-[#0D0E11]">1-on-1 Reviews</div>
            </div>
          </div>

          {/* Next Live Session Alert */}
          <div className="p-4 rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/20 flex flex-col sm:flex-row sm:items-center justify-between text-left gap-2 sm:gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#4285F4]">
                Next Live Cohort Session
              </span>
              <p className="text-xs font-bold text-[#0D0E11]">
                Orientation & Track Kickoff · Friday @ 5:00 PM (WAT)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-[#4285F4] border border-[#4285F4]/30 shrink-0 self-start sm:self-auto">
              Virtual / Google Meet
            </span>
          </div>

          {/* CTA Action */}
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-[#0D0E11] hover:bg-[#22242B] text-sm font-black text-[#FAF7EE] shadow-md transition-all cursor-pointer group"
            >
              <span>Go to Your Student Dashboard</span>
              <ArrowRight className="w-4 h-4 text-[#FBBC04] transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
