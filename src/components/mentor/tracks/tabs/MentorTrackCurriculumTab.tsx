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
          <h2 className="text-xl font-black text-gdg-black">Curriculum Management</h2>
          <p className="text-xs text-gdg-gray font-medium">
            Build modules, organize lessons, edit syllabi, and publish live content for students.
          </p>
        </div>
        <button
          onClick={openAddModule}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gdg-black text-gdg-cream text-xs font-bold hover:bg-gdg-dark-border transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 text-gdg-yellow" />
          <span>Add Module</span>
        </button>
      </div>

      {modules.length === 0 ? (
        <div className="rounded-3xl bg-white border border-gdg-border p-12 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gdg-blue/10 text-gdg-blue flex items-center justify-center mx-auto">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-black text-gdg-black">No Modules Created</h3>
          <p className="text-xs text-gdg-gray max-w-md mx-auto">
            Start structuring your track syllabus by creating the first module (e.g., &quot;Fundamentals &amp; Setup&quot;).
          </p>
          <button
            onClick={openAddModule}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gdg-black text-gdg-cream text-xs font-bold hover:bg-gdg-dark-border transition-colors"
          >
            <Plus className="h-4 w-4 text-gdg-yellow" />
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
                className="rounded-3xl bg-white border border-gdg-border shadow-sm overflow-hidden"
              >
                {/* Module Header Bar */}
                <div className="p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gdg-border">
                  <div className="flex items-center gap-4">
                    {/* Reorder Module Up/Down */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        disabled={index === 0}
                        onClick={() => handleReorderModule(mod.id, 'up')}
                        className="p-1 rounded hover:bg-gdg-cream text-gdg-gray disabled:opacity-25 transition-colors"
                        title="Move Module Up"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-[11px] font-mono font-black text-gdg-black w-5 text-center">
                        #{mod.order}
                      </span>
                      <button
                        disabled={index === modules.length - 1}
                        onClick={() => handleReorderModule(mod.id, 'down')}
                        className="p-1 rounded hover:bg-gdg-cream text-gdg-gray disabled:opacity-25 transition-colors"
                        title="Move Module Down"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gdg-blue bg-gdg-blue/10 px-2.5 py-0.5 rounded-md">
                          Module {mod.order}
                        </span>
                        <span className="text-[11px] font-mono text-gdg-gray">
                          /{mod.slug}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-gdg-black mt-0.5">
                        {mod.title}
                      </h3>
                      {mod.description && (
                        <p className="text-xs text-gdg-gray mt-1 line-clamp-1">
                          {mod.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Module Controls */}
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => openAddLesson(mod.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gdg-cream hover:bg-gdg-border text-xs font-bold text-gdg-black border border-gdg-border transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5 text-gdg-green" />
                      <span>Add Lesson</span>
                    </button>

                    <button
                      onClick={() => openEditModule(mod)}
                      className="p-2 rounded-xl hover:bg-gdg-cream border border-transparent hover:border-gdg-border text-gdg-gray hover:text-gdg-black transition-colors"
                      title="Edit Module"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => setDeletingModule(mod)}
                      className="p-2 rounded-xl hover:bg-gdg-red/10 border border-transparent text-gdg-gray hover:text-gdg-red transition-colors"
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
                      className="p-2 rounded-xl hover:bg-gdg-cream text-gdg-gray transition-colors"
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
                  <div className="p-6 bg-gdg-cream/50 space-y-3">
                    {(!mod.lessons || mod.lessons.length === 0) ? (
                      <div className="p-6 rounded-2xl bg-white border border-dashed border-gdg-border text-center text-xs text-gdg-gray">
                        No lessons added to this module yet.{' '}
                        <button
                          onClick={() => openAddLesson(mod.id)}
                          className="text-gdg-blue font-bold underline ml-1 hover:text-gdg-blue-dark"
                        >
                          Add one now
                        </button>
                      </div>
                    ) : (
                      mod.lessons.map((lesson, lIndex: number) => (
                        <div
                          key={lesson.id}
                          className="p-4 rounded-2xl bg-white border border-gdg-border hover:border-gdg-black/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            {/* Lesson Reorder */}
                            <div className="flex flex-col items-center gap-0.5">
                              <button
                                disabled={lIndex === 0}
                                onClick={() => handleReorderLesson(mod.id, lesson.id, 'up')}
                                className="p-0.5 rounded hover:bg-gdg-cream text-gdg-gray disabled:opacity-20"
                              >
                                <ChevronUp className="h-3 w-3" />
                              </button>
                              <span className="text-[10px] font-mono font-bold text-gdg-gray">
                                {lesson.order}
                              </span>
                              <button
                                disabled={lIndex === (mod.lessons?.length || 0) - 1}
                                onClick={() => handleReorderLesson(mod.id, lesson.id, 'down')}
                                className="p-0.5 rounded hover:bg-gdg-cream text-gdg-gray disabled:opacity-20"
                              >
                                <ChevronDown className="h-3 w-3" />
                              </button>
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-gdg-black">
                                  {lesson.title}
                                </span>
                                {lesson.isPublished ? (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gdg-green/10 text-gdg-green border border-gdg-green/30">
                                    Published
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gdg-gray/10 text-gdg-gray border border-gdg-gray/30">
                                    Draft
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gdg-gray mt-1">
                                <span className="font-mono text-[11px]">/{lesson.slug}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-gdg-yellow" />
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
                                  ? 'border-gdg-border text-gdg-gray hover:text-gdg-red hover:bg-gdg-red/5'
                                  : 'border-gdg-green/40 bg-gdg-green/10 text-gdg-green hover:bg-gdg-green/20'
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
                              className="p-1.5 rounded-lg hover:bg-gdg-cream text-gdg-gray hover:text-gdg-black transition-colors"
                              title="Edit Lesson"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => setDeletingLesson(lesson)}
                              className="p-1.5 rounded-lg hover:bg-gdg-red/10 text-gdg-gray hover:text-gdg-red transition-colors"
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
