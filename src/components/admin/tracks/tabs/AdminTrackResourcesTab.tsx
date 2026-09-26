'use client';

import React from 'react';
import {
  Plus,
  FolderGit2,
  FileCode2,
  Download,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { formatFileSize } from '@/lib/cloudinary-constants';

interface AdminTrackResourcesTabProps {
  track: any;
  resourceList: any[];
  openCreateResourceModal: () => void;
  setDeletingResource: (res: any) => void;
}

export function AdminTrackResourcesTab({
  track,
  resourceList,
  openCreateResourceModal,
  setDeletingResource,
}: AdminTrackResourcesTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Track Resources & Course Materials</h3>
          <p className="text-xs text-white/50">
            Uploaded Cloudinary assets and external reference materials for this track.
          </p>
        </div>
        <button
          onClick={openCreateResourceModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-gdg-green" />
          <span>Add Resource</span>
        </button>
      </div>

      {resourceList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/5 border border-dashed border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 text-white/40 flex items-center justify-center mx-auto">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <p className="text-xs text-white/40">No uploaded resource links or files for this track yet.</p>
          <button
            onClick={openCreateResourceModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-white/90 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload First Resource</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resourceList.map((res) => {
            const isCloudinary = Boolean(res.publicId || res.originalFileName);
            const moduleName =
              res.module?.title ||
              track.modules?.find((m: any) => m.id === res.moduleId)?.title;
            const lessonName = res.lesson?.title;

            return (
              <div
                key={res.id}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-4 group hover:border-white/20 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-white/10 text-white/80">
                        {res.type}
                      </span>
                      {isCloudinary && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-gdg-blue/20 text-gdg-blue border border-gdg-blue/30">
                          CLOUD ASSET
                        </span>
                      )}
                    </div>
                    {res.isRequired && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-gdg-red/20 text-gdg-red border border-gdg-red/30">
                        REQUIRED
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-white group-hover:text-gdg-blue transition-colors">
                    {res.title}
                  </h4>

                  {res.description && (
                    <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>
                  )}

                  {isCloudinary && res.originalFileName && (
                    <div className="flex items-center gap-2 text-[11px] text-white/60 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                      <FileCode2 className="w-3.5 h-3.5 text-gdg-green" />
                      <span className="font-medium text-white/80 truncate">
                        {res.originalFileName}
                      </span>
                      {res.fileSize && (
                        <span className="text-[10px] text-white/40 shrink-0">
                          ({formatFileSize(res.fileSize)})
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-white/40">
                    {moduleName && <span>Module: {moduleName}</span>}
                    {lessonName && <span>• Lesson: {lessonName}</span>}
                    {res.uploadedBy && (
                      <span>• Added by: {res.uploadedBy.firstName || 'Staff'}</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gdg-blue hover:underline"
                  >
                    {isCloudinary ? (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download / View</span>
                      </>
                    ) : (
                      <>
                        <span>Open Link</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </>
                    )}
                  </a>

                  <button
                    onClick={() => setDeletingResource(res)}
                    className="p-1.5 rounded-xl hover:bg-gdg-red/20 text-white/40 hover:text-gdg-red transition-colors cursor-pointer"
                    title="Delete Resource"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
