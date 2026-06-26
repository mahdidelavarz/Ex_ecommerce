// src/components/ui/Drawer.tsx
// Slide-in side panel: backdrop + Escape-to-close + body scroll lock.
// Used for the mobile product filter, checkout address form, cart, etc.
'use client';

import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MdiClose } from '@/components/icons/Icons';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Which edge the panel slides in from. Default "left". */
  side?: 'left' | 'right';
  hideClose?: boolean;
}

export default function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  side = 'left',
  hideClose = false,
}: DrawerProps) {
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

  const sidePos =
    side === 'left'
      ? 'left-0 animate-slide-in-left'
      : 'right-0 animate-slide-in-right';

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        className={`absolute top-0 h-full w-full sm:w-96 bg-surface shadow-modal flex flex-col ${sidePos}`}
      >
        {(title || !hideClose) && (
          <div className="flex items-center justify-between gap-4 p-4 border-b border-border shrink-0">
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

        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-border shrink-0">
            {footer}
          </div>
        )}
      </aside>
    </div>,
    document.body
  );
}
