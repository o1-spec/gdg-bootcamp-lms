'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { X, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network failure and redirect anyway
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
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

      {/* Desktop spacer to reserve layout width in parent flex container */}
      <div className="hidden lg:block w-70 sm:w-72 shrink-0 select-none pointer-events-none" aria-hidden="true" />

      {/* Sidebar Container: Fixed to the screen */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-70 sm:w-72 max-w-[85vw] flex-col bg-gdg-black text-gdg-cream border-r border-gdg-dark-border transition-transform duration-300 ease-in-out select-none',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between px-5 border-b border-gdg-dark-border/80 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group min-w-0 transition-transform hover:scale-[1.02]">
            <div className="bg-white rounded-xl px-2 py-1 flex items-center justify-center shadow-xs border border-white/10 shrink-0">
              <Image
                src="/GDGOC-LASU-logo.webp"
                alt="GDG on Campus LASU"
                width={120}
                height={24}
                className="h-6 w-auto object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black tracking-wider uppercase text-gdg-cream block truncate">
                {portalBadge}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gdg-green animate-pulse shrink-0" />
                <span className="text-[9px] font-bold tracking-wider text-gdg-cream/50 uppercase">
                  Active
                </span>
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-xl p-1.5 text-gdg-cream/60 hover:bg-[#1A1C23] hover:text-gdg-cream lg:hidden transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-gdg-dark-border">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              {section.title && (
                <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-widest text-gdg-cream/40">
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
                        ? 'bg-gdg-yellow text-gdg-black font-bold shadow-md shadow-gdg-yellow/10'
                        : 'text-gdg-cream/70 hover:bg-[#1A1C23] hover:text-gdg-cream'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                          active
                            ? 'text-gdg-black'
                            : 'text-gdg-cream/50 group-hover:text-gdg-cream'
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {badgeVal !== undefined && badgeVal !== null && Number(badgeVal) > 0 && (
                      <span
                        className={cn(
                          'ml-2 rounded-full px-2 py-0.5 text-[10px] font-black tracking-wider transition-colors',
                          active
                            ? 'bg-gdg-black text-gdg-yellow'
                            : item.badgeVariant === 'danger'
                              ? 'bg-gdg-red text-white animate-pulse'
                              : 'bg-gdg-yellow/20 text-gdg-yellow border border-gdg-yellow/30'
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
        <div className="border-t border-gdg-dark-border p-4 bg-[#0A0B0E] shrink-0">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/settings"
              onClick={() => onMobileClose()}
              className="flex items-center gap-3 min-w-0 flex-1 rounded-xl p-1.5 -ml-1.5 hover:bg-[#1A1C23] transition-colors"
            >
              <Avatar className="h-9 w-9 rounded-xl border border-[#2D3039]">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-gdg-blue text-white font-bold text-xs">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-gdg-cream truncate block">
                  {user.name}
                </span>
                <span className="text-[10px] text-gdg-cream/50 font-medium truncate block">
                  {user.role}
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="rounded-xl p-2 text-gdg-cream/50 hover:bg-gdg-red/20 hover:text-gdg-red transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <ConfirmDialog
        isOpen={showLogoutModal}
        onClose={() => !isLoggingOut && setShowLogoutModal(false)}
        onCancel={() => !isLoggingOut && setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Log Out of Bootcamp?"
        description="Are you sure you want to end your session? You will be signed out from your learning portal and redirected to the login screen."
        confirmLabel="Yes, Log Out"
        cancelText="Stay Signed In"
        variant="danger"
        isLoading={isLoggingOut}
      />
    </>
  );
}
