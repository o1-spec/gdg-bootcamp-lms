'use client';

import React from 'react';
import { Calendar, User } from 'lucide-react';
import { AttendanceRecord } from '@/types/lms';
import { AttendanceStatusBadge } from '@/components/attendance/AttendanceStatusBadge';

interface AttendanceTableProps {
  records: AttendanceRecord[];
}

export function AttendanceTable({ records }: AttendanceTableProps) {
  if (records.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gdg-border bg-white p-12 text-center text-xs font-semibold text-gdg-gray">
        No attendance records match your active filters.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gdg-border bg-white overflow-hidden shadow-xs">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gdg-border bg-gdg-cream/60 text-[11px] font-bold uppercase tracking-wider text-gdg-gray">
              <th className="py-4 px-6">Date</th>
              <th className="py-4 px-6">Track</th>
              <th className="py-4 px-6">Session Topic</th>
              <th className="py-4 px-6">Mentor</th>
              <th className="py-4 px-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gdg-border text-xs">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gdg-cream/40 transition-colors">
                {/* Date */}
                <td className="py-4 px-6 font-bold text-gdg-black whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-gdg-blue" />
                    <span>{record.date}</span>
                  </div>
                </td>

                {/* Track */}
                <td className="py-4 px-6 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: record.trackAccentColor }}
                    />
                    <span className="font-bold text-gdg-black">{record.trackName}</span>
                  </div>
                </td>

                {/* Session */}
                <td className="py-4 px-6">
                  <div className="space-y-0.5">
                    <p className="font-black text-gdg-black line-clamp-1">{record.sessionTitle}</p>
                    {record.note && (
                      <p className="text-[11px] text-gdg-gray italic line-clamp-1">
                        Note: {record.note}
                      </p>
                    )}
                  </div>
                </td>

                {/* Mentor */}
                <td className="py-4 px-6 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-gdg-gray font-medium">
                    <User className="h-3.5 w-3.5 text-gdg-gray" />
                    <span>{record.mentorName}</span>
                  </div>
                </td>

                {/* Status */}
                <td className="py-4 px-6 text-right whitespace-nowrap">
                  <AttendanceStatusBadge status={record.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden divide-y divide-gdg-border">
        {records.map((record) => (
          <div key={record.id} className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: record.trackAccentColor }}
                />
                <span className="text-[11px] font-bold text-gdg-gray uppercase tracking-wider">
                  {record.trackName}
                </span>
              </div>
              <AttendanceStatusBadge status={record.status} />
            </div>

            <div>
              <h4 className="text-sm font-black text-gdg-black tracking-tight">
                {record.sessionTitle}
              </h4>
              {record.note && (
                <p className="text-xs text-gdg-gray italic mt-1">
                  Note: {record.note}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-gdg-gray font-medium pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gdg-blue" />
                <span>{record.date}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span>{record.mentorName}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
