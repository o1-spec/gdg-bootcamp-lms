'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OnboardingStepIndicator } from './OnboardingStepIndicator';
import { profileSetupSchema } from '@/lib/validations/onboarding';
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/ui/social-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileSetupFormProps {
  initialUser: {
    firstName: string;
    lastName: string;
    displayName?: string | null;
    email: string;
    avatarUrl?: string | null;
    bio?: string | null;
    githubUrl?: string | null;
    linkedinUrl?: string | null;
  };
}

export function ProfileSetupForm({ initialUser }: ProfileSetupFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('code') || '';

  const [formData, setFormData] = useState({
    firstName: initialUser.firstName || '',
    lastName: initialUser.lastName || '',
    displayName: initialUser.displayName || `${initialUser.firstName || ''} ${initialUser.lastName || ''}`.trim(),
    avatarUrl: initialUser.avatarUrl || '',
    bio: initialUser.bio || '',
    githubUrl: initialUser.githubUrl || '',
    linkedinUrl: initialUser.linkedinUrl || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = profileSetupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const formatted: Record<string, string> = {};
      Object.entries(fieldErrors).forEach(([key, val]) => {
        if (val?.[0]) formatted[key] = val[0];
      });
      setErrors(formatted);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/onboarding/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.error || 'Failed to update profile.' });
        setIsSubmitting(false);
        return;
      }

      // Proceed to Step 2: Join Bootcamp (preserving invite code if available)
      const nextUrl = inviteCode
        ? `/onboarding/join?code=${encodeURIComponent(inviteCode)}`
        : '/onboarding/join';
      router.push(nextUrl);
    } catch {
      setErrors({ general: 'Network error. Please try again.' });
      setIsSubmitting(false);
    }
  };

  const initials = `${formData.firstName.slice(0, 1)}${formData.lastName.slice(0, 1)}`.toUpperCase() || 'ST';

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-[#0D0E11] py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#FBBC04]/30">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Step Indicator */}
        <OnboardingStepIndicator currentStep={1} />

        {/* Card */}
        <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-10 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBBC04]/20 border border-[#FBBC04]/40 text-xs font-black text-[#0D0E11] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#EA4335]" />
              <span>Step 1 of 3 · Profile Setup</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0D0E11] tracking-tight">
              Tell us about yourself
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6368] max-w-sm mx-auto">
              Your profile is visible to mentors and fellow students in your cohort.
            </p>
          </div>

          {errors.general && (
            <div className="p-4 rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/20 flex items-center gap-3 text-xs font-bold text-[#EA4335]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar Preview & URL */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0]">
              <Avatar className="w-16 h-16 rounded-2xl border-2 border-[#0D0E11]">
                <AvatarImage src={formData.avatarUrl} alt="Avatar Preview" />
                <AvatarFallback className="bg-[#0D0E11] text-[#FAF7EE] font-black text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <label className="block text-xs font-bold text-[#0D0E11]">
                  Avatar Image URL (optional)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5DFD0] text-xs text-[#0D0E11] placeholder:text-[#5F6368] focus:border-[#0D0E11] outline-none"
                  />
                </div>
                {errors.avatarUrl && (
                  <p className="text-[11px] font-bold text-[#EA4335]">{errors.avatarUrl}</p>
                )}
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0D0E11]">
                  First Name <span className="text-[#EA4335]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-sm text-[#0D0E11] focus:bg-white focus:border-[#0D0E11] outline-none transition-all"
                />
                {errors.firstName && (
                  <p className="text-[11px] font-bold text-[#EA4335]">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0D0E11]">
                  Last Name <span className="text-[#EA4335]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-sm text-[#0D0E11] focus:bg-white focus:border-[#0D0E11] outline-none transition-all"
                />
                {errors.lastName && (
                  <p className="text-[11px] font-bold text-[#EA4335]">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0D0E11]">
                Display Name (optional)
              </label>
              <input
                type="text"
                placeholder="Preferred name or handle"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-sm text-[#0D0E11] focus:bg-white focus:border-[#0D0E11] outline-none transition-all"
              />
              {errors.displayName && (
                <p className="text-[11px] font-bold text-[#EA4335]">{errors.displayName}</p>
              )}
            </div>

            {/* Short Bio */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0D0E11]">
                Short Bio (optional)
              </label>
              <textarea
                rows={3}
                placeholder="A couple sentences about your interests, current stack, and what you aim to build..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-xs text-[#0D0E11] placeholder:text-[#5F6368] focus:bg-white focus:border-[#0D0E11] outline-none transition-all resize-none"
              />
              <div className="flex justify-between items-center text-[10px] text-[#5F6368]">
                <span>Max 500 characters</span>
                <span>{formData.bio.length}/500</span>
              </div>
              {errors.bio && (
                <p className="text-[11px] font-bold text-[#EA4335]">{errors.bio}</p>
              )}
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#0D0E11]">
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>GitHub URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-xs text-[#0D0E11] placeholder:text-[#5F6368] focus:bg-white focus:border-[#0D0E11] outline-none"
                />
                {errors.githubUrl && (
                  <p className="text-[11px] font-bold text-[#EA4335]">{errors.githubUrl}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#0D0E11]">
                  <LinkedinIcon className="w-3.5 h-3.5 text-[#4285F4]" />
                  <span>LinkedIn URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-xs text-[#0D0E11] placeholder:text-[#5F6368] focus:bg-white focus:border-[#0D0E11] outline-none"
                />
                {errors.linkedinUrl && (
                  <p className="text-[11px] font-bold text-[#EA4335]">{errors.linkedinUrl}</p>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-[#E5DFD0] flex items-center justify-between">
              <span className="text-xs text-[#5F6368]">
                Signed in as <strong className="text-[#0D0E11]">{initialUser.email}</strong>
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0D0E11] hover:bg-[#22242B] text-xs font-black text-[#FAF7EE] shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#FBBC04]" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Join</span>
                    <ArrowRight className="w-4 h-4 text-[#FBBC04]" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
