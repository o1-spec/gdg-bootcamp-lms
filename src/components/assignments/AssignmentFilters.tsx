'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AssignmentStatusFilter =
  | 'all'
  | 'due_soon'
  | 'in_progress'
  | 'submitted'
  | 'completed'
  | 'not_started';

interface AssignmentFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus: AssignmentStatusFilter;
  onStatusChange: (status: AssignmentStatusFilter) => void;
  selectedTrack: string;
  onTrackChange: (track: string) => void;
  onResetFilters: () => void;
  totalResultsCount: number;
}

export function AssignmentFilters({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedTrack,
  onTrackChange,
  onResetFilters,
  totalResultsCount,
}: AssignmentFiltersProps) {
  const statusOptions: { id: AssignmentStatusFilter; label: string }[] = [
    { id: 'all', label: 'All Assignments' },
    { id: 'due_soon', label: 'Due Soon' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'submitted', label: 'Submitted' },
    { id: 'completed', label: 'Completed / Reviewed' },
    { id: 'not_started', label: 'Not Started' },
  ];

  const trackOptions = [
    { id: 'all', label: 'All Tracks' },
    { id: 'backend-development', label: 'Backend' },
    { id: 'frontend-development', label: 'Frontend' },
    { id: 'dsa-interview-prep', label: 'DSA & Prep' },
    { id: 'ui-ux-design', label: 'UI/UX' },
  ];

  const hasActiveFilters =
    searchQuery !== '' || selectedStatus !== 'all' || selectedTrack !== 'all';

  return (
    <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 shadow-xs space-y-5">
      {/* Search Input */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F6368]" />
        <input
          type="text"
          placeholder="Search by assignment title, track, or module..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-12 rounded-full border border-[#E5DFD0] bg-[#FAF7EE]/50 pl-11 pr-11 text-xs sm:text-sm font-medium text-[#0D0E11] placeholder:text-[#5F6368] focus:border-[#0D0E11] focus:bg-white focus:outline-none transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5F6368] hover:text-[#0D0E11] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Row 1: Status Tabs */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
          Filter by Status
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onStatusChange(opt.id)}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                selectedStatus === opt.id
                  ? 'bg-[#0D0E11] text-[#FAF7EE] shadow-xs'
                  : 'bg-[#FAF7EE] border border-[#E5DFD0] text-[#5F6368] hover:text-[#0D0E11] hover:border-[#0D0E11]/30'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Row 2: Track Filter & Count */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-[#E5DFD0]">
        <div className="space-y-2 flex-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
            Filter by Track
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {trackOptions.map((tr) => (
              <button
                key={tr.id}
                type="button"
                onClick={() => onTrackChange(tr.id)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                  selectedTrack === tr.id
                    ? 'bg-[#0D0E11] text-[#FAF7EE]'
                    : 'bg-white border border-[#E5DFD0] text-[#5F6368] hover:text-[#0D0E11]'
                )}
              >
                {tr.label}
              </button>
            ))}
          </div>
        </div>

        {/* Counter and reset */}
        <div className="flex items-center gap-3 pt-2 lg:pt-0 text-xs font-medium text-[#5F6368]">
          <span>
            Showing <strong>{totalResultsCount}</strong> assignments
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-bold text-[#EA4335] hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
