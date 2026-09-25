'use client';

import React from 'react';
import Link from 'next/link';

interface SessionItem {
  id: string;
  mode: string;
  startTime: string | Date;
  title: string;
  description?: string | null;
  attendances?: any[];
}

interface MentorTrackAttendanceTabProps {
  trackId: string;
  sessions?: SessionItem[];
}

export function MentorTrackAttendanceTab({
  trackId,
  sessions,
}: MentorTrackAttendanceTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#0D0E11]">Sessions &amp; Attendance</h2>
          <p className="text-xs text-[#5F6368]">Live workshops, lecture dates, and recorded attendance.</p>
        </div>
        <Link
          href={`/mentor/attendance?trackId=${trackId}`}
          className="px-4 py-2.5 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] transition-colors"
        >
          Record Attendance
        </Link>
      </div>

      {(!sessions || sessions.length === 0) ? (
        <div className="p-8 rounded-3xl bg-white border border-[#E5DFD0] text-center text-xs text-[#5F6368]">
          No sessions scheduled for this track yet.
        </div>
      ) : (
        <div className="divide-y divide-[#E5DFD0] bg-white rounded-3xl border border-[#E5DFD0] shadow-sm overflow-hidden">
          {sessions.map((session) => (
            <div key={session.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#4285F4]/10 text-[#4285F4]">
                    {session.mode}
                  </span>
                  <span className="text-xs text-[#5F6368] font-bold">
                    {new Date(session.startTime).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h4 className="text-base font-black text-[#0D0E11] mt-1">{session.title}</h4>
                <p className="text-xs text-[#5F6368] mt-0.5">{session.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-[#5F6368] font-medium">
                  {session.attendances?.length || 0} students recorded
                </span>
                <Link
                  href={`/mentor/attendance?trackId=${trackId}&sessionId=${session.id}`}
                  className="px-4 py-2 rounded-xl bg-[#FAF7EE] hover:bg-[#E5DFD0] text-xs font-bold text-[#0D0E11] border border-[#E5DFD0] transition-colors"
                >
                  Mark Attendance
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
