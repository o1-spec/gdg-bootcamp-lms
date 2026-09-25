'use client';

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface AdminCreateModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string) => Promise<void>;
  isSaving: boolean;
}

export function AdminCreateModuleModal({
  isOpen,
  onClose,
  onSubmit,
  isSaving,
}: AdminCreateModuleModalProps) {
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(moduleTitle, moduleDescription);
    setModuleTitle('');
    setModuleDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-[#14151B] border border-white/10 p-5 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-white">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-xl font-black text-white">Add Curriculum Module</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Module Title <span className="text-[#EA4335]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Module 1: Foundations & Architecture"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Overview of concepts covered in this module..."
              value={moduleDescription}
              onChange={(e) => setModuleDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4] resize-none"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#EA4335] hover:bg-[#EA4335]/90 text-xs font-bold text-white disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create Module</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
