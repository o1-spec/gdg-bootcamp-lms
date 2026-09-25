'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StudentItem {
  id: string;
  name: string;
  email: string;
  avatar: string;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  completedAssignments: number;
  totalAssignments: number;
  attendanceRate: number;
}

interface MentorTrackStudentsTabProps {
  students: StudentItem[];
  onSelectStudent: (student: any) => void;
}

export function MentorTrackStudentsTab({
  students,
  onSelectStudent,
}: MentorTrackStudentsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-[#0D0E11]">Enrolled Students</h2>
        <p className="text-xs text-[#5F6368]">
          Supervise individual student learning trajectory, submission completions, and session attendance.
        </p>
      </div>

      {students.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white border border-[#E5DFD0] text-center text-xs text-[#5F6368]">
          No students currently enrolled in this track.
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-[#E5DFD0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7EE] border-b border-[#E5DFD0] text-[#5F6368] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-4 text-center">Progress</th>
                  <th className="py-4 px-4 text-center">Lessons</th>
                  <th className="py-4 px-4 text-center">Assignments</th>
                  <th className="py-4 px-4 text-center">Attendance</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DFD0]">
                {students.map((st) => (
                  <tr
                    key={st.id}
                    className="hover:bg-[#FAF7EE]/50 transition-colors cursor-pointer"
                    onClick={() => onSelectStudent(st)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={st.avatar}
                          alt={st.name}
                          className="w-9 h-9 rounded-full object-cover border border-[#E5DFD0]"
                        />
                        <div>
                          <span className="font-bold text-[#0D0E11] block text-sm">{st.name}</span>
                          <span className="text-[#5F6368] text-[11px]">{st.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 bg-[#E5DFD0] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#34A853] h-full rounded-full"
                            style={{ width: `${st.progressPercentage}%` }}
                          />
                        </div>
                        <span className="font-bold text-[#0D0E11] font-mono">{st.progressPercentage}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-[#0D0E11]">
                      {st.completedLessons}/{st.totalLessons}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-[#0D0E11]">
                      {st.completedAssignments}/{st.totalAssignments}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-full text-[10px] font-black font-mono',
                          st.attendanceRate >= 80
                            ? 'bg-[#34A853]/10 text-[#34A853]'
                            : st.attendanceRate >= 60
                            ? 'bg-[#FBBC04]/20 text-[#0D0E11]'
                            : 'bg-[#EA4335]/10 text-[#EA4335]'
                        )}
                      >
                        {st.attendanceRate}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStudent(st);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-[#E5DFD0] text-xs font-bold text-[#0D0E11] hover:bg-white shadow-xs"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
