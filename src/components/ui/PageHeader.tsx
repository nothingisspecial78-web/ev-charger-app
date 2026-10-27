import React from 'react';

export const PageHeader: React.FC<{ title: string; description?: string; action?: React.ReactNode }> = ({ title, description, action }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[32px] sm:leading-10">{title}</h1>
      {description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">{description}</p>}
    </div>
    {action}
  </div>
);
