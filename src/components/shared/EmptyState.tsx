import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  accentColor?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  accentColor = "#4285F4",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-[#E5DFD0] bg-white p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-2xs",
        className
      )}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center border"
        style={{
          backgroundColor: `${accentColor}15`,
          borderColor: `${accentColor}30`,
          color: accentColor,
        }}
      >
        <Icon className="w-7 h-7" />
      </div>

      <div className="max-w-md space-y-1">
        <h3 className="text-base sm:text-lg font-black text-[#0D0E11] tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-[#5F6368] font-medium leading-relaxed">
          {description}
        </p>
      </div>

      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
