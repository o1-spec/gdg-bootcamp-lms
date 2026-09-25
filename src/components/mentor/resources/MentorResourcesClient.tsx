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
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Video,
  Code,
  Sliders,
  Link as LinkIcon,
  Layers,
} from 'lucide-react';
import { MentorSidebar } from '@/components/mentor/MentorSidebar';
import { MentorHeader } from '@/components/mentor/MentorHeader';
import { ConfirmDialog } from '@/components/mentor/ConfirmDialog';
import { cn } from '@/lib/utils';

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

  // Form state
  const [formTrackId, setFormTrackId] = useState<string>(tracks[0]?.id || '');
  const [formModuleId, setFormModuleId] = useState<string>('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<string>('DOCUMENT');
  const [formUrl, setFormUrl] = useState('');
  const [formIsRequired, setFormIsRequired] = useState(false);

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

  const openCreateModal = () => {
    const defaultTrack = tracks[0];
    setFormTrackId(defaultTrack?.id || '');
    setFormModuleId(defaultTrack?.modules?.[0]?.id || '');
    setFormTitle('');
    setFormDescription('');
    setFormType('DOCUMENT');
    setFormUrl('');
    setFormIsRequired(false);
    setFormError(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (res: any) => {
    setEditingResource(res);
    const trId = res.module?.trackId || res.lesson?.module?.trackId || tracks[0]?.id;
    setFormTrackId(trId);
    setFormModuleId(res.moduleId || res.lesson?.moduleId || '');
    setFormTitle(res.title);
    setFormDescription(res.description || '');
    setFormType(res.type);
    setFormUrl(res.url);
    setFormIsRequired(res.isRequired);
    setFormError(null);
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formModuleId) {
      setFormError('Please select a module for this resource');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingResource) {
        // PATCH
        const res = await fetch(`/api/mentor/resources/${editingResource.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle,
            description: formDescription,
            type: formType,
            url: formUrl,
            moduleId: formModuleId,
            isRequired: formIsRequired,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update resource');

        setResources((prev) =>
          prev.map((r) => (r.id === editingResource.id ? { ...r, ...data.resource } : r))
        );
        showToast('Resource updated');
        setEditingResource(null);
      } else {
        // POST
        const res = await fetch('/api/mentor/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle,
            description: formDescription,
            type: formType,
            url: formUrl,
            moduleId: formModuleId,
            isRequired: formIsRequired,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create resource');

        setResources((prev) => [data.resource, ...prev]);
        showToast('Resource published');
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
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="h-4 w-4 text-[#EA4335]" />;
      case 'CODE':
        return <Code className="h-4 w-4 text-[#34A853]" />;
      case 'SLIDES':
        return <Sliders className="h-4 w-4 text-[#FBBC04]" />;
      case 'LINK':
        return <LinkIcon className="h-4 w-4 text-[#4285F4]" />;
      default:
        return <FileText className="h-4 w-4 text-[#4285F4]" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7EE] text-[#0D0E11] antialiased selection:bg-[#FBBC04]/30">
      <MentorSidebar
        currentTab="resources"
        mentor={mentor}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        pendingSubmissionsCount={metrics.pendingSubmissionsCount}
        assignedTracksCount={metrics.assignedTracksCount}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <MentorHeader
          currentTab="resources"
          mentor={mentor}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        {/* Success Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] px-5 py-3 shadow-xl border border-[#34A853]/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
            <CheckCircle2 className="h-4 w-4 text-[#34A853]" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}

        <main className="flex-1 p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5DFD0] pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FBBC04]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
                  Learning Materials &amp; Documentation
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0D0E11]">
                Resource Management
              </h1>
              <p className="text-base text-[#5F6368] max-w-2xl font-medium">
                Upload and organize starter templates, documentation, API guides, slides, and video links for your assigned tracks.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              disabled={tracks.length === 0}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] disabled:opacity-50 transition-colors shadow-sm self-start md:self-auto"
            >
              <Plus className="h-4 w-4 text-[#FBBC04]" />
              <span>Add Resource</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-[#E5DFD0] shadow-sm">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <Search className="h-4 w-4 text-[#5F6368] shrink-0 ml-2" />
              <input
                type="text"
                placeholder="Search resources by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-medium bg-transparent outline-none placeholder:text-[#5F6368]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-[#5F6368] hover:text-[#0D0E11]">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
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
                <option value="DOCUMENT">Document</option>
                <option value="VIDEO">Video</option>
                <option value="CODE">Code / Repo</option>
                <option value="SLIDES">Slides</option>
                <option value="LINK">Link</option>
              </select>
            </div>
          </div>

          {/* Resources Grid */}
          {filteredResources.length === 0 ? (
            <div className="rounded-3xl bg-white border border-[#E5DFD0] p-12 text-center shadow-sm max-w-md mx-auto space-y-4">
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] transition-colors"
                >
                  <Plus className="h-4 w-4 text-[#FBBC04]" />
                  <span>Create First Resource</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((res) => {
                const trackName = res.module?.track?.name || res.lesson?.module?.track?.name || 'General';
                const moduleName = res.module?.title || res.lesson?.module?.title;

                return (
                  <div
                    key={res.id}
                    className="p-6 rounded-3xl bg-white border border-[#E5DFD0] hover:border-[#0D0E11] transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 group"
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

                        {res.isRequired && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EA4335]/10 text-[#EA4335] border border-[#EA4335]/30">
                            Required
                          </span>
                        )}
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
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#E5DFD0] flex items-center justify-between">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4285F4] hover:underline"
                      >
                        <span>Open Link</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(res)}
                          className="p-1.5 rounded-xl hover:bg-[#FAF7EE] text-[#5F6368] hover:text-[#0D0E11] transition-colors"
                          title="Edit Resource"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingResource(res)}
                          className="p-1.5 rounded-xl hover:bg-[#EA4335]/10 text-[#5F6368] hover:text-[#EA4335] transition-colors"
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
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[#E5DFD0] p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-[#0D0E11]">
                {editingResource ? 'Edit Resource' : 'Add New Resource'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingResource(null);
                }}
                className="p-2 rounded-xl hover:bg-[#FAF7EE] text-[#5F6368] hover:text-[#0D0E11]"
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

            <form onSubmit={handleSaveResource} className="space-y-4">
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
                    onChange={(e) => setFormModuleId(e.target.value)}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                    Resource Type *
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium bg-white"
                  >
                    <option value="DOCUMENT">Document</option>
                    <option value="VIDEO">Video</option>
                    <option value="CODE">Code / GitHub</option>
                    <option value="SLIDES">Slides Presentation</option>
                    <option value="LINK">External Link</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                    Resource URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0D0E11] block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="How students should utilize this material..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E5DFD0] focus:border-[#0D0E11] outline-none text-xs font-medium resize-none"
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF7EE] border border-[#E5DFD0]">
                <input
                  type="checkbox"
                  id="reqCheckbox"
                  checked={formIsRequired}
                  onChange={(e) => setFormIsRequired(e.target.checked)}
                  className="w-4 h-4 rounded text-[#4285F4] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="reqCheckbox" className="text-xs font-bold text-[#0D0E11] cursor-pointer">
                  Mark as Required Material for Track Completion
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingResource(null);
                  }}
                  className="px-5 py-2.5 rounded-2xl border border-[#E5DFD0] text-xs font-bold text-[#5F6368] hover:text-[#0D0E11]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-[#0D0E11] text-[#FAF7EE] text-xs font-bold hover:bg-[#22242B] disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : editingResource ? 'Save Changes' : 'Publish Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE RESOURCE */}
      <ConfirmDialog
        isOpen={!!deletingResource}
        title="Delete Resource"
        description={`Are you sure you want to remove "${deletingResource?.title}"? Students will no longer see this link.`}
        confirmLabel="Delete Resource"
        isDestructive={true}
        onConfirm={handleDeleteResource}
        onCancel={() => setDeletingResource(null)}
      />
    </div>
  );
}
