'use client';

import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface LessonData {
  id?: string;
  title: string;
  slug: string;
  duration: number;
  order: number;
  description?: string | null;
  content?: string | null;
  isPublished?: boolean;
}

interface MentorLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLesson: LessonData | null;
  defaultOrder: number;
  onSave: (data: {
    title: string;
    slug: string;
    duration: number;
    order: number;
    description: string;
    content: string;
    isPublished: boolean;
  }) => Promise<void>;
  isSubmitting: boolean;
  formError: string | null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function MentorLessonModalForm({
  onClose,
  editingLesson,
  defaultOrder,
  onSave,
  isSubmitting,
  formError,
}: Omit<MentorLessonModalProps, 'isOpen'>) {
  const [lessonTitle, setLessonTitle] = useState(editingLesson?.title || '');
  const [lessonSlug, setLessonSlug] = useState(editingLesson?.slug || '');
  const [lessonDuration, setLessonDuration] = useState(editingLesson?.duration ?? 45);
  const [lessonOrder, setLessonOrder] = useState(editingLesson?.order ?? defaultOrder);
  const [lessonDescription, setLessonDescription] = useState(editingLesson?.description || '');
  const [lessonContent, setLessonContent] = useState(editingLesson?.content || '');
  const [lessonIsPublished, setLessonIsPublished] = useState(editingLesson?.isPublished ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: lessonTitle,
      slug: lessonSlug,
      duration: lessonDuration,
      order: lessonOrder,
      description: lessonDescription,
      content: lessonContent,
      isPublished: lessonIsPublished,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-white border border-gdg-border p-5 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-gdg-black">
            {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gdg-cream text-gdg-gray hover:text-gdg-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {formError && (
          <div className="p-3.5 rounded-2xl bg-gdg-red/10 border border-gdg-red/30 text-xs font-bold text-gdg-red flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gdg-black block mb-1">
              Lesson Title *
            </label>
            <input
              type="text"
              required
              value={lessonTitle}
              onChange={(e) => {
                setLessonTitle(e.target.value);
                if (!editingLesson) setLessonSlug(slugify(e.target.value));
              }}
              placeholder="e.g., Database Migrations & Relations"
              className="w-full px-4 py-2.5 rounded-2xl border border-gdg-border focus:border-gdg-black outline-none text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-gdg-black block mb-1">
                Slug *
              </label>
              <input
                type="text"
                required
                value={lessonSlug}
                onChange={(e) => setLessonSlug(slugify(e.target.value))}
                placeholder="db-migrations"
                className="w-full px-4 py-2.5 rounded-2xl border border-gdg-border focus:border-gdg-black outline-none text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gdg-black block mb-1">
                Duration (Mins) *
              </label>
              <input
                type="number"
                min="5"
                required
                value={lessonDuration}
                onChange={(e) => setLessonDuration(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl border border-gdg-border focus:border-gdg-black outline-none text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gdg-black block mb-1">
                Order *
              </label>
              <input
                type="number"
                min="1"
                required
                value={lessonOrder}
                onChange={(e) => setLessonOrder(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl border border-gdg-border focus:border-gdg-black outline-none text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gdg-black block mb-1">
              Short Description
            </label>
            <input
              type="text"
              value={lessonDescription}
              onChange={(e) => setLessonDescription(e.target.value)}
              placeholder="Summary of core concepts covered in this lesson..."
              className="w-full px-4 py-2.5 rounded-2xl border border-gdg-border focus:border-gdg-black outline-none text-xs font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gdg-black block mb-1">
              Lesson Content / Notes (Markdown supported)
            </label>
            <textarea
              rows={6}
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
              placeholder="Write lesson notes, code samples, commands, or learning guidelines..."
              className="w-full px-4 py-2.5 rounded-2xl border border-gdg-border focus:border-gdg-black outline-none text-xs font-mono resize-y"
            />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gdg-cream border border-gdg-border">
            <input
              type="checkbox"
              id="publishCheckbox"
              checked={lessonIsPublished}
              onChange={(e) => setLessonIsPublished(e.target.checked)}
              className="w-4 h-4 rounded text-gdg-blue focus:ring-0 cursor-pointer"
            />
            <label htmlFor="publishCheckbox" className="text-xs font-bold text-gdg-black cursor-pointer">
              Publish Lesson immediately (visible to enrolled students)
            </label>
          </div>

          <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl border border-gdg-border text-xs font-bold text-gdg-gray hover:text-gdg-black text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-2xl bg-gdg-black text-gdg-cream text-xs font-bold hover:bg-gdg-dark-border disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : editingLesson ? 'Save Changes' : 'Create Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function MentorLessonModal(props: MentorLessonModalProps) {
  if (!props.isOpen) return null;
  return <MentorLessonModalForm key={props.editingLesson?.id || 'new'} {...props} />;
}
