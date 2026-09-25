'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  KeyRound,
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  ExternalLink,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setDevResetUrl(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to submit reset request.');
      } else {
        setIsSubmitted(true);
        if (data.devResetUrl) {
          setDevResetUrl(data.devResetUrl);
        }
      }
    } catch {
      setErrorMessage('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-[#0D0E11] flex flex-col justify-between antialiased selection:bg-[#FBBC04]/30">
      {/* Top Banner Ribbon */}
      <div className="w-full bg-[#0D0E11] text-[#FAF7EE] py-2 px-6 overflow-hidden border-b border-[#0D0E11]/10">
        <div className="flex items-center justify-between text-xs font-black tracking-wider uppercase whitespace-nowrap">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            <span>BUILD ✦</span>
            <span>INNOVATE ✦</span>
            <span>DESIGN ✦</span>
            <span>SHIP ✦</span>
            <span>LEARN ✦</span>
          </div>
          <span className="hidden lg:inline text-[11px] font-semibold text-[#FAF7EE]/70">
            GDG on Campus LASU · Account Security Recovery
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Header & Logo */}
          <div className="text-center space-y-2">
            <div className="inline-flex h-14 w-14 rounded-3xl bg-[#0D0E11] text-[#FBBC04] items-center justify-center shadow-md mb-2">
              <KeyRound className="h-7 w-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0D0E11] tracking-tight">
              Forgot Password
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6368] font-medium max-w-sm mx-auto">
              Enter your registered email address to initiate the account password recovery flow.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-8 shadow-sm space-y-6">
            {isSubmitted ? (
              <div className="space-y-6 text-center">
                <div className="h-12 w-12 rounded-2xl bg-[#34A853]/10 text-[#34A853] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-black text-[#0D0E11]">Request Received</h3>
                  <p className="text-xs text-[#5F6368] font-medium leading-relaxed">
                    If an account exists for <strong className="text-[#0D0E11]">{email}</strong>, password reset instructions will be sent.
                  </p>
                </div>

                {/* Email Delivery Pending Notice */}
                <div className="p-4 rounded-2xl bg-[#FBBC04]/10 border border-[#FBBC04]/30 text-left text-xs text-[#7A5800] space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-[#0D0E11]">
                    <Info className="h-4 w-4 text-[#FBBC04]" />
                    <span>External Email Delivery Pending</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    External email provider integration (e.g. Resend / SendGrid) is not yet active. Cryptographic reset tokens are generated and stored in the database.
                  </p>
                </div>

                {/* Dev Testing Reset Link */}
                {devResetUrl && (
                  <div className="p-4 rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/30 text-left space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#4285F4] block">
                      Developer / Admin Test Link:
                    </span>
                    <Link
                      href={devResetUrl}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4285F4] hover:underline break-all"
                    >
                      <span>Proceed to reset password form</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </Link>
                  </div>
                )}

                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold border border-[#E5DFD0] text-[#0D0E11] hover:bg-[#FAF7EE] transition-all"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Return to Sign In</span>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/20 text-xs font-semibold text-[#EA4335] flex items-center gap-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0D0E11] flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-[#5F6368]" />
                    <span>Account Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@gdglasu.dev"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-[#E5DFD0] bg-white text-[#0D0E11] focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#0D0E11] text-[#FAF7EE] hover:bg-[#0D0E11]/85 transition-all shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Request Password Reset</span>
                </button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5F6368] hover:text-[#0D0E11] transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-xs text-[#5F6368] font-medium border-t border-[#E5DFD0]">
        GDG on Campus LASU &copy; 2026. All rights reserved.
      </div>
    </div>
  );
}
