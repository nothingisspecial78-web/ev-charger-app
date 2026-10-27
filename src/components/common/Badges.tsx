import React from 'react';
import { AvailabilityStatus, RequestStatus, ConnectorType } from '@/types';
import { CheckCircle2, Clock, XCircle, AlertCircle, Zap, ShieldCheck } from 'lucide-react';

export const ChargerStatusBadge: React.FC<{ status: AvailabilityStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const configs = {
    available: {
      label: 'Available',
      bg: 'bg-emerald-50 text-emerald-900 border-emerald-200/90 shadow-[0_0_12px_rgba(35,122,75,0.15)]',
      dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(35,122,75,0.8)]',
      icon: CheckCircle2,
    },
    busy: {
      label: 'In Use',
      bg: 'bg-amber-50 text-amber-900 border-amber-200/90 shadow-[0_0_12px_rgba(169,103,18,0.15)]',
      dot: 'bg-amber-500 shadow-[0_0_8px_rgba(169,103,18,0.8)]',
      icon: Clock,
    },
    offline: {
      label: 'Offline',
      bg: 'bg-gray-100 text-gray-700 border-gray-300',
      dot: 'bg-gray-400',
      icon: AlertCircle,
    },
  };

  const config = configs[status] || configs.available;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${config.bg} ${className}`}
      title={`Owner reported status: ${config.label}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
      <span>{config.label}</span>
    </span>
  );
};

export const RequestStatusBadge: React.FC<{ status: RequestStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const configs = {
    pending: {
      label: 'Pending Approval',
      bg: 'bg-amber-50 text-amber-900 border-amber-200/90 shadow-[0_0_12px_rgba(169,103,18,0.12)]',
      icon: Clock,
      color: 'text-amber-700',
    },
    approved: {
      label: 'Confirmed Slot',
      bg: 'bg-emerald-50 text-emerald-900 border-emerald-200/90 shadow-[0_0_12px_rgba(35,122,75,0.15)]',
      icon: CheckCircle2,
      color: 'text-emerald-700',
    },
    rejected: {
      label: 'Declined',
      bg: 'bg-rose-50 text-rose-900 border-rose-200/90 shadow-[0_0_12px_rgba(185,56,56,0.12)]',
      icon: XCircle,
      color: 'text-rose-700',
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: AlertCircle,
      color: 'text-gray-500',
    },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${config.bg} ${className}`}
    >
      <Icon className={`w-3.5 h-3.5 ${config.color}`} />
      <span>{config.label}</span>
    </span>
  );
};

export const ConnectorChip: React.FC<{ connector: ConnectorType; className?: string }> = ({
  connector,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#EAF3EF] text-[#174D3A] border border-[#C5DED3] hover:bg-[#DDF0E7] transition-colors shadow-2xs ${className}`}
    >
      <Zap className="w-3.5 h-3.5 text-[#174D3A] fill-current" />
      <span>{connector}</span>
    </span>
  );
};

export const PowerBadge: React.FC<{ powerKw: number; className?: string }> = ({
  powerKw,
  className = '',
}) => {
  const isRapid = powerKw >= 50;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold ${
        isRapid
          ? 'bg-gradient-to-r from-[#174D3A] to-[#1F6B50] text-[#C8F169] shadow-xs'
          : 'bg-white text-[#174D3A] border border-border shadow-2xs'
      } ${className}`}
    >
      <Zap className="w-3.5 h-3.5 fill-current" />
      <span>{powerKw} kW {isRapid ? 'Rapid DC' : 'AC'}</span>
    </span>
  );
};

export const VerifiedHostBadge: React.FC<{ name?: string; className?: string }> = ({
  name,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}
      title="Host listing verified by platform"
    >
      <ShieldCheck className="w-3 h-3 text-emerald-600" />
      <span>{name ? `Host: ${name.split(' ')[0]}` : 'Verified Host'}</span>
    </span>
  );
};
