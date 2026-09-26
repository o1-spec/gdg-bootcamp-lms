'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Layers, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { SettingsUser } from '../SettingsClient';
import { cn } from '@/lib/utils';

interface AccountTabProps {
  currentUser: SettingsUser;
  setCurrentUser: React.Dispatch<React.SetStateAction<SettingsUser>>;
  enrollmentsSummary: { id: string; name: string; cohortName?: string | null }[];
  mentorTracksSummary: { id: string; name: string }[];
}

export function AccountTab({
  currentUser,
  setCurrentUser,
  enrollmentsSummary,
  mentorTracksSummary,
}: AccountTabProps) {
  const router = useRouter();

  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    currentPassword: '',
  });
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

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
        setCurrentUser((prev) => ({ ...prev, email: emailForm.newEmail }));
        setEmailForm({ newEmail: '', currentPassword: '' });
        router.refresh();
      }
    } catch {
      setEmailFeedback({ type: 'error', message: 'A network error occurred.' });
    } finally {
      setEmailSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Details Card */}
      <div className="rounded-3xl border border-gdg-border bg-white p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="border-b border-gdg-border pb-4">
          <h3 className="text-lg font-black text-gdg-black">Account Information</h3>
          <p className="text-xs text-gdg-gray font-medium">
            Overview of your account role, membership dates, and assigned track enrollments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-gdg-cream border border-gdg-border space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray block">
              Account Role
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-gdg-black">
                {currentUser.role.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-gdg-blue/10 text-gdg-blue">
                Official
              </span>
            </div>
            <span className="text-[10px] text-gdg-gray font-medium block">
              Role modifications must be authorized by a platform administrator.
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gdg-cream border border-gdg-border space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray block">
              Account Status
            </span>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gdg-green" />
              <span className="text-sm font-black text-gdg-black">
                {currentUser.isActive ? 'Active' : 'Deactivated'}
              </span>
            </div>
            <span className="text-[10px] text-gdg-gray font-medium block">
              Account is in good standing with full platform access.
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gdg-cream border border-gdg-border space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray block">
              Member Since
            </span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-gdg-black">
              <Calendar className="h-4 w-4 text-gdg-gray" />
              <span>
                {new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <span className="text-[10px] text-gdg-gray font-medium block">
              Registration timestamp
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gdg-cream border border-gdg-border space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray block">
              Active Cohorts / Tracks
            </span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-gdg-black">
              <Layers className="h-4 w-4 text-gdg-yellow" />
              <span>
                {currentUser.role === 'STUDENT'
                  ? `${enrollmentsSummary.length} Track Enrolled`
                  : currentUser.role === 'MENTOR'
                  ? `${mentorTracksSummary.length} Track Assigned`
                  : 'All Tracks (Admin)'}
              </span>
            </div>
            <span className="text-[10px] text-gdg-gray font-medium block">
              Track enrollments are managed via bootcamp cohort invites.
            </span>
          </div>
        </div>

        {enrollmentsSummary.length > 0 && (
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-gdg-black block">
              Enrolled Tracks:
            </label>
            <div className="flex flex-wrap gap-2">
              {enrollmentsSummary.map((item) => (
                <div
                  key={item.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gdg-border bg-white text-xs font-bold text-gdg-black"
                >
                  <span className="h-2 w-2 rounded-full bg-gdg-blue" />
                  <span>{item.name}</span>
                  {item.cohortName && (
                    <span className="text-[10px] text-gdg-gray font-medium">
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
            <label className="text-xs font-bold text-gdg-black block">
              Assigned Mentor Tracks:
            </label>
            <div className="flex flex-wrap gap-2">
              {mentorTracksSummary.map((item) => (
                <div
                  key={item.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gdg-border bg-white text-xs font-bold text-gdg-black"
                >
                  <span className="h-2 w-2 rounded-full bg-gdg-yellow" />
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
        className="rounded-3xl border border-gdg-border bg-white p-6 sm:p-8 shadow-2xs space-y-6"
      >
        <div className="border-b border-gdg-border pb-4">
          <h3 className="text-lg font-black text-gdg-black">Email Address</h3>
          <p className="text-xs text-gdg-gray font-medium">
            Your current login email is <strong className="text-gdg-black">{currentUser.email}</strong>.
            To change it, enter a new email and verify your current password.
          </p>
        </div>

        {emailFeedback && (
          <div
            className={cn(
              'p-4 rounded-2xl text-xs font-semibold flex items-center gap-3',
              emailFeedback.type === 'success'
                ? 'bg-gdg-green/10 text-gdg-green border border-gdg-green/20'
                : 'bg-gdg-red/10 text-gdg-red border border-gdg-red/20'
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
            <label className="text-xs font-bold text-gdg-black">New Email Address</label>
            <input
              type="email"
              required
              placeholder="new.email@example.com"
              value={emailForm.newEmail}
              onChange={(e) =>
                setEmailForm((prev) => ({ ...prev, newEmail: e.target.value }))
              }
              className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-gdg-border bg-white text-gdg-black focus:outline-none focus:border-gdg-blue focus:ring-1 focus:ring-gdg-blue transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gdg-black">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                required
                placeholder="Verify identity"
                value={emailForm.currentPassword}
                onChange={(e) =>
                  setEmailForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                className="w-full px-3.5 pr-10 py-2.5 text-xs font-semibold rounded-xl border border-gdg-border bg-white text-gdg-black focus:outline-none focus:border-gdg-blue focus:ring-1 focus:ring-gdg-blue transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gdg-gray hover:text-gdg-black focus:outline-none transition-colors cursor-pointer"
                tabIndex={-1}
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-gdg-border">
          <button
            type="submit"
            disabled={emailSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gdg-black text-white hover:bg-gdg-dark-hover transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {emailSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Update Email</span>
          </button>
        </div>
      </form>
    </div>
  );
}
