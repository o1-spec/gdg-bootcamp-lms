'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { registerFormSchema } from '@/lib/validations/auth';
import { ArrowRight, Lock, Mail, User, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('code') || '';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = registerFormSchema.safeParse({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    });

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      setErrors({
        firstName: fieldErrors.firstName?.[0],
        lastName: fieldErrors.lastName?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({
          general: data.error || 'Registration failed. Please check your information and try again.',
        });
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        const nextUrl = inviteCode
          ? `/onboarding/profile?code=${encodeURIComponent(inviteCode)}`
          : '/onboarding/profile';
        router.push(nextUrl);
        router.refresh();
      }, 1000);
    } catch {
      setErrors({
        general: 'Unable to connect to registration service. Please verify your connection.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#FBBC04]/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* GDG LASU Brand header */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#0D0E11] px-3 py-2 rounded-2xl">
              <span className="h-4 w-1.5 rounded-full bg-[#4285F4]" />
              <span className="h-4 w-1.5 rounded-full bg-[#EA4335]" />
              <span className="h-4 w-1.5 rounded-full bg-[#FBBC04]" />
              <span className="h-4 w-1.5 rounded-full bg-[#34A853]" />
            </div>
            <div className="text-left">
              <span className="text-sm font-black tracking-tight text-[#0D0E11] uppercase block">
                GDG on Campus
              </span>
              <span className="text-[11px] font-bold text-[#5F6368] block">
                Lagos State University • LMS
              </span>
            </div>
          </Link>
        </div>

        <h2 className="text-center text-2xl sm:text-3xl font-black tracking-tight text-[#0D0E11]">
          Create your student account
        </h2>
        <p className="mt-2 text-center text-xs font-semibold text-[#5F6368]">
          Join Cohort 1 and enroll in premier engineering learning tracks.
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 sm:py-8 sm:px-10 rounded-2xl sm:rounded-3xl border border-[#E5DFD0] shadow-sm">
          {isSuccess && (
            <div className="mb-6 rounded-2xl bg-[#34A853]/10 border border-[#34A853]/30 p-4 flex items-center gap-3 text-xs font-bold text-[#0F9D58] animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>Registration successful! Launching your learning dashboard...</span>
            </div>
          )}

          {errors.general && (
            <div className="mb-6 rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/30 p-4 flex items-start gap-3 text-xs font-bold text-[#EA4335] animate-in fade-in">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-xs font-bold uppercase tracking-wider text-[#0D0E11] mb-1.5">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F6368]" />
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Tobi"
                    className={`w-full h-10 rounded-2xl border ${
                      errors.firstName ? 'border-[#EA4335]' : 'border-[#E5DFD0]'
                    } bg-[#FAF7EE]/50 pl-9 pr-3 text-xs font-medium text-[#0D0E11] focus:bg-white focus:outline-none transition-all`}
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-[11px] text-[#EA4335] font-semibold">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-xs font-bold uppercase tracking-wider text-[#0D0E11] mb-1.5">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F6368]" />
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Adebayo"
                    className={`w-full h-10 rounded-2xl border ${
                      errors.lastName ? 'border-[#EA4335]' : 'border-[#E5DFD0]'
                    } bg-[#FAF7EE]/50 pl-9 pr-3 text-xs font-medium text-[#0D0E11] focus:bg-white focus:outline-none transition-all`}
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-[11px] text-[#EA4335] font-semibold">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#0D0E11] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F6368]" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tobi@lasu.edu.ng"
                  className={`w-full h-10 rounded-2xl border ${
                    errors.email ? 'border-[#EA4335]' : 'border-[#E5DFD0]'
                  } bg-[#FAF7EE]/50 pl-10 pr-4 text-xs font-medium text-[#0D0E11] focus:bg-white focus:outline-none transition-all`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[11px] text-[#EA4335] font-semibold">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[#0D0E11] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F6368]" />
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className={`w-full h-10 rounded-2xl border ${
                    errors.password ? 'border-[#EA4335]' : 'border-[#E5DFD0]'
                  } bg-[#FAF7EE]/50 pl-10 pr-4 text-xs font-medium text-[#0D0E11] focus:bg-white focus:outline-none transition-all`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-[#EA4335] font-semibold">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-[#0D0E11] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F6368]" />
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className={`w-full h-10 rounded-2xl border ${
                    errors.confirmPassword ? 'border-[#EA4335]' : 'border-[#E5DFD0]'
                  } bg-[#FAF7EE]/50 pl-10 pr-4 text-xs font-medium text-[#0D0E11] focus:bg-white focus:outline-none transition-all`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-[11px] text-[#EA4335] font-semibold">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-[#0D0E11] py-3 px-4 text-xs font-black uppercase tracking-wider text-[#FAF7EE] hover:bg-[#22242B] disabled:opacity-60 transition-all cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#FBBC04]" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Register for Bootcamp</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E5DFD0] text-center">
            <p className="text-xs font-semibold text-[#5F6368]">
              Already have an account?{' '}
              <Link
                href={inviteCode ? `/login?code=${encodeURIComponent(inviteCode)}` : '/login'}
                className="font-bold text-[#0D0E11] hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7EE] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FBBC04]" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
