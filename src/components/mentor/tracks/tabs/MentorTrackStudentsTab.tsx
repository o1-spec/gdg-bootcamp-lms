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
        <h2 className="text-xl font-black text-gdg-black">Enrolled Students</h2>
        <p className="text-xs text-gdg-gray">
          Supervise individual student learning trajectory, submission completions, and session attendance.
        </p>
      </div>

      {students.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white border border-gdg-border text-center text-xs text-gdg-gray">
          No students currently enrolled in this track.
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-gdg-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gdg-cream border-b border-gdg-border text-gdg-gray uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-4 text-center">Progress</th>
                  <th className="py-4 px-4 text-center">Lessons</th>
                  <th className="py-4 px-4 text-center">Assignments</th>
                  <th className="py-4 px-4 text-center">Attendance</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gdg-border">
                {students.map((st) => (
                  <tr
                    key={st.id}
                    className="hover:bg-gdg-cream/50 transition-colors cursor-pointer"
                    onClick={() => onSelectStudent(st)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={st.avatar}
                          alt={st.name}
                          className="w-9 h-9 rounded-full object-cover border border-gdg-border"
                        />
                        <div>
                          <span className="font-bold text-gdg-black block text-sm">{st.name}</span>
                          <span className="text-gdg-gray text-[11px]">{st.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 bg-gdg-border h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gdg-green h-full rounded-full"
                            style={{ width: `${st.progressPercentage}%` }}
                          />
                        </div>
                        <span className="font-bold text-gdg-black font-mono">{st.progressPercentage}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-gdg-black">
                      {st.completedLessons}/{st.totalLessons}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-gdg-black">
                      {st.completedAssignments}/{st.totalAssignments}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-full text-[10px] font-black font-mono',
                          st.attendanceRate >= 80
                            ? 'bg-gdg-green/10 text-gdg-green'
                            : st.attendanceRate >= 60
                            ? 'bg-gdg-yellow/20 text-gdg-black'
                            : 'bg-gdg-red/10 text-gdg-red'
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
                        className="px-3 py-1.5 rounded-xl border border-gdg-border text-xs font-bold text-gdg-black hover:bg-white shadow-xs"
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
