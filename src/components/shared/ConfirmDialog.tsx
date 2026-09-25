'use client';

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export interface ConfirmDialogProps {
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
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => !isLoading && handleClose()}
      />

      <div className="relative w-full max-w-md rounded-3xl border border-[#E5DFD0] bg-white p-5 sm:p-8 shadow-2xl z-10 space-y-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start gap-3.5 sm:gap-4">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#EA4335]/10 text-[#EA4335] shrink-0 border border-[#EA4335]/20">
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="space-y-1 min-w-0">
            <h3 className="text-base sm:text-lg font-black text-[#0D0E11] tracking-tight break-words">
              {title}
            </h3>
            <p className="text-xs text-[#5F6368] leading-relaxed break-words">
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#E5DFD0] text-xs font-bold text-[#0D0E11] hover:bg-[#FAF7EE] transition-colors disabled:opacity-50 cursor-pointer text-center"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer text-center ${
              isDestructive
                ? 'bg-[#EA4335] hover:bg-[#D93025] text-white shadow-[#EA4335]/20'
                : 'bg-[#0D0E11] hover:bg-[#202124] text-white'
            }`}
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{finalConfirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
