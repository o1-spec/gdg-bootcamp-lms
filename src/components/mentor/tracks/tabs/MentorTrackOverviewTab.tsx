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
                  {ma.mentor.avatarUrl ? (
                    <img
                      src={ma.mentor.avatarUrl}
                      alt={ma.mentor.firstName}
                      className="w-9 h-9 rounded-full object-cover border border-[#E5DFD0]"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#0D0E11] text-[#FAF7EE] text-xs font-black flex items-center justify-center border border-[#E5DFD0]">
                      {ma.mentor.firstName?.[0] || 'M'}
                    </div>
                  )}
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
  );
}
