'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setErrorMessage('Missing password reset token in URL.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to reset password.');
      } else {
        setIsSuccess(true);
      }
    } catch {
      setErrorMessage('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-3">
          <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
            <Image
              src="/GDGOC-LASU-logo.webp"
              alt="GDG on Campus LASU Logo"
              width={240}
              height={46}
              priority
              className="h-10 sm:h-11 w-auto object-contain"
            />
          </Link>
        </div>
        <div className="inline-flex h-12 w-12 rounded-2xl bg-gdg-black text-gdg-green items-center justify-center shadow-md mb-1">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gdg-black tracking-tight">
          Reset Your Password
        </h1>
        <p className="text-xs sm:text-sm text-gdg-gray font-medium max-w-sm mx-auto">
          Enter and confirm your new secure password below to regain full account access.
        </p>
      </div>

      <div className="rounded-3xl border border-gdg-border bg-white p-6 sm:p-8 shadow-sm space-y-6">
        {!token && (
          <div className="p-4 rounded-2xl bg-gdg-red/10 border border-gdg-red/20 text-xs font-semibold text-gdg-red space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Invalid Reset URL</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              No reset token was found in the link. Please request a new password reset link.
            </p>
            <div className="pt-2">
              <Link
                href="/forgot-password"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gdg-red hover:underline"
              >
                <span>Request password reset</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        {isSuccess ? (
          <div className="space-y-6 text-center">
            <div className="h-12 w-12 rounded-2xl bg-gdg-green/10 text-gdg-green flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-black text-gdg-black">Password Reset Complete!</h3>
              <p className="text-xs text-gdg-gray font-medium leading-relaxed">
                Your account password has been updated and securely hashed. You can now sign in with your new credentials.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold bg-gdg-black text-gdg-cream hover:bg-gdg-black/85 transition-all shadow-2xs"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="h-3.5 w-3.5 text-gdg-green" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-gdg-red/10 border border-gdg-red/20 text-xs font-semibold text-gdg-red flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gdg-black">New Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 text-xs font-semibold rounded-xl border border-gdg-border bg-white text-gdg-black focus:outline-none focus:border-gdg-blue focus:ring-1 focus:ring-gdg-blue transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gdg-gray hover:text-gdg-black"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gdg-black">Confirm Password *</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-gdg-border bg-white text-gdg-black focus:outline-none focus:border-gdg-blue focus:ring-1 focus:ring-gdg-blue transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !token || !password || !confirmPassword}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-gdg-black text-gdg-cream hover:bg-gdg-black/85 transition-all shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Reset Password</span>
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gdg-gray hover:text-gdg-black transition-colors"
              >
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gdg-cream text-gdg-black flex flex-col justify-between antialiased selection:bg-gdg-yellow/30">
      {/* Top Banner Ribbon */}
      <div className="w-full bg-gdg-black text-gdg-cream py-2 px-6 overflow-hidden border-b border-gdg-black/10">
        <div className="flex items-center justify-between text-xs font-black tracking-wider uppercase whitespace-nowrap">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            <span>BUILD ✦</span>
            <span>INNOVATE ✦</span>
            <span>DESIGN ✦</span>
            <span>SHIP ✦</span>
            <span>LEARN ✦</span>
          </div>
          <span className="hidden lg:inline text-[11px] font-semibold text-gdg-cream/70">
            GDG on Campus LASU · Account Security Recovery
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-gdg-blue" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-xs text-gdg-gray font-medium border-t border-gdg-border">
        GDG on Campus LASU &copy; 2026. All rights reserved.
      </div>
    </div>
  );
}
