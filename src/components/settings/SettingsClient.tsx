'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  KeyRound,
  Sliders,
  ArrowLeft,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ProfileTab } from './tabs/ProfileTab';
import { AccountTab } from './tabs/AccountTab';
import { SecurityTab } from './tabs/SecurityTab';
import { PreferencesTab } from './tabs/PreferencesTab';

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
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [currentUser, setCurrentUser] = useState<SettingsUser>(user);

  const backLink =
    currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN'
      ? '/admin'
      : currentUser.role === 'MENTOR'
      ? '/mentor'
      : '/';

  return (
    <div className="min-h-screen bg-gdg-cream text-gdg-black antialiased selection:bg-gdg-yellow/30">
      {/* Top Ticker Ribbon */}
      <div className="w-full bg-gdg-black text-gdg-cream py-2 px-6 overflow-hidden border-b border-gdg-black/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs font-mono tracking-tight text-gdg-cream/70">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-gdg-green animate-pulse" />
            GDG on Campus LASU · Account Control & Security Center
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px]">
            <span>Authenticated as {currentUser.email}</span>
            <span className="text-gdg-cream/30">|</span>
            <span className="capitalize">{currentUser.role.toLowerCase()}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href={backLink}
            className="inline-flex items-center gap-2 text-xs font-bold text-gdg-gray hover:text-gdg-black transition-colors py-1 px-2.5 rounded-lg hover:bg-black/5 -ml-2.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>

        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gdg-border">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-gdg-yellow/15 text-[#9A7400] border border-gdg-yellow/30">
              <Sparkles className="h-3.5 w-3.5" />
              Account Settings
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gdg-black tracking-tight">
              Settings & Security
            </h1>
            <p className="text-sm text-gdg-gray max-w-xl font-medium">
              Manage your personal credentials, identity profile, authentication security, and in-app alert subscriptions.
            </p>
          </div>

          {/* Quick Summary Pill Card */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-gdg-border shadow-2xs">
            <Avatar className="h-12 w-12 border border-gdg-border shadow-2xs">
              <AvatarImage
                src={currentUser.avatarUrl || undefined}
                alt={currentUser.displayName || currentUser.firstName}
              />
              <AvatarFallback className="bg-gdg-black text-gdg-cream text-sm font-bold">
                {(currentUser.firstName?.[0] || 'U') + (currentUser.lastName?.[0] || '')}
              </AvatarFallback>
            </Avatar>
            <div className="pr-2">
              <p className="text-xs font-black text-gdg-black leading-tight">
                {currentUser.displayName || `${currentUser.firstName} ${currentUser.lastName}`}
              </p>
              <p className="text-[11px] text-gdg-gray font-medium leading-tight">{currentUser.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gdg-black text-gdg-cream">
                  {currentUser.role}
                </span>
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-gdg-green/15 text-gdg-green">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation & Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 items-start">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-1.5 bg-white p-2 rounded-2xl border border-gdg-border shadow-2xs">
            {[
              { id: 'profile', label: 'Profile', icon: User, desc: 'Name, bio & links' },
              { id: 'account', label: 'Account', icon: Layers, desc: 'Email & enrollments' },
              { id: 'security', label: 'Security', icon: KeyRound, desc: 'Password & session' },
              { id: 'preferences', label: 'Preferences', icon: Sliders, desc: 'Notification alerts' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={cn(
                    'w-full flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl text-left transition-all cursor-pointer',
                    isActive
                      ? 'bg-gdg-black text-gdg-cream shadow-2xs'
                      : 'text-gdg-gray hover:text-gdg-black hover:bg-gdg-cream'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 mt-0.5 shrink-0',
                      isActive ? 'text-gdg-cream' : 'text-gdg-gray'
                    )}
                  />
                  <div className="min-w-0">
                    <span className="block text-xs font-black tracking-tight truncate">{tab.label}</span>
                    <span
                      className={cn(
                        'hidden sm:block text-[11px] font-medium leading-snug truncate',
                        isActive ? 'text-gdg-cream/70' : 'text-gdg-gray'
                      )}
                    >
                      {tab.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Tab Panel */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <ProfileTab currentUser={currentUser} setCurrentUser={setCurrentUser} />
            )}

            {activeTab === 'account' && (
              <AccountTab
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                enrollmentsSummary={enrollmentsSummary}
                mentorTracksSummary={mentorTracksSummary}
              />
            )}

            {activeTab === 'security' && <SecurityTab />}

            {activeTab === 'preferences' && (
              <PreferencesTab initialPreferences={currentUser.notificationPreferences} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
