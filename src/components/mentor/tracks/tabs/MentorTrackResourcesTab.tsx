'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface ResourceItem {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  url: string;
  isRequired?: boolean;
}

interface MentorTrackResourcesTabProps {
  trackId: string;
  resources: ResourceItem[];
}

export function MentorTrackResourcesTab({
  trackId,
  resources,
}: MentorTrackResourcesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#0D0E11]">Track Learning Resources</h2>
          <p className="text-xs text-[#5F6368]">Documentation, starter repos, slides, and links for this track.</p>
        </div>
        <Link
          href={`/mentor/resources?trackId=${trackId}`}
          className="px-4 py-2.5 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] transition-colors"
        >
          Manage All Resources
        </Link>
      </div>

      {resources.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white border border-[#E5DFD0] text-center text-xs text-[#5F6368]">
          No resources uploaded for this track yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-2xl bg-white border border-[#E5DFD0] hover:border-[#0D0E11] transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#FAF7EE] text-[#5F6368] border border-[#E5DFD0]">
                  {res.type}
                </span>
                {res.isRequired && (
                  <span className="text-[10px] font-bold text-[#EA4335]">Required</span>
                )}
              </div>
              <h4 className="font-bold text-sm text-[#0D0E11] line-clamp-1">{res.title}</h4>
              {res.description && (
                <p className="text-xs text-[#5F6368] line-clamp-2">{res.description}</p>
              )}
              <a
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4285F4] hover:underline pt-2"
              >
                <span>Access Resource</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
