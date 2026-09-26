import React from "react";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-gdg-cream flex flex-col items-center justify-center p-6 text-center antialiased selection:bg-gdg-yellow/30">
      {/* GDG Pulse Logo / Spinner */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* Subtle glowing backdrop pulse */}
        <div className="absolute w-20 h-20 rounded-full bg-gdg-blue/15 animate-ping" />
        
        {/* GDG Ring */}
        <div className="relative w-14 h-14 rounded-full border-4 border-gdg-border border-t-gdg-blue border-r-gdg-red border-b-gdg-yellow border-l-gdg-green animate-spin" />
        
        {/* Center dot */}
        <div className="absolute w-3 h-3 rounded-full bg-gdg-blue shadow-sm" />
      </div>

      {/* Brand Identity */}
      <div className="space-y-2 max-w-xs">
        <h2 className="text-lg font-black text-gdg-black tracking-tight flex items-center justify-center gap-1.5">
          <span>GDG LASU Bootcamp</span>
        </h2>
        <p className="text-xs font-semibold text-gdg-gray animate-pulse tracking-wide">
          Loading learning platform...
        </p>
      </div>

      {/* Modern Accent Bar */}
      <div className="w-28 h-1 rounded-full bg-gdg-border overflow-hidden mt-6">
        <div className="h-full bg-linear-to-r from-gdg-blue via-gdg-red to-gdg-green animate-pulse" />
      </div>
    </div>
  );
}
