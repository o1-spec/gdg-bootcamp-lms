import React from 'react';
import {
  FileText,
  Presentation,
  GitBranch,
  ExternalLink,
  Code2,
  ArrowUpRight,
} from 'lucide-react';
import { LessonResourceItem, ResourceType } from '@/types/lms';
import { cn } from '@/lib/utils';

interface LessonResourcesProps {
  resources: LessonResourceItem[];
  onOpenResource?: (resource: LessonResourceItem) => void;
}

export function LessonResources({
  resources,
  onOpenResource,
}: LessonResourcesProps) {
  if (!resources || resources.length === 0) return null;

  const getResourceMeta = (type: ResourceType) => {
    switch (type) {
      case 'slides':
        return { icon: Presentation, color: 'text-gdg-yellow', bg: 'bg-gdg-yellow/15 border-gdg-yellow/30', label: 'Slides' };
      case 'github':
        return { icon: GitBranch, color: 'text-gdg-black', bg: 'bg-gdg-black/10 border-gdg-black/20', label: 'GitHub' };
      case 'practice':
        return { icon: Code2, color: 'text-gdg-green', bg: 'bg-gdg-green/15 border-gdg-green/30', label: 'Practice' };
      case 'article':
        return { icon: ExternalLink, color: 'text-gdg-blue', bg: 'bg-gdg-blue/12 border-gdg-blue/25', label: 'Article' };
      case 'pdf':
      default:
        return { icon: FileText, color: 'text-gdg-red', bg: 'bg-gdg-red/12 border-gdg-red/25', label: 'PDF' };
    }
  };

  return (
    <div className="rounded-3xl border border-gdg-border bg-white p-6 sm:p-7 shadow-xs space-y-4">
      <div>
        <h3 className="text-lg sm:text-xl font-black text-gdg-black tracking-tight">
          Lesson Resources
        </h3>
        <p className="text-xs text-gdg-gray font-medium mt-0.5">
          Curated materials to reinforce this lesson’s concepts
        </p>
      </div>

      <div className="space-y-3">
        {resources.map((res) => {
          const meta = getResourceMeta(res.type);
          const IconComp = meta.icon;

          return (
            <div
              key={res.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-gdg-border bg-gdg-cream/50 hover:bg-white hover:border-gdg-black/30 transition-all duration-200"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
                    meta.bg,
                    meta.color
                  )}
                >
                  <IconComp className="h-5 w-5" />
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gdg-gray">
                      {meta.label}
                    </span>
                    {res.isRequired ? (
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-gdg-red/15 text-gdg-red border border-gdg-red/30">
                        REQUIRED
                      </span>
                    ) : (
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-gdg-border text-gdg-gray">
                        OPTIONAL
                      </span>
                    )}
                    {res.fileSize && (
                      <span className="text-[11px] text-gdg-gray">
                        ({res.fileSize})
                      </span>
                    )}
                  </div>

                  <h5 className="text-xs sm:text-sm font-bold text-gdg-black">
                    {res.title}
                  </h5>
                </div>
              </div>

              <div className="flex items-center justify-end shrink-0 pl-13 sm:pl-0">
                <a
                  href={res.url}
                  target={res.url.startsWith('http') ? '_blank' : '_self'}
                  rel="noreferrer"
                  onClick={() => onOpenResource?.(res)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gdg-black px-4 py-1.5 text-xs font-bold text-gdg-black hover:bg-gdg-black hover:text-gdg-cream transition-all cursor-pointer shadow-2xs"
                >
                  <span>Open</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
