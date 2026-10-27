import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export const Dialog: React.FC<{
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ open, title, description, onClose, children }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', onKeyDown); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="w-full max-w-md rounded-card border border-border bg-surface p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div><h2 id="dialog-title" className="text-lg font-semibold text-foreground">{title}</h2>{description && <p className="mt-1 text-sm leading-5 text-muted">{description}</p>}</div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Close dialog"><X className="h-4 w-4" /></Button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
};
