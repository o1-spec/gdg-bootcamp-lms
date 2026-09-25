'use client';

import React from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LessonItem {
  id: string;
  title: string;
  slug: string;
  durationMinutes?: number;
  order: number;
  isPublished?: boolean;
  _count?: { progress?: number };
}

export interface ModuleItem {
  id: string;
  title: string;
  slug: string;
  order: number;
  description?: string | null;
  lessons?: LessonItem[];
}

interface MentorTrackCurriculumTabProps {
  modules: ModuleItem[];
  expandedModuleIds: Record<string, boolean>;
  setExpandedModuleIds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  openAddModule: () => void;
  openEditModule: (mod: ModuleItem) => void;
  setDeletingModule: (mod: ModuleItem) => void;
  handleReorderModule: (moduleId: string, direction: 'up' | 'down') => void;
  openAddLesson: (moduleId: string) => void;
  openEditLesson: (lesson: LessonItem, moduleId: string) => void;
  setDeletingLesson: (lesson: LessonItem) => void;
  handleReorderLesson: (moduleId: string, lessonId: string, direction: 'up' | 'down') => void;
  handleTogglePublish: (lesson: LessonItem, moduleId: string) => void;
}

export function MentorTrackCurriculumTab({
  modules,
  expandedModuleIds,
  setExpandedModuleIds,
  openAddModule,
  openEditModule,
  setDeletingModule,
  handleReorderModule,
  openAddLesson,
  openEditLesson,
  setDeletingLesson,
  handleReorderLesson,
  handleTogglePublish,
}: MentorTrackCurriculumTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#0D0E11]">Curriculum Management</h2>
          <p className="text-xs text-[#5F6368] font-medium">
            Build modules, organize lessons, edit syllabi, and publish live content for students.
          </p>
        </div>
        <button
          onClick={openAddModule}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 text-[#FBBC04]" />
          <span>Add Module</span>
        </button>
      </div>

      {modules.length === 0 ? (
        <div className="rounded-3xl bg-white border border-[#E5DFD0] p-12 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#4285F4]/10 text-[#4285F4] flex items-center justify-center mx-auto">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-black text-[#0D0E11]">No Modules Created</h3>
          <p className="text-xs text-[#5F6368] max-w-md mx-auto">
            Start structuring your track syllabus by creating the first module (e.g., &quot;Fundamentals &amp; Setup&quot;).
          </p>
          <button
            onClick={openAddModule}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] transition-colors"
          >
            <Plus className="h-4 w-4 text-[#FBBC04]" />
            <span>Create First Module</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {modules.map((mod, index) => {
            const isExpanded = expandedModuleIds[mod.id] ?? true;
            return (
              <div
                key={mod.id}
                className="rounded-3xl bg-white border border-[#E5DFD0] shadow-sm overflow-hidden"
              >
                {/* Module Header Bar */}
                <div className="p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5DFD0]">
                  <div className="flex items-center gap-4">
                    {/* Reorder Module Up/Down */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        disabled={index === 0}
                        onClick={() => handleReorderModule(mod.id, 'up')}
                        className="p-1 rounded hover:bg-[#FAF7EE] text-[#5F6368] disabled:opacity-25 transition-colors"
                        title="Move Module Up"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-[11px] font-mono font-black text-[#0D0E11] w-5 text-center">
                        #{mod.order}
                      </span>
                      <button
                        disabled={index === modules.length - 1}
                        onClick={() => handleReorderModule(mod.id, 'down')}
                        className="p-1 rounded hover:bg-[#FAF7EE] text-[#5F6368] disabled:opacity-25 transition-colors"
                        title="Move Module Down"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#4285F4] bg-[#4285F4]/10 px-2.5 py-0.5 rounded-md">
                          Module {mod.order}
                        </span>
                        <span className="text-[11px] font-mono text-[#5F6368]">
                          /{mod.slug}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-[#0D0E11] mt-0.5">
                        {mod.title}
                      </h3>
                      {mod.description && (
                        <p className="text-xs text-[#5F6368] mt-1 line-clamp-1">
                          {mod.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Module Controls */}
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => openAddLesson(mod.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7EE] hover:bg-[#E5DFD0] text-xs font-bold text-[#0D0E11] border border-[#E5DFD0] transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5 text-[#34A853]" />
                      <span>Add Lesson</span>
                    </button>

                    <button
                      onClick={() => openEditModule(mod)}
                      className="p-2 rounded-xl hover:bg-[#FAF7EE] border border-transparent hover:border-[#E5DFD0] text-[#5F6368] hover:text-[#0D0E11] transition-colors"
                      title="Edit Module"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => setDeletingModule(mod)}
                      className="p-2 rounded-xl hover:bg-[#EA4335]/10 border border-transparent text-[#5F6368] hover:text-[#EA4335] transition-colors"
                      title="Delete Module"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() =>
                        setExpandedModuleIds((prev) => ({
                          ...prev,
                          [mod.id]: !isExpanded,
                        }))
                      }
                      className="p-2 rounded-xl hover:bg-[#FAF7EE] text-[#5F6368] transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Lessons List in Module */}
                {isExpanded && (
                  <div className="p-6 bg-[#FAF7EE]/50 space-y-3">
                    {(!mod.lessons || mod.lessons.length === 0) ? (
                      <div className="p-6 rounded-2xl bg-white border border-dashed border-[#E5DFD0] text-center text-xs text-[#5F6368]">
                        No lessons added to this module yet.{' '}
                        <button
                          onClick={() => openAddLesson(mod.id)}
                          className="text-[#4285F4] font-bold underline ml-1 hover:text-[#3367D6]"
                        >
                          Add one now
                        </button>
                      </div>
                    ) : (
                      mod.lessons.map((lesson, lIndex: number) => (
                        <div
                          key={lesson.id}
                          className="p-4 rounded-2xl bg-white border border-[#E5DFD0] hover:border-[#0D0E11]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            {/* Lesson Reorder */}
                            <div className="flex flex-col items-center gap-0.5">
                              <button
                                disabled={lIndex === 0}
                                onClick={() => handleReorderLesson(mod.id, lesson.id, 'up')}
                                className="p-0.5 rounded hover:bg-[#FAF7EE] text-[#5F6368] disabled:opacity-20"
                              >
                                <ChevronUp className="h-3 w-3" />
                              </button>
                              <span className="text-[10px] font-mono font-bold text-[#5F6368]">
                                {lesson.order}
                              </span>
                              <button
                                disabled={lIndex === (mod.lessons?.length || 0) - 1}
                                onClick={() => handleReorderLesson(mod.id, lesson.id, 'down')}
                                className="p-0.5 rounded hover:bg-[#FAF7EE] text-[#5F6368] disabled:opacity-20"
                              >
                                <ChevronDown className="h-3 w-3" />
                              </button>
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[#0D0E11]">
                                  {lesson.title}
                                </span>
                                {lesson.isPublished ? (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/30">
                                    Published
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#5F6368]/10 text-[#5F6368] border border-[#5F6368]/30">
                                    Draft
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-[#5F6368] mt-1">
                                <span className="font-mono text-[11px]">/{lesson.slug}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-[#FBBC04]" />
                                  {lesson.durationMinutes} min
                                </span>
                                {lesson._count?.progress !== undefined && (
                                  <>
                                    <span>•</span>
                                    <span>{lesson._count.progress} completed</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Lesson Actions */}
                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <button
                              onClick={() => handleTogglePublish(lesson, mod.id)}
                              className={cn(
                                'px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1',
                                lesson.isPublished
                                  ? 'border-[#E5DFD0] text-[#5F6368] hover:text-[#EA4335] hover:bg-[#EA4335]/5'
                                  : 'border-[#34A853]/40 bg-[#34A853]/10 text-[#34A853] hover:bg-[#34A853]/20'
                              )}
                              title={lesson.isPublished ? 'Unpublish to Draft' : 'Publish Live'}
                            >
                              {lesson.isPublished ? (
                                <>
                                  <EyeOff className="h-3 w-3" />
                                  <span>Unpublish</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3 w-3" />
                                  <span>Publish</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => openEditLesson(lesson, mod.id)}
                              className="p-1.5 rounded-lg hover:bg-[#FAF7EE] text-[#5F6368] hover:text-[#0D0E11] transition-colors"
                              title="Edit Lesson"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => setDeletingLesson(lesson)}
                              className="p-1.5 rounded-lg hover:bg-[#EA4335]/10 text-[#5F6368] hover:text-[#EA4335] transition-colors"
                              title="Delete Lesson"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
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
