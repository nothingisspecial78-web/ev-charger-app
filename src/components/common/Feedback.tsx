import React from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';

export const SkeletonCard: React.FC = () => (
  <div className="space-y-4 rounded-card border border-border bg-surface p-6 animate-pulse">
    <div className="flex justify-between items-start gap-4">
      <div className="space-y-2.5 w-2/3">
    <div className="h-5 w-3/4 rounded-lg bg-border"></div>
    <div className="h-3.5 w-1/2 rounded-lg bg-surface-muted"></div>
      </div>
      <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
    </div>
    <div className="h-14 w-full rounded-2xl bg-surface-muted"></div>
    <div className="flex gap-2">
      <div className="h-6 w-20 bg-gray-100 rounded-lg"></div>
      <div className="h-6 w-16 bg-gray-100 rounded-lg"></div>
    </div>
    <div className="h-px bg-gray-100 my-2"></div>
    <div className="flex justify-between items-center pt-2">
      <div className="h-4 w-28 bg-gray-100 rounded"></div>
      <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
    </div>
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}> = ({ title, description, actionText, onAction, icon }) => (
  <div className="mx-auto my-8 flex max-w-lg flex-col items-center justify-center rounded-card border border-border bg-surface p-10 text-center sm:p-14">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary">
      {icon || <AlertCircle className="w-8 h-8" />}
    </div>
    <h3 className="mb-1.5 text-lg font-semibold text-foreground">{title}</h3>
    <p className="mb-7 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
      >
        <span>{actionText}</span>
        <ArrowRight className="h-4 w-4 text-accent" />
      </button>
    )}
  </div>
);

export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Failed to load', message, onRetry }) => (
  <div className="mx-auto my-8 max-w-md rounded-card border border-danger/20 bg-danger-bg p-7 text-center">
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
      <AlertTriangle className="w-7 h-7" />
    </div>
    <h4 className="mb-1 text-lg font-semibold text-danger-fg">{title}</h4>
    <p className="mb-5 text-sm leading-relaxed text-danger-fg">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-control bg-danger px-5 text-sm font-semibold text-white hover:bg-danger-fg"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Try Again</span>
      </button>
    )}
  </div>
);

export const ConfirmModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  noteInput?: boolean;
  notePlaceholder?: string;
  noteLabel?: string;
  noteRequired?: boolean;
  onConfirm: (note?: string) => void;
  onCancel: () => void;
}> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  isDestructive = false,
  noteInput = false,
  notePlaceholder = 'Optional note for the driver...',
  noteLabel = 'Note (optional)',
  noteRequired = false,
  onConfirm,
  onCancel,
}) => {
  const [note, setNote] = React.useState('');
  const dialogRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { if (!isOpen) setNote(''); }, [isOpen]);
  React.useEffect(() => {
    if (!isOpen) return;
    dialogRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onCancel(); return; }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button, textarea, input, [href]')).filter(element => !element.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = previousOverflow; };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4" role="presentation">
      <div ref={dialogRef} className="w-full max-w-md space-y-5 rounded-card border border-border bg-surface p-6 shadow-lg" role="dialog" aria-modal="true" aria-labelledby="confirm-title" tabIndex={-1}>
        <h3 id="confirm-title" className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted">{message}</p>

        {noteInput && (
          <div>
            <label htmlFor="confirm-note" className="mb-1.5 block text-sm font-semibold text-foreground">
              {noteLabel}{noteRequired ? ' *' : ''}
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={notePlaceholder}
              rows={3}
              maxLength={300}
              id="confirm-note"
              required={noteRequired}
              className="min-h-[88px] w-full resize-none rounded-control border border-border bg-surface p-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex min-h-[44px] w-full items-center justify-center rounded-control border border-border px-5 text-sm font-semibold text-foreground hover:bg-surface-muted sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { if (noteRequired && !note.trim()) return; onConfirm(note); }}
            className={`flex min-h-[44px] w-full items-center justify-center rounded-control px-6 text-sm font-semibold text-white sm:w-auto ${isDestructive ? 'bg-danger hover:bg-danger-fg' : 'bg-primary hover:bg-primary-hover'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
