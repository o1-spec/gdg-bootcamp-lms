import React from 'react';
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
      <div className="flex items-center justify-between relative">
        {/* Connecting Progress Line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-[#E5DFD0] -z-0">
          <div
            className="h-full bg-[#0D0E11] transition-all duration-300"
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
                  isDone && 'bg-[#0D0E11] text-[#FAF7EE] border-[#0D0E11]',
                  isCurrent && 'bg-[#FAF7EE] text-[#0D0E11] border-[#0D0E11] shadow-md ring-4 ring-[#FBBC04]/30',
                  !isDone && !isCurrent && 'bg-[#FAF7EE] text-[#5F6368] border-[#E5DFD0]'
                )}
              >
                {isDone ? (
                  <Check className="w-4 h-4 text-[#34A853] stroke-[3]" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={cn(
                  'text-[11px] font-bold tracking-tight uppercase',
                  isCurrent ? 'text-[#0D0E11]' : isDone ? 'text-[#0D0E11]/70' : 'text-[#5F6368]'
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
