'use client';

import React from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AdminUser } from './AdminSidebar';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu: () => void;
  admin: AdminUser;
  actions?: React.ReactNode;
}

export function AdminHeader({
  title,
  subtitle,
  onOpenMobileMenu,
  admin,
  actions,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-gdg-black/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 -ml-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-black text-gdg-cream tracking-tight flex items-center gap-2 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-white/50 font-medium truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {actions && <div className="flex items-center gap-2">{actions}</div>}

          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="text-right">
              <p className="text-xs font-bold text-gdg-cream">{admin.name}</p>
              <div className="flex items-center justify-end gap-1 text-[11px] text-gdg-yellow">
                <ShieldCheck className="w-3 h-3" />
                <span>{admin.role}</span>
              </div>
            </div>
            <Avatar className="w-8 h-8 border border-white/20">
              <AvatarImage src={admin.avatar} alt={admin.name} />
              <AvatarFallback className="bg-gdg-red text-white font-bold text-xs">
                {admin.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
