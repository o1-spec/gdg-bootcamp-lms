'use client';

import React, { useState } from 'react';
import {
  X,
  Loader2,
  Upload,
  ExternalLink,
  FileCode2,
  AlertCircle,
} from 'lucide-react';
import { ResourceType } from '@prisma/client';
import { formatFileSize } from '@/lib/cloudinary-constants';

interface AdminCreateResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: any[];
  onResourceCreated: (resource: any) => void;
}

const MAX_FILE_SIZE_MB = 25;

export function AdminCreateResourceModal({
  isOpen,
  onClose,
  modules,
  onResourceCreated,
}: AdminCreateResourceModalProps) {
  const [resTitle, setResTitle] = useState('');
  const [resDescription, setResDescription] = useState('');
  const [resType, setResType] = useState<ResourceType>(ResourceType.DOCUMENT);
  const [resUrl, setResUrl] = useState('');
  const [resPublicId, setResPublicId] = useState<string | null>(null);
  const [resFileName, setResFileName] = useState<string | null>(null);
  const [resFileSize, setResFileSize] = useState<number | null>(null);
  const [resMimeType, setResMimeType] = useState<string | null>(null);
  const [resModuleId, setResModuleId] = useState<string>(modules?.[0]?.id || '');
  const [resLessonId, setResLessonId] = useState<string>('');
  const [resIsRequired, setResIsRequired] = useState(false);
  const [resSourceMode, setResSourceMode] = useState<'upload' | 'link'>('upload');
  const [isUploadingRes, setIsUploadingRes] = useState(false);
  const [resUploadError, setResUploadError] = useState<string | null>(null);
  const [resFormError, setResFormError] = useState<string | null>(null);
  const [isSavingRes, setIsSavingRes] = useState(false);

  if (!isOpen) return null;

  const handleResourceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setResUploadError(`File is too large. Max allowed size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setIsUploadingRes(true);
    setResUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload/resource', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setResUrl(data.url);
      setResPublicId(data.publicId || null);
      setResFileName(data.originalFileName || file.name);
      setResFileSize(data.fileSize || file.size);
      setResMimeType(data.mimeType || file.type);

      if (!resTitle && data.originalFileName) {
        const clean = data.originalFileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setResTitle(clean.charAt(0).toUpperCase() + clean.slice(1));
      }

      if (data.suggestedType) {
        setResType(data.suggestedType);
      }
    } catch (err: any) {
      setResUploadError(err.message || 'File upload failed');
    } finally {
      setIsUploadingRes(false);
      e.target.value = '';
    }
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingRes) return;
    if (!resModuleId) {
      setResFormError('Please select a module for this resource');
      return;
    }
    if (!resUrl.trim()) {
      setResFormError('Please upload a file or enter an external URL');
      return;
    }

    setIsSavingRes(true);
    setResFormError(null);

    try {
      const res = await fetch('/api/mentor/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: resTitle,
          description: resDescription,
          type: resType,
          url: resUrl,
          publicId: resPublicId,
          originalFileName: resFileName,
          fileSize: resFileSize,
          mimeType: resMimeType,
          moduleId: resModuleId,
          lessonId: resLessonId || null,
          isRequired: resIsRequired,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create resource');

      onResourceCreated(data.resource);
      onClose();
    } catch (err: any) {
      setResFormError(err.message || 'Failed to create resource');
    } finally {
      setIsSavingRes(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-[#14151B] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-white">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gdg-blue">
              Track Curriculum
            </span>
            <h3 className="text-xl font-black text-white">
              Add Track Resource
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {resFormError && (
          <div className="p-3.5 rounded-2xl bg-gdg-red/15 border border-gdg-red/30 text-xs font-bold text-gdg-red flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{resFormError}</span>
          </div>
        )}

        {/* Toggle Mode */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/10">
          <button
            type="button"
            onClick={() => setResSourceMode('upload')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              resSourceMode === 'upload' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            <Upload className="h-3.5 w-3.5 text-gdg-green" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setResSourceMode('link')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              resSourceMode === 'link' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            <ExternalLink className="h-3.5 w-3.5 text-gdg-blue" />
            <span>External Link</span>
          </button>
        </div>

        <form onSubmit={handleSaveResource} className="space-y-4">
          {resSourceMode === 'upload' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/80 flex items-center justify-between">
                <span>File Asset</span>
                <span className="text-[10px] text-white/40">MAX {MAX_FILE_SIZE_MB}MB</span>
              </label>

              {resFileName ? (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileCode2 className="h-4 w-4 text-gdg-green" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{resFileName}</p>
                      {resFileSize && (
                        <p className="text-[10px] text-white/40">{formatFileSize(resFileSize)}</p>
                      )}
                    </div>
                  </div>
                  <label className="text-[11px] font-bold text-gdg-blue hover:underline cursor-pointer ml-3 shrink-0">
                    Replace
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleResourceFileUpload}
                      disabled={isUploadingRes}
                    />
                  </label>
                </div>
              ) : (
                <div>
                  <label
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                      isUploadingRes
                        ? 'border-gdg-blue bg-gdg-blue/10 pointer-events-none'
                        : 'border-white/15 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/30'
                    }`}
                  >
                    {isUploadingRes ? (
                      <div className="flex flex-col items-center py-2">
                        <Loader2 className="h-6 w-6 text-gdg-blue animate-spin mb-2" />
                        <span className="text-xs font-bold text-white">Uploading to Cloudinary...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-white/40 mb-1.5" />
                        <span className="text-xs font-bold text-white">Choose file or drag & drop</span>
                        <span className="text-[10px] text-white/40 mt-0.5">
                          PDF, ZIP, Slides, Docs, Images up to {MAX_FILE_SIZE_MB}MB
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleResourceFileUpload}
                          disabled={isUploadingRes}
                        />
                      </>
                    )}
                  </label>
                  {resUploadError && (
                    <p className="text-[11px] text-gdg-red font-bold mt-1.5">{resUploadError}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-white/80 block mb-1">Title *</label>
            <input
              type="text"
              required
              value={resTitle}
              onChange={(e) => setResTitle(e.target.value)}
              placeholder="e.g. Architecture Blueprint & Schema Guide"
              className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-gdg-blue"
            />
          </div>

          {resSourceMode === 'link' && (
            <div>
              <label className="text-xs font-bold text-white/80 block mb-1">Resource URL *</label>
              <input
                type="url"
                required
                value={resUrl}
                onChange={(e) => setResUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-gdg-blue"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-white/80 block mb-1">Module *</label>
              <select
                value={resModuleId}
                onChange={(e) => {
                  setResModuleId(e.target.value);
                  setResLessonId('');
                }}
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-[#1D1F27] border border-white/10 text-xs text-white focus:outline-none focus:border-gdg-blue"
              >
                {modules?.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-white/80 block mb-1">Type *</label>
              <select
                value={resType}
                onChange={(e) => setResType(e.target.value as ResourceType)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#1D1F27] border border-white/10 text-xs text-white focus:outline-none focus:border-gdg-blue"
              >
                <option value={ResourceType.PDF}>PDF Document</option>
                <option value={ResourceType.DOCUMENT}>Document</option>
                <option value={ResourceType.SLIDE}>Slide Deck</option>
                <option value={ResourceType.CODE}>Source Code</option>
                <option value={ResourceType.GITHUB}>GitHub</option>
                <option value={ResourceType.FIGMA}>Figma</option>
                <option value={ResourceType.DATASET}>Dataset</option>
                <option value={ResourceType.CHEATSHEET}>Cheatsheet</option>
                <option value={ResourceType.VIDEO}>Video</option>
                <option value={ResourceType.LINK}>External Link</option>
                <option value={ResourceType.OTHER}>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-white/80 block mb-1">Description</label>
            <textarea
              rows={2}
              value={resDescription}
              onChange={(e) => setResDescription(e.target.value)}
              placeholder="How students should utilize this material..."
              className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-gdg-blue resize-none"
            />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
            <input
              type="checkbox"
              id="adminReqCheckbox"
              checked={resIsRequired}
              onChange={(e) => setResIsRequired(e.target.checked)}
              className="rounded text-gdg-blue cursor-pointer"
            />
            <label htmlFor="adminReqCheckbox" className="text-xs font-bold text-white cursor-pointer">
              Mark as Required Track Material
            </label>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingRes || isUploadingRes}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gdg-blue hover:bg-gdg-blue/90 text-xs font-bold text-white disabled:opacity-50"
            >
              {isSavingRes && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Publish Resource</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
