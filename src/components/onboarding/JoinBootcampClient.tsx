'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OnboardingStepIndicator } from './OnboardingStepIndicator';
import {
  Ticket,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Award,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InviteValidationResult } from '@/types/lms';

interface JoinBootcampClientProps {
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export function JoinBootcampClient({ user: _user }: JoinBootcampClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = (searchParams.get('code') || '').trim().toUpperCase();

  const [code, setCode] = useState(initialCode);
  const [isValidating, setIsValidating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [validationResult, setValidationResult] = useState<InviteValidationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);

  // Function to validate invite code via API
  const handleValidate = useCallback(async (codeToValidate: string) => {
    const cleanCode = codeToValidate.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 3) {
      setValidationResult(null);
      setErrorMessage(null);
      return;
    }

    setIsValidating(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/invites/validate?code=${encodeURIComponent(cleanCode)}`);
      const data: InviteValidationResult = await res.json();

      if (!res.ok || !data.valid) {
        setValidationResult(null);
        setErrorMessage(data.error || 'Invite code not found.');
      } else {
        setValidationResult(data);
        setErrorMessage(null);

        // Auto-select tracks if single track or only 1 available
        if (data.invite?.trackId) {
          setSelectedTrackIds([data.invite.trackId]);
        } else if (data.invite?.availableTracks && data.invite.availableTracks.length === 1) {
          setSelectedTrackIds([data.invite.availableTracks[0].id]);
        } else {
          setSelectedTrackIds([]);
        }
      }
    } catch {
      setErrorMessage('Could not connect to server to validate invite.');
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Validate initial code on mount if present
  useEffect(() => {
    if (initialCode) {
      const timer = setTimeout(() => {
        handleValidate(initialCode);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialCode, handleValidate]);

  // Track selection toggle
  const toggleTrack = (trackId: string) => {
    const max = validationResult?.invite?.maxTrackSelections || 1;
    if (selectedTrackIds.includes(trackId)) {
      setSelectedTrackIds(selectedTrackIds.filter((id) => id !== trackId));
    } else {
      if (max === 1) {
        setSelectedTrackIds([trackId]);
      } else if (selectedTrackIds.length < max) {
        setSelectedTrackIds([...selectedTrackIds, trackId]);
      }
    }
  };

  // Submit Join Request
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validationResult?.valid || !code) return;

    // Check track selection if multiple allowed
    if (
      validationResult.invite?.allowTrackSelection &&
      selectedTrackIds.length === 0
    ) {
      setErrorMessage('Please select at least one track to enroll in.');
      return;
    }

    setIsJoining(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/invites/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          trackIds: selectedTrackIds.length > 0 ? selectedTrackIds : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to join bootcamp.');
        setIsJoining(false);
        return;
      }

      // Success! Proceed to Step 3: Complete
      const trackParam = (data.enrolledTrackNames || []).join(',');
      router.push(`/onboarding/complete?tracks=${encodeURIComponent(trackParam)}&bootcamp=${encodeURIComponent(data.bootcampName || '')}`);
    } catch {
      setErrorMessage('An unexpected network error occurred.');
      setIsJoining(false);
    }
  };

  const invite = validationResult?.invite;

  return (
    <div className="min-h-screen bg-gdg-cream text-gdg-black py-12 px-4 sm:px-6 lg:px-8 selection:bg-gdg-yellow/30">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Step Indicator */}
        <OnboardingStepIndicator currentStep={2} />

        {/* Card */}
        <div className="rounded-3xl border border-gdg-border bg-white p-6 sm:p-10 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gdg-blue/15 border border-gdg-blue/30 text-xs font-black text-gdg-blue uppercase tracking-wider">
              <Ticket className="w-3.5 h-3.5" />
              <span>Step 2 of 3 · Join Bootcamp</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gdg-black tracking-tight">
              Enter your invite code
            </h1>
            <p className="text-xs sm:text-sm text-gdg-gray max-w-sm mx-auto">
              Join your designated bootcamp track with the invite code provided by GDG LASU organizers.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-gdg-red/10 border border-gdg-red/30 flex items-center gap-3 text-xs font-bold text-gdg-red animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-6">
            {/* Invite Code Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gdg-black">
                Invite Code <span className="text-gdg-red">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gdg-gray" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. BACKEND26 or GDGLASU26"
                    value={code}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setCode(val);
                      if (val.length >= 4) {
                        handleValidate(val);
                      } else {
                        setValidationResult(null);
                        setErrorMessage(null);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gdg-cream border border-gdg-border text-sm font-mono font-bold tracking-wider text-gdg-black uppercase focus:bg-white focus:border-gdg-black outline-none transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleValidate(code)}
                  disabled={isValidating || !code.trim()}
                  className="px-5 py-3 rounded-2xl bg-gdg-cream hover:bg-gdg-border border border-gdg-border text-xs font-bold text-gdg-black transition-all cursor-pointer disabled:opacity-50"
                >
                  {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
                </button>
              </div>
              <p className="text-[11px] text-gdg-gray">
                Codes are case-insensitive. Example: <code className="font-bold text-gdg-black">BACKEND26</code> or <code className="font-bold text-gdg-black">GDGLASU26</code>
              </p>
            </div>

            {/* PREVIEW OF VALID INVITE */}
            {invite && (
              <div className="rounded-2xl border-2 border-gdg-green/40 bg-gdg-green/5 p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gdg-green" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-gdg-green">
                      Verified Invite
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-gdg-black bg-white px-2 py-0.5 rounded-md border border-gdg-border">
                    {invite.code}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-gdg-gray">
                    <Award className="w-3.5 h-3.5 text-gdg-yellow" />
                    <span>{invite.bootcampName}</span>
                    {invite.cohortName && (
                      <>
                        <span>•</span>
                        <span>{invite.cohortName}</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-gdg-black">
                    {invite.trackName || (invite.allowTrackSelection ? 'Multi-Track Cohort Access' : 'Bootcamp Access')}
                  </h3>
                </div>

                {/* TRACK SELECTION (If invite allows choosing tracks) */}
                {invite.allowTrackSelection && invite.availableTracks && invite.availableTracks.length > 0 && (
                  <div className="pt-2 border-t border-gdg-green/20 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gdg-black">
                        Select Your Track{invite.maxTrackSelections && invite.maxTrackSelections > 1 ? ` (up to ${invite.maxTrackSelections})` : ''}:
                      </label>
                      <span className="text-[11px] text-gdg-gray">
                        {selectedTrackIds.length} of {invite.maxTrackSelections || 1} selected
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {invite.availableTracks.map((t) => {
                        const isSelected = selectedTrackIds.includes(t.id);
                        return (
                          <div
                            key={t.id}
                            onClick={() => toggleTrack(t.id)}
                            className={cn(
                              'p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between gap-2',
                              isSelected
                                ? 'bg-white border-gdg-black shadow-xs ring-2 ring-gdg-black/10'
                                : 'bg-white/60 border-gdg-border hover:bg-white hover:border-gdg-black/30'
                            )}
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: t.accent || '#4285F4' }}
                                />
                                <span className="text-xs font-black text-gdg-black truncate">
                                  {t.name}
                                </span>
                              </div>
                              {t.description && (
                                <p className="text-[10px] text-gdg-gray line-clamp-2">
                                  {t.description}
                                </p>
                              )}
                            </div>

                            <div
                              className={cn(
                                'w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors',
                                isSelected
                                  ? 'bg-gdg-black text-white border-gdg-black'
                                  : 'border-gdg-border bg-white'
                              )}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-gdg-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push('/onboarding/profile')}
                className="text-xs font-bold text-gdg-gray hover:text-gdg-black transition-colors"
              >
                Back to Profile
              </button>

              <button
                type="submit"
                disabled={!invite || isJoining}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gdg-black hover:bg-gdg-dark-border text-xs font-black text-gdg-cream shadow-sm transition-all cursor-pointer disabled:opacity-40"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-gdg-yellow" />
                    <span>Joining Track...</span>
                  </>
                ) : (
                  <>
                    <span>Join Bootcamp</span>
                    <ArrowRight className="w-4 h-4 text-gdg-yellow" />
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
