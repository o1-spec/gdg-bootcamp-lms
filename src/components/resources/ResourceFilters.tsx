'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResourceFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTrack: string;
  onTrackChange: (track: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedRequirement: 'all' | 'required' | 'optional';
  onRequirementChange: (req: 'all' | 'required' | 'optional') => void;
  onResetFilters: () => void;
  totalResultsCount: number;
}

export function ResourceFilters({
  searchQuery,
  onSearchChange,
  selectedTrack,
  onTrackChange,
  selectedType,
  onTypeChange,
  selectedRequirement,
  onRequirementChange,
  onResetFilters,
  totalResultsCount,
}: ResourceFiltersProps) {
  const trackOptions = [
    { id: 'all', label: 'All Tracks' },
    { id: 'backend-development', label: 'Backend Development' },
    { id: 'frontend-development', label: 'Frontend Development' },
    { id: 'dsa-interview-prep', label: 'DSA & Interview Prep' },
    { id: 'ui-ux-design', label: 'UI/UX Design' },
  ];

  const typeOptions = [
    { id: 'all', label: 'All Types' },
    { id: 'pdf', label: 'PDFs' },
    { id: 'video', label: 'Videos' },
    { id: 'slides', label: 'Slides' },
    { id: 'github', label: 'GitHub & Code' },
    { id: 'figma', label: 'Figma' },
    { id: 'cheatsheet', label: 'Cheat Sheets' },
    { id: 'practice', label: 'Practice' },
    { id: 'article', label: 'Articles' },
  ];

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedTrack !== 'all' ||
    selectedType !== 'all' ||
    selectedRequirement !== 'all';

  return (
    <div className="rounded-3xl border border-[#E5DFD0] bg-white p-4 sm:p-6 shadow-xs space-y-5">
      {/* Search Input */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F6368]" />
        <input
          type="text"
          placeholder="Search by resource title, topic, module, or keyword..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-12 rounded-full border border-[#E5DFD0] bg-[#FAF7EE]/50 pl-11 pr-11 text-xs sm:text-sm font-medium text-[#0D0E11] placeholder:text-[#5F6368] focus:border-[#0D0E11] focus:bg-white focus:outline-none transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5F6368] hover:text-[#0D0E11]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Row 1: Track Pills */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
          Filter by Track
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {trackOptions.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTrackChange(t.id)}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                selectedTrack === t.id
                  ? 'bg-[#0D0E11] text-[#FAF7EE] shadow-xs'
                  : 'bg-[#FAF7EE] border border-[#E5DFD0] text-[#5F6368] hover:text-[#0D0E11] hover:border-[#0D0E11]/30'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Row 2: Type Pills & Required Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-[#E5DFD0]">
        <div className="space-y-2 flex-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
            Resource Format
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {typeOptions.map((tp) => (
              <button
                key={tp.id}
                type="button"
                onClick={() => onTypeChange(tp.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap',
                  selectedType === tp.id
                    ? 'bg-[#0D0E11] text-[#FAF7EE]'
                    : 'bg-white border border-[#E5DFD0] text-[#5F6368] hover:text-[#0D0E11]'
                )}
              >
                {tp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Required / Optional segmented pill */}
        <div className="space-y-2 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368] block">
            Requirement
          </span>
          <div className="inline-flex items-center p-1 rounded-full bg-[#FAF7EE] border border-[#E5DFD0]">
            {(['all', 'required', 'optional'] as const).map((req) => (
              <button
                key={req}
                type="button"
                onClick={() => onRequirementChange(req)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-bold transition-all capitalize cursor-pointer',
                  selectedRequirement === req
                    ? 'bg-[#0D0E11] text-[#FAF7EE]'
                    : 'text-[#5F6368] hover:text-[#0D0E11]'
                )}
              >
                {req}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count & Reset row */}
      <div className="flex items-center justify-between pt-2 text-xs font-medium text-[#5F6368]">
        <span>
          Showing <strong>{totalResultsCount}</strong> resources matching your criteria
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-bold text-[#EA4335] hover:underline cursor-pointer"
          >
            Reset all filters
          </button>
        )}
      </div>
    </div>
  );
}
