import React, { useState, useEffect } from 'react';
import { BookingRequest, RequestStatus } from '@/types';
import { DataService } from '@/services/dataService';
import { useAuth } from '@/context/AuthContext';
import { RequestStatusBadge } from '@/components/common/Badges';
import { EmptyState, ErrorState, ConfirmModal } from '@/components/common/Feedback';
import { getGoogleMapsNavUrl, calculateDistanceKm, estimateDrivingMinutes } from '@/utils/geo';
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
  Navigation,
  Phone,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const DriverRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User coordinates for live distance calculation
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');

  // Cancel dialog
  const [cancellingRequest, setCancellingRequest] = useState<BookingRequest | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          // Kozhikode default
          setUserCoords({ latitude: 11.2588, longitude: 75.7804 });
        }
      );
    }
  }, []);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhone(text);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const filteredRequests =
    statusFilter === 'all' ? requests : requests.filter(r => r.status === statusFilter);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#174D3A] uppercase tracking-wider mb-1.5">
            <CalendarCheck2 className="w-4 h-4" />
            <span>Driver Session Tracker</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#17231F] tracking-tight">
            My Booking Requests
          </h1>
          <p className="text-xs sm:text-sm text-[#66736D] mt-1 font-medium">
            Monitor host confirmations, access turn-by-turn routes in Google Maps, and contact station owners.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-border text-xs font-bold text-[#17231F] hover:bg-gray-50 self-start sm:self-auto shadow-2xs hover:shadow-xs min-h-[40px] transition-all"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border pb-3 overflow-x-auto no-scrollbar">
        {(['all', 'pending', 'approved', 'rejected', 'cancelled'] as const).map(tab => {
          const count =
            tab === 'all' ? requests.length : requests.filter(r => r.status === tab).length;

          const labels = {
            all: 'All Requests',
            pending: 'Pending Approval',
            approved: 'Confirmed Slots',
            rejected: 'Declined',
            cancelled: 'Cancelled',
          };

          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[38px] ${
                statusFilter === tab
                  ? 'bg-[#174D3A] text-white shadow-xs'
                  : 'bg-white text-[#66736D] border border-border hover:text-[#17231F] hover:bg-gray-50'
              }`}
            >
              <span>{labels[tab]}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  statusFilter === tab ? 'bg-white/20 text-white' : 'bg-[#F5F7F4] text-[#17231F]'
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
          <div className="bg-white rounded-3xl border border-border p-6 animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            <div className="h-12 bg-gray-100 rounded-xl"></div>
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          title={statusFilter === 'all' ? 'No session requests yet' : `No ${statusFilter} requests`}
          description="Browse active chargers on the map and submit your reservation query to local hosts."
          actionText="Discover Stations"
          onAction={() => (window.location.href = '/chargers')}
        />
      ) : (
        <div className="space-y-5">
          {filteredRequests.map(req => {
            const charger = req.charger;
            const dist =
              userCoords && charger?.latitude && charger?.longitude
                ? calculateDistanceKm(
                    userCoords.latitude,
                    userCoords.longitude,
                    charger.latitude,
                    charger.longitude
                  )
                : null;
            const travelMins = dist ? estimateDrivingMinutes(dist) : null;
            const navUrl = getGoogleMapsNavUrl(
              charger?.latitude,
              charger?.longitude,
              charger?.address
            );

            return (
              <div
                key={req.id}
                className={`bg-white rounded-3xl border p-5 sm:p-7 shadow-card transition-all duration-200 space-y-5 ${
                  req.status === 'approved'
                    ? 'border-emerald-300 ring-2 ring-emerald-200/50'
                    : 'border-border'
                }`}
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-lg text-[#17231F] truncate">
                      {charger?.name || 'Charging Station'}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#66736D] mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#174D3A] shrink-0" />
                      <span className="truncate">{charger?.address || charger?.area}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
                    <span className="text-[11px] font-mono font-bold text-[#66736D] bg-gray-100 px-2 py-0.5 rounded-md">
                      Ref: {req.id.slice(0, 8)}
                    </span>
                    <RequestStatusBadge status={req.status} />
                  </div>
                </div>

                {/* APPROVED HERO NAVIGATION BANNER */}
                {req.status === 'approved' && (
                  <div className="bg-gradient-to-r from-[#EAF3EF] to-[#D5EADB] border border-[#A6D5BF] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                          </span>
                          <span className="font-extrabold text-base text-[#174D3A]">
                            Charging Bay Confirmed & Ready!
                          </span>
                        </div>
                        <p className="text-xs text-[#17231F]">
                          {dist !== null ? (
                            <span>
                              Estimated travel time: <strong>~{travelMins} mins</strong> ({dist.toFixed(1)} km)
                            </span>
                          ) : (
                            'Turn-by-turn route available in Google Maps.'
                          )}
                        </p>
                      </div>

                      {/* Google Maps Turn-by-Turn Navigation Button */}
                      <a
                        href={navUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#174D3A] hover:bg-[#123D2E] text-white text-xs sm:text-sm font-extrabold transition shadow-card whitespace-nowrap min-h-[44px]"
                      >
                        <Navigation className="w-4 h-4 text-[#C8F169]" />
                        <span>Navigate in Google Maps</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                      </a>
                    </div>

                    {/* Host Phone Number Sharing */}
                    {charger?.owner?.phone && (
                      <div className="pt-3 border-t border-[#A6D5BF]/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-[#174D3A]">
                          <Phone className="w-4 h-4 text-[#174D3A]" />
                          <span>
                            Host Contact ({charger.owner.display_name?.split(' ')[0]}):{' '}
                            <strong>{charger.owner.phone}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${charger.owner.phone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#A6D5BF] font-bold text-[#174D3A] hover:bg-emerald-50 transition min-h-[34px]"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call Host</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(charger.owner!.phone!)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#A6D5BF] font-bold text-[#174D3A] hover:bg-emerald-50 transition min-h-[34px]"
                            title="Copy host phone number"
                          >
                            {copiedPhone === charger.owner.phone ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedPhone === charger.owner.phone ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Time & Duration Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#F5F7F4] rounded-2xl p-4 text-xs border border-[#E8EDE9]">
                  <div>
                    <span className="text-[#66736D] block font-semibold">Scheduled Slot</span>
                    <span className="font-extrabold text-[#17231F] flex items-center gap-1.5 mt-1">
                      <Calendar className="w-4 h-4 text-[#174D3A]" />
                      {new Date(req.requested_start).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#66736D] block font-semibold">Duration</span>
                    <span className="font-extrabold text-[#17231F] flex items-center gap-1.5 mt-1">
                      <Clock className="w-4 h-4 text-[#174D3A]" />
                      {req.duration_minutes} mins
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[#66736D] block font-semibold">Submitted Time</span>
                    <span className="text-[#17231F] font-bold mt-1 block">
                      {new Date(req.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Driver Note */}
                {req.driver_note && (
                  <div className="text-xs text-[#66736D] bg-[#FAFCFA] rounded-2xl p-3.5 border border-border">
                    <span className="font-bold text-[#17231F]">Your Vehicle Note:</span> "{req.driver_note}"
                  </div>
                )}

                {/* Host Response Note */}
                {req.owner_response_note && (
                  <div className="text-xs bg-[#EAF3EF] border border-[#C5DED3] rounded-2xl p-3.5 text-[#174D3A] flex items-start gap-2.5">
                    <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold">Host Instructions:</span> "{req.owner_response_note}"
                    </div>
                  </div>
                )}

                {/* Action Footer */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border">
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/chargers/${req.charger_id}`}
                      className="text-xs font-bold text-[#174D3A] hover:underline flex items-center gap-1"
                    >
                      <span>View Station Specs</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {req.status !== 'approved' && charger?.latitude && charger?.longitude && (
                      <a
                        href={navUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>Preview on Map</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {req.status === 'pending' && (
                    <button
                      onClick={() => setCancellingRequest(req)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3.5 py-2 rounded-xl transition min-h-[38px] border border-rose-200"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel Request</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Cancelling Request */}
      <ConfirmModal
        isOpen={Boolean(cancellingRequest)}
        title="Cancel Booking Request?"
        message="Are you sure you want to withdraw this charging reservation request? The station host will be notified."
        confirmLabel={cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
        isDestructive={true}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancellingRequest(null)}
      />
    </div>
  );
};
