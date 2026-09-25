'use client';

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string;
  isLoading?: boolean;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  description,
  confirmText,
  confirmLabel,
  cancelText = 'Cancel',
  isLoading = false,
  isDestructive = true,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const handleClose = () => {
    if (onCancel) onCancel();
    else if (onClose) onClose();
  };

  const finalConfirmLabel = confirmLabel || confirmText || (isDestructive ? 'Delete' : 'Confirm');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => !isLoading && handleClose()}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-8 shadow-2xl z-10 space-y-6 animate-in fade-in zoom-in-95">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-[#EA4335]/10 text-[#EA4335] shrink-0 border border-[#EA4335]/20">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-[#0D0E11] tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-[#5F6368] leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5DFD0]">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleClose}
            className="px-5 py-2.5 rounded-full border border-[#E5DFD0] text-xs font-bold text-[#5F6368] hover:bg-[#FAF7EE] hover:text-[#0D0E11] transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EA4335] text-white text-xs font-black hover:bg-[#D93025] transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{finalConfirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
