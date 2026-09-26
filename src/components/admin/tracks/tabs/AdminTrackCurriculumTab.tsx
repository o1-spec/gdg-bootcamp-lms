'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface AdminTrackCurriculumTabProps {
  track: any;
  expandedModules: Record<string, boolean>;
  toggleModule: (id: string) => void;
  openCreateModule: () => void;
}

export function AdminTrackCurriculumTab({
  track,
  expandedModules,
  toggleModule,
  openCreateModule,
}: AdminTrackCurriculumTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Syllabus & Lesson Plan</h3>
          <p className="text-xs text-white/50">Manage modules, lessons, and student walkthroughs</p>
        </div>
        <button
          onClick={openCreateModule}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white"
        >
          <Plus className="w-3.5 h-3.5 text-gdg-blue" />
          <span>Add Module</span>
        </button>
      </div>

      {(!track.modules || track.modules.length === 0) ? (
        <div className="p-12 text-center rounded-3xl bg-white/5 border border-dashed border-white/10 space-y-3">
          <p className="text-xs text-white/40">No modules created yet for this track.</p>
          <button
            onClick={openCreateModule}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gdg-red text-xs font-bold text-white"
          >
            <Plus className="w-4 h-4" />
            <span>Create Module</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {track.modules.map((mod: any, index: number) => {
            const isExpanded = expandedModules[mod.id] ?? false;
            return (
              <div
                key={mod.id}
                className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
              >
                <div
                  onClick={() => toggleModule(mod.id)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{mod.title}</h4>
                      <p className="text-[11px] text-white/40">{mod.lessons?.length || 0} lessons</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-white/40" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/40" />
                  )}
                </div>

                {isExpanded && mod.lessons && mod.lessons.length > 0 && (
                  <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
                    {mod.lessons.map((lesson: any, lIndex: number) => (
                      <div
                        key={lesson.id}
                        className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[11px] font-mono text-white/30">
                            {index + 1}.{lIndex + 1}
                          </span>
                          <span className="font-semibold text-white truncate">{lesson.title}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] text-white/40">
                            {lesson.duration || '45 mins'}
                          </span>
                          <Link
                            href={`/tracks/${track.id}/lessons/${lesson.id}`}
                            target="_blank"
                            className="p-1 rounded text-white/40 hover:text-white"
                            title="View Student Lesson Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
