'use client';

import React from 'react';
import Link from 'next/link';

interface AssignmentItem {
  id: string;
  type?: string;
  points: number;
  title: string;
  dueDate: string | Date;
  description?: string | null;
  submissions?: any[];
}

interface MentorTrackAssignmentsTabProps {
  trackId: string;
  assignments?: AssignmentItem[];
}

export function MentorTrackAssignmentsTab({
  trackId,
  assignments,
}: MentorTrackAssignmentsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#0D0E11]">Track Assignments</h2>
          <p className="text-xs text-[#5F6368]">Assessments and projects assigned to this track cohort.</p>
        </div>
        <Link
          href={`/mentor/assignments?trackId=${trackId}`}
          className="px-4 py-2.5 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] transition-colors"
        >
          Create &amp; Manage Assignments
        </Link>
      </div>

      {(!assignments || assignments.length === 0) ? (
        <div className="p-8 rounded-3xl bg-white border border-[#E5DFD0] text-center text-xs text-[#5F6368]">
          No assignments created for this track yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((assignment) => {
            const submittedCount = assignment.submissions?.length || 0;
            return (
              <div
                key={assignment.id}
                className="p-6 rounded-3xl bg-white border border-[#E5DFD0] shadow-sm hover:border-[#0D0E11] transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368]">
                      {assignment.type || 'PROJECT'} • {assignment.points} Points
                    </span>
                    <h3 className="text-base font-black text-[#0D0E11] mt-1">{assignment.title}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
                    Due {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <p className="text-xs text-[#5F6368] line-clamp-2">{assignment.description}</p>

                <div className="pt-4 border-t border-[#E5DFD0] flex items-center justify-between">
                  <span className="text-xs text-[#5F6368] font-medium">
                    <strong>{submittedCount}</strong> Submissions
                  </span>
                  <Link
                    href={`/mentor/assignments/${assignment.id}`}
                    className="text-xs font-bold text-[#4285F4] hover:underline"
                  >
                    Review Submissions →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
