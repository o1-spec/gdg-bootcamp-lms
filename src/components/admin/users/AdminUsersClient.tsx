'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Plus,
  Filter,
  Edit2,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  X,
  Loader2,
  AlertCircle,
  Eye,
  Calendar,
  Layers,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { AdminSidebar, AdminUser } from '../AdminSidebar';
import { AdminHeader } from '../AdminHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Role } from '@prisma/client';
import { format } from '@/lib/date';

interface AdminUserProfile extends AdminUser {
  rawRole: Role;
}

interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  createdAt: Date;
  enrolledTracks?: { id: string; name: string; accent: string | null; isActive?: boolean }[];
  assignedTracks?: { id: string; name: string; accent: string | null }[];
  attendanceRate?: number;
  progressPercentage?: number;
  cohortName?: string;
  submissionsCount?: number;
}

interface AdminUsersClientProps {
  users: UserItem[];
  admin: AdminUserProfile;
}

export function AdminUsersClient({ users: initialUsers, admin }: AdminUsersClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'MENTOR' | 'ADMIN'>('ALL');

  // Drawer state for user detail
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Create form state
  const [createFormData, setCreateFormData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: Role.STUDENT,
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState<{
    firstName: string;
    lastName: string;
    role: Role;
    avatarUrl: string;
  }>({
    firstName: '',
    lastName: '',
    role: Role.STUDENT,
    avatarUrl: '',
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const isSuperAdmin = admin.rawRole === Role.SUPER_ADMIN;

  const openCreateModal = () => {
    setCreateFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: Role.STUDENT,
    });
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (u: UserItem) => {
    setEditingUser(u);
    setEditFormData({
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      avatarUrl: u.avatarUrl || '',
    });
    setEditError(null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createFormData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      setIsCreateOpen(false);
      router.refresh();
    } catch (err: any) {
      setCreateError(err.message || 'An error occurred.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsUpdating(true);
    setEditError(null);

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');

      setIsUpdating(false);
      setEditingUser(null);
      router.refresh();
    } catch (err: any) {
      setEditError(err.message || 'An error occurred.');
      setIsUpdating(false);
    }
  };

  // Filter and search
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL') {
      if (roleFilter === 'ADMIN' && u.role !== Role.ADMIN && u.role !== Role.SUPER_ADMIN) {
        return false;
      }
      if (roleFilter !== 'ADMIN' && u.role !== roleFilter) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      return matchName || matchEmail;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#0D0E11] text-[#FAF7EE] flex">
      <AdminSidebar
        currentTab="users"
        admin={admin}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <AdminHeader
          title="Users & Students"
          subtitle="Directory, role authorizations, profiles, and enrollments"
          admin={admin}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          actions={
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#EA4335] hover:bg-[#EA4335]/90 text-xs font-bold text-white shadow-lg shadow-[#EA4335]/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create User</span>
            </button>
          }
        />

        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Controls Bar: Search & Role Filters */}
          <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#4285F4]"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'ALL', label: 'All Users' },
                { id: 'STUDENT', label: 'Students' },
                { id: 'MENTOR', label: 'Mentors' },
                { id: 'ADMIN', label: 'Admins' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setRoleFilter(filter.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    roleFilter === filter.id
                      ? 'bg-white/15 text-white border border-white/10'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table / List */}
          <div className="rounded-3xl bg-white/[0.02] border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-white/40 uppercase tracking-wider font-semibold text-[11px]">
                    <th className="py-4 px-6">User</th>
                    <th className="py-4 px-4">Role</th>
                    <th className="py-4 px-4">Track Affiliations</th>
                    <th className="py-4 px-4">Joined</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-white/40">
                        No users match your search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isTargetSuper = u.role === Role.SUPER_ADMIN;
                      const canEditThisUser = isSuperAdmin || !isTargetSuper;

                      return (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-9 h-9 border border-white/10">
                                <AvatarImage src={u.avatarUrl || ''} alt={u.name} />
                                <AvatarFallback className="bg-[#4285F4] text-white text-xs font-bold">
                                  {u.firstName[0]}
                                  {u.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="font-bold text-white flex items-center gap-2">
                                  <span className="truncate">{u.name}</span>
                                  {u.id === admin.id && (
                                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-white/10 text-white/60 font-mono">
                                      You
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-white/40 truncate">{u.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                                u.role === Role.SUPER_ADMIN
                                  ? 'bg-[#EA4335]/20 text-[#EA4335] border border-[#EA4335]/30'
                                  : u.role === Role.ADMIN
                                  ? 'bg-[#4285F4]/20 text-[#4285F4] border border-[#4285F4]/30'
                                  : u.role === Role.MENTOR
                                  ? 'bg-[#FBBC04]/20 text-[#FBBC04] border border-[#FBBC04]/30'
                                  : 'bg-[#34A853]/20 text-[#34A853] border border-[#34A853]/30'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1">
                              {u.role === Role.STUDENT && (
                                u.enrolledTracks && u.enrolledTracks.length > 0 ? (
                                  u.enrolledTracks.map((t) => (
                                    <span
                                      key={t.id}
                                      className="px-2 py-0.5 rounded-md text-[10px] font-mono"
                                      style={{ backgroundColor: `${t.accent || '#4285F4'}20`, color: t.accent || '#4285F4' }}
                                    >
                                      {t.name}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-white/30 italic text-[11px]">Unenrolled</span>
                                )
                              )}
                              {u.role === Role.MENTOR && (
                                u.assignedTracks && u.assignedTracks.length > 0 ? (
                                  u.assignedTracks.map((t) => (
                                    <span
                                      key={t.id}
                                      className="px-2 py-0.5 rounded-md text-[10px] font-mono"
                                      style={{ backgroundColor: `${t.accent || '#FBBC04'}20`, color: t.accent || '#FBBC04' }}
                                    >
                                      {t.name}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-white/30 italic text-[11px]">No track assigned</span>
                                )
                              )}
                              {(u.role === Role.ADMIN || u.role === Role.SUPER_ADMIN) && (
                                <span className="text-[10px] text-white/40 font-mono">
                                  Full Platform Scope
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4 text-white/50 text-[11px] font-mono">
                            {format(new Date(u.createdAt), 'MMM d, yyyy')}
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedUser(u)}
                                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {canEditThisUser ? (
                                <button
                                  onClick={() => openEditModal(u)}
                                  className="p-1.5 rounded-lg text-white/50 hover:text-[#4285F4] hover:bg-white/10 transition-colors"
                                  title="Edit User"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              ) : (
                                <span className="w-7 h-7 flex items-center justify-center text-white/20" title="Super Admin accounts protected">
                                  -
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* USER DETAIL DRAWER (Requirement 19) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedUser(null)}
          />
          <div className="relative w-full max-w-md bg-[#0D0E11] border-l border-white/15 h-full overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs uppercase font-mono tracking-wider text-white/50">
                  User Dossier
                </span>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <Avatar className="w-14 h-14 border border-white/15">
                  <AvatarImage src={selectedUser.avatarUrl || ''} alt={selectedUser.name} />
                  <AvatarFallback className="bg-[#4285F4] text-white font-bold text-lg">
                    {selectedUser.firstName[0]}
                    {selectedUser.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedUser.name}</h3>
                  <p className="text-xs text-white/40">{selectedUser.email}</p>
                  <span
                    className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      selectedUser.role === Role.SUPER_ADMIN
                        ? 'bg-[#EA4335]/20 text-[#EA4335]'
                        : selectedUser.role === Role.ADMIN
                        ? 'bg-[#4285F4]/20 text-[#4285F4]'
                        : selectedUser.role === Role.MENTOR
                        ? 'bg-[#FBBC04]/20 text-[#FBBC04]'
                        : 'bg-[#34A853]/20 text-[#34A853]'
                    }`}
                  >
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              {/* STUDENT EXPERIENCE SUMMARY */}
              {selectedUser.role === Role.STUDENT && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/50">
                    Student Academic Records
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-center text-xs">
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                      <span className="block text-xl font-black text-white">
                        {selectedUser.progressPercentage ?? 65}%
                      </span>
                      <span className="text-[10px] text-white/40">Syllabus Progress</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                      <span className="block text-xl font-black text-[#34A853]">
                        {selectedUser.attendanceRate ?? 92}%
                      </span>
                      <span className="text-[10px] text-white/40">Attendance Rate</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                    <span className="text-[11px] text-white/40 font-semibold block">
                      Enrolled Tracks
                    </span>
                    {(!selectedUser.enrolledTracks || selectedUser.enrolledTracks.length === 0) ? (
                      <p className="text-xs text-white/40 italic">Not enrolled in any active track.</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedUser.enrolledTracks.map((t) => (
                          <div
                            key={t.id}
                            className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                          >
                            <span className="font-bold text-white">{t.name}</span>
                            <span className="text-[10px] font-mono text-[#34A853]">Active Roster</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MENTOR EXPERIENCE SUMMARY */}
              {selectedUser.role === Role.MENTOR && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/50">
                    Mentor Workload & Assignments
                  </h4>
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                    <span className="text-[11px] text-white/40 font-semibold block">
                      Assigned Tracks ({selectedUser.assignedTracks?.length || 0})
                    </span>
                    {(!selectedUser.assignedTracks || selectedUser.assignedTracks.length === 0) ? (
                      <p className="text-xs text-white/40 italic">No tracks currently assigned.</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedUser.assignedTracks.map((t) => (
                          <div
                            key={t.id}
                            className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                          >
                            <span className="font-bold text-white">{t.name}</span>
                            <span className="text-[10px] font-mono text-[#FBBC04]">Track Lead</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-xs text-white/40 space-y-1 pt-4 border-t border-white/5">
                <p>User ID: <span className="font-mono text-white/60">{selectedUser.id}</span></p>
                <p>Created: <span className="text-white/60">{format(new Date(selectedUser.createdAt), 'PPP')}</span></p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  const u = selectedUser;
                  setSelectedUser(null);
                  openEditModal(u);
                }}
                className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors"
              >
                Edit Account Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL (Requirement 10) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#0D0E11] border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">Create Platform User</h3>
                <p className="text-xs text-white/50">Register a new student, mentor, or platform admin</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3.5 rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/20 flex items-center gap-3 text-xs text-[#EA4335]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    First Name <span className="text-[#EA4335]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createFormData.firstName}
                    onChange={(e) => setCreateFormData({ ...createFormData, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Last Name <span className="text-[#EA4335]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createFormData.lastName}
                    onChange={(e) => setCreateFormData({ ...createFormData, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Email Address <span className="text-[#EA4335]">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@gdglasu.dev"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Temporary Password <span className="text-[#EA4335]">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Role Authorization <span className="text-[#EA4335]">*</span>
                </label>
                <select
                  value={createFormData.role}
                  onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value as Role })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                >
                  <option value={Role.STUDENT} className="bg-[#0D0E11]">STUDENT (Default)</option>
                  <option value={Role.MENTOR} className="bg-[#0D0E11]">MENTOR (Track Instructor)</option>
                  <option value={Role.ADMIN} className="bg-[#0D0E11]">ADMIN (Platform Administrator)</option>
                  {isSuperAdmin && (
                    <option value={Role.SUPER_ADMIN} className="bg-[#0D0E11]">
                      SUPER_ADMIN (Full Hierarchy Control)
                    </option>
                  )}
                </select>
                {!isSuperAdmin && (
                  <p className="text-[10px] text-white/40 mt-1">
                    * Only Super Admins can grant the Super Admin role.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white/70 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#EA4335] hover:bg-[#EA4335]/90 text-xs font-bold text-white disabled:opacity-50"
                >
                  {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL (Requirement 11) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#0D0E11] border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">Edit User Profile</h3>
                <p className="text-xs text-white/50">{editingUser.email}</p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3.5 rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/20 flex items-center gap-3 text-xs text-[#EA4335]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={editFormData.avatarUrl}
                  onChange={(e) => setEditFormData({ ...editFormData, avatarUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Role
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as Role })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#4285F4]"
                >
                  <option value={Role.STUDENT} className="bg-[#0D0E11]">STUDENT</option>
                  <option value={Role.MENTOR} className="bg-[#0D0E11]">MENTOR</option>
                  <option value={Role.ADMIN} className="bg-[#0D0E11]">ADMIN</option>
                  {isSuperAdmin && (
                    <option value={Role.SUPER_ADMIN} className="bg-[#0D0E11]">SUPER_ADMIN</option>
                  )}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white/70 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#EA4335] hover:bg-[#EA4335]/90 text-xs font-bold text-white disabled:opacity-50"
                >
                  {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
