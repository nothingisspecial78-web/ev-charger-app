import React from 'react';
import { cn } from '@/lib/utils';

export const Badge: React.FC<React.HTMLAttributes<HTMLSpanElement> & { variant?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' }> = ({ className, variant = 'neutral', ...props }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-semibold',
      { 'border-border bg-surface-muted text-muted': variant === 'neutral' },
      { 'border-primary-200 bg-primary-50 text-primary': variant === 'primary' },
      { 'border-success/20 bg-success-bg text-success-fg': variant === 'success' },
      { 'border-warning/20 bg-warning-bg text-warning-fg': variant === 'warning' },
      { 'border-danger/20 bg-danger-bg text-danger-fg': variant === 'danger' },
      { 'border-info/20 bg-info-bg text-info-fg': variant === 'info' },
      className
    )}
    {...props}
  />
);
