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
import { Button } from '@/components/ui/button';
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
          label: 'PDF Document',
          color: 'text-rose-600 dark:text-rose-400',
          bg: 'bg-rose-500/10 border-rose-500/20',
          actionText: 'Download',
          actionIcon: Download,
        };
      case 'figma':
        return {
          icon: Palette,
          label: 'Figma Design',
          color: 'text-purple-600 dark:text-purple-400',
          bg: 'bg-purple-500/10 border-purple-500/20',
          actionText: 'Open Figma',
          actionIcon: ArrowUpRight,
        };
      case 'github':
        return {
          icon: GitBranch,
          label: 'GitHub Repo',
          color: 'text-slate-800 dark:text-slate-200',
          bg: 'bg-slate-500/10 border-slate-500/20',
          actionText: 'View Repo',
          actionIcon: ArrowUpRight,
        };
      case 'video':
        return {
          icon: Video,
          label: 'Video Lesson',
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-500/10 border-blue-500/20',
          actionText: 'Watch',
          actionIcon: ArrowUpRight,
        };
      case 'slides':
        return {
          icon: Presentation,
          label: 'Presentation',
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/20',
          actionText: 'View Slides',
          actionIcon: ArrowUpRight,
        };
      case 'dataset':
        return {
          icon: Database,
          label: 'Dataset',
          color: 'text-cyan-600 dark:text-cyan-400',
          bg: 'bg-cyan-500/10 border-cyan-500/20',
          actionText: 'Download',
          actionIcon: Download,
        };
      case 'exercise':
        return {
          icon: Code2,
          label: 'Practice Sandbox',
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/20',
          actionText: 'Practice',
          actionIcon: ArrowUpRight,
        };
      case 'cheatsheet':
        return {
          icon: FileSpreadsheet,
          label: 'Cheat Sheet',
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/20',
          actionText: 'Download',
          actionIcon: Download,
        };
      case 'notes':
      case 'article':
      case 'link':
      default:
        return {
          icon: ExternalLink,
          label: 'External Link',
          color: 'text-teal-600 dark:text-teal-400',
          bg: 'bg-teal-500/10 border-teal-500/20',
          actionText: 'Open',
          actionIcon: ArrowUpRight,
        };
    }
  };

  const meta = getResourceMeta(resource.type);
  const IconComponent = meta.icon;
  const ActionIcon = meta.actionIcon;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-border/70 bg-card hover:bg-muted/30 hover:border-border transition-colors">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
            meta.bg,
            meta.color
          )}
        >
          <IconComponent className="h-5 w-5" />
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
              {meta.label}
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-[11px] font-medium text-foreground/80">
              {resource.trackName}
            </span>
            {resource.fileSize && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-[11px] text-muted-foreground">
                  {resource.fileSize}
                </span>
              </>
            )}
            {resource.duration && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-[11px] text-muted-foreground">
                  {resource.duration}
                </span>
              </>
            )}
          </div>

          <h4 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-1">
            {resource.title}
          </h4>

          {resource.lessonName && (
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              Lesson: {resource.lessonName}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end shrink-0 pt-1 sm:pt-0">
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs px-2.5 font-medium gap-1 text-foreground"
          onClick={() => onOpen?.(resource)}
        >
          <span>{meta.actionText}</span>
          <ActionIcon className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
