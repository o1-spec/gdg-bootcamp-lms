import React from 'react';
import {
  FileText,
  Video,
  GitBranch,
  Palette,
  ExternalLink,
  Presentation,
  Database,
  Code2,
  FileSpreadsheet,
  Download,
  ArrowUpRight,
} from 'lucide-react';
import { Resource, ResourceType } from '@/types/lms';
import { cn } from '@/lib/utils';

interface ResourceItemProps {
  resource: Resource;
  onOpen?: (resource: Resource) => void;
}

export function ResourceItem({ resource, onOpen }: ResourceItemProps) {
  const getResourceMeta = (type: ResourceType) => {
    switch (type) {
      case 'pdf':
        return {
          icon: FileText,
          label: 'PDF Cheatsheet',
          color: 'text-gdg-red',
          bg: 'bg-gdg-red/12 border-gdg-red/25',
          actionText: 'Download',
          actionIcon: Download,
        };
      case 'figma':
        return {
          icon: Palette,
          label: 'Figma Design System',
          color: 'text-gdg-yellow',
          bg: 'bg-gdg-yellow/15 border-gdg-yellow/30',
          actionText: 'Open Figma',
          actionIcon: ArrowUpRight,
        };
      case 'github':
        return {
          icon: GitBranch,
          label: 'GitHub Repository',
          color: 'text-gdg-black',
          bg: 'bg-gdg-black/10 border-gdg-black/20',
          actionText: 'View Repo',
          actionIcon: ArrowUpRight,
        };
      case 'video':
        return {
          icon: Video,
          label: 'Video Masterclass',
          color: 'text-gdg-blue',
          bg: 'bg-gdg-blue/12 border-gdg-blue/25',
          actionText: 'Watch Video',
          actionIcon: ArrowUpRight,
        };
      case 'slides':
        return {
          icon: Presentation,
          label: 'Workshop Slides',
          color: 'text-gdg-yellow',
          bg: 'bg-gdg-yellow/15 border-gdg-yellow/30',
          actionText: 'View Slides',
          actionIcon: ArrowUpRight,
        };
      case 'dataset':
        return {
          icon: Database,
          label: 'Live Dataset',
          color: 'text-gdg-blue',
          bg: 'bg-gdg-blue/12 border-gdg-blue/25',
          actionText: 'Download',
          actionIcon: Download,
        };
      case 'exercise':
        return {
          icon: Code2,
          label: 'Interactive Sandbox',
          color: 'text-gdg-green',
          bg: 'bg-gdg-green/15 border-gdg-green/30',
          actionText: 'Practice',
          actionIcon: ArrowUpRight,
        };
      case 'cheatsheet':
        return {
          icon: FileSpreadsheet,
          label: 'Architecture Sheet',
          color: 'text-gdg-red',
          bg: 'bg-gdg-red/12 border-gdg-red/25',
          actionText: 'Download',
          actionIcon: Download,
        };
      case 'notes':
      case 'article':
      case 'link':
      default:
        return {
          icon: ExternalLink,
          label: 'Resource Link',
          color: 'text-gdg-green',
          bg: 'bg-gdg-green/15 border-gdg-green/30',
          actionText: 'Open Resource',
          actionIcon: ArrowUpRight,
        };
    }
  };

  const meta = getResourceMeta(resource.type);
  const IconComponent = meta.icon;
  const ActionIcon = meta.actionIcon;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl border border-gdg-border bg-white hover:border-gdg-black/30 transition-all duration-200 shadow-xs hover:shadow-md">
      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border',
            meta.bg,
            meta.color
          )}
        >
          <IconComponent className="h-5 w-5" />
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-gdg-gray">
              {meta.label}
            </span>
            <span className="text-gdg-gray/40">•</span>
            <span className="text-xs font-bold text-gdg-black">
              {resource.trackName}
            </span>
            {resource.fileSize && (
              <>
                <span className="text-gdg-gray/40">•</span>
                <span className="text-xs font-medium text-gdg-gray">
                  {resource.fileSize}
                </span>
              </>
            )}
            {resource.duration && (
              <>
                <span className="text-gdg-gray/40">•</span>
                <span className="text-xs font-medium text-gdg-gray">
                  {resource.duration}
                </span>
              </>
            )}
          </div>

          <h4 className="text-sm font-black text-gdg-black tracking-tight">
            {resource.title}
          </h4>

          {resource.lessonName && (
            <p className="text-xs text-gdg-gray font-normal">
              Module: {resource.lessonName}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end shrink-0 pt-1 sm:pt-0">
        <button
          type="button"
          onClick={() => onOpen?.(resource)}
          className="inline-flex items-center gap-1.5 rounded-full border border-gdg-black hover:bg-gdg-black hover:text-gdg-cream text-gdg-black px-4 py-1.5 text-xs font-bold tracking-wide transition-all active:scale-95 cursor-pointer"
        >
          <span>{meta.actionText}</span>
          <ActionIcon className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
