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
    <div className="bg-white rounded-2xl border border-border p-5 shadow-subtle hover:shadow-card transition flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#66736D]">{title}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accentStyles[accentColor]}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl font-extrabold text-[#17231F] tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-[#66736D] mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};
