'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, FileCheck, UserCheck } from 'lucide-react';

interface MentorTrackOverviewTabProps {
  track: any;
  totalLessonsCount: number;
  openAddModule: () => void;
}

export function MentorTrackOverviewTab({
  track,
  totalLessonsCount,
  openAddModule,
}: MentorTrackOverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="p-8 rounded-3xl bg-white border border-gdg-border shadow-sm space-y-4">
          <h2 className="text-xl font-black text-gdg-black">Track Information</h2>
          <p className="text-sm text-gdg-gray leading-relaxed">
            {track.description}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gdg-border">
            <div>
              <span className="text-[11px] font-bold uppercase text-gdg-gray block">Cohort</span>
              <span className="text-sm font-black text-gdg-black">{track.cohort?.name}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase text-gdg-gray block">Assigned Mentors</span>
              <span className="text-sm font-black text-gdg-black">
                {track.mentorAssignments?.length || 1}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase text-gdg-gray block">Total Lessons</span>
              <span className="text-sm font-black text-gdg-black">{totalLessonsCount}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase text-gdg-gray block">Live Sessions</span>
              <span className="text-sm font-black text-gdg-black">{track.sessions?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Assigned Mentors Box */}
        <div className="p-8 rounded-3xl bg-white border border-gdg-border shadow-sm space-y-4">
          <h3 className="text-base font-black text-gdg-black">Mentor Instructional Staff</h3>
          <div className="divide-y divide-gdg-border">
            {track.mentorAssignments?.map((ma: any) => (
              <div key={ma.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {ma.mentor.avatarUrl ? (
                    <img
                      src={ma.mentor.avatarUrl}
                      alt={ma.mentor.firstName}
                      className="w-9 h-9 rounded-full object-cover border border-gdg-border"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gdg-black text-gdg-cream text-xs font-black flex items-center justify-center border border-gdg-border">
                      {ma.mentor.firstName?.[0] || 'M'}
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-black text-gdg-black block">
                      {ma.mentor.firstName} {ma.mentor.lastName}
                    </span>
                    <span className="text-[11px] text-gdg-gray">{ma.mentor.email}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gdg-cream text-gdg-gray border border-gdg-border">
                  {ma.mentor.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Quick Access */}
      <div className="space-y-6">
        <div className="p-6 rounded-3xl bg-white border border-gdg-border shadow-sm space-y-4">
          <h3 className="text-base font-black text-gdg-black">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={openAddModule}
              className="w-full text-left p-3 rounded-2xl bg-gdg-cream hover:bg-gdg-border/60 transition-colors flex items-center justify-between text-xs font-bold text-gdg-black"
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-gdg-yellow" />
                <span>Add New Module</span>
              </span>
            </button>
            <Link
              href={`/mentor/assignments?trackId=${track.id}`}
              className="w-full p-3 rounded-2xl bg-gdg-cream hover:bg-gdg-border/60 transition-colors flex items-center justify-between text-xs font-bold text-gdg-black"
            >
              <span className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-gdg-blue" />
                <span>Manage Assignments</span>
              </span>
            </Link>
            <Link
              href={`/mentor/attendance?trackId=${track.id}`}
              className="w-full p-3 rounded-2xl bg-gdg-cream hover:bg-gdg-border/60 transition-colors flex items-center justify-between text-xs font-bold text-gdg-black"
            >
              <span className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-gdg-green" />
                <span>Take Attendance</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
