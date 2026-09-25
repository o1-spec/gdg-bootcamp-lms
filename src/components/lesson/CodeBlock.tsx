'use client';

import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language = 'http', title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-[#22242B] bg-[#0D0E11] text-[#FAF7EE] shadow-sm">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#15161A] border-b border-[#22242B]">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-[#FBBC04]" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#FAF7EE]/70">
            {title || language}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold text-[#FAF7EE]/70 hover:bg-[#22242B] hover:text-[#FAF7EE] transition-colors cursor-pointer"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-[#34A853]" />
              <span className="text-[#34A853]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto font-mono text-xs sm:text-[13px] leading-relaxed text-[#FAF7EE]/90">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
