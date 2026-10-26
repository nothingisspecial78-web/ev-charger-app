import React from 'react';

export const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor?: 'primary' | 'lime' | 'amber' | 'emerald';
}> = ({ title, value, subtitle, icon, accentColor = 'primary' }) => {
  const accentStyles = {
    primary: 'bg-[#EAF3EF] text-[#174D3A]',
    lime: 'bg-[#C8F169]/30 text-[#174D3A]',
    amber: 'bg-amber-100 text-amber-800',
    emerald: 'bg-emerald-100 text-emerald-800',
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-3.5 sm:p-5 shadow-subtle hover:shadow-card transition flex flex-col justify-between min-w-0">
      <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#66736D] truncate">{title}</span>
        <div className={`w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl flex items-center justify-center ${accentStyles[accentColor]}`}>
          {icon}
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-2xl sm:text-3xl font-extrabold text-[#17231F] tracking-tight truncate">{value}</div>
        {subtitle && <p className="text-[11px] sm:text-xs text-[#66736D] mt-0.5 sm:mt-1 truncate">{subtitle}</p>}
      </div>
    </div>
  );
};
