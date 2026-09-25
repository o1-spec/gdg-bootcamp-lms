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
  FileCode2,
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
        return {
          icon: FileText,
          label: 'Document / PDF Guide',
          color: 'text-gdg-red',
          bg: 'bg-gdg-red/12 border-gdg-red/25',
        };
      case 'video':
        return {
          icon: Video,
          label: 'Recorded Video Session',
          color: 'text-gdg-blue',
          bg: 'bg-gdg-blue/12 border-gdg-blue/25',
        };
      case 'slides':
        return {
          icon: Presentation,
          label: 'Presentation Slides',
          color: 'text-gdg-yellow',
          bg: 'bg-gdg-yellow/15 border-gdg-yellow/30',
        };
      case 'github':
      case 'code':
        return {
          icon: GitBranch,
          label: 'GitHub Repository & Code',
          color: 'text-gdg-black',
          bg: 'bg-gdg-black/10 border-gdg-black/20',
        };
      case 'figma':
        return {
          icon: Palette,
          label: 'Figma Design System / Prototype',
          color: 'text-gdg-yellow',
          bg: 'bg-gdg-yellow/15 border-gdg-yellow/30',
        };
      case 'dataset':
        return {
          icon: Database,
          label: 'Raw Data & Analysis Set',
          color: 'text-gdg-blue',
          bg: 'bg-gdg-blue/12 border-gdg-blue/25',
        };
      case 'cheatsheet':
        return {
          icon: FileSpreadsheet,
          label: 'Developer Quick Cheatsheet',
          color: 'text-gdg-red',
          bg: 'bg-gdg-red/12 border-gdg-red/25',
        };
      case 'practice':
      case 'exercise':
        return {
          icon: Code2,
          label: 'Hands-on Practice & Exercises',
          color: 'text-gdg-green',
          bg: 'bg-gdg-green/15 border-gdg-green/30',
        };
      default:
        return {
          icon: ExternalLink,
          label: 'Web Documentation',
          color: 'text-gdg-green',
          bg: 'bg-gdg-green/15 border-gdg-green/30',
        };
    }
  };

  const meta = getResourceMeta(resource.type);
  const IconComp = meta.icon;

  const isPdf =
    resource.type === 'pdf' ||
    resource.originalFileName?.toLowerCase().endsWith('.pdf') ||
    resource.url.toLowerCase().includes('.pdf');

  const isImage =
    resource.mimeType?.startsWith('image/') ||
    /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(resource.originalFileName || resource.url);

  const isCloudinary = Boolean(resource.publicId || resource.originalFileName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-gdg-border bg-gdg-cream p-5 sm:p-8 shadow-2xl z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Top colored accent line */}
        <div
          className="absolute top-0 left-8 right-8 h-1.5 rounded-b-full"
          style={{ backgroundColor: resource.accentColor }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-gdg-gray hover:text-gdg-black hover:bg-gdg-border/50 transition-colors cursor-pointer"
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

          {isCloudinary && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gdg-blue/10 text-gdg-blue border border-gdg-blue/20">
              CLOUDINARY ASSET
            </span>
          )}

          {resource.isRequired ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gdg-red/15 text-gdg-red border border-gdg-red/30">
              REQUIRED FOR TRACK
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-gdg-gray border border-gdg-border">
              OPTIONAL ENRICHMENT
            </span>
          )}

          {resource.fileSize && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-gdg-gray border border-gdg-border">
              {resource.fileSize}
            </span>
          )}

          {resource.duration && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-gdg-gray border border-gdg-border">
              {resource.duration}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-3xl font-black text-gdg-black tracking-tight leading-tight">
          {resource.title}
        </h2>

        {/* Description */}
        <p className="mt-3 text-sm sm:text-base text-gdg-gray leading-relaxed">
          {resource.description}
        </p>

        {/* Image Preview if image asset */}
        {isImage && resource.url && (
          <div className="mt-5 rounded-2xl overflow-hidden border border-gdg-border bg-white p-2">
            <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden bg-gdg-cream flex items-center justify-center">
              <img
                src={resource.url}
                alt={resource.title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Attached filename if Cloudinary upload */}
        {resource.originalFileName && (
          <div className="mt-4 flex items-center gap-2 text-xs text-gdg-black bg-white px-4 py-2.5 rounded-2xl border border-gdg-border">
            <FileCode2 className="h-4 w-4 text-gdg-green" />
            <span className="font-bold">Original Asset:</span>
            <span className="font-mono text-gdg-gray">{resource.originalFileName}</span>
          </div>
        )}

        {/* Metadata Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white border border-gdg-border">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gdg-cream text-gdg-black border border-gdg-border">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray">
                Enrolled Track
              </p>
              <p className="text-xs font-black text-gdg-black">{resource.trackName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gdg-cream text-gdg-black border border-gdg-border">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray">
                Curriculum Module
              </p>
              <p className="text-xs font-black text-gdg-black">{resource.moduleName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gdg-cream text-gdg-black border border-gdg-border">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray">
                Instructor / Contributor
              </p>
              <p className="text-xs font-black text-gdg-black">{resource.uploadedBy}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gdg-cream text-gdg-black border border-gdg-border">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gdg-gray">
                Uploaded On
              </p>
              <p className="text-xs font-black text-gdg-black">{resource.addedAt}</p>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gdg-border">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-bold text-gdg-gray hover:text-gdg-black hover:bg-white border border-transparent hover:border-gdg-border transition-all cursor-pointer"
          >
            Dismiss
          </button>

          {/* For PDF resources: provide both Open in new tab AND direct download */}
          {isPdf ? (
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-gdg-black text-gdg-black text-xs font-black hover:bg-white transition-all cursor-pointer"
              >
                <ExternalLink className="h-4 w-4 text-gdg-blue" />
                <span>Open in Tab</span>
              </a>

              <a
                href={resource.url}
                download={resource.originalFileName || `${resource.title}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gdg-black text-gdg-cream text-xs font-black hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md"
              >
                <Download className="h-4 w-4 text-gdg-yellow" />
                <span>Download PDF</span>
              </a>
            </div>
          ) : (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              download={resource.originalFileName}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gdg-black text-gdg-cream text-xs font-black hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md"
            >
              {isCloudinary ? (
                <>
                  <Download className="h-4 w-4 text-gdg-yellow" />
                  <span>Download File</span>
                </>
              ) : resource.type === 'github' || resource.type === 'code' ? (
                <>
                  <GitBranch className="h-4 w-4 text-gdg-green" />
                  <span>Inspect Repository</span>
                </>
              ) : resource.type === 'video' ? (
                <>
                  <Video className="h-4 w-4 text-gdg-blue" />
                  <span>Watch Video Session</span>
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 text-gdg-blue" />
                  <span>Open Resource</span>
                </>
              )}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
