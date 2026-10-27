import React from 'react';

export const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor?: 'primary' | 'lime' | 'amber' | 'emerald';
}> = ({ title, value, subtitle, icon, accentColor = 'primary' }) => {
  const accentStyles = { primary: 'text-primary', lime: 'text-primary', amber: 'text-warning', emerald: 'text-success' };

  return (
    <div className="flex min-w-0 flex-col justify-between rounded-card border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="truncate text-sm font-semibold text-muted">
          {title}
        </span>
        <div className={`shrink-0 ${accentStyles[accentColor]}`}>
          {icon}
        </div>
      </div>
      <div className="min-w-0">
        <div className="truncate text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {value}
        </div>
        {subtitle && (
          <p className="mt-1 truncate text-sm text-muted">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
