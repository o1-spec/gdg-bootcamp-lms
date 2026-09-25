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
        return { icon: FileText, label: 'Document / PDF', color: 'text-[#EA4335]', bg: 'bg-[#EA4335]/12 border-[#EA4335]/25' };
      case 'video':
        return { icon: Video, label: 'Video Lecture', color: 'text-[#4285F4]', bg: 'bg-[#4285F4]/12 border-[#4285F4]/25' };
      case 'slides':
        return { icon: Presentation, label: 'Slide Deck', color: 'text-[#FBBC04]', bg: 'bg-[#FBBC04]/15 border-[#FBBC04]/30' };
      case 'github':
      case 'code':
        return { icon: GitBranch, label: 'Code Repository', color: 'text-[#0D0E11]', bg: 'bg-[#0D0E11]/10 border-[#0D0E11]/20' };
      case 'figma':
        return { icon: Palette, label: 'Figma Community Kit', color: 'text-[#FBBC04]', bg: 'bg-[#FBBC04]/15 border-[#FBBC04]/30' };
      case 'dataset':
        return { icon: Database, label: 'Dataset', color: 'text-[#4285F4]', bg: 'bg-[#4285F4]/12 border-[#4285F4]/25' };
      case 'cheatsheet':
        return { icon: FileSpreadsheet, label: 'Cheat Sheet', color: 'text-[#EA4335]', bg: 'bg-[#EA4335]/12 border-[#EA4335]/25' };
      case 'practice':
      case 'exercise':
        return { icon: Code2, label: 'Practice Exercise', color: 'text-[#34A853]', bg: 'bg-[#34A853]/15 border-[#34A853]/30' };
      case 'article':
      case 'link':
      default:
        return { icon: ExternalLink, label: 'Web Resource', color: 'text-[#34A853]', bg: 'bg-[#34A853]/15 border-[#34A853]/30' };
    }
  };

  const meta = getResourceMeta(resource.type);
  const IconComp = meta.icon;

  return (
    <div
      onClick={() => onSelect(resource)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#E5DFD0] bg-white p-6 shadow-xs hover:border-[#0D0E11]/30 hover:shadow-md transition-all duration-200 cursor-pointer"
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
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30">
                REQUIRED
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368] truncate">
              {resource.trackName} • {resource.moduleName}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-[#0D0E11] tracking-tight group-hover:text-black line-clamp-2">
            {resource.title}
          </h3>

          <p className="text-xs text-[#5F6368] font-normal leading-relaxed line-clamp-2 pt-1">
            {resource.description}
          </p>
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="mt-5 pt-4 border-t border-[#E5DFD0] flex items-center justify-between text-xs">
        <div className="text-[11px] font-medium text-[#5F6368]">
          {resource.fileSize && <span>{resource.fileSize}</span>}
          {resource.duration && <span>{resource.duration}</span>}
          {!resource.fileSize && !resource.duration && <span>Online Link</span>}
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-[#0D0E11] group-hover:text-[#4285F4] transition-colors">
          <span>Inspect Details</span>
          <Eye className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
