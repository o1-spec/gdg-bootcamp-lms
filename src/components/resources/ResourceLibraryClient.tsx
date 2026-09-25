'use client';

import React, { useState, useMemo } from 'react';
import {
  FolderGit2,
  FileCheck2,
  Layers,
  Sparkles,
  Inbox,
  RotateCcw,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { ResourceFilters } from '@/components/resources/ResourceFilters';
import { ResourceDetails } from '@/components/resources/ResourceDetails';
import { LibraryResource, StudentProfile, Track } from '@/types/lms';

const fallbackStudent: StudentProfile = {
  id: '',
  name: 'Student',
  firstName: 'Student',
  lastName: '',
  email: '',
  avatar: '',
  cohort: 'Bootcamp 2026',
  role: 'Student',
  enrolledTracksCount: 0,
  studyStreakDays: 0,
  totalHoursSpent: 0,
  onboardingCompleted: true,
};

interface ResourceLibraryClientProps {
  initialResources?: LibraryResource[];
  student?: StudentProfile;
  enrolledTracks?: Track[];
}

export function ResourceLibraryClient({
  initialResources,
  student = fallbackStudent,
  enrolledTracks = [],
}: ResourceLibraryClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRequirement, setSelectedRequirement] = useState<'all' | 'required' | 'optional'>('all');

  const allResources = initialResources || [];

  // Resource details inspection modal state
  const [activeResource, setActiveResource] = useState<LibraryResource | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Handle resource selection
  const handleSelectResource = (res: LibraryResource) => {
    setActiveResource(res);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setActiveResource(null);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTrack('all');
    setSelectedType('all');
    setSelectedRequirement('all');
  };

  // Filtered resources matching criteria
  const filteredResources = useMemo(() => {
    return allResources.filter((res) => {
      // Search matching title, description, track, module
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches =
          res.title.toLowerCase().includes(query) ||
          res.description.toLowerCase().includes(query) ||
          res.trackName.toLowerCase().includes(query) ||
          res.moduleName.toLowerCase().includes(query) ||
          res.uploadedBy.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Track filter
      if (selectedTrack !== 'all' && res.trackId !== selectedTrack) {
        return false;
      }

      // Format / type filter
      if (selectedType !== 'all') {
        if (selectedType === 'github' && (res.type === 'github' || res.type === 'code')) {
          // match both code/github
        } else if (res.type !== selectedType) {
          return false;
        }
      }

      // Requirement filter
      if (selectedRequirement === 'required' && !res.isRequired) {
        return false;
      }
      if (selectedRequirement === 'optional' && res.isRequired) {
        return false;
      }

      return true;
    });
  }, [allResources, searchQuery, selectedTrack, selectedType, selectedRequirement]);

  const requiredCount = allResources.filter((r) => r.isRequired).length;

  return (
    <div className="flex min-h-screen bg-[#FAF7EE] text-[#0D0E11] antialiased selection:bg-[#FBBC04]/30">
      {/* Sidebar */}
      <DashboardSidebar
        currentTab="resources"
        student={student}
        enrolledTracks={enrolledTracks}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingAssignmentsCount={0}
        liveClassesCount={0}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader
          currentTab="resources"
          student={student}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onSearchChange={setSearchQuery}
        />

        {/* Ticker Ribbon */}
        <div className="w-full bg-[#FBBC04] text-[#0D0E11] py-2 px-6 overflow-hidden border-b border-[#0D0E11]/10">
          <div className="flex items-center justify-between text-xs font-black tracking-wider uppercase whitespace-nowrap">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              <span>BUILD ✦</span>
              <span>INNOVATE ✦</span>
              <span>DESIGN ✦</span>
              <span>SHIP ✦</span>
              <span>LEARN ✦</span>
              <span>CONNECT ✦</span>
              <span>GROW ✦</span>
              <span className="hidden sm:inline">BUILD ✦ INNOVATE ✦ SHIP</span>
            </div>
            <span className="hidden lg:inline text-[11px] font-bold tracking-normal opacity-90 pl-4">
              GDG on Campus LASU Knowledge Base & Repository Vault
            </span>
          </div>
        </div>

        <main className="flex-1 p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl w-full mx-auto">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5DFD0] pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#4285F4]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
                  Curated Material Vault
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#0D0E11] tracking-tight">
                Resources
              </h1>
              <p className="text-sm text-[#5F6368] font-medium max-w-xl">
                Access learning materials from all your enrolled tracks. Download guides, examine starter repos, review slides, and consult cheatsheets.
              </p>
            </div>

            {/* Quick Stats Pills */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-[#E5DFD0] bg-white px-4 py-2.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="h-4 w-4 text-[#4285F4]" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
                      Total Assets
                    </span>
                    <span className="text-lg font-black text-[#0D0E11]">
                      {allResources.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E5DFD0] bg-white px-4 py-2.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-[#EA4335]" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
                      Required
                    </span>
                    <span className="text-lg font-black text-[#0D0E11]">
                      {requiredCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E5DFD0] bg-white px-4 py-2.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#34A853]" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
                      Tracks Covered
                    </span>
                    <span className="text-lg font-black text-[#0D0E11]">
                      4 Tracks
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filters Controller */}
          <ResourceFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTrack={selectedTrack}
            onTrackChange={setSelectedTrack}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedRequirement={selectedRequirement}
            onRequirementChange={setSelectedRequirement}
            onResetFilters={handleResetFilters}
            totalResultsCount={filteredResources.length}
          />

          {/* Resources Grid or Empty State */}
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onSelect={handleSelectResource}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#E5DFD0] bg-white p-12 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
                <Inbox className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#0D0E11]">
                  No resources match your filters
                </h3>
                <p className="text-xs sm:text-sm text-[#5F6368] max-w-md mx-auto">
                  Try adjusting your search query, selecting &quot;All Tracks&quot; or resetting your format requirements.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0D0E11] text-[#FAF7EE] text-xs font-black hover:bg-black transition-all cursor-pointer shadow-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset all filters</span>
              </button>
            </div>
          )}

          {/* Cross-track Contributor Callout */}
          <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-8 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#4285F4]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4285F4]">
                    GDG Library Contributions
                  </span>
                </div>
                <h4 className="text-lg sm:text-xl font-black text-[#0D0E11] tracking-tight">
                  Have a great starter repo, cheat sheet, or tool to share?
                </h4>
                <p className="text-xs text-[#5F6368] leading-relaxed">
                  Bootcamp mentors and senior alumni regularly review peer-submitted resources to enrich the curriculum. Submit recommendations in your squad channel.
                </p>
              </div>

              <a
                href="https://gdg.community.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF7EE] hover:bg-[#E5DFD0]/60 border border-[#E5DFD0] text-xs font-bold text-[#0D0E11] shrink-0 transition-colors"
              >
                <span>GDG LASU Discord Vault</span>
              </a>
            </div>
          </div>
        </main>
      </div>

      {/* Lightweight Resource Details Inspection Modal */}
      <ResourceDetails
        resource={activeResource}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
      />
    </div>
  );
}
