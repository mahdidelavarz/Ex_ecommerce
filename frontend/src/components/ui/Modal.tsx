// src/components/ui/Modal.tsx
// Centered modal dialog: backdrop + Escape-to-close + body scroll lock.
// Replaces the hand-rolled `fixed inset-0 z-50` overlays scattered in pages.
'use client';

import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MdiClose } from '@/components/icons/Icons';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  /** Footer area (e.g. action buttons), pinned below the body. */
  footer?: ReactNode;
  /** Max width preset for the panel. */
  size?: 'sm' | 'md' | 'lg';
  /** Hide the default close (×) button in the header. */
  hideClose?: boolean;
}

const sizeClass = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  hideClose = false,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${sizeClass[size]} bg-surface rounded-card shadow-modal animate-fade-in max-h-[90vh] flex flex-col`}
      >
        {(title || !hideClose) && (
          <div className="flex items-center justify-between gap-4 p-4 border-b border-border">
            <h2 className="text-lg font-bold text-text-primary">{title}</h2>
            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="بستن"
                className="p-2 hover:bg-surface-raised rounded-button transition-colors shrink-0"
              >
                <MdiClose className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        <div className="p-4 overflow-y-auto">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
