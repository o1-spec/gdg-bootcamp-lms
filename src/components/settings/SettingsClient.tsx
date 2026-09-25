'use client';

import React, { useState, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ShieldCheck,
  KeyRound,
  Sliders,
  ArrowLeft,
  Camera,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  Mail,
  Calendar,
  Layers,
  Sparkles,
  LogOut,
  Bell,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GithubIcon, LinkedinIcon } from '@/components/ui/social-icons';
import { cn } from '@/lib/utils';

export interface SettingsUser {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  email: string;
  role: string;
  avatarUrl: string | null;
  avatarPublicId?: string | null;
  bio: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  isActive: boolean;
  createdAt: string;
  notificationPreferences?: {
    assignments?: boolean;
    sessions?: boolean;
    resources?: boolean;
    announcements?: boolean;
    feedback?: boolean;
  } | null;
}

interface SettingsClientProps {
  user: SettingsUser;
  enrollmentsSummary: { id: string; name: string; cohortName?: string | null }[];
  mentorTracksSummary: { id: string; name: string }[];
}

type TabType = 'profile' | 'account' | 'security' | 'preferences';

export function SettingsClient({
  user,
  enrollmentsSummary,
  mentorTracksSummary,
}: SettingsClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Local state for user info
  const [currentUser, setCurrentUser] = useState<SettingsUser>(user);

  // ── Profile Form State ──────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    displayName: user.displayName || `${user.firstName} ${user.lastName}`,
    bio: user.bio || '',
    githubUrl: user.githubUrl || '',
    linkedinUrl: user.linkedinUrl || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // ── Avatar State ────────────────────────────────────────────────
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarFeedback, setAvatarFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // ── Email Change State ──────────────────────────────────────────
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    currentPassword: '',
  });
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // ── Password Change State ───────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // ── Preferences State ───────────────────────────────────────────
  const [prefs, setPrefs] = useState({
    assignments: user.notificationPreferences?.assignments !== false,
    sessions: user.notificationPreferences?.sessions !== false,
    resources: user.notificationPreferences?.resources !== false,
    announcements: user.notificationPreferences?.announcements !== false,
    feedback: user.notificationPreferences?.feedback !== false,
  });
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsFeedback, setPrefsFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // ── Danger Zone State ───────────────────────────────────────────
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileFeedback(null);

    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();

      if (!res.ok) {
        setProfileFeedback({ type: 'error', message: data.error || 'Failed to update profile' });
      } else {
        setProfileFeedback({ type: 'success', message: 'Profile details saved successfully!' });
        setCurrentUser((prev) => ({
          ...prev,
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          displayName: profileForm.displayName,
          bio: profileForm.bio,
          githubUrl: profileForm.githubUrl,
          linkedinUrl: profileForm.linkedinUrl,
        }));
        router.refresh();
      }
    } catch {
      setProfileFeedback({ type: 'error', message: 'A network error occurred. Please try again.' });
    } finally {
      setProfileSaving(false);
    }
  };

  // Avatar Upload
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setAvatarFeedback({ type: 'error', message: 'Avatar image must be smaller than 5MB.' });
      return;
    }

    setAvatarUploading(true);
    setAvatarFeedback(null);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setAvatarFeedback({ type: 'error', message: data.error || 'Failed to upload avatar' });
      } else {
        setAvatarFeedback({ type: 'success', message: 'Avatar uploaded and updated!' });
        setCurrentUser((prev) => ({
          ...prev,
          avatarUrl: data.avatarUrl,
          avatarPublicId: data.avatarPublicId,
        }));
        router.refresh();
      }
    } catch {
      setAvatarFeedback({ type: 'error', message: 'Failed to upload avatar. Try again.' });
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Avatar Remove
  const handleRemoveAvatar = async () => {
    if (!currentUser.avatarUrl && !currentUser.avatarPublicId) return;

    setAvatarUploading(true);
    setAvatarFeedback(null);

    try {
      const res = await fetch('/api/upload/avatar', { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        setAvatarFeedback({ type: 'error', message: data.error || 'Failed to remove avatar' });
      } else {
        setAvatarFeedback({ type: 'success', message: 'Avatar removed.' });
        setCurrentUser((prev) => ({
          ...prev,
          avatarUrl: null,
          avatarPublicId: null,
        }));
        router.refresh();
      }
    } catch {
      setAvatarFeedback({ type: 'error', message: 'Failed to remove avatar.' });
    } finally {
      setAvatarUploading(false);
    }
  };

  // Email Change
  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSaving(true);
    setEmailFeedback(null);

    try {
      const res = await fetch('/api/settings/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailForm),
      });
      const data = await res.json();

      if (!res.ok) {
        setEmailFeedback({ type: 'error', message: data.error || 'Failed to update email' });
      } else {
        setEmailFeedback({ type: 'success', message: 'Email address updated successfully!' });
        setCurrentUser((prev) => ({ ...prev, email: data.email }));
        setEmailForm({ newEmail: '', currentPassword: '' });
        router.refresh();
      }
    } catch {
      setEmailFeedback({ type: 'error', message: 'A network error occurred.' });
    } finally {
      setEmailSaving(false);
    }
  };

  // Password Change
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword.length < 8) {
      setPasswordFeedback({ type: 'error', message: 'New password must be at least 8 characters long.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordFeedback({ type: 'error', message: 'New password cannot be the same as your current password.' });
      return;
    }

    setPasswordSaving(true);
    setPasswordFeedback(null);

    try {
      const res = await fetch('/api/settings/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();

      if (!res.ok) {
        setPasswordFeedback({ type: 'error', message: data.error || 'Failed to change password' });
      } else {
        setPasswordFeedback({
          type: 'success',
          message: 'Password changed successfully! A security notice has been recorded.',
        });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch {
      setPasswordFeedback({ type: 'error', message: 'A network error occurred.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  // Preferences Save
  const handleSavePreferences = async () => {
    setPrefsSaving(true);
    setPrefsFeedback(null);

    try {
      const res = await fetch('/api/settings/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
      const data = await res.json();

      if (!res.ok) {
        setPrefsFeedback({ type: 'error', message: data.error || 'Failed to save preferences' });
      } else {
        setPrefsFeedback({ type: 'success', message: 'Notification preferences saved!' });
        setCurrentUser((prev) => ({ ...prev, notificationPreferences: prefs }));
      }
    } catch {
      setPrefsFeedback({ type: 'error', message: 'A network error occurred.' });
    } finally {
      setPrefsSaving(false);
    }
  };

  // Sign out handler
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const backLink =
    currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN'
      ? '/admin'
      : currentUser.role === 'MENTOR'
      ? '/mentor'
      : '/';

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-[#0D0E11] antialiased selection:bg-[#FBBC04]/30">
      {/* Top Ticker Ribbon */}
      <div className="w-full bg-[#0D0E11] text-[#FAF7EE] py-2 px-6 overflow-hidden border-b border-[#0D0E11]/10">
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
          <span className="hidden lg:inline text-[11px] font-semibold tracking-normal text-[#FAF7EE]/70 pl-4">
            GDG on Campus LASU · Account Control & Security Center
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href={backLink}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#5F6368] hover:text-[#0D0E11] transition-colors rounded-xl px-3 py-2 -ml-3 hover:bg-black/5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>

          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#4285F4] hover:underline"
          >
            <span>View Public Profile</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5DFD0] pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#34A853]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
                Account Administration
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#0D0E11] tracking-tight">
              Settings & Security
            </h1>
            <p className="text-sm text-[#5F6368] font-medium max-w-xl">
              Manage your personal credentials, identity profile, authentication security, and in-app alert subscriptions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-[#E5DFD0] bg-white px-5 py-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-[#E5DFD0]">
                  <AvatarImage src={currentUser.avatarUrl || ''} />
                  <AvatarFallback className="bg-[#4285F4] text-white font-black text-sm">
                    {currentUser.firstName?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-sm font-black text-[#0D0E11] block leading-snug">
                    {currentUser.displayName || `${currentUser.firstName} ${currentUser.lastName}`}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368]">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Grid: Sidebar Tabs + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Tabs Navigation (Desktop Sidebar, Mobile Horizontal) */}
          <div className="lg:col-span-1 space-y-2">
            <nav className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
              {(
                [
                  { id: 'profile', label: 'Profile', icon: User, desc: 'Personal info & avatar' },
                  { id: 'account', label: 'Account', icon: ShieldCheck, desc: 'Role, email & cohorts' },
                  { id: 'security', label: 'Security', icon: KeyRound, desc: 'Password & session' },
                  { id: 'preferences', label: 'Preferences', icon: Sliders, desc: 'Notification alerts' },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left transition-all border shrink-0 lg:w-full',
                      active
                        ? 'bg-[#0D0E11] text-[#FAF7EE] border-[#0D0E11] shadow-2xs'
                        : 'bg-white text-[#5F6368] border-[#E5DFD0] hover:border-[#0D0E11]/30 hover:text-[#0D0E11]'
                    )}
                  >
                    <div
                      className={cn(
                        'h-8 w-8 rounded-xl flex items-center justify-center shrink-0',
                        active ? 'bg-white/10 text-[#FAF7EE]' : 'bg-[#FAF7EE] text-[#5F6368]'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black block tracking-wide">{tab.label}</span>
                      <span
                        className={cn(
                          'text-[10px] hidden sm:block truncate',
                          active ? 'text-[#FAF7EE]/70' : 'text-[#5F6368]/70'
                        )}
                      >
                        {tab.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* ────────────────────────────────────────────────────────
                TAB 1: PROFILE
            ──────────────────────────────────────────────────────── */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-8 shadow-2xs space-y-6">
                  <div className="border-b border-[#E5DFD0] pb-4">
                    <h3 className="text-lg font-black text-[#0D0E11]">Profile Avatar</h3>
                    <p className="text-xs text-[#5F6368] font-medium">
                      Upload your profile photo. Supported formats: JPG, PNG, WebP up to 5MB.
                    </p>
                  </div>

                  {avatarFeedback && (
                    <div
                      className={cn(
                        'p-4 rounded-2xl text-xs font-semibold flex items-center gap-3',
                        avatarFeedback.type === 'success'
                          ? 'bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/20'
                          : 'bg-[#EA4335]/10 text-[#EA4335] border border-[#EA4335]/20'
                      )}
                    >
                      {avatarFeedback.type === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 shrink-0" />
                      )}
                      <span>{avatarFeedback.message}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group">
                      <Avatar className="h-24 w-24 border-4 border-[#FAF7EE] shadow-sm">
                        <AvatarImage src={currentUser.avatarUrl || ''} />
                        <AvatarFallback className="bg-[#4285F4] text-white font-black text-2xl">
                          {currentUser.firstName?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {avatarUploading && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 flex-1 text-center sm:text-left">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleAvatarFileChange}
                        disabled={avatarUploading}
                      />

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={avatarUploading}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#0D0E11] text-[#FAF7EE] hover:bg-[#0D0E11]/85 transition-all shadow-2xs disabled:opacity-50"
                        >
                          <Camera className="h-3.5 w-3.5 text-[#FBBC04]" />
                          <span>{currentUser.avatarUrl ? 'Replace Avatar' : 'Upload Avatar'}</span>
                        </button>

                        {currentUser.avatarUrl && (
                          <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            disabled={avatarUploading}
                            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border border-[#E5DFD0] text-[#EA4335] hover:bg-[#EA4335]/5 transition-all disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] text-[#5F6368] font-medium">
                        Recommended: Square image, 400x400 pixels or larger.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile Form */}
                <form
                  onSubmit={handleSaveProfile}
                  className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-8 shadow-2xs space-y-6"
                >
                  <div className="border-b border-[#E5DFD0] pb-4">
                    <h3 className="text-lg font-black text-[#0D0E11]">Personal Details</h3>
                    <p className="text-xs text-[#5F6368] font-medium">
                      Update your public profile, display name, and biographical information.
                    </p>
                  </div>

                  {profileFeedback && (
                    <div
                      className={cn(
                        'p-4 rounded-2xl text-xs font-semibold flex items-center gap-3',
                        profileFeedback.type === 'success'
                          ? 'bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/20'
                          : 'bg-[#EA4335]/10 text-[#EA4335] border border-[#EA4335]/20'
                      )}
                    >
                      {profileFeedback.type === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 shrink-0" />
                      )}
                      <span>{profileFeedback.message}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0D0E11]">First Name *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.firstName}
                        onChange={(e) =>
                          setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))
                        }
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-[#E5DFD0] bg-white text-[#0D0E11] focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0D0E11]">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.lastName}
                        onChange={(e) =>
                          setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))
                        }
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-[#E5DFD0] bg-white text-[#0D0E11] focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0D0E11]">Display Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Johnson"
                      value={profileForm.displayName}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, displayName: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-[#E5DFD0] bg-white text-[#0D0E11] focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-all"
                    />
                    <span className="text-[10px] text-[#5F6368] font-medium block">
                      Displayed on comments, submissions, and cohort activity feeds.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#0D0E11]">Short Bio</label>
                      <span className="text-[10px] text-[#5F6368] font-medium">
                        {profileForm.bio.length}/500
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={500}
                      placeholder="A short snippet about your engineering interests, goals, or background..."
                      value={profileForm.bio}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-[#E5DFD0] bg-white text-[#0D0E11] focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-all resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0D0E11] flex items-center gap-1.5">
                        <GithubIcon className="h-3.5 w-3.5" />
                        <span>GitHub Profile</span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://github.com/yourusername"
                        value={profileForm.githubUrl}
                        onChange={(e) =>
                          setProfileForm((prev) => ({ ...prev, githubUrl: e.target.value }))
                        }
                        className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-[#E5DFD0] bg-white text-[#0D0E11] focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0D0E11] flex items-center gap-1.5">
                        <LinkedinIcon className="h-3.5 w-3.5" />
                        <span>LinkedIn Profile</span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/yourusername"
                        value={profileForm.linkedinUrl}
                        onChange={(e) =>
                          setProfileForm((prev) => ({ ...prev, linkedinUrl: e.target.value }))
                        }
                        className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-[#E5DFD0] bg-white text-[#0D0E11] focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-[#E5DFD0]">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0D0E11] text-[#FAF7EE] hover:bg-[#0D0E11]/85 transition-all shadow-2xs disabled:opacity-50"
                    >
                      {profileSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <span>Save Profile Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ────────────────────────────────────────────────────────
                TAB 2: ACCOUNT
            ──────────────────────────────────────────────────────── */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                {/* Account Details Card */}
                <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-8 shadow-2xs space-y-6">
                  <div className="border-b border-[#E5DFD0] pb-4">
                    <h3 className="text-lg font-black text-[#0D0E11]">Account Information</h3>
                    <p className="text-xs text-[#5F6368] font-medium">
                      Overview of your account role, membership dates, and assigned track enrollments.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
                        Account Role
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#0D0E11]">
                          {currentUser.role.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#4285F4]/10 text-[#4285F4]">
                          Official
                        </span>
                      </div>
                      <span className="text-[10px] text-[#5F6368] font-medium block">
                        Role modifications must be authorized by a platform administrator.
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
                        Account Status
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#34A853]" />
                        <span className="text-sm font-black text-[#0D0E11]">
                          {currentUser.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#5F6368] font-medium block">
                        Account is in good standing with full platform access.
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
                        Member Since
                      </span>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-[#0D0E11]">
                        <Calendar className="h-4 w-4 text-[#5F6368]" />
                        <span>{new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <span className="text-[10px] text-[#5F6368] font-medium block">
                        Registration timestamp
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
                        Active Cohorts / Tracks
                      </span>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-[#0D0E11]">
                        <Layers className="h-4 w-4 text-[#FBBC04]" />
                        <span>
                          {currentUser.role === 'STUDENT'
                            ? `${enrollmentsSummary.length} Track Enrolled`
                            : currentUser.role === 'MENTOR'
                            ? `${mentorTracksSummary.length} Track Assigned`
                            : 'All Tracks (Admin)'}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#5F6368] font-medium block">
                        Track enrollments are managed via bootcamp cohort invites.
                      </span>
                    </div>
                  </div>

                  {/* List of enrolled tracks */}
                  {enrollmentsSummary.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-bold text-[#0D0E11] block">
                        Enrolled Tracks:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {enrollmentsSummary.map((item) => (
                          <div
                            key={item.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E5DFD0] bg-white text-xs font-bold text-[#0D0E11]"
                          >
                            <span className="h-2 w-2 rounded-full bg-[#4285F4]" />
                            <span>{item.name}</span>
                            {item.cohortName && (
                              <span className="text-[10px] text-[#5F6368] font-medium">
                                ({item.cohortName})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {mentorTracksSummary.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-bold text-[#0D0E11] block">
                        Assigned Mentor Tracks:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {mentorTracksSummary.map((item) => (
                          <div
                            key={item.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E5DFD0] bg-white text-xs font-bold text-[#0D0E11]"
                          >
                            <span className="h-2 w-2 rounded-full bg-[#FBBC04]" />
                            <span>{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Email Address Card */}
                <form
                  onSubmit={handleSaveEmail}
                  className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-8 shadow-2xs space-y-6"
                >
                  <div className="border-b border-[#E5DFD0] pb-4">
                    <h3 className="text-lg font-black text-[#0D0E11]">Email Address</h3>
                    <p className="text-xs text-[#5F6368] font-medium">
                      Your current login email is <strong className="text-[#0D0E11]">{currentUser.email}</strong>.
                      To change it, enter a new email and verify your current password.
                    </p>
                  </div>

                  {emailFeedback && (
                    <div
                      className={cn(
                        'p-4 rounded-2xl text-xs font-semibold flex items-center gap-3',
                        emailFeedback.type === 'success'
                          ? 'bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/20'
                          : 'bg-[#EA4335]/10 text-[#EA4335] border border-[#EA4335]/20'
                      )}
                    >
                      {emailFeedback.type === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 shrink-0" />
                      )}
                      <span>{emailFeedback.message}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0D0E11]">New Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="new.email@example.com"
                        value={emailForm.newEmail}
                        onChange={(e) =>
                          setEmailForm((prev) => ({ ...prev, newEmail: e.target.value }))
                        }
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-[#E5DFD0] bg-white text-[#0D0E11] focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0D0E11]">Current Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={emailForm.currentPassword}
                        onChange={(e) =>
                          setEmailForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                        }
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-[#E5DFD0] bg-white text-[#0D0E11] focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-[#E5DFD0]">
                    <button
                      type="submit"
                      disabled={emailSaving || !emailForm.newEmail || !emailForm.currentPassword}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0D0E11] text-[#FAF7EE] hover:bg-[#0D0E11]/85 transition-all shadow-2xs disabled:opacity-50"
                    >
                      {emailSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <span>Update Email</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ────────────────────────────────────────────────────────
                TAB 3: SECURITY
            ──────────────────────────────────────────────────────── */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Change Password Card */}
                <form
                  onSubmit={handleSavePassword}
                  className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-8 shadow-2xs space-y-6"
                >
                  <div className="border-b border-[#E5DFD0] pb-4">
                    <h3 className="text-lg font-black text-[#0D0E11]">Change Password</h3>
                    <p className="text-xs text-[#5F6368] font-medium">
                      Protect your account with a secure password of at least 8 characters.
                    </p>
                  </div>

                  {passwordFeedback && (
                    <div
                      className={cn(
                        'p-4 rounded-2xl text-xs font-semibold flex items-center gap-3',
                        passwordFeedback.type === 'success'
                          ? 'bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/20'
                          : 'bg-[#EA4335]/10 text-[#EA4335] border border-[#EA4335]/20'
                      )}
                    >
                      {passwordFeedback.type === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 shrink-0" />
                      )}
                      <span>{passwordFeedback.message}</span>
                    </div>
                  )}

                  <div className="space-y-4 max-w-xl">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0D0E11]">Current Password *</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          required
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 pr-10 text-xs font-semibold rounded-xl border border-[#E5DFD0] bg-white text-[#0D0E11] focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5F6368] hover:text-[#0D0E11]"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#0D0E11]">New Password *</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            placeholder="At least 8 characters"
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                            }
                            className="w-full px-3.5 py-2.5 pr-10 text-xs font-semibold rounded-xl border border-[#E5DFD0] bg-white text-[#0D0E11] focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5F6368] hover:text-[#0D0E11]"
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#0D0E11]">Confirm New Password *</label>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          placeholder="Repeat new password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-[#E5DFD0] bg-white text-[#0D0E11] focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-xs text-[#5F6368] space-y-1">
                    <span className="font-bold text-[#0D0E11] block">Password Policy Guidelines:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      <li>Minimum 8 characters in length</li>
                      <li>Must not be identical to your current password</li>
                      <li>A security audit alert will be dispatched to your notifications feed</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-[#E5DFD0]">
                    <button
                      type="submit"
                      disabled={passwordSaving || !passwordForm.currentPassword || !passwordForm.newPassword}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0D0E11] text-[#FAF7EE] hover:bg-[#0D0E11]/85 transition-all shadow-2xs disabled:opacity-50"
                    >
                      {passwordSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <span>Update Password</span>
                    </button>
                  </div>
                </form>

                {/* Session Security Review Card */}
                <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-8 shadow-2xs space-y-4">
                  <div className="border-b border-[#E5DFD0] pb-4">
                    <h3 className="text-lg font-black text-[#0D0E11]">Session & Cookie Security</h3>
                    <p className="text-xs text-[#5F6368] font-medium">
                      Overview of cryptographic session protection mechanisms guarding your account.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#34A853]">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>HTTP-Only Cookies</span>
                      </div>
                      <p className="text-[11px] text-[#5F6368]">
                        Protected against cross-site scripting (XSS). Cannot be read by JavaScript.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#34A853]">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>SameSite Protection</span>
                      </div>
                      <p className="text-[11px] text-[#5F6368]">
                        Strict browser cookies prevent CSRF forgery across foreign origins.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#34A853]">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Server-Signed JWT</span>
                      </div>
                      <p className="text-[11px] text-[#5F6368]">
                        HMAC-SHA256 signature verified on every privileged route.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="rounded-3xl border border-[#EA4335]/30 bg-white p-6 sm:p-8 shadow-2xs space-y-4">
                  <div className="border-b border-[#EA4335]/20 pb-4">
                    <h3 className="text-lg font-black text-[#EA4335]">Danger Zone</h3>
                    <p className="text-xs text-[#5F6368] font-medium">
                      Security termination actions for this authenticated browser session.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#EA4335]/5 border border-[#EA4335]/20">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-[#0D0E11] block">
                        Sign out from this device
                      </span>
                      <span className="text-[11px] text-[#5F6368] font-medium block">
                        Terminates your current HTTP-only cookie session and redirects to the sign-in portal.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#EA4335] text-white hover:bg-[#EA4335]/90 transition-all shadow-2xs shrink-0 disabled:opacity-50"
                    >
                      {isLoggingOut ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <LogOut className="h-3.5 w-3.5" />
                      )}
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ────────────────────────────────────────────────────────
                TAB 4: PREFERENCES
            ──────────────────────────────────────────────────────── */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-8 shadow-2xs space-y-6">
                  <div className="border-b border-[#E5DFD0] pb-4">
                    <h3 className="text-lg font-black text-[#0D0E11]">In-App Notification Preferences</h3>
                    <p className="text-xs text-[#5F6368] font-medium">
                      Control which optional activity notifications appear in your bell dropdown and feed.
                    </p>
                  </div>

                  {prefsFeedback && (
                    <div
                      className={cn(
                        'p-4 rounded-2xl text-xs font-semibold flex items-center gap-3',
                        prefsFeedback.type === 'success'
                          ? 'bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/20'
                          : 'bg-[#EA4335]/10 text-[#EA4335] border border-[#EA4335]/20'
                      )}
                    >
                      {prefsFeedback.type === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 shrink-0" />
                      )}
                      <span>{prefsFeedback.message}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {(
                      [
                        {
                          key: 'assignments',
                          title: 'Assignments & Project Deadlines',
                          desc: 'Alerts when new assignments are published or submissions are received.',
                        },
                        {
                          key: 'sessions',
                          title: 'Live Sessions & Reminders',
                          desc: 'Notifications when scheduled workshops, guest lectures, or office hours are booked.',
                        },
                        {
                          key: 'resources',
                          title: 'Learning Resources',
                          desc: 'Alerts when mentors post slides, guides, videos, or code boilerplates.',
                        },
                        {
                          key: 'announcements',
                          title: 'Cohort Bulletins & Notices',
                          desc: 'General announcements and track-wide broadcast notices from mentors and admins.',
                        },
                        {
                          key: 'feedback',
                          title: 'Submission Grading & Review Feedback',
                          desc: 'Instant notifications when your assignment receives an evaluation or review remarks.',
                        },
                      ] as const
                    ).map((item) => {
                      const enabled = prefs[item.key];
                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-4 rounded-2xl border border-[#E5DFD0] bg-[#FAF7EE] hover:bg-white transition-colors"
                        >
                          <div className="space-y-0.5 pr-4">
                            <span className="text-xs font-black text-[#0D0E11] block">
                              {item.title}
                            </span>
                            <span className="text-[11px] text-[#5F6368] font-medium block">
                              {item.desc}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setPrefs((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                            }
                            className={cn(
                              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                              enabled ? 'bg-[#34A853]' : 'bg-[#E5DFD0]'
                            )}
                          >
                            <span
                              className={cn(
                                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                                enabled ? 'translate-x-5' : 'translate-x-0'
                              )}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/20 text-xs text-[#4285F4] flex items-start gap-2.5">
                    <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Critical System Alerts:</span>
                      <span className="text-[11px] opacity-90 block">
                        Account security notices, password changes, and track enrollment confirmations are critical alerts and are always delivered.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-[#E5DFD0]">
                    <button
                      type="button"
                      onClick={handleSavePreferences}
                      disabled={prefsSaving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0D0E11] text-[#FAF7EE] hover:bg-[#0D0E11]/85 transition-all shadow-2xs disabled:opacity-50"
                    >
                      {prefsSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <span>Save Preferences</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
