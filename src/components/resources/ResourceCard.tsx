'use client';

import React from 'react';
import {
  FileText,
  Video,
  Presentation,
  GitBranch,
  ExternalLink,
  Code2,
  Palette,
  Database,
  FileSpreadsheet,
  Eye,
} from 'lucide-react';
import { LibraryResource, ResourceType } from '@/types/lms';
import { cn } from '@/lib/utils';

interface ResourceCardProps {
  resource: LibraryResource;
  onSelect: (resource: LibraryResource) => void;
}

export function ResourceCard({ resource, onSelect }: ResourceCardProps) {
  const getResourceMeta = (type: ResourceType) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return { icon: FileText, label: 'Document / PDF', color: 'text-gdg-red', bg: 'bg-gdg-red/12 border-gdg-red/25' };
      case 'video':
        return { icon: Video, label: 'Video Lecture', color: 'text-gdg-blue', bg: 'bg-gdg-blue/12 border-gdg-blue/25' };
      case 'slides':
        return { icon: Presentation, label: 'Slide Deck', color: 'text-gdg-yellow', bg: 'bg-gdg-yellow/15 border-gdg-yellow/30' };
      case 'github':
      case 'code':
        return { icon: GitBranch, label: 'Code Repository', color: 'text-gdg-black', bg: 'bg-gdg-black/10 border-gdg-black/20' };
      case 'figma':
        return { icon: Palette, label: 'Figma Community Kit', color: 'text-gdg-yellow', bg: 'bg-gdg-yellow/15 border-gdg-yellow/30' };
      case 'dataset':
        return { icon: Database, label: 'Dataset', color: 'text-gdg-blue', bg: 'bg-gdg-blue/12 border-gdg-blue/25' };
      case 'cheatsheet':
        return { icon: FileSpreadsheet, label: 'Cheat Sheet', color: 'text-gdg-red', bg: 'bg-gdg-red/12 border-gdg-red/25' };
      case 'practice':
      case 'exercise':
        return { icon: Code2, label: 'Practice Exercise', color: 'text-gdg-green', bg: 'bg-gdg-green/15 border-gdg-green/30' };
      case 'article':
      case 'link':
      default:
        return { icon: ExternalLink, label: 'Web Resource', color: 'text-gdg-green', bg: 'bg-gdg-green/15 border-gdg-green/30' };
    }
  };

  const meta = getResourceMeta(resource.type);
  const IconComp = meta.icon;

  return (
    <div
      onClick={() => onSelect(resource)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gdg-border bg-white p-6 shadow-xs hover:border-gdg-black/30 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Top track colored border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: resource.accentColor }}
      />

      <div className="space-y-4">
        {/* Type & Required Badges */}
        <div className="flex items-start justify-between gap-2">
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border',
              meta.bg,
              meta.color
            )}
          >
            <IconComp className="h-5 w-5" />
          </div>

          <div className="flex items-center gap-1.5">
            {resource.isRequired ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gdg-red/15 text-gdg-red border border-gdg-red/30">
                REQUIRED
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gdg-cream text-gdg-gray border border-gdg-border">
                OPTIONAL
              </span>
            )}
          </div>
        </div>

        {/* Track & Module Meta */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: resource.accentColor }}
            />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gdg-gray truncate">
              {resource.trackName} • {resource.moduleName}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-gdg-black tracking-tight group-hover:text-black line-clamp-2">
            {resource.title}
          </h3>

          <p className="text-xs text-gdg-gray font-normal leading-relaxed line-clamp-2 pt-1">
            {resource.description}
          </p>
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="mt-5 pt-4 border-t border-gdg-border flex items-center justify-between text-xs">
        <div className="text-[11px] font-medium text-gdg-gray">
          {resource.fileSize && <span>{resource.fileSize}</span>}
          {resource.duration && <span>{resource.duration}</span>}
          {!resource.fileSize && !resource.duration && <span>Online Link</span>}
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-gdg-black group-hover:text-gdg-blue transition-colors">
          <span>Inspect Details</span>
          <Eye className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
