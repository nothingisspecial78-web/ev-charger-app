import React from 'react';

export const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor?: 'primary' | 'lime' | 'amber' | 'emerald';
}> = ({ title, value, subtitle, icon, accentColor = 'primary' }) => {
  const accentStyles = {
    primary: 'bg-gradient-to-br from-[#EAF3EF] to-[#D5E9DF] text-[#174D3A] border border-[#C5DED3]',
    lime: 'bg-gradient-to-br from-[#C8F169]/30 to-[#B5DF57]/40 text-[#174D3A] border border-[#C8F169]/50',
    amber: 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 border border-amber-300',
    emerald: 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-900 border border-emerald-300',
  };

  return (
    <div className="bg-white rounded-3xl border border-border p-5 sm:p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-w-0">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#66736D] truncate">
          {title}
        </span>
        <div className={`w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-2xl flex items-center justify-center shadow-2xs ${accentStyles[accentColor]}`}>
          {icon}
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-3xl sm:text-4xl font-extrabold text-[#17231F] tracking-tight truncate tabular-nums">
          {value}
        </div>
        {subtitle && (
          <p className="text-[11px] sm:text-xs text-[#66736D] mt-1 truncate font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
