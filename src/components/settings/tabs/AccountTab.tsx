'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Layers, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
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
              <span>
                {new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
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
            <label className="text-xs font-bold text-[#0D0E11]">Current Password</label>
            <input
              type="password"
              required
              placeholder="Verify identity"
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
            disabled={emailSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0D0E11] text-white hover:bg-[#202124] transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {emailSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Update Email</span>
          </button>
        </div>
      </form>
    </div>
  );
}
