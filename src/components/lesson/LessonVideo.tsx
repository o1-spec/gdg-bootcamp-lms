'use client';

import React, { useState } from 'react';
import { Play, Clock, Sparkles } from 'lucide-react';

interface LessonVideoProps {
  title: string;
  duration: string;
  accentColor?: string;
}

export function LessonVideo({
  title,
  duration,
  accentColor = '#4285F4',
}: LessonVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="overflow-hidden rounded-3xl border border-gdg-dark-border bg-gdg-black text-gdg-cream shadow-sm">
      {/* Video Display Area */}
      <div className="relative aspect-video w-full bg-gradient-to-br from-[#15161A] via-gdg-black to-[#1C1D22] flex items-center justify-center p-6 text-center">
        {/* Subtle Google accent glow */}
        <div
          className="pointer-events-none absolute h-40 w-40 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: accentColor }}
        />

        {!isPlaying ? (
          <div className="relative z-10 flex flex-col items-center gap-4 max-w-md">
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-gdg-cream text-gdg-black hover:scale-105 transition-transform shadow-lg cursor-pointer"
              aria-label="Play lesson video"
            >
              <Play className="h-6 w-6 fill-current translate-x-0.5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gdg-cream/60">
                Interactive Masterclass Walkthrough
              </span>
              <h4 className="text-base sm:text-lg font-black text-gdg-cream tracking-tight">
                {title}
              </h4>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-gdg-cream/70 bg-gdg-dark-border/80 px-3 py-1 rounded-full border border-gdg-cream/10">
              <Clock className="h-3.5 w-3.5 text-gdg-yellow" />
              <span>{duration} Runtime</span>
            </div>
          </div>
        ) : (
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center space-y-3 bg-gdg-black/90 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-gdg-green font-bold text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Streaming Live Workshop Replay</span>
            </div>
            <p className="text-xs text-gdg-cream/70 max-w-sm">
              Simulating video player buffer for: &quot;{title}&quot;. In production, this will stream from the Bootcamp Cloud video host.
            </p>
            <button
              type="button"
              onClick={() => setIsPlaying(false)}
              className="px-4 py-1.5 rounded-full border border-gdg-cream/30 text-xs font-bold text-gdg-cream hover:bg-white/10"
            >
              Reset Player
            </button>
          </div>
        )}
      </div>

      {/* Video Footer bar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-[#15161A] border-t border-gdg-dark-border text-xs font-medium text-gdg-cream/70">
        <span className="truncate">GDG on Campus LASU • Video Lecture Series</span>
        <span className="font-bold text-gdg-cream">1080p HD</span>
      </div>
    </div>
  );
}
