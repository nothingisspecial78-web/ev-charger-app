import React from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-control font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-55',
        { 'bg-primary text-primary-foreground hover:bg-primary-hover': variant === 'primary' },
        { 'border border-border bg-surface text-foreground hover:bg-surface-muted': variant === 'secondary' },
        { 'text-muted hover:bg-primary-50 hover:text-primary': variant === 'ghost' },
        { 'bg-danger text-white hover:bg-danger-fg': variant === 'danger' },
        { 'px-3 text-xs': size === 'sm' },
        { 'px-4 text-sm': size === 'md' },
        { 'px-5 text-base': size === 'lg' },
        className
      )}
      {...props}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
