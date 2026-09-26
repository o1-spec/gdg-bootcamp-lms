'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginSchema } from '@/lib/validations/auth';
import { ArrowRight, Lock, Mail, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('code') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({
          general: data.error || 'Invalid credentials. Please verify your email and password.',
        });
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      const userRole = data.user?.role;
      let destination = '/dashboard';
      if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
        destination = '/admin/dashboard';
      } else if (userRole === 'MENTOR') {
        destination = '/mentor/dashboard';
      } else if (inviteCode) {
        destination = `/onboarding/join?code=${encodeURIComponent(inviteCode)}`;
      } else if (data.user?.onboardingCompleted === false) {
        destination = '/onboarding';
      }
      setTimeout(() => {
        router.push(destination);
        router.refresh();
      }, 1000);
    } catch {
      setErrors({
        general: 'Unable to connect to the authentication service. Please check your network connection.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gdg-cream flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 selection:bg-gdg-yellow/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* GDG LASU Brand header */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
            <Image
              src="/GDGOC-LASU-logo.webp"
              alt="GDG on Campus LASU Logo"
              width={260}
              height={50}
              priority
              className="h-11 sm:h-12 w-auto object-contain"
            />
          </Link>
        </div>

        <h2 className="text-center text-2xl sm:text-3xl font-black tracking-tight text-gdg-black">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-xs font-semibold text-gdg-gray">
          Access your enrolled tracks, curriculum notes, assignments, and mentor sessions.
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 sm:py-8 sm:px-10 rounded-2xl sm:rounded-3xl border border-gdg-border shadow-sm">
          {isSuccess && (
            <div className="mb-6 rounded-2xl bg-gdg-green/10 border border-gdg-green/30 p-4 flex items-center gap-3 text-xs font-bold text-[#0F9D58] animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>Authentication successful! Launching your learning dashboard...</span>
            </div>
          )}

          {errors.general && (
            <div className="mb-6 rounded-2xl bg-gdg-red/10 border border-gdg-red/30 p-4 flex items-start gap-3 text-xs font-bold text-gdg-red animate-in fade-in">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gdg-black mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gdg-gray" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@gdglasu.dev"
                  className={`w-full h-11 rounded-2xl border ${
                    errors.email ? 'border-gdg-red focus:border-gdg-red' : 'border-gdg-border focus:border-gdg-black'
                  } bg-gdg-cream/50 pl-10 pr-4 text-xs font-medium text-gdg-black placeholder:text-gdg-gray/60 focus:bg-white focus:outline-none transition-all`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-gdg-red font-semibold">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gdg-black">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gdg-gray" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full h-11 rounded-2xl border ${
                    errors.password ? 'border-gdg-red focus:border-gdg-red' : 'border-gdg-border focus:border-gdg-black'
                  } bg-gdg-cream/50 pl-10 pr-11 text-xs font-medium text-gdg-black placeholder:text-gdg-gray/60 focus:bg-white focus:outline-none transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gdg-gray hover:text-gdg-black focus:outline-none transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-gdg-red font-semibold">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gdg-black py-3 px-4 text-xs font-black uppercase tracking-wider text-gdg-cream hover:bg-gdg-dark-border disabled:opacity-60 transition-all cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-gdg-yellow" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gdg-border text-center">
            <p className="text-xs font-semibold text-gdg-gray">
              Don&apos;t have an LMS account yet?{' '}
              <Link
                href={inviteCode ? `/register?code=${encodeURIComponent(inviteCode)}` : '/register'}
                className="font-bold text-gdg-black hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials hint box - Development only */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 rounded-2xl border border-gdg-border bg-white/70 p-4 text-center">
            <p className="text-xs font-bold text-gdg-black mb-1">Development Demo Credentials</p>
            <p className="text-[11px] text-gdg-gray">
              Email: <code className="font-mono font-bold text-gdg-black">student@gdglasu.dev</code> • Password:{' '}
              <code className="font-mono font-bold text-gdg-black">Password123!</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gdg-cream flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gdg-yellow" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
