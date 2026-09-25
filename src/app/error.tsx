'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log sanitized error on client without exposing credentials or traces to users
    console.error('[Bootcamp LMS Error]', error.digest || error.message);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gdg-cream text-gdg-black p-6 antialiased">
      <div className="max-w-md w-full rounded-3xl border border-gdg-border bg-white p-8 sm:p-10 shadow-lg text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gdg-red/10 border border-gdg-red/20 text-gdg-red flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gdg-red">
            Application Notice
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gdg-black tracking-tight">
            Something unexpected occurred
          </h2>
          <p className="text-sm text-gdg-gray leading-relaxed">
            We encountered a temporary issue while loading this page. Your data is safe. Please try refreshing or return to your dashboard.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gdg-black hover:bg-gdg-dark-border text-white px-6 py-3 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-gdg-border bg-gdg-cream hover:bg-gdg-border text-gdg-black px-6 py-3 text-xs font-bold transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
