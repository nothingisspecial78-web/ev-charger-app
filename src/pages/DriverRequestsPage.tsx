import React, { useState, useEffect } from 'react';
import { BookingRequest, RequestStatus } from '@/types';
import { DataService } from '@/services/dataService';
import { useAuth } from '@/context/AuthContext';
import { RequestStatusBadge } from '@/components/common/Badges';
import { EmptyState, ErrorState, ConfirmModal } from '@/components/common/Feedback';
import { Link } from 'react-router-dom';
import {
  CalendarCheck2,
  Clock,
  MapPin,
  Calendar,
  XCircle,
  RotateCcw,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const DriverRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');

  // Cancel dialog
  const [cancellingRequest, setCancellingRequest] = useState<BookingRequest | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await DataService.getDriverRequests(user.id);
      setRequests(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const handleConfirmCancel = async () => {
    if (!cancellingRequest || !user) return;
    setCancelling(true);
    try {
      await DataService.cancelOwnRequest(cancellingRequest.id, user.id);
      setCancellingRequest(null);
      await fetchRequests();
    } catch (err: any) {
      alert(err?.message || 'Failed to cancel request');
    } finally {
      setCancelling(false);
    }
  };

  const filteredRequests = statusFilter === 'all'
    ? requests
    : requests.filter(r => r.status === statusFilter);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#174D3A] uppercase tracking-wider mb-1">
            <CalendarCheck2 className="w-4 h-4" />
            <span>Driver Session Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231F] tracking-tight">
            My Booking Requests
          </h1>
          <p className="text-sm text-[#66736D] mt-1">
            Track real-time status transitions and host confirmations.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-border text-xs font-semibold text-[#17231F] hover:bg-gray-50 self-start sm:self-auto shadow-xs"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {(['all', 'pending', 'approved', 'rejected', 'cancelled'] as const).map(tab => {
          const count = tab === 'all'
            ? requests.length
            : requests.filter(r => r.status === tab).length;

          const labels = {
            all: 'All Requests',
            pending: 'Pending',
            approved: 'Confirmed',
            rejected: 'Declined',
            cancelled: 'Cancelled',
          };

          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === tab
                  ? 'bg-[#174D3A] text-white shadow-xs'
                  : 'bg-white text-[#66736D] border border-border hover:text-[#17231F]'
              }`}
            >
              <span>{labels[tab]}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  statusFilter === tab ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Requests Content */}
      {error ? (
        <ErrorState message={error} onRetry={fetchRequests} />
      ) : loading ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-border p-6 animate-pulse space-y-3">
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-100 rounded w-1/4"></div>
          </div>
          <div className="bg-white rounded-2xl border border-border p-6 animate-pulse space-y-3">
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-100 rounded w-1/4"></div>
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          title={statusFilter === 'all' ? 'No requests yet' : `No ${statusFilter} requests`}
          description="Find a nearby charger listing and submit your first reservation request."
          actionText="Discover Chargers"
          onAction={() => (window.location.href = '/chargers')}
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(req => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-subtle hover:shadow-card transition space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3">
                <div>
                  <h3 className="font-bold text-base text-[#17231F]">
                    {req.charger?.name || 'Charging Station'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#66736D] mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#174D3A]" />
                    <span>{req.charger?.address || req.charger?.area}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[11px] font-mono text-[#66736D]">
                    Ref: {req.id.slice(0, 8)}
                  </span>
                  <RequestStatusBadge status={req.status} />
                </div>
              </div>

              {/* Time & Duration Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#F5F7F4] rounded-xl p-3 text-xs">
                <div>
                  <span className="text-[#66736D] block">Requested Time</span>
                  <span className="font-bold text-[#17231F] flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-[#174D3A]" />
                    {new Date(req.requested_start).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-[#66736D] block">Duration</span>
                  <span className="font-bold text-[#17231F] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-[#174D3A]" />
                    {req.duration_minutes} mins
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[#66736D] block">Submitted</span>
                  <span className="text-[#17231F] mt-0.5 block">
                    {new Date(req.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Driver note */}
              {req.driver_note && (
                <div className="text-xs text-[#66736D] bg-gray-50 rounded-xl p-3">
                  <span className="font-semibold text-[#17231F]">Your Note:</span> "{req.driver_note}"
                </div>
              )}

              {/* Host response note */}
              {req.owner_response_note && (
                <div className="text-xs bg-[#EAF3EF] border border-[#C5DED3] rounded-xl p-3 text-[#174D3A] flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Host Response:</span> "{req.owner_response_note}"
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-border/60">
                <Link
                  to={`/chargers/${req.charger_id}`}
                  className="text-xs font-semibold text-[#174D3A] hover:underline flex items-center gap-1"
                >
                  <span>View Charger Details</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>

                {req.status === 'pending' && (
                  <button
                    onClick={() => setCancellingRequest(req)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Request</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal for Cancelling Request */}
      <ConfirmModal
        isOpen={Boolean(cancellingRequest)}
        title="Cancel Booking Request?"
        message="Are you sure you want to withdraw this charging reservation request? This action cannot be undone."
        confirmLabel={cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
        isDestructive={true}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancellingRequest(null)}
      />
    </div>
  );
};
