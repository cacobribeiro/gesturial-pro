'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40">
      <div className={clsx('w-full max-w-md rounded-t-3xl bg-white p-5 shadow-soft')}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="text-sm text-muted">
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
