'use client';

import React from 'react';
import { AlertTriangle, Info, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export type DialogVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string | null;
  isLoading?: boolean;
  isDestructive?: boolean;
  variant?: DialogVariant;
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
  variant,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const handleClose = () => {
    if (onCancel) onCancel();
    else if (onClose) onClose();
  };

  const effectiveVariant: DialogVariant =
    variant || (isDestructive ? 'danger' : 'info');

  const finalConfirmLabel =
    confirmLabel ||
    confirmText ||
    (effectiveVariant === 'danger' ? 'Delete' : effectiveVariant === 'success' ? 'Great!' : 'Confirm');

  // Icon & color styling based on variant
  const getVariantStyles = () => {
    switch (effectiveVariant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />,
          iconBg: 'bg-gdg-red/10 text-gdg-red border-gdg-red/20',
          confirmBtn: 'bg-gdg-red hover:bg-gdg-red-dark text-white shadow-gdg-red/20',
        };
      case 'warning':
        return {
          icon: <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />,
          iconBg: 'bg-gdg-yellow/15 text-gdg-yellow-dark border-gdg-yellow/30',
          confirmBtn: 'bg-gdg-black hover:bg-gdg-dark-hover text-white',
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />,
          iconBg: 'bg-gdg-green/10 text-gdg-green border-gdg-green/20',
          confirmBtn: 'bg-gdg-green hover:bg-gdg-green-dark text-white shadow-gdg-green/20',
        };
      case 'info':
      default:
        return {
          icon: <Info className="h-5 w-5 sm:h-6 sm:w-6" />,
          iconBg: 'bg-gdg-blue/10 text-gdg-blue border-gdg-blue/20',
          confirmBtn: 'bg-gdg-blue hover:bg-gdg-blue-dark text-white shadow-gdg-blue/20',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => !isLoading && handleClose()}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md rounded-3xl border border-gdg-border bg-white p-6 sm:p-8 shadow-2xl z-10 space-y-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start gap-3.5 sm:gap-4">
          <div className={`p-2.5 sm:p-3 rounded-2xl shrink-0 border ${styles.iconBg}`}>
            {styles.icon}
          </div>
          <div className="space-y-1.5 min-w-0">
            <h3 className="text-base sm:text-lg font-black text-gdg-black tracking-tight wrap-break-word">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-gdg-gray leading-relaxed wrap-break-word">
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2 border-t border-gdg-border/50">
          {cancelText && (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gdg-border text-xs font-bold text-gdg-black hover:bg-gdg-cream transition-colors disabled:opacity-50 cursor-pointer text-center"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer text-center ${styles.confirmBtn}`}
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{finalConfirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
