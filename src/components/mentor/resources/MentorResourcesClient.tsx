'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderGit2,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Video,
  Code,
  Link as LinkIcon,
  Layers,
  Upload,
  Download,
  FileCode2,
  Loader2,
  Palette,
  Database,
  FileSpreadsheet,
  BookOpen,
} from 'lucide-react';
import { MentorSidebar } from '@/components/mentor/MentorSidebar';
import { MentorHeader } from '@/components/mentor/MentorHeader';
import { ConfirmDialog } from '@/components/mentor/ConfirmDialog';
import { cn } from '@/lib/utils';
import { formatFileSize, MAX_FILE_SIZE_MB } from '@/lib/cloudinary-constants';
import { ResourceType } from '@prisma/client';

interface MentorResourcesClientProps {
  tracks: any[];
  resources: any[];
  mentor: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
  };
  metrics: {
    assignedTracksCount: number;
    pendingSubmissionsCount: number;
  };
}

export function MentorResourcesClient({
  tracks,
  resources: initialResources,
  mentor,
  metrics,
}: MentorResourcesClientProps) {
  const router = useRouter();
  const [resources, setResources] = useState<any[]>(initialResources);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filters
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any | null>(null);
  const [deletingResource, setDeletingResource] = useState<any | null>(null);

  // Form mode: 'upload' | 'link'
  const [sourceMode, setSourceMode] = useState<'upload' | 'link'>('upload');

  // Form state
  const [formTrackId, setFormTrackId] = useState<string>(tracks[0]?.id || '');
  const [formModuleId, setFormModuleId] = useState<string>('');
  const [formLessonId, setFormLessonId] = useState<string>('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<ResourceType>(ResourceType.PDF);
  const [formUrl, setFormUrl] = useState('');
  const [formPublicId, setFormPublicId] = useState<string | null>(null);
  const [formOriginalFileName, setFormOriginalFileName] = useState<string | null>(null);
  const [formFileSize, setFormFileSize] = useState<number | null>(null);
  const [formMimeType, setFormMimeType] = useState<string | null>(null);
  const [formIsRequired, setFormIsRequired] = useState(false);

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Find modules for the currently selected track in modal
  const selectedTrackObj = tracks.find((t) => t.id === formTrackId);
  const availableModules = selectedTrackObj?.modules || [];
  const selectedModuleObj = availableModules.find((m: any) => m.id === formModuleId);
  const availableLessons = selectedModuleObj?.lessons || [];

  const openCreateModal = () => {
    const defaultTrack = tracks[0];
    const defaultModule = defaultTrack?.modules?.[0];
    setSourceMode('upload');
    setFormTrackId(defaultTrack?.id || '');
    setFormModuleId(defaultModule?.id || '');
    setFormLessonId('');
    setFormTitle('');
    setFormDescription('');
    setFormType(ResourceType.PDF);
    setFormUrl('');
    setFormPublicId(null);
    setFormOriginalFileName(null);
    setFormFileSize(null);
    setFormMimeType(null);
    setFormIsRequired(false);
    setFormError(null);
    setUploadError(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (res: any) => {
    setEditingResource(res);
    const trId = res.module?.trackId || res.lesson?.module?.trackId || tracks[0]?.id;
    setFormTrackId(trId);
    setFormModuleId(res.moduleId || res.lesson?.moduleId || '');
    setFormLessonId(res.lessonId || '');
    setFormTitle(res.title);
    setFormDescription(res.description || '');
    setFormType(res.type);
    setFormUrl(res.url);
    setFormPublicId(res.publicId || null);
    setFormOriginalFileName(res.originalFileName || null);
    setFormFileSize(res.fileSize || null);
    setFormMimeType(res.mimeType || null);
    setFormIsRequired(res.isRequired);
    setSourceMode(res.publicId ? 'upload' : 'link');
    setFormError(null);
    setUploadError(null);
  };

  // Handle uploading file via Cloudinary upload route
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    if (formTrackId) formData.append('trackId', formTrackId);
    if (formModuleId) formData.append('moduleId', formModuleId);
    if (formLessonId) formData.append('lessonId', formLessonId);

    try {
      const res = await fetch('/api/upload/resource', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload resource file');
      }

      setFormUrl(data.url);
      setFormPublicId(data.publicId);
      setFormOriginalFileName(data.originalFileName);
      setFormFileSize(data.fileSize);
      setFormMimeType(data.mimeType);

      // Auto-populate title if empty
      if (!formTitle.trim()) {
        const cleanTitle = data.originalFileName
          .replace(/\.[^/.]+$/, '')
          .replace(/[_-]/g, ' ');
        setFormTitle(cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1));
      }

      // Auto-suggest type
      if (data.suggestedType) {
        setFormType(data.suggestedType);
      }

      showToast(`Uploaded ${data.originalFileName} successfully`);
    } catch (err: any) {
      console.error('Resource file upload error:', err);
      setUploadError(err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (isUploading) {
      setFormError('Please wait for file upload to complete');
      return;
    }

    if (!formModuleId) {
      setFormError('Please select a module for this resource');
      return;
    }

    if (!formUrl.trim()) {
      setFormError(
        sourceMode === 'upload'
          ? 'Please select a file to upload or enter a URL'
          : 'Please enter a valid resource URL'
      );
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: formTitle,
      description: formDescription,
      type: formType,
      url: formUrl,
      publicId: formPublicId,
      originalFileName: formOriginalFileName,
      fileSize: formFileSize,
      mimeType: formMimeType,
      moduleId: formModuleId,
      lessonId: formLessonId || null,
      isRequired: formIsRequired,
    };

    try {
      if (editingResource) {
        // PATCH
        const res = await fetch(`/api/mentor/resources/${editingResource.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update resource');

        setResources((prev) =>
          prev.map((r) => (r.id === editingResource.id ? { ...r, ...data.resource } : r))
        );
        showToast('Resource updated successfully');
        setEditingResource(null);
      } else {
        // POST
        const res = await fetch('/api/mentor/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create resource');

        setResources((prev) => [data.resource, ...prev]);
        showToast('Resource published successfully');
        setIsCreateOpen(false);
      }
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async () => {
    if (!deletingResource) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/mentor/resources/${deletingResource.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete resource');

      setResources((prev) => prev.filter((r) => r.id !== deletingResource.id));
      showToast('Resource removed');
      setDeletingResource(null);
      router.refresh();
    } catch (err: any) {
      showToast(err.message || 'Deletion failed');
      setDeletingResource(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered resources
  const filteredResources = resources.filter((res) => {
    const trackId = res.module?.trackId || res.lesson?.module?.trackId;
    if (selectedTrackFilter !== 'all' && trackId !== selectedTrackFilter) {
      return false;
    }
    if (selectedTypeFilter !== 'all' && res.type !== selectedTypeFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = res.title.toLowerCase().includes(q);
      const matchDesc = res.description?.toLowerCase().includes(q);
      const matchFile = res.originalFileName?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchFile) return false;
    }
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-4 w-4 text-[#EA4335]" />;
      case 'VIDEO':
        return <Video className="h-4 w-4 text-[#4285F4]" />;
      case 'CODE':
      case 'GITHUB':
        return <Code className="h-4 w-4 text-[#34A853]" />;
      case 'SLIDE':
        return <BookOpen className="h-4 w-4 text-[#FBBC04]" />;
      case 'FIGMA':
        return <Palette className="h-4 w-4 text-[#EA4335]" />;
      case 'DATASET':
        return <Database className="h-4 w-4 text-[#4285F4]" />;
      case 'CHEATSHEET':
        return <FileSpreadsheet className="h-4 w-4 text-[#FBBC04]" />;
      default:
        return <LinkIcon className="h-4 w-4 text-[#34A853]" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7EE] text-[#0D0E11] antialiased selection:bg-[#FBBC04]/30">
      <MentorSidebar
        currentTab="resources"
        mentor={mentor}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingSubmissionsCount={metrics?.pendingSubmissionsCount}
        assignedTracksCount={metrics?.assignedTracksCount}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <MentorHeader
          currentTab="resources"
          mentor={mentor}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          title="Track Resources"
          subtitle="Manage uploaded documents, guides, repositories, and learning assets."
        />

        {/* Scrollable Container */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl w-full mx-auto">
          {/* Toast notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#0D0E11] text-white text-xs font-bold shadow-xl animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle2 className="h-4 w-4 text-[#34A853]" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Top Banner Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#E5DFD0]">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0D0E11]">Resource Library</h2>
              <p className="text-xs text-[#5F6368] font-medium">Curate files and links for students across your assigned tracks.</p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] transition-all shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4 text-[#FBBC04]" />
              <span>Add Resource</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-[#E5DFD0] shadow-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F6368]" />
              <input
                type="text"
                placeholder="Search resources by title, description, or filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-xs font-medium text-[#0D0E11] placeholder:text-[#5F6368] focus:border-[#0D0E11] focus:bg-white outline-none"
              />
            </div>

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              {/* Track filter */}
              <select
                value={selectedTrackFilter}
                onChange={(e) => setSelectedTrackFilter(e.target.value)}
                className="px-3.5 py-2 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-xs font-bold text-[#0D0E11] outline-none"
              >
                <option value="all">All Tracks</option>
                {tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              {/* Type filter */}
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="px-3.5 py-2 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] text-xs font-bold text-[#0D0E11] outline-none"
              >
                <option value="all">All Types</option>
                <option value="PDF">PDF</option>
                <option value="DOCUMENT">Document</option>
                <option value="SLIDE">Slides</option>
                <option value="VIDEO">Video</option>
                <option value="CODE">Code</option>
                <option value="GITHUB">GitHub</option>
                <option value="FIGMA">Figma</option>
                <option value="DATASET">Dataset</option>
                <option value="CHEATSHEET">Cheatsheet</option>
                <option value="ARTICLE">Article</option>
                <option value="LINK">Link</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Resources Grid */}
          {filteredResources.length === 0 ? (
            <div className="rounded-3xl bg-white border border-[#E5DFD0] p-12 text-center shadow-xs max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#4285F4]/10 text-[#4285F4] flex items-center justify-center mx-auto">
                <FolderGit2 className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-[#0D0E11]">No Resources Found</h3>
              <p className="text-xs text-[#5F6368]">
                {resources.length === 0
                  ? "You haven't uploaded any learning resources for your assigned tracks yet."
                  : 'No resources match your search or selected filter options.'}
              </p>
              {resources.length === 0 && (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-[#FBBC04]" />
                  <span>Create First Resource</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((res) => {
                const trackName = res.module?.track?.name || res.lesson?.module?.track?.name || 'General Track';
                const moduleName = res.module?.title || res.lesson?.module?.title;
                const lessonTitle = res.lesson?.title;
                const isUploaded = Boolean(res.publicId || res.originalFileName);

                return (
                  <div
                    key={res.id}
                    className="p-6 rounded-3xl bg-white border border-[#E5DFD0] hover:border-[#0D0E11] transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-[#FAF7EE] border border-[#E5DFD0]">
                            {getTypeIcon(res.type)}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#5F6368]">
                            {res.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isUploaded && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/20">
                              CLOUD ASSET
                            </span>
                          )}
                          {res.isRequired && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EA4335]/10 text-[#EA4335] border border-[#EA4335]/30">
                              Required
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-black text-base text-[#0D0E11] group-hover:text-[#4285F4] transition-colors line-clamp-1">
                          {res.title}
                        </h3>
                        {res.description && (
                          <p className="text-xs text-[#5F6368] mt-1 line-clamp-2 leading-relaxed">
                            {res.description}
                          </p>
                        )}
                      </div>

                      {/* File metadata info */}
                      {isUploaded && (
                        <div className="flex items-center gap-2 text-[11px] text-[#5F6368] bg-[#FAF7EE]/60 px-3 py-1.5 rounded-xl border border-[#E5DFD0]/60">
                          <FileCode2 className="h-3.5 w-3.5 text-[#34A853]" />
                          <span className="font-bold text-[#0D0E11] truncate">
                            {res.originalFileName || 'Attached Asset'}
                          </span>
                          {res.fileSize && (
                            <span className="text-[10px] font-medium text-[#5F6368] shrink-0">
                              ({formatFileSize(res.fileSize)})
                            </span>
                          )}
                        </div>
                      )}

                      <div className="p-3 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0] space-y-1 text-[11px]">
                        <div className="flex items-center gap-1.5 text-[#5F6368] font-medium">
                          <Layers className="h-3 w-3 text-[#4285F4]" />
                          <span className="font-bold text-[#0D0E11]">{trackName}</span>
                        </div>
                        {moduleName && (
                          <div className="text-[10px] text-[#5F6368] truncate pl-4.5">
                            Module: {moduleName}
                          </div>
                        )}
                        {lessonTitle && (
                          <div className="text-[10px] text-[#5F6368] truncate pl-4.5">
                            Lesson: {lessonTitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#E5DFD0] flex items-center justify-between">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4285F4] hover:underline"
                      >
                        {isUploaded ? (
                          <>
                            <Download className="h-3.5 w-3.5" />
                            <span>Download / View</span>
                          </>
                        ) : (
                          <>
                            <span>Open Link</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </>
                        )}
                      </a>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(res)}
                          className="p-1.5 rounded-xl hover:bg-[#FAF7EE] text-[#5F6368] hover:text-[#0D0E11] transition-colors cursor-pointer"
                          title="Edit Resource"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingResource(res)}
                          className="p-1.5 rounded-xl hover:bg-[#EA4335]/10 text-[#5F6368] hover:text-[#EA4335] transition-colors cursor-pointer"
                          title="Delete Resource"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* CREATE / EDIT MODAL */}
      {(isCreateOpen || editingResource) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[#E5DFD0] p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD0]">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4285F4]">
                  Resource Management
                </span>
                <h3 className="text-xl font-black text-[#0D0E11]">
                  {editingResource ? 'Edit Resource' : 'Add New Resource'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingResource(null);
                }}
                className="p-2 rounded-xl hover:bg-[#FAF7EE] text-[#5F6368] hover:text-[#0D0E11] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/30 text-xs font-bold text-[#EA4335] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Source Mode Toggle: Upload File vs External Link */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0]">
              <button
                type="button"
                onClick={() => setSourceMode('upload')}
                className={cn(
                  'flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black transition-all cursor-pointer',
                  sourceMode === 'upload'
                    ? 'bg-white text-[#0D0E11] shadow-xs'
                    : 'text-[#5F6368] hover:text-[#0D0E11]'
                )}
              >
                <Upload className="h-3.5 w-3.5 text-[#34A853]" />
                <span>Upload File</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('link')}
                className={cn(
                  'flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black transition-all cursor-pointer',
                  sourceMode === 'link'
                    ? 'bg-white text-[#0D0E11] shadow-xs'
                    : 'text-[#5F6368] hover:text-[#0D0E11]'
                )}
              >
                <LinkIcon className="h-3.5 w-3.5 text-[#4285F4]" />
                <span>External Link</span>
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="space-y-4">
              {/* File upload picker if mode is upload */}
              {sourceMode === 'upload' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-[#0D0E11] flex items-center justify-between">
                    <span>File Asset (PDF, Slides, Images, Documents, Code)</span>
                    <span className="text-[10px] font-bold text-[#5F6368]">
                      MAX {MAX_FILE_SIZE_MB}MB
                    </span>
                  </label>

                  {formOriginalFileName ? (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0]">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-white text-[#34A853] border border-[#E5DFD0]">
                          <FileCode2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-[#0D0E11] truncate">
                            {formOriginalFileName}
                          </p>
                          {formFileSize && (
                            <p className="text-[10px] text-[#5F6368]">
                              {formatFileSize(formFileSize)} • Cloudinary Uploaded
                            </p>
                          )}
                        </div>
                      </div>

                      <label className="text-[11px] font-black text-[#4285F4] hover:underline cursor-pointer ml-3 shrink-0">
                        Replace
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                  ) : (
                    <div>
                      <label
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                          isUploading
                            ? 'border-[#4285F4] bg-[#4285F4]/5 pointer-events-none'
                            : 'border-[#E5DFD0] bg-[#FAF7EE]/50 hover:bg-[#FAF7EE] hover:border-[#0D0E11]/30'
                        }`}
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center py-2">
                            <Loader2 className="h-6 w-6 text-[#4285F4] animate-spin mb-2" />
                            <span className="text-xs font-bold text-[#0D0E11]">
                              Uploading file to Cloudinary...
                            </span>
                            <span className="text-[10px] text-[#5F6368]">
                              Processing and securing asset
                            </span>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-[#5F6368] mb-1.5" />
                            <span className="text-xs font-bold text-[#0D0E11]">
                              Click to choose file or drag & drop
                            </span>
                            <span className="text-[10px] text-[#5F6368] mt-0.5">
                              PDF, ZIP, PPTX, DOCX, CSV, PNG, or JPG up to {MAX_FILE_SIZE_MB}MB
                            </span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={handleFileUpload}
                              disabled={isUploading}
                            />
                          </>
                        )}
                      </label>
                      {uploadError && (
                        <p className="text-[11px] text-[#EA4335] font-bold mt-1.5">
                          {uploadError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Title input */}
              <div>
                <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., PostgreSQL Official Cheat Sheet & Docs"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium"
                />
              </div>

              {/* External URL input if link mode */}
              {sourceMode === 'link' && (
                <div>
                  <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                    Resource URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://youtube.com/..., https://github.com/..., etc."
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-mono"
                  />
                </div>
              )}

              {/* Track & Module selects */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                    Track *
                  </label>
                  <select
                    value={formTrackId}
                    onChange={(e) => {
                      setFormTrackId(e.target.value);
                      const t = tracks.find((tr) => tr.id === e.target.value);
                      setFormModuleId(t?.modules?.[0]?.id || '');
                      setFormLessonId('');
                    }}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium bg-white"
                  >
                    {tracks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                    Module *
                  </label>
                  <select
                    value={formModuleId}
                    onChange={(e) => {
                      setFormModuleId(e.target.value);
                      setFormLessonId('');
                    }}
                    required
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium bg-white"
                  >
                    {availableModules.length === 0 ? (
                      <option value="">No modules available</option>
                    ) : (
                      availableModules.map((m: any) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Optional Lesson select */}
              {availableLessons.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                    Associated Lesson <span className="text-[#5F6368] font-normal">(Optional)</span>
                  </label>
                  <select
                    value={formLessonId}
                    onChange={(e) => setFormLessonId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium bg-white"
                  >
                    <option value="">No specific lesson (Module-level resource)</option>
                    {availableLessons.map((l: any) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Resource Type */}
              <div>
                <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                  Resource Type *
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as ResourceType)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium bg-white"
                >
                  <option value={ResourceType.PDF}>PDF Document</option>
                  <option value={ResourceType.DOCUMENT}>Document / Word / Notes</option>
                  <option value={ResourceType.SLIDE}>Slide Presentation</option>
                  <option value={ResourceType.CODE}>Source Code / Archive</option>
                  <option value={ResourceType.GITHUB}>GitHub Repository</option>
                  <option value={ResourceType.FIGMA}>Figma Design File</option>
                  <option value={ResourceType.DATASET}>Dataset / Spreadsheet</option>
                  <option value={ResourceType.CHEATSHEET}>Cheatsheet</option>
                  <option value={ResourceType.PRACTICE}>Practice Problem</option>
                  <option value={ResourceType.VIDEO}>Video Lecture</option>
                  <option value={ResourceType.ARTICLE}>Article / Blog Post</option>
                  <option value={ResourceType.LINK}>External Web Link</option>
                  <option value={ResourceType.OTHER}>Other Material</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="How students should utilize this material..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium resize-none"
                />
              </div>

              {/* Required Checkbox */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0]">
                <input
                  type="checkbox"
                  id="reqCheckbox"
                  checked={formIsRequired}
                  onChange={(e) => setFormIsRequired(e.target.checked)}
                  className="rounded text-[#0D0E11] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="reqCheckbox" className="text-xs font-bold text-[#0D0E11] cursor-pointer">
                  Mark as Required Course Material
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DFD0]">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingResource(null);
                  }}
                  className="px-5 py-2.5 rounded-full border border-[#0D0E11] text-xs font-bold text-[#0D0E11] hover:bg-[#FAF7EE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#34A853]" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-[#34A853]" />
                  )}
                  <span>{editingResource ? 'Save Changes' : 'Publish Resource'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDialog
        isOpen={Boolean(deletingResource)}
        title="Remove Resource"
        description={`Are you sure you want to remove "${deletingResource?.title}"? If this is an uploaded Cloudinary asset, the file will be safely deleted from storage.`}
        confirmText="Delete Resource"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteResource}
        onCancel={() => setDeletingResource(null)}
      />
    </div>
  );
}
