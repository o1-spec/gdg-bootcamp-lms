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
        return { icon: Presentation, color: 'text-[#FBBC04]', bg: 'bg-[#FBBC04]/15 border-[#FBBC04]/30', label: 'Slides' };
      case 'github':
        return { icon: GitBranch, color: 'text-[#0D0E11]', bg: 'bg-[#0D0E11]/10 border-[#0D0E11]/20', label: 'GitHub' };
      case 'practice':
        return { icon: Code2, color: 'text-[#34A853]', bg: 'bg-[#34A853]/15 border-[#34A853]/30', label: 'Practice' };
      case 'article':
        return { icon: ExternalLink, color: 'text-[#4285F4]', bg: 'bg-[#4285F4]/12 border-[#4285F4]/25', label: 'Article' };
      case 'pdf':
      default:
        return { icon: FileText, color: 'text-[#EA4335]', bg: 'bg-[#EA4335]/12 border-[#EA4335]/25', label: 'PDF' };
    }
  };

  return (
    <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-7 shadow-xs space-y-4">
      <div>
        <h3 className="text-lg sm:text-xl font-black text-[#0D0E11] tracking-tight">
          Lesson Resources
        </h3>
        <p className="text-xs text-[#5F6368] font-medium mt-0.5">
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
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-[#E5DFD0] bg-[#FAF7EE]/50 hover:bg-white hover:border-[#0D0E11]/30 transition-all duration-200"
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
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#5F6368]">
                      {meta.label}
                    </span>
                    {res.isRequired ? (
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30">
                        REQUIRED
                      </span>
                    ) : (
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-[#E5DFD0] text-[#5F6368]">
                        OPTIONAL
                      </span>
                    )}
                    {res.fileSize && (
                      <span className="text-[11px] text-[#5F6368]">
                        ({res.fileSize})
                      </span>
                    )}
                  </div>

                  <h5 className="text-xs sm:text-sm font-bold text-[#0D0E11]">
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
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#0D0E11] px-4 py-1.5 text-xs font-bold text-[#0D0E11] hover:bg-[#0D0E11] hover:text-[#FAF7EE] transition-all cursor-pointer shadow-2xs"
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
