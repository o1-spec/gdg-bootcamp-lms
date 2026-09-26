'use client';

import React from 'react';
import Link from 'next/link';
import { format } from '@/lib/date';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AdminTrackOverviewTabProps {
  mentors: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  }[];
  sessions: {
    id: string;
    title: string;
    startTime: string | Date;
    mode: string;
  }[];
}

export function AdminTrackOverviewTab({
  mentors,
  sessions,
}: AdminTrackOverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Mentors on Track */}
      <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Track Mentors</h3>
          <Link
            href="/admin/mentors"
            className="text-xs text-gdg-yellow hover:underline"
          >
            Manage
          </Link>
        </div>
        {mentors.length === 0 ? (
          <p className="text-xs text-white/40 italic">No mentors assigned to this track.</p>
        ) : (
          <div className="space-y-3">
            {mentors.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={m.avatar || ''} alt={m.name} />
                    <AvatarFallback className="bg-gdg-yellow text-black text-xs font-bold">
                      {m.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-bold text-white">{m.name}</p>
                    <p className="text-[10px] text-white/40">{m.email}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gdg-yellow/10 text-gdg-yellow">
                  Assigned Mentor
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Sessions on Track */}
      <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Track Sessions</h3>
          <Link
            href="/admin/sessions"
            className="text-xs text-gdg-blue hover:underline"
          >
            View All
          </Link>
        </div>
        {sessions.length === 0 ? (
          <p className="text-xs text-white/40 italic">No sessions scheduled.</p>
        ) : (
          <div className="space-y-3">
            {sessions.slice(0, 3).map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white">{s.title}</p>
                  <p className="text-[10px] text-white/40">
                    {format(new Date(s.startTime), 'EEE, MMM d • h:mm a')}
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/60">
                  {s.mode}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
