import React from 'react';
import { CheckCircle2, Target } from 'lucide-react';

interface LessonObjectivesProps {
  objectives: string[];
  accentColor?: string;
}

export function LessonObjectives({
  objectives,
  accentColor = '#4285F4',
}: LessonObjectivesProps) {
  if (!objectives || objectives.length === 0) return null;

  return (
    <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-7 shadow-xs space-y-4">
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `${accentColor}15`,
            color: accentColor,
          }}
        >
          <Target className="h-4 w-4" />
        </div>
        <h3 className="text-base sm:text-lg font-black text-[#0D0E11] tracking-tight">
          By the end of this lesson, you should be able to:
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {objectives.map((obj, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FAF7EE]/60 border border-[#E5DFD0]"
          >
            <CheckCircle2 className="h-4 w-4 text-[#34A853] shrink-0 mt-0.5" />
            <span className="text-xs sm:text-[13px] font-semibold text-[#0D0E11] leading-relaxed">
              {obj}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
