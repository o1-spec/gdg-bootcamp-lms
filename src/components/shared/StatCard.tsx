import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  accentColor = "#4285F4",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl sm:rounded-3xl border border-[#E5DFD0] bg-white p-5 sm:p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between transition-all hover:shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center border"
          style={{
            backgroundColor: `${accentColor}15`,
            borderColor: `${accentColor}30`,
            color: accentColor,
          }}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3">
        <span className="text-2xl sm:text-3xl font-black text-[#0D0E11] tracking-tight block">
          {value}
        </span>
        {subtitle && (
          <span className="text-xs text-[#5F6368] font-medium block mt-0.5">
            {subtitle}
          </span>
        )}
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ backgroundColor: accentColor }}
      />
    </div>
  );
}
