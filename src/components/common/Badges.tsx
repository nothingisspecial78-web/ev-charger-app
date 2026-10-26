import React from 'react';
import { AvailabilityStatus, RequestStatus, ConnectorType } from '@/types';
import { CheckCircle2, Clock, XCircle, AlertCircle, Zap } from 'lucide-react';

export const ChargerStatusBadge: React.FC<{ status: AvailabilityStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const configs = {
    available: {
      label: 'Available',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
    },
    busy: {
      label: 'In Use',
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
      title={`Owner reported status: ${config.label}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
      {config.label}
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
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: Clock,
    },
    approved: {
      label: 'Confirmed Slot',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
    },
    rejected: {
      label: 'Declined',
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: XCircle,
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-gray-100 text-gray-600 border-gray-300',
      icon: AlertCircle,
    },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

export const ConnectorChip: React.FC<{ connector: ConnectorType; className?: string }> = ({
  connector,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#EAF3EF] text-[#174D3A] border border-[#C5DED3] ${className}`}
    >
      <Zap className="w-3 h-3 text-[#174D3A]" />
      {connector}
    </span>
  );
};
