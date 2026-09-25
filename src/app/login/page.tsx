'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginSchema } from '@/lib/validations/auth';
import { ArrowRight, Lock, Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
      let destination = '/';
      if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
        destination = '/admin/dashboard';
      } else if (userRole === 'MENTOR') {
        destination = '/mentor/dashboard';
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
    <div className="min-h-screen bg-[#FAF7EE] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#FBBC04]/30">
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

        <h2 className="text-center text-3xl font-black tracking-tight text-[#0D0E11]">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-xs font-semibold text-[#5F6368]">
          Access your enrolled tracks, curriculum notes, assignments, and mentor sessions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#E5DFD0] shadow-sm">
          {isSuccess && (
            <div className="mb-6 rounded-2xl bg-[#34A853]/10 border border-[#34A853]/30 p-4 flex items-center gap-3 text-xs font-bold text-[#0F9D58] animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>Authentication successful! Launching your learning dashboard...</span>
            </div>
          )}

          {errors.general && (
            <div className="mb-6 rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/30 p-4 flex items-start gap-3 text-xs font-bold text-[#EA4335] animate-in fade-in">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#0D0E11] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F6368]" />
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
                    errors.email ? 'border-[#EA4335] focus:border-[#EA4335]' : 'border-[#E5DFD0] focus:border-[#0D0E11]'
                  } bg-[#FAF7EE]/50 pl-10 pr-4 text-xs font-medium text-[#0D0E11] placeholder:text-[#5F6368]/60 focus:bg-white focus:outline-none transition-all`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-[#EA4335] font-semibold">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[#0D0E11]">
                  Password
                </label>
                <span className="text-[11px] font-bold text-[#4285F4] cursor-not-allowed opacity-70">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F6368]" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full h-11 rounded-2xl border ${
                    errors.password ? 'border-[#EA4335] focus:border-[#EA4335]' : 'border-[#E5DFD0] focus:border-[#0D0E11]'
                  } bg-[#FAF7EE]/50 pl-10 pr-4 text-xs font-medium text-[#0D0E11] placeholder:text-[#5F6368]/60 focus:bg-white focus:outline-none transition-all`}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-[#EA4335] font-semibold">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#0D0E11] py-3 px-4 text-xs font-black uppercase tracking-wider text-[#FAF7EE] hover:bg-[#22242B] disabled:opacity-60 transition-all cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#FBBC04]" />
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

          <div className="mt-6 pt-6 border-t border-[#E5DFD0] text-center">
            <p className="text-xs font-semibold text-[#5F6368]">
              Don&apos;t have an LMS account yet?{' '}
              <Link href="/register" className="font-bold text-[#0D0E11] hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials hint box */}
        <div className="mt-6 rounded-2xl border border-[#E5DFD0] bg-white/70 p-4 text-center">
          <p className="text-xs font-bold text-[#0D0E11] mb-1">Development Demo Credentials</p>
          <p className="text-[11px] text-[#5F6368]">
            Email: <code className="font-mono font-bold text-[#0D0E11]">student@gdglasu.dev</code> • Password:{' '}
            <code className="font-mono font-bold text-[#0D0E11]">Password123!</code>
          </p>
        </div>
      </div>
    </div>
  );
}
