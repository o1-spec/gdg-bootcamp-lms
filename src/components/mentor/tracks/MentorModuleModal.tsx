'use client';

import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ModuleData {
  id?: string;
  title: string;
  slug: string;
  order: number;
  description?: string | null;
}

interface MentorModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingModule: ModuleData | null;
  defaultOrder: number;
  onSave: (data: { title: string; slug: string; order: number; description: string }) => Promise<void>;
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

function MentorModuleModalForm({
  onClose,
  editingModule,
  defaultOrder,
  onSave,
  isSubmitting,
  formError,
}: Omit<MentorModuleModalProps, 'isOpen'>) {
  const [moduleTitle, setModuleTitle] = useState(editingModule?.title || '');
  const [moduleSlug, setModuleSlug] = useState(editingModule?.slug || '');
  const [moduleOrder, setModuleOrder] = useState(editingModule?.order ?? defaultOrder);
  const [moduleDescription, setModuleDescription] = useState(editingModule?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: moduleTitle,
      slug: moduleSlug,
      order: moduleOrder,
      description: moduleDescription,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-[#E5DFD0] p-5 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-[#0D0E11]">
            {editingModule ? 'Edit Module' : 'Create New Module'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#FAF7EE] text-[#5F6368] hover:text-[#0D0E11]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {formError && (
          <div className="p-3.5 rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/30 text-xs font-bold text-[#EA4335] flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#0D0E11] block mb-1">
              Module Title *
            </label>
            <input
              type="text"
              required
              value={moduleTitle}
              onChange={(e) => {
                setModuleTitle(e.target.value);
                if (!editingModule) setModuleSlug(slugify(e.target.value));
              }}
              placeholder="e.g., PostgreSQL & Advanced Schema Design"
              className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                Slug *
              </label>
              <input
                type="text"
                required
                value={moduleSlug}
                onChange={(e) => setModuleSlug(slugify(e.target.value))}
                placeholder="postgresql-schema-design"
                className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                Order Number *
              </label>
              <input
                type="number"
                min="1"
                required
                value={moduleOrder}
                onChange={(e) => setModuleOrder(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#0D0E11] block mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={moduleDescription}
              onChange={(e) => setModuleDescription(e.target.value)}
              placeholder="Brief overview of learning outcomes for this module..."
              className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium resize-none"
            />
          </div>

          <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl border border-[#E5DFD0] text-xs font-bold text-[#5F6368] hover:text-[#0D0E11] text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : editingModule ? 'Save Changes' : 'Create Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function MentorModuleModal(props: MentorModuleModalProps) {
  if (!props.isOpen) return null;
  return <MentorModuleModalForm key={props.editingModule?.id || 'new'} {...props} />;
}
