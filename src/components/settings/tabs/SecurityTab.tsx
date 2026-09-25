'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SecurityTab() {
  const router = useRouter();

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

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordFeedback({
        type: 'error',
        message: 'New password must be at least 8 characters long.',
      });
      return;
    }

    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordFeedback({
        type: 'error',
        message: 'New password cannot be the same as your current password.',
      });
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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Password Card */}
      <form
        onSubmit={handleSavePassword}
        className="rounded-3xl border border-gdg-border bg-white p-6 sm:p-8 shadow-2xs space-y-6"
      >
        <div className="border-b border-gdg-border pb-4">
          <h3 className="text-lg font-black text-gdg-black">Change Password</h3>
          <p className="text-xs text-gdg-gray font-medium">
            Protect your account with a secure password of at least 8 characters.
          </p>
        </div>

        {passwordFeedback && (
          <div
            className={cn(
              'p-4 rounded-2xl text-xs font-semibold flex items-center gap-3',
              passwordFeedback.type === 'success'
                ? 'bg-gdg-green/10 text-gdg-green border border-gdg-green/20'
                : 'bg-gdg-red/10 text-gdg-red border border-gdg-red/20'
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
            <label className="text-xs font-bold text-gdg-black">Current Password *</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                required
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 pr-10 text-xs font-semibold rounded-xl border border-gdg-border bg-white text-gdg-black focus:outline-none focus:border-gdg-blue focus:ring-1 focus:ring-gdg-blue transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gdg-gray hover:text-gdg-black"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gdg-black">New Password *</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 8 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 pr-10 text-xs font-semibold rounded-xl border border-gdg-border bg-white text-gdg-black focus:outline-none focus:border-gdg-blue focus:ring-1 focus:ring-gdg-blue transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gdg-gray hover:text-gdg-black"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gdg-black">Confirm New Password *</label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                placeholder="Repeat new password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-gdg-border bg-white text-gdg-black focus:outline-none focus:border-gdg-blue focus:ring-1 focus:ring-gdg-blue transition-all"
              />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gdg-cream border border-gdg-border text-xs text-gdg-gray space-y-1">
          <span className="font-bold text-gdg-black block">Password Policy Guidelines:</span>
          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
            <li>Minimum 8 characters in length</li>
            <li>Must not be identical to your current password</li>
            <li>A security audit alert will be dispatched to your notifications feed</li>
          </ul>
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-gdg-border">
          <button
            type="submit"
            disabled={passwordSaving || !passwordForm.currentPassword || !passwordForm.newPassword}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gdg-black text-gdg-cream hover:bg-gdg-black/85 transition-all shadow-2xs disabled:opacity-50"
          >
            {passwordSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Update Password</span>
          </button>
        </div>
      </form>

      {/* Session Security Review Card */}
      <div className="rounded-3xl border border-gdg-border bg-white p-6 sm:p-8 shadow-2xs space-y-4">
        <div className="border-b border-gdg-border pb-4">
          <h3 className="text-lg font-black text-gdg-black">Session & Cookie Security</h3>
          <p className="text-xs text-gdg-gray font-medium">
            Overview of cryptographic session protection mechanisms guarding your account.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-gdg-cream border border-gdg-border space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gdg-green">
              <CheckCircle2 className="h-4 w-4" />
              <span>HTTP-Only Cookies</span>
            </div>
            <p className="text-[11px] text-gdg-gray">
              Protected against cross-site scripting (XSS). Cannot be read by JavaScript.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gdg-cream border border-gdg-border space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gdg-green">
              <CheckCircle2 className="h-4 w-4" />
              <span>SameSite Protection</span>
            </div>
            <p className="text-[11px] text-gdg-gray">
              Strict browser cookies prevent CSRF forgery across foreign origins.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gdg-cream border border-gdg-border space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gdg-green">
              <CheckCircle2 className="h-4 w-4" />
              <span>Server-Signed JWT</span>
            </div>
            <p className="text-[11px] text-gdg-gray">
              HMAC-SHA256 signature verified on every privileged route.
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-3xl border border-gdg-red/30 bg-white p-6 sm:p-8 shadow-2xs space-y-4">
        <div className="border-b border-gdg-red/20 pb-4">
          <h3 className="text-lg font-black text-gdg-red">Danger Zone</h3>
          <p className="text-xs text-gdg-gray font-medium">
            Security termination actions for this authenticated browser session.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gdg-red/5 border border-gdg-red/20">
          <div className="space-y-0.5">
            <span className="text-xs font-black text-gdg-black block">
              Sign out from this device
            </span>
            <span className="text-[11px] text-gdg-gray font-medium block">
              Terminates your current HTTP-only cookie session and redirects to the sign-in portal.
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gdg-red text-white hover:bg-gdg-red/90 transition-all shadow-2xs shrink-0 disabled:opacity-50"
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
  );
}
