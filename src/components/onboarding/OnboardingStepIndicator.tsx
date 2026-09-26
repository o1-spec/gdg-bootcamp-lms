import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check, User, Ticket, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export type OnboardingStep = 1 | 2 | 3;

interface OnboardingStepIndicatorProps {
  currentStep: OnboardingStep;
}

export function OnboardingStepIndicator({ currentStep }: OnboardingStepIndicatorProps) {
  const steps = [
    { number: 1, label: 'Profile', icon: User },
    { number: 2, label: 'Join Bootcamp', icon: Ticket },
    { number: 3, label: 'Complete', icon: Sparkles },
  ];

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex justify-center mb-6">
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

      <div className="flex items-center justify-between relative">
        {/* Connecting Progress Line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-gdg-border z-0">
          <div
            className="h-full bg-gdg-black transition-all duration-300"
            style={{
              width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
            }}
          />
        </div>

        {steps.map((step) => {
          const isDone = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const Icon = step.icon;

          return (
            <div key={step.number} className="flex flex-col items-center gap-2 z-10">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all duration-200 border-2',
                  isDone && 'bg-gdg-black text-gdg-cream border-gdg-black',
                  isCurrent && 'bg-gdg-cream text-gdg-black border-gdg-black shadow-md ring-4 ring-gdg-yellow/30',
                  !isDone && !isCurrent && 'bg-gdg-cream text-gdg-gray border-gdg-border'
                )}
              >
                {isDone ? (
                  <Check className="w-4 h-4 text-gdg-green stroke-3" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={cn(
                  'text-[11px] font-bold tracking-tight uppercase',
                  isCurrent ? 'text-gdg-black' : isDone ? 'text-gdg-black/70' : 'text-gdg-gray'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
