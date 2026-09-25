import React from 'react';
import { LessonContentSection } from '@/types/lms';
import { CodeBlock } from './CodeBlock';
import { Info, Lightbulb, AlertTriangle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonContentProps {
  sections: LessonContentSection[];
}

export function LessonContent({ sections }: LessonContentProps) {
  if (!sections || sections.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gdg-border bg-white p-8 text-center space-y-2">
        <p className="text-sm font-bold text-gdg-black">Lesson notes not added yet</p>
        <p className="text-xs text-gdg-gray">The instructor has not published study notes or lecture materials for this lesson yet.</p>
      </div>
    );
  }

  const renderCalloutIcon = (type?: string) => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="h-4 w-4 text-gdg-yellow" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-gdg-red" />;
      case 'google':
        return <Sparkles className="h-4 w-4 text-gdg-blue" />;
      case 'note':
      default:
        return <Info className="h-4 w-4 text-gdg-green" />;
    }
  };

  return (
    <div className="space-y-10">
      {sections.map((section, idx) => (
        <section key={idx} className="space-y-4">
          <h3 className="text-xl sm:text-2xl font-black text-gdg-black tracking-tight">
            {section.title}
          </h3>

          <p className="text-sm sm:text-base text-gdg-gray leading-relaxed font-normal">
            {section.content}
          </p>

          {/* Bullet points */}
          {section.bulletPoints && section.bulletPoints.length > 0 && (
            <ul className="space-y-2.5 pt-1 pl-2">
              {section.bulletPoints.map((bp, bIdx) => (
                <li
                  key={bIdx}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-gdg-black leading-relaxed"
                >
                  <span className="h-2 w-2 rounded-full bg-gdg-black mt-2 shrink-0" />
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
                  ? 'bg-gdg-yellow/10 border-gdg-yellow/30 text-[#825c00]'
                  : section.callout.type === 'warning'
                  ? 'bg-gdg-red/10 border-gdg-red/30 text-[#c23326]'
                  : section.callout.type === 'google'
                  ? 'bg-gdg-black border-gdg-dark-border text-gdg-cream'
                  : 'bg-white border-gdg-border text-gdg-black'
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
            <div className="my-4 overflow-hidden rounded-2xl border border-gdg-border bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gdg-cream border-b border-gdg-border">
                      {section.table.headers.map((header, hIdx) => (
                        <th
                          key={hIdx}
                          className="px-4 py-3 font-black text-gdg-black uppercase tracking-wider text-[11px]"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gdg-border">
                    {section.table.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-gdg-cream/50 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={cn(
                              'px-4 py-3 font-medium text-gdg-gray',
                              cIdx === 0 && 'font-bold text-gdg-black'
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
