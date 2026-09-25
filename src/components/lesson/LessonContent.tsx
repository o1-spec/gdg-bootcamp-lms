import React from 'react';
import { LessonContentSection } from '@/types/lms';
import { CodeBlock } from './CodeBlock';
import { Info, Lightbulb, AlertTriangle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonContentProps {
  sections: LessonContentSection[];
}

export function LessonContent({ sections }: LessonContentProps) {
  if (!sections || sections.length === 0) return null;

  const renderCalloutIcon = (type?: string) => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="h-4 w-4 text-[#FBBC04]" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-[#EA4335]" />;
      case 'google':
        return <Sparkles className="h-4 w-4 text-[#4285F4]" />;
      case 'note':
      default:
        return <Info className="h-4 w-4 text-[#34A853]" />;
    }
  };

  return (
    <div className="space-y-10">
      {sections.map((section, idx) => (
        <section key={idx} className="space-y-4">
          <h3 className="text-xl sm:text-2xl font-black text-[#0D0E11] tracking-tight">
            {section.title}
          </h3>

          <p className="text-sm sm:text-base text-[#5F6368] leading-relaxed font-normal">
            {section.content}
          </p>

          {/* Bullet points */}
          {section.bulletPoints && section.bulletPoints.length > 0 && (
            <ul className="space-y-2.5 pt-1 pl-2">
              {section.bulletPoints.map((bp, bIdx) => (
                <li
                  key={bIdx}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-[#0D0E11] leading-relaxed"
                >
                  <span className="h-2 w-2 rounded-full bg-[#0D0E11] mt-2 shrink-0" />
                  <span>{bp}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Code Snippet */}
          {section.codeSnippet && (
            <CodeBlock
              code={section.codeSnippet.code}
              language={section.codeSnippet.language}
            />
          )}

          {/* Callout Card */}
          {section.callout && (
            <div
              className={cn(
                'my-4 rounded-2xl p-4 sm:p-5 border flex items-start gap-3.5',
                section.callout.type === 'tip'
                  ? 'bg-[#FBBC04]/10 border-[#FBBC04]/30 text-[#825c00]'
                  : section.callout.type === 'warning'
                  ? 'bg-[#EA4335]/10 border-[#EA4335]/30 text-[#c23326]'
                  : section.callout.type === 'google'
                  ? 'bg-[#0D0E11] border-[#22242B] text-[#FAF7EE]'
                  : 'bg-white border-[#E5DFD0] text-[#0D0E11]'
              )}
            >
              <div className="shrink-0 mt-0.5">
                {renderCalloutIcon(section.callout.type)}
              </div>
              <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                {section.callout.text}
              </p>
            </div>
          )}

          {/* Table */}
          {section.table && (
            <div className="my-4 overflow-hidden rounded-2xl border border-[#E5DFD0] bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#FAF7EE] border-b border-[#E5DFD0]">
                      {section.table.headers.map((header, hIdx) => (
                        <th
                          key={hIdx}
                          className="px-4 py-3 font-black text-[#0D0E11] uppercase tracking-wider text-[11px]"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DFD0]">
                    {section.table.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-[#FAF7EE]/50 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={cn(
                              'px-4 py-3 font-medium text-[#5F6368]',
                              cIdx === 0 && 'font-bold text-[#0D0E11]'
                            )}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
