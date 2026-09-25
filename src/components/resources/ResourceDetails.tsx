'use client';

import React, { useEffect } from 'react';
import {
  X,
  ExternalLink,
  Download,
  Calendar,
  User,
  Layers,
  BookOpen,
  FileText,
  Video,
  Presentation,
  GitBranch,
  Palette,
  Database,
  FileSpreadsheet,
  Code2,
} from 'lucide-react';
import { LibraryResource, ResourceType } from '@/types/lms';
import { cn } from '@/lib/utils';

interface ResourceDetailsProps {
  resource: LibraryResource | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ResourceDetails({ resource, isOpen, onClose }: ResourceDetailsProps) {
  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !resource) return null;

  const getResourceMeta = (type: ResourceType) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return { icon: FileText, label: 'Document / PDF Guide', color: 'text-[#EA4335]', bg: 'bg-[#EA4335]/12 border-[#EA4335]/25' };
      case 'video':
        return { icon: Video, label: 'Recorded Video Session', color: 'text-[#4285F4]', bg: 'bg-[#4285F4]/12 border-[#4285F4]/25' };
      case 'slides':
        return { icon: Presentation, label: 'Presentation Slides', color: 'text-[#FBBC04]', bg: 'bg-[#FBBC04]/15 border-[#FBBC04]/30' };
      case 'github':
      case 'code':
        return { icon: GitBranch, label: 'GitHub Repository & Code', color: 'text-[#0D0E11]', bg: 'bg-[#0D0E11]/10 border-[#0D0E11]/20' };
      case 'figma':
        return { icon: Palette, label: 'Figma Design System / Prototype', color: 'text-[#FBBC04]', bg: 'bg-[#FBBC04]/15 border-[#FBBC04]/30' };
      case 'dataset':
        return { icon: Database, label: 'Raw Data & Analysis Set', color: 'text-[#4285F4]', bg: 'bg-[#4285F4]/12 border-[#4285F4]/25' };
      case 'cheatsheet':
        return { icon: FileSpreadsheet, label: 'Developer Quick Cheatsheet', color: 'text-[#EA4335]', bg: 'bg-[#EA4335]/12 border-[#EA4335]/25' };
      case 'practice':
      case 'exercise':
        return { icon: Code2, label: 'Hands-on Practice & Exercises', color: 'text-[#34A853]', bg: 'bg-[#34A853]/15 border-[#34A853]/30' };
      default:
        return { icon: ExternalLink, label: 'Web Documentation', color: 'text-[#34A853]', bg: 'bg-[#34A853]/15 border-[#34A853]/30' };
    }
  };

  const meta = getResourceMeta(resource.type);
  const IconComp = meta.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-[#E5DFD0] bg-[#FAF7EE] p-6 sm:p-8 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        {/* Top colored accent line */}
        <div
          className="absolute top-0 left-8 right-8 h-1.5 rounded-b-full"
          style={{ backgroundColor: resource.accentColor }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-[#5F6368] hover:text-[#0D0E11] hover:bg-[#E5DFD0]/50 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close modal</span>
        </button>

        {/* Header Tagging */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border',
              meta.bg,
              meta.color
            )}
          >
            <IconComp className="h-3.5 w-3.5" />
            <span>{meta.label}</span>
          </div>

          {resource.isRequired ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30">
              REQUIRED FOR TRACK
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#5F6368] border border-[#E5DFD0]">
              OPTIONAL ENRICHMENT
            </span>
          )}

          {resource.fileSize && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#5F6368] border border-[#E5DFD0]">
              {resource.fileSize}
            </span>
          )}

          {resource.duration && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#5F6368] border border-[#E5DFD0]">
              {resource.duration}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-[#0D0E11] tracking-tight leading-tight">
          {resource.title}
        </h2>

        {/* Description */}
        <p className="mt-3 text-sm sm:text-base text-[#5F6368] leading-relaxed">
          {resource.description}
        </p>

        {/* Metadata Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white border border-[#E5DFD0]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FAF7EE] text-[#0D0E11] border border-[#E5DFD0]">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368]">
                Enrolled Track
              </p>
              <p className="text-xs font-black text-[#0D0E11]">{resource.trackName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FAF7EE] text-[#0D0E11] border border-[#E5DFD0]">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368]">
                Curriculum Module
              </p>
              <p className="text-xs font-black text-[#0D0E11]">{resource.moduleName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FAF7EE] text-[#0D0E11] border border-[#E5DFD0]">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368]">
                Instructor / Contributor
              </p>
              <p className="text-xs font-black text-[#0D0E11]">{resource.uploadedBy}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FAF7EE] text-[#0D0E11] border border-[#E5DFD0]">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368]">
                Uploaded On
              </p>
              <p className="text-xs font-black text-[#0D0E11]">{resource.addedAt}</p>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#E5DFD0]">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-bold text-[#5F6368] hover:text-[#0D0E11] hover:bg-white border border-transparent hover:border-[#E5DFD0] transition-all cursor-pointer"
          >
            Dismiss
          </button>

          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0D0E11] text-[#FAF7EE] text-xs font-black hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md"
          >
            {resource.type === 'pdf' || resource.type === 'document' || resource.type === 'cheatsheet' ? (
              <>
                <Download className="h-4 w-4 text-[#FBBC04]" />
                <span>Download Document</span>
              </>
            ) : resource.type === 'github' || resource.type === 'code' ? (
              <>
                <GitBranch className="h-4 w-4 text-[#34A853]" />
                <span>Inspect Repository</span>
              </>
            ) : resource.type === 'video' ? (
              <>
                <Video className="h-4 w-4 text-[#4285F4]" />
                <span>Watch Video Session</span>
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 text-[#4285F4]" />
                <span>Open Resource</span>
              </>
            )}
          </a>
        </div>
      </div>
    </div>
  );
}
