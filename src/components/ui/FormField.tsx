import React from 'react';
import { cn } from '@/lib/utils';

export const FormField: React.FC<{
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ id, label, hint, error, required, children }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-semibold text-foreground">
      {label} {required && <span className="text-danger" aria-hidden="true">*</span>}
    </label>
    {children}
    {hint && !error && <p id={`${id}-hint`} className="text-xs text-muted">{hint}</p>}
    {error && <p id={`${id}-error`} className="text-xs font-medium text-danger" role="alert">{error}</p>}
  </div>
);

export const fieldClassName = (className?: string) =>
  cn(
    'min-h-[44px] w-full rounded-control border border-border bg-surface px-3 text-base text-foreground placeholder:text-muted/70 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15',
    className
  );
