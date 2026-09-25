'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Ticket,
  Plus,
  Search,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  ShieldCheck,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Layers,
  Award,
  CalendarRange,
  X,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { AdminSidebar, AdminUser } from '../AdminSidebar';
import { AdminHeader } from '../AdminHeader';
import { BootcampInvite } from '@/types/lms';
import { createInviteSchema } from '@/lib/validations/onboarding';

interface AdminInvitesClientProps {
  initialInvites: BootcampInvite[];
  admin: AdminUser;
  bootcamps: { id: string; name: string }[];
  cohorts: { id: string; name: string; bootcampId: string }[];
  tracks: { id: string; name: string; cohortId: string; accent?: string | null }[];
}

export function AdminInvitesClient({
  initialInvites,
  admin,
  bootcamps,
  cohorts,
  tracks,
}: AdminInvitesClientProps) {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [invites, setInvites] = useState<BootcampInvite[]>(initialInvites);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'expired' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Copied tracking
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      showToast(`Invite code "${code}" copied to clipboard`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      showToast(`Code: ${code}`);
    }
  };

  const handleCopyLink = async (code: string) => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const joinUrl = `${origin}/join?code=${encodeURIComponent(code)}`;
      await navigator.clipboard.writeText(joinUrl);
      showToast('Invite link copied to clipboard');
    } catch {
      showToast('Failed to copy link');
    }
  };

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    bootcampId: bootcamps[0]?.id || '',
    cohortId: '',
    trackId: '',
    code: '',
    expiresAt: '',
    maxUses: '',
    allowTrackSelection: false,
    maxTrackSelections: '1',
  });

  // Filter cohorts by selected bootcamp
  const filteredCohorts = cohorts.filter(
    (c) => !formData.bootcampId || c.bootcampId === formData.bootcampId
  );

  // Filter tracks by selected cohort
  const filteredTracks = tracks.filter(
    (t) => !formData.cohortId || t.cohortId === formData.cohortId
  );

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'GDG';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, code }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    const payload = {
      bootcampId: formData.bootcampId,
      cohortId: formData.cohortId || undefined,
      trackId: formData.allowTrackSelection ? undefined : formData.trackId || undefined,
      code: formData.code.trim().toUpperCase() || undefined,
      expiresAt: formData.expiresAt || undefined,
      maxUses: formData.maxUses ? parseInt(formData.maxUses, 10) : undefined,
      allowTrackSelection: formData.allowTrackSelection,
      maxTrackSelections: formData.allowTrackSelection && formData.maxTrackSelections ? parseInt(formData.maxTrackSelections, 10) : 1,
    };

    const val = createInviteSchema.safeParse(payload);
    if (!val.success) {
      setCreateError(val.error.issues[0]?.message || 'Invalid form data');
      return;
    }

    setIsCreating(true);

    try {
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || 'Failed to create invite');
      } else {
        setInvites([data.invite, ...invites]);
        setIsCreateOpen(false);
        showToast(`Invite "${data.invite.code}" created successfully`);
        setFormData({
          bootcampId: bootcamps[0]?.id || '',
          cohortId: '',
          trackId: '',
          code: '',
          expiresAt: '',
          maxUses: '',
          allowTrackSelection: false,
          maxTrackSelections: '1',
        });
      }
    } catch {
      setCreateError('Network error while creating invite');
    } finally {
      setIsCreating(false);
    }
  };

  // Toggle Active/Inactive
  const handleToggleStatus = async (invite: BootcampInvite) => {
    const newStatus = !invite.isActive;
    try {
      const res = await fetch(`/api/admin/invites/${invite.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (res.ok) {
        setInvites(
          invites.map((i) => (i.id === invite.id ? { ...i, isActive: newStatus } : i))
        );
        showToast(`Invite ${invite.code} marked ${newStatus ? 'active' : 'inactive'}`);
      }
    } catch {
      showToast('Failed to update status');
    }
  };

  // Delete Invite
  const handleDelete = async (inviteId: string) => {
    if (!confirm('Are you sure you want to delete this invite code?')) return;
    try {
      const res = await fetch(`/api/admin/invites/${inviteId}`, { method: 'DELETE' });
      if (res.ok) {
        setInvites(invites.filter((i) => i.id !== inviteId));
        showToast('Invite code deleted');
      }
    } catch {
      showToast('Failed to delete invite');
    }
  };

  // Filtered Invites
  const now = new Date();
  const displayedInvites = invites.filter((inv) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        inv.code.toLowerCase().includes(q) ||
        (inv.bootcampName && inv.bootcampName.toLowerCase().includes(q)) ||
        (inv.cohortName && inv.cohortName.toLowerCase().includes(q)) ||
        (inv.trackName && inv.trackName.toLowerCase().includes(q));
      if (!matches) return false;
    }

    const isExpired = inv.expiresAt ? new Date(inv.expiresAt) <= now : false;

    if (activeFilter === 'active') return inv.isActive && !isExpired;
    if (activeFilter === 'expired') return isExpired;
    if (activeFilter === 'inactive') return !inv.isActive;
    return true;
  });

  const totalUses = invites.reduce((acc, i) => acc + (i.useCount || 0), 0);
  const activeCount = invites.filter((i) => i.isActive && (!i.expiresAt || new Date(i.expiresAt) > now)).length;

  return (
    <div className="min-h-screen bg-[#0D0E11] text-[#FAF7EE] flex antialiased">
      {/* Sidebar */}
      <AdminSidebar
        currentTab="invites"
        admin={admin}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Invite Codes & Access"
          subtitle="Manage bootcamp join codes, track access limits, and shareable join links."
          admin={admin}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          actions={
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#4285F4] hover:bg-[#4285F4]/90 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#FBBC04]" />
              <span>Create Invite</span>
            </button>
          }
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-white text-[#0D0E11] text-xs font-bold shadow-2xl border border-white/20 animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle2 className="w-4 h-4 text-[#34A853]" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Metric Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-3xl bg-[#14151B] border border-white/10 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-white/50">Total Invites</div>
              <div className="text-2xl font-black text-white">{invites.length}</div>
            </div>
            <div className="p-4 rounded-3xl bg-[#14151B] border border-white/10 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#34A853]">Active Invites</div>
              <div className="text-2xl font-black text-[#34A853]">{activeCount}</div>
            </div>
            <div className="p-4 rounded-3xl bg-[#14151B] border border-white/10 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#4285F4]">Total Redemptions</div>
              <div className="text-2xl font-black text-[#4285F4]">{totalUses}</div>
            </div>
            <div className="p-4 rounded-3xl bg-[#14151B] border border-white/10 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#FBBC04]">Avg. Uses / Code</div>
              <div className="text-2xl font-black text-white">
                {invites.length > 0 ? (totalUses / invites.length).toFixed(1) : '0'}
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl bg-[#14151B] border border-white/10">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search by code, bootcamp, cohort, or track..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#4285F4]"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs">
              {(['all', 'active', 'expired', 'inactive'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all cursor-pointer ${
                    activeFilter === tab
                      ? 'bg-white/15 text-white'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Invites Table / Cards */}
          {displayedInvites.length > 0 ? (
            <div className="rounded-3xl border border-white/10 bg-[#14151B] overflow-hidden">
              {/* Mobile Card List (< md) */}
              <div className="md:hidden divide-y divide-white/5">
                {displayedInvites.map((inv) => {
                  const isExpired = inv.expiresAt ? new Date(inv.expiresAt) <= now : false;
                  const hasMax = inv.maxUses !== null && inv.maxUses !== undefined;
                  const isFull = hasMax && inv.useCount >= (inv.maxUses || 0);

                  return (
                    <div key={inv.id} className="p-4 space-y-3">
                      {/* Code, Copy Buttons, and Status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-xs text-white px-2.5 py-1 rounded-xl bg-white/10 border border-white/15 tracking-wider">
                            {inv.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(inv.code)}
                            title="Copy Code"
                            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            {copiedCode === inv.code ? (
                              <Check className="w-3.5 h-3.5 text-[#34A853]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopyLink(inv.code)}
                            title="Copy Shareable Join Link"
                            className="p-1.5 rounded-lg text-white/50 hover:text-[#4285F4] hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {!inv.isActive ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/50 border border-white/10">
                            Inactive
                          </span>
                        ) : isExpired ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30">
                            Expired
                          </span>
                        ) : isFull ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBBC04]/15 text-[#FBBC04] border border-[#FBBC04]/30">
                            Full
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30">
                            Active
                          </span>
                        )}
                      </div>

                      {/* Bootcamp, Cohort & Track */}
                      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5 text-xs">
                        <div className="font-bold text-white">{inv.bootcampName}</div>
                        <div className="text-[11px] text-white/50">{inv.cohortName || 'All Cohorts'}</div>
                        <div className="pt-1">
                          {inv.allowTrackSelection ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBBC04]/15 text-[#FBBC04] border border-[#FBBC04]/30">
                              <Sparkles className="w-3 h-3" />
                              <span>Multi-Track (Max {inv.maxTrackSelections || 1})</span>
                            </span>
                          ) : inv.trackName ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4285F4]/15 text-[#4285F4] border border-[#4285F4]/30">
                              <Layers className="w-3 h-3" />
                              <span>{inv.trackName}</span>
                            </span>
                          ) : (
                            <span className="text-white/40 italic text-[11px]">All Cohort Tracks</span>
                          )}
                        </div>
                      </div>

                      {/* Usage & Expiration */}
                      <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-white/5 text-[11px]">
                        <div>
                          <span className="text-white/40">Uses: </span>
                          <span className="font-bold text-white font-mono">
                            {inv.useCount} {hasMax ? `/ ${inv.maxUses}` : ''}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/40">Expires: </span>
                          <span className={`font-mono ${isExpired ? 'text-[#EA4335] font-bold' : 'text-white/60'}`}>
                            {inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                      </div>

                      {/* Mobile Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => handleToggleStatus(inv)}
                          className="flex-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {inv.isActive ? (
                            <>
                              <ToggleRight className="w-3.5 h-3.5 text-[#34A853]" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-3.5 h-3.5 text-white/40" />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="py-1.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-[#EA4335] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          title="Delete Invite"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-white/50 text-[10px] uppercase font-bold tracking-wider border-b border-white/10">
                    <tr>
                      <th className="px-5 py-3.5">Invite Code</th>
                      <th className="px-5 py-3.5">Bootcamp / Cohort</th>
                      <th className="px-5 py-3.5">Target Track</th>
                      <th className="px-5 py-3.5">Usage Count</th>
                      <th className="px-5 py-3.5">Expiration</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {displayedInvites.map((inv) => {
                      const isExpired = inv.expiresAt ? new Date(inv.expiresAt) <= now : false;
                      const hasMax = inv.maxUses !== null && inv.maxUses !== undefined;
                      const isFull = hasMax && inv.useCount >= (inv.maxUses || 0);

                      return (
                        <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-sm text-white px-2.5 py-1 rounded-xl bg-white/10 border border-white/15 tracking-wider">
                                {inv.code}
                              </span>
                              <button
                                onClick={() => handleCopyCode(inv.code)}
                                title="Copy Code"
                                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              >
                                {copiedCode === inv.code ? (
                                  <Check className="w-3.5 h-3.5 text-[#34A853]" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => handleCopyLink(inv.code)}
                                title="Copy Shareable Join Link"
                                className="p-1.5 rounded-lg text-white/40 hover:text-[#4285F4] hover:bg-white/10 transition-colors cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="space-y-0.5">
                              <div className="font-bold text-white">{inv.bootcampName}</div>
                              <div className="text-[11px] text-white/50">{inv.cohortName || 'All Cohorts'}</div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            {inv.allowTrackSelection ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FBBC04]/15 text-[#FBBC04] border border-[#FBBC04]/30">
                                <Sparkles className="w-3 h-3" />
                                <span>Multi-Track (Max {inv.maxTrackSelections || 1})</span>
                              </span>
                            ) : inv.trackName ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#4285F4]/15 text-[#4285F4] border border-[#4285F4]/30">
                                <Layers className="w-3 h-3" />
                                <span>{inv.trackName}</span>
                              </span>
                            ) : (
                              <span className="text-white/40 italic">All Cohort Tracks</span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="space-y-1">
                              <div className="font-bold text-white">
                                {inv.useCount} {hasMax ? `/ ${inv.maxUses}` : 'uses'}
                              </div>
                              {hasMax && (
                                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      isFull ? 'bg-[#EA4335]' : 'bg-[#34A853]'
                                    }`}
                                    style={{
                                      width: `${Math.min(100, (inv.useCount / (inv.maxUses || 1)) * 100)}%`,
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            {inv.expiresAt ? (
                              <span className={`text-[11px] font-medium ${isExpired ? 'text-[#EA4335] font-bold' : 'text-white/60'}`}>
                                {new Date(inv.expiresAt).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-white/40">Never expires</span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {!inv.isActive ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/50 border border-white/10">
                                Inactive
                              </span>
                            ) : isExpired ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30">
                                Expired
                              </span>
                            ) : isFull ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FBBC04]/15 text-[#FBBC04] border border-[#FBBC04]/30">
                                Limit Reached
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30">
                                Active
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleStatus(inv)}
                                title={inv.isActive ? 'Deactivate Invite' : 'Reactivate Invite'}
                                className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              >
                                {inv.isActive ? (
                                  <ToggleRight className="w-4 h-4 text-[#34A853]" />
                                ) : (
                                  <ToggleLeft className="w-4 h-4 text-white/40" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDelete(inv.id)}
                                title="Delete Invite"
                                className="p-2 rounded-xl text-white/50 hover:text-[#EA4335] hover:bg-[#EA4335]/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-[#14151B] border border-white/10 space-y-3">
              <Ticket className="w-10 h-10 text-white/30 mx-auto" />
              <h3 className="text-base font-black text-white">No invite codes match your filter</h3>
              <p className="text-xs text-white/50">Create a new invite code or adjust your filter.</p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#4285F4] text-xs font-bold text-white hover:bg-[#4285F4]/90 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Invite Code</span>
              </button>
            </div>
          )}
        </main>
      </div>

      {/* CREATE INVITE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#14151B] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4285F4]">
                  Access Control
                </span>
                <h3 className="text-xl font-black text-white">Create Bootcamp Invite</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3.5 rounded-2xl bg-[#EA4335]/15 border border-[#EA4335]/30 text-xs font-bold text-[#EA4335] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* Custom / Auto Code */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white/90">
                    Invite Code (optional)
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4285F4] hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate Random</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. BACKEND26 (leave empty for auto-generation)"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 font-mono font-bold text-white uppercase focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              {/* Bootcamp Picker */}
              <div className="space-y-1.5">
                <label className="font-bold text-white/90">
                  Bootcamp <span className="text-[#EA4335]">*</span>
                </label>
                <select
                  required
                  value={formData.bootcampId}
                  onChange={(e) => setFormData({ ...formData, bootcampId: e.target.value, cohortId: '', trackId: '' })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 font-bold text-white focus:outline-none focus:border-[#4285F4]"
                >
                  {bootcamps.map((b) => (
                    <option key={b.id} value={b.id} className="bg-[#14151B]">
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cohort Picker */}
              <div className="space-y-1.5">
                <label className="font-bold text-white/90">
                  Cohort (optional)
                </label>
                <select
                  value={formData.cohortId}
                  onChange={(e) => setFormData({ ...formData, cohortId: e.target.value, trackId: '' })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 font-medium text-white focus:outline-none focus:border-[#4285F4]"
                >
                  <option value="" className="bg-[#14151B]">All Cohorts / General Bootcamp</option>
                  {filteredCohorts.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#14151B]">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Multi-Track vs Single Track Toggle */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="font-bold text-white">Allow Student Track Selection</label>
                    <p className="text-[11px] text-white/50">Student can choose their preferred track during onboarding.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.allowTrackSelection}
                    onChange={(e) => setFormData({ ...formData, allowTrackSelection: e.target.checked })}
                    className="w-4 h-4 rounded text-[#4285F4] cursor-pointer"
                  />
                </div>

                {formData.allowTrackSelection ? (
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <label className="font-bold text-white/90">Max Track Selections</label>
                    <input
                      type="number"
                      min="1"
                      max="4"
                      value={formData.maxTrackSelections}
                      onChange={(e) => setFormData({ ...formData, maxTrackSelections: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4285F4]"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <label className="font-bold text-white/90">Designated Track (optional)</label>
                    <select
                      value={formData.trackId}
                      onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 font-medium text-white focus:outline-none focus:border-[#4285F4]"
                    >
                      <option value="" className="bg-[#14151B]">None / All Tracks</option>
                      {filteredTracks.map((t) => (
                        <option key={t.id} value={t.id} className="bg-[#14151B]">
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Usage Limit & Expiration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-white/90">Max Uses (optional)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 50 (unlimited if empty)"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4285F4]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-white/90">Expires On (optional)</label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4285F4]"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 transition-colors text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#4285F4] hover:bg-[#4285F4]/90 text-xs font-bold text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Invite</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
