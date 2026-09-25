'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { X, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NavSectionConfig } from '@/constants/navigation';
import { cn } from '@/lib/utils';

export interface AppSidebarUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

interface AppSidebarProps {
  currentTab?: string;
  user: AppSidebarUser;
  sections: NavSectionConfig[];
  badges?: Record<string, number | string | undefined | null>;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  portalName?: string;
  portalBadge?: string;
  extraFooterContent?: React.ReactNode;
}

export function AppSidebar({
  currentTab,
  user,
  sections,
  badges = {},
  isMobileOpen,
  onMobileClose,
  portalName = 'GDG ON CAMPUS LASU',
  portalBadge = 'Bootcamp 2026',
  extraFooterContent,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network failure and redirect anyway
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  const isItemActive = (id: string, href: string) => {
    if (currentTab) return currentTab === id;
    if (pathname === href) return true;
    if (href !== '/dashboard' && href !== '/admin/dashboard' && href !== '/mentor/dashboard') {
      return pathname.startsWith(href);
    }
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[280px] sm:w-72 max-w-[85vw] flex-col bg-[#0D0E11] text-[#FAF7EE] border-r border-[#22242B] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shrink-0 select-none',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-[#22242B]/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1A1C23] border border-[#2D3039] shadow-inner">
              <div className="flex flex-wrap w-5 h-5 gap-1 items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-[#EA4335]" />
                <span className="h-2 w-2 rounded-full bg-[#4285F4]" />
                <span className="h-2 w-2 rounded-full bg-[#34A853]" />
                <span className="h-2 w-2 rounded-full bg-[#FBBC04]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wider uppercase text-[#FAF7EE]">
                  {portalName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34A853] animate-pulse" />
                <span className="text-[10px] font-semibold tracking-wider text-[#FAF7EE]/50 uppercase">
                  {portalBadge}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-xl p-1.5 text-[#FAF7EE]/60 hover:bg-[#1A1C23] hover:text-[#FAF7EE] lg:hidden transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-[#22242B]">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              {section.title && (
                <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-widest text-[#FAF7EE]/40">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const active = isItemActive(item.id, item.href);
                const Icon = item.icon;
                const badgeVal = item.badgeKey ? badges[item.badgeKey] : undefined;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => onMobileClose()}
                    className={cn(
                      'group flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200',
                      active
                        ? 'bg-[#FBBC04] text-[#0D0E11] font-bold shadow-md shadow-[#FBBC04]/10'
                        : 'text-[#FAF7EE]/70 hover:bg-[#1A1C23] hover:text-[#FAF7EE]'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                          active
                            ? 'text-[#0D0E11]'
                            : 'text-[#FAF7EE]/50 group-hover:text-[#FAF7EE]'
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {badgeVal !== undefined && badgeVal !== null && Number(badgeVal) > 0 && (
                      <span
                        className={cn(
                          'ml-2 rounded-full px-2 py-0.5 text-[10px] font-black tracking-wider transition-colors',
                          active
                            ? 'bg-[#0D0E11] text-[#FBBC04]'
                            : item.badgeVariant === 'danger'
                            ? 'bg-[#EA4335] text-white animate-pulse'
                            : 'bg-[#FBBC04]/20 text-[#FBBC04] border border-[#FBBC04]/30'
                        )}
                      >
                        {badgeVal}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {extraFooterContent}
        </div>

        {/* User Profile Footer */}
        <div className="border-t border-[#22242B] p-4 bg-[#0A0B0E]">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/settings"
              onClick={() => onMobileClose()}
              className="flex items-center gap-3 min-w-0 flex-1 rounded-xl p-1.5 -ml-1.5 hover:bg-[#1A1C23] transition-colors"
            >
              <Avatar className="h-9 w-9 rounded-xl border border-[#2D3039]">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-[#4285F4] text-white font-bold text-xs">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-[#FAF7EE] truncate block">
                  {user.name}
                </span>
                <span className="text-[10px] text-[#FAF7EE]/50 font-medium truncate block">
                  {user.role}
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl p-2 text-[#FAF7EE]/50 hover:bg-[#EA4335]/20 hover:text-[#EA4335] transition-colors"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
