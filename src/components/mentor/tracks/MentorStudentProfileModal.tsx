'use client';

import React from 'react';
import { X } from 'lucide-react';

interface StudentData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  enrolledAt: string | Date;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  completedAssignments: number;
  totalAssignments: number;
  attendanceRate: number;
  sessionsAttended: number;
  totalSessions: number;
}

interface MentorStudentProfileModalProps {
  selectedStudent: StudentData | null;
  onClose: () => void;
  modulesCount: number;
}

export function MentorStudentProfileModal({
  selectedStudent,
  onClose,
  modulesCount,
}: MentorStudentProfileModalProps) {
  if (!selectedStudent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-gdg-border p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {selectedStudent.avatar ? (
              <img
                src={selectedStudent.avatar}
                alt={selectedStudent.name}
                className="w-14 h-14 rounded-2xl object-cover border border-gdg-border"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gdg-black text-gdg-cream flex items-center justify-center font-black text-lg">
                {selectedStudent.name.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="text-xl font-black text-gdg-black">{selectedStudent.name}</h3>
              <p className="text-xs text-gdg-gray">{selectedStudent.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gdg-cream text-gdg-gray border border-gdg-border">
                Enrolled {new Date(selectedStudent.enrolledAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gdg-cream text-gdg-gray hover:text-gdg-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-gdg-cream border border-gdg-border">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold uppercase text-gdg-gray">Progress</span>
            <p className="text-xl font-black text-gdg-black font-mono">
              {selectedStudent.progressPercentage}%
            </p>
          </div>
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold uppercase text-gdg-gray">Lessons</span>
            <p className="text-xl font-black text-gdg-black font-mono">
              {selectedStudent.completedLessons}/{selectedStudent.totalLessons}
            </p>
          </div>
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold uppercase text-gdg-gray">Attendance</span>
            <p className="text-xl font-black text-gdg-black font-mono">
              {selectedStudent.attendanceRate}%
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-gdg-gray">
            Student Progress Summary
          </h4>
          <div className="p-4 rounded-2xl bg-white border border-gdg-border space-y-2 text-xs">
            <div className="flex justify-between text-gdg-gray">
              <span>Track Modules Enrolled</span>
              <span className="font-bold text-gdg-black">{modulesCount} Modules</span>
            </div>
            <div className="flex justify-between text-gdg-gray">
              <span>Assignments Completed</span>
              <span className="font-bold text-gdg-black">
                {selectedStudent.completedAssignments} of {selectedStudent.totalAssignments}
              </span>
            </div>
            <div className="flex justify-between text-gdg-gray">
              <span>Live Sessions Attended</span>
              <span className="font-bold text-gdg-black">
                {selectedStudent.sessionsAttended} of {selectedStudent.totalSessions}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gdg-black text-gdg-cream text-xs font-bold hover:bg-gdg-dark-border transition-colors"
        >
          Close Profile
        </button>
      </div>
    </div>
  );
}
