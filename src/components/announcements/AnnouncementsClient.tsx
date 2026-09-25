'use client';

import React, { useState, useMemo } from 'react';
import {
  Bell,
  Inbox,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard';
import {
  AnnouncementFilters,
  AnnouncementFilterCategory,
} from '@/components/announcements/AnnouncementFilters';
import { AnnouncementDetails } from '@/components/announcements/AnnouncementDetails';
import { FullAnnouncement, StudentProfile, Track } from '@/types/lms';

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

interface AnnouncementsClientProps {
  initialAnnouncements?: FullAnnouncement[];
  student?: StudentProfile;
  enrolledTracks?: Track[];
}

export function AnnouncementsClient({
  initialAnnouncements,
  student = fallbackStudent,
  enrolledTracks = [],
}: AnnouncementsClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AnnouncementFilterCategory>('all');
  const [selectedTrack, setSelectedTrack] = useState('all');

  const allAnnouncements = initialAnnouncements || [];

  // Modal inspection state
  const [activeAnnouncement, setActiveAnnouncement] = useState<FullAnnouncement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectAnnouncement = (anc: FullAnnouncement) => {
    setActiveAnnouncement(anc);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActiveAnnouncement(null);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTrack('all');
  };

  // Filtered announcements
  const filteredAnnouncements = useMemo(() => {
    return allAnnouncements.filter((anc) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches =
          anc.title.toLowerCase().includes(query) ||
          anc.content.toLowerCase().includes(query) ||
          anc.trackName.toLowerCase().includes(query) ||
          anc.author.name.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Track filter
      if (selectedTrack !== 'all') {
        if (anc.trackId !== selectedTrack && anc.trackId !== 'all') {
          return false;
        }
      }

      // Category filter
      if (selectedCategory === 'important') {
        if (anc.priority !== 'IMPORTANT' && anc.priority !== 'URGENT') return false;
      } else if (selectedCategory === 'reminders') {
        if (anc.priority !== 'REMINDER') return false;
      } else if (selectedCategory === 'general') {
        if (anc.trackId && anc.trackId !== 'all') return false;
      } else if (selectedCategory === 'track_specific') {
        if (!anc.trackId || anc.trackId === 'all') return false;
      }

      return true;
    });
  }, [allAnnouncements, searchQuery, selectedTrack, selectedCategory]);

  return (
    <div className="flex min-h-screen bg-gdg-cream text-gdg-black antialiased selection:bg-gdg-yellow/30">
      {/* Sidebar */}
      <DashboardSidebar
        currentTab="announcements"
        student={student}
        enrolledTracks={enrolledTracks}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingAssignmentsCount={0}
        liveClassesCount={0}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader
          currentTab="announcements"
          student={student}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onSearchChange={setSearchQuery}
        />

        {/* Ticker Ribbon */}
        <div className="w-full bg-gdg-yellow text-gdg-black py-2 px-6 overflow-hidden border-b border-gdg-black/10">
          <div className="flex items-center justify-between text-xs font-black tracking-wider uppercase whitespace-nowrap">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              <span>BUILD ✦</span>
              <span>INNOVATE ✦</span>
              <span>DESIGN ✦</span>
              <span>SHIP ✦</span>
              <span>LEARN ✦</span>
              <span>CONNECT ✦</span>
              <span>GROW ✦</span>
            </div>
            <span className="hidden lg:inline text-[11px] font-bold tracking-normal opacity-90 pl-4">
              GDG on Campus LASU Official Broadcast & Dispatch Center
            </span>
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gdg-border pb-6 sm:pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-gdg-yellow" />
                <span className="text-xs font-bold uppercase tracking-wider text-gdg-gray">
                  Cohort Broadcast Channel
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gdg-black tracking-tight">
                Announcements
              </h1>
              <p className="text-sm text-gdg-gray font-medium max-w-xl">
                Stay updated with important bootcamp information, schedule shifts, project release notes, and community updates.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-gdg-border bg-white px-4 py-2.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-gdg-yellow" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray block">
                      Active Bulletins
                    </span>
                    <span className="text-sm font-black text-gdg-black">
                      {allAnnouncements.length} Announcements
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <AnnouncementFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedTrack={selectedTrack}
            onTrackChange={setSelectedTrack}
            onResetFilters={handleResetFilters}
            totalResultsCount={filteredAnnouncements.length}
          />

          {/* Announcements Grid or Empty State */}
          {filteredAnnouncements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAnnouncements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  onSelect={handleSelectAnnouncement}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gdg-border bg-white p-12 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gdg-cream text-gdg-gray border border-gdg-border">
                <Inbox className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-gdg-black">
                  No announcements match your filter
                </h3>
                <p className="text-xs sm:text-sm text-gdg-gray max-w-md mx-auto">
                  Try adjusting your search query or selecting &quot;All Updates&quot;.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gdg-black text-gdg-cream text-xs font-black hover:bg-black transition-all cursor-pointer shadow-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset filters</span>
              </button>
            </div>
          )}

          {/* Discord & WhatsApp Community Callout */}
          <div className="rounded-3xl border border-gdg-border bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gdg-blue" />
                <span className="text-xs font-bold uppercase tracking-wider text-gdg-blue">
                  Real-time Community Chat
                </span>
              </div>
              <h4 className="text-lg sm:text-xl font-black text-gdg-black tracking-tight">
                Join your squad channel on the GDG LASU Discord server
              </h4>
              <p className="text-xs text-gdg-gray leading-relaxed">
                Connect with mentors and fellow bootcamp peers in real time for instant debugging assistance and squad discussions.
              </p>
            </div>

            <a
              href="https://gdg.community.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gdg-black text-gdg-cream text-xs font-black hover:bg-black transition-all cursor-pointer shadow-md shrink-0"
            >
              <span>Open GDG Discord</span>
            </a>
          </div>
        </main>
      </div>

      {/* Announcement Detail Modal */}
      <AnnouncementDetails
        announcement={activeAnnouncement}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
