'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Layers,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/ui/social-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { StudentProfile, Track } from '@/types/lms';

interface EnrolledTrackItem {
  id: string;
  name: string;
  slug: string;
  accent?: string | null;
  cohortName?: string | null;
}

interface StudentProfileClientProps {
  initialUser: {
    id: string;
    firstName: string;
    lastName: string;
    displayName?: string | null;
    email: string;
    role: string;
    avatarUrl?: string | null;
    bio?: string | null;
    githubUrl?: string | null;
    linkedinUrl?: string | null;
    createdAt?: string;
  };
  enrolledTracks: EnrolledTrackItem[];
}

export function StudentProfileClient({ initialUser, enrolledTracks }: StudentProfileClientProps) {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: initialUser.firstName || '',
    lastName: initialUser.lastName || '',
    displayName: initialUser.displayName || `${initialUser.firstName} ${initialUser.lastName}`,
    avatarUrl: initialUser.avatarUrl || '',
    bio: initialUser.bio || '',
    githubUrl: initialUser.githubUrl || '',
    linkedinUrl: initialUser.linkedinUrl || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const studentProfile: StudentProfile = {
    id: initialUser.id,
    name: formData.displayName || `${formData.firstName} ${formData.lastName}`,
    firstName: formData.firstName,
    lastName: formData.lastName,
    displayName: formData.displayName,
    email: initialUser.email,
    avatar: formData.avatarUrl || '',
    cohort: enrolledTracks[0]?.name ? `${enrolledTracks[0].name} Cohort` : 'Bootcamp Cohort',
    role: initialUser.role === 'MENTOR' ? 'Mentor/Tutor' : initialUser.role === 'ADMIN' ? 'Admin' : 'Student',
    enrolledTracksCount: enrolledTracks.length,
    studyStreakDays: 0,
    totalHoursSpent: 0,
    bio: formData.bio,
    githubUrl: formData.githubUrl,
    linkedinUrl: formData.linkedinUrl,
    onboardingCompleted: true,
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to update profile.');
      } else {
        setSuccessMessage('Profile saved successfully.');
        router.refresh();
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch {
      setErrorMessage('Network error while saving profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = `${formData.firstName.slice(0, 1)}${formData.lastName.slice(0, 1)}`.toUpperCase() || 'ST';

  const sidebarTracks: Track[] = enrolledTracks.map((et) => ({
    id: et.id,
    name: (et.name as Track['name']) || 'Frontend Development',
    slug: et.slug,
    description: '',
    cohort: et.cohortName || 'Bootcamp 2026',
    instructors: [],
    progressPercentage: 0,
    completedLessons: 0,
    totalLessons: 0,
    currentModule: 'Curriculum',
    nextLesson: undefined,
    colorTheme: {
      badge: 'bg-[#4285F4]/10 text-[#4285F4]',
      border: 'border-[#4285F4]/30',
      accent: et.accent || '#4285F4',
    },
  }));

  return (
    <div className="flex min-h-screen bg-[#FAF7EE] text-[#0D0E11] antialiased selection:bg-[#FBBC04]/30">
      {/* Sidebar */}
      <DashboardSidebar
        currentTab="dashboard"
        student={studentProfile}
        enrolledTracks={sidebarTracks}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Main Container */}
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader
          currentTab="dashboard"
          student={studentProfile}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
        />

        <main className="flex-1 p-6 sm:p-8 lg:p-10 space-y-8 max-w-5xl w-full mx-auto">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E5DFD0]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4]" />
                <span className="text-[11px] font-black uppercase tracking-wider text-[#5F6368]">
                  Account Settings
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0D0E11] tracking-tight">
                Student Profile
              </h1>
              <p className="text-xs sm:text-sm text-[#5F6368]">
                Manage your personal identity, bio, social connections, and cohort tracks.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0D0E11] hover:bg-[#22242B] text-xs font-black text-[#FAF7EE] shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#FBBC04]" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#FBBC04]" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>

          {/* Feedback alerts */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-[#34A853]/15 border border-[#34A853]/30 text-xs font-bold text-[#34A853] flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-[#EA4335]/15 border border-[#EA4335]/30 text-xs font-bold text-[#EA4335] flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Profile Card & Enrolled Tracks */}
            <div className="space-y-6">
              {/* Profile Overview Card */}
              <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 shadow-sm space-y-4 text-center">
                <Avatar className="w-24 h-24 rounded-3xl border-2 border-[#0D0E11] mx-auto shadow-md">
                  <AvatarImage src={formData.avatarUrl} alt={formData.displayName} />
                  <AvatarFallback className="bg-[#0D0E11] text-[#FAF7EE] font-black text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <h2 className="text-lg font-black text-[#0D0E11]">
                    {formData.displayName || `${formData.firstName} ${formData.lastName}`}
                  </h2>
                  <p className="text-xs text-[#5F6368] font-medium">{initialUser.email}</p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30 text-[11px] font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Enrolled Student</span>
                </div>

                {formData.bio && (
                  <p className="text-xs text-[#5F6368] leading-relaxed pt-2 border-t border-[#E5DFD0]">
                    &ldquo;{formData.bio}&rdquo;
                  </p>
                )}

                {/* Social Badges */}
                <div className="flex items-center justify-center gap-3 pt-3 border-t border-[#E5DFD0]">
                  {formData.githubUrl ? (
                    <a
                      href={formData.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-[#FAF7EE] hover:bg-[#E5DFD0] border border-[#E5DFD0] text-[#0D0E11] transition-colors"
                      title="GitHub Profile"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  ) : null}
                  {formData.linkedinUrl ? (
                    <a
                      href={formData.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-[#FAF7EE] hover:bg-[#E5DFD0] border border-[#E5DFD0] text-[#4285F4] transition-colors"
                      title="LinkedIn Profile"
                    >
                      <LinkedinIcon className="w-4 h-4" />
                    </a>
                  ) : null}
                  {!formData.githubUrl && !formData.linkedinUrl && (
                    <span className="text-[11px] text-[#5F6368]">No social links attached</span>
                  )}
                </div>
              </div>

              {/* Enrolled Tracks (Readonly - Student cannot edit arbitary enrollments) */}
              <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#4285F4]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#0D0E11]">
                      My Enrolled Tracks
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7EE] border border-[#E5DFD0] text-[#5F6368]">
                    {enrolledTracks.length} Active
                  </span>
                </div>

                {enrolledTracks.length > 0 ? (
                  <div className="space-y-2.5">
                    {enrolledTracks.map((trk) => (
                      <Link
                        key={trk.id}
                        href={`/tracks/${trk.slug || trk.id}`}
                        className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7EE] hover:bg-white border border-[#E5DFD0] hover:border-[#0D0E11]/30 transition-all group"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: trk.accent || '#4285F4' }}
                            />
                            <span className="text-xs font-bold text-[#0D0E11] truncate group-hover:text-black">
                              {trk.name}
                            </span>
                          </div>
                          {trk.cohortName && (
                            <span className="text-[10px] text-[#5F6368] pl-3.5 block">
                              {trk.cohortName}
                            </span>
                          )}
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#5F6368] group-hover:text-[#0D0E11] shrink-0" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-center space-y-2">
                    <p className="text-xs text-[#5F6368]">You have not joined any track yet.</p>
                    <Link
                      href="/onboarding/join"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4285F4] hover:underline"
                    >
                      <span>Join via Invite Code</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Editable Profile Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSave} className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-black text-[#0D0E11]">Personal Details</h3>
                  <p className="text-xs text-[#5F6368]">Update your personal information and contact links.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0D0E11]">First Name</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-xs font-medium text-[#0D0E11] focus:bg-white focus:border-[#0D0E11] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0D0E11]">Last Name</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-xs font-medium text-[#0D0E11] focus:bg-white focus:border-[#0D0E11] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#0D0E11]">Display Name</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-xs font-medium text-[#0D0E11] focus:bg-white focus:border-[#0D0E11] outline-none"
                  />
                  <p className="text-[10px] text-[#5F6368]">The name shown on leaderboards, assignment submissions, and discussions.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#0D0E11]">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={initialUser.email}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7EE]/50 border border-[#E5DFD0] text-xs font-medium text-[#5F6368] cursor-not-allowed"
                  />
                  <p className="text-[10px] text-[#5F6368]">Primary login email managed by administrative team.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#0D0E11]">Avatar Image URL</label>
                  <input
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-xs font-medium text-[#0D0E11] focus:bg-white focus:border-[#0D0E11] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#0D0E11]">Short Bio</label>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell your mentors and cohort about your interests and goals..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-xs text-[#0D0E11] focus:bg-white focus:border-[#0D0E11] outline-none resize-none"
                  />
                  <div className="flex justify-between items-center text-[10px] text-[#5F6368]">
                    <span>Max 500 characters</span>
                    <span>{formData.bio.length}/500</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5DFD0] space-y-4">
                  <div>
                    <h3 className="text-base font-black text-[#0D0E11]">Portfolio & Socials</h3>
                    <p className="text-xs text-[#5F6368]">Connect your developer profiles for mentor review.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-[#0D0E11]">
                        <GithubIcon className="w-3.5 h-3.5" />
                        <span>GitHub Profile</span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://github.com/..."
                        value={formData.githubUrl}
                        onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-xs font-medium text-[#0D0E11] focus:bg-white focus:border-[#0D0E11] outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-[#0D0E11]">
                        <LinkedinIcon className="w-3.5 h-3.5 text-[#4285F4]" />
                        <span>LinkedIn Profile</span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/..."
                        value={formData.linkedinUrl}
                        onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-xs font-medium text-[#0D0E11] focus:bg-white focus:border-[#0D0E11] outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5DFD0] flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0D0E11] hover:bg-[#22242B] text-xs font-black text-[#FAF7EE] shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#FBBC04]" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-[#FBBC04]" />
                        <span>Save Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
