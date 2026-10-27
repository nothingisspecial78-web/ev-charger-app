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
       bg: 'bg-success-bg text-success-fg border-success/20',
       dot: 'bg-success',
      icon: CheckCircle2,
    },
    busy: {
      label: 'In Use',
       bg: 'bg-warning-bg text-warning-fg border-warning/20',
       dot: 'bg-warning',
      icon: Clock,
    },
    offline: {
      label: 'Offline',
       bg: 'bg-surface-muted text-muted border-border',
       dot: 'bg-muted',
      icon: AlertCircle,
    },
  };

  const config = configs[status] || configs.available;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${config.bg} ${className}`}
      title={`Owner reported status: ${config.label}`}
    >
       <span className={`h-2 w-2 rounded-full ${config.dot}`} />
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
      bg: 'bg-warning-bg text-warning-fg border-warning/20',
      icon: Clock,
      color: 'text-warning',
    },
    approved: {
      label: 'Confirmed Slot',
      bg: 'bg-success-bg text-success-fg border-success/20',
      icon: CheckCircle2,
      color: 'text-success',
    },
    rejected: {
      label: 'Declined',
      bg: 'bg-danger-bg text-danger-fg border-danger/20',
      icon: XCircle,
      color: 'text-danger',
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-surface-muted text-muted border-border',
      icon: AlertCircle,
      color: 'text-muted',
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
      className={`inline-flex items-center gap-1.5 rounded-control border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary transition-colors ${className}`}
    >
      <Zap className="h-3.5 w-3.5 fill-current text-primary" />
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
        isRapid ? 'bg-primary text-accent' : 'border border-border bg-surface text-primary'
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
      className={`inline-flex items-center gap-1 rounded-pill border border-success/20 bg-success-bg px-2 py-0.5 text-xs font-semibold text-success-fg ${className}`}
      title="Host listing verified by platform"
    >
      <ShieldCheck className="w-3 h-3 text-emerald-600" />
      <span>{name ? `Host: ${name.split(' ')[0]}` : 'Verified Host'}</span>
    </span>
  );
};
