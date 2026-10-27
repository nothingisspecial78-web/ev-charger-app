import React from 'react';
import { cn } from '@/lib/utils';

export const Tabs: React.FC<{ value: string; onChange: (value: string) => void; items: { value: string; label: string; count?: number }[] }> = ({ value, onChange, items }) => (
  <div className="flex gap-1 overflow-x-auto border-b border-border no-scrollbar" role="tablist">
    {items.map(item => (
      <button
        key={item.value}
        type="button"
        role="tab"
        aria-selected={value === item.value}
        onClick={() => onChange(item.value)}
        className={cn('min-h-[44px] whitespace-nowrap border-b-2 px-3 text-sm font-semibold transition-colors', value === item.value ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground')}
      >
        {item.label}{item.count !== undefined && <span className="ml-1.5 rounded-pill bg-surface-muted px-1.5 py-0.5 text-xs tabular-nums">{item.count}</span>}
      </button>
    ))}
  </div>
);
