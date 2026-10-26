import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DataService } from '@/services/dataService';
import { BookingRequest, RequestStatus } from '@/types';
import { RequestStatusBadge } from '@/components/common/Badges';
import { ConfirmModal, EmptyState } from '@/components/common/Feedback';
import {
  ListOrdered,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  RotateCcw,
  MessageSquare,
  MapPin,
  Phone,
  Copy,
  Check,
} from 'lucide-react';

export const OwnerRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Filter
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');

  // Decision Modal
  const [selectedReq, setSelectedReq] = useState<BookingRequest | null>(null);
  const [decisionAction, setDecisionAction] = useState<'approve' | 'reject' | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await DataService.getOwnerRequests(user.id);
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const handleDecision = async (note?: string) => {
    if (!selectedReq || !user || !decisionAction) return;
    setProcessing(true);
    try {
      if (decisionAction === 'approve') {
        await DataService.approveBookingRequest(selectedReq.id, user.id, note);
      } else {
        await DataService.rejectBookingRequest(selectedReq.id, user.id, note);
      }
      setSelectedReq(null);
      setDecisionAction(null);
      await fetchRequests();
    } catch (err: any) {
      alert(err?.message || 'Decision failed');
    } finally {
      setProcessing(false);
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
    <div className="space-y-4 sm:space-y-6 pb-16 w-full max-w-full overflow-hidden px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231F] tracking-tight">
            Incoming Driver Requests
          </h1>
          <p className="text-xs sm:text-sm text-[#66736D] mt-1">
            Review driver reservation queries, inspect driver contact info, and grant slot access.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-border text-xs font-semibold text-[#17231F] hover:bg-gray-50 self-start sm:self-auto shadow-xs min-h-[38px]"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Tabs - Horizontally scrollable */}
      <div className="flex gap-2 border-b border-border pb-3 overflow-x-auto no-scrollbar">
        {(['all', 'pending', 'approved', 'rejected', 'cancelled'] as const).map(tab => {
          const count =
            tab === 'all' ? requests.length : requests.filter(r => r.status === tab).length;

          const labels = {
            all: 'All Requests',
            pending: 'Pending',
            approved: 'Approved',
            rejected: 'Declined',
            cancelled: 'Cancelled',
          };

          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap min-h-[36px] ${
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

      {/* Content */}
      {loading ? (
        <div className="py-12 text-center text-xs sm:text-sm text-[#66736D] animate-pulse">
          Loading request queue...
        </div>
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          title={statusFilter === 'all' ? 'No incoming requests' : `No ${statusFilter} requests`}
          description="Driver booking requests for your stations will appear here."
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(req => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-border p-4 sm:p-6 shadow-subtle hover:shadow-card transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-[#17231F] truncate">
                    {req.charger?.name || 'Charging Bay'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#66736D] mt-0.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#174D3A] flex-shrink-0" />
                    <span className="truncate">{req.charger?.area || req.charger?.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  <span className="text-[11px] font-mono text-[#66736D]">
                    ID: {req.id.slice(0, 8)}
                  </span>
                  <RequestStatusBadge status={req.status} />
                </div>
              </div>

              {/* Time & Driver Information (Requirement 2) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 bg-[#F5F7F4] rounded-xl p-3 text-xs">
                <div>
                  <span className="text-[#66736D] block">Driver Contact</span>
                  <div className="font-bold text-[#17231F] flex items-center gap-1.5 mt-0.5">
                    <User className="w-3.5 h-3.5 text-[#174D3A] flex-shrink-0" />
                    <span>{req.driver?.display_name || 'Driver'}</span>
                  </div>
                  {req.driver?.phone && (
                    <div className="mt-1 flex items-center gap-2">
                      <a
                        href={`tel:${req.driver.phone}`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-border text-[11px] font-semibold text-[#174D3A] hover:underline"
                      >
                        <Phone className="w-3 h-3 text-[#174D3A]" />
                        <span>{req.driver.phone}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(req.driver!.phone!)}
                        className="text-gray-400 hover:text-gray-600 p-0.5"
                        title="Copy phone"
                      >
                        {copiedPhone === req.driver.phone ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[#66736D] block">Requested Arrival</span>
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
              </div>

              {/* Driver Note */}
              {req.driver_note && (
                <div className="text-xs bg-gray-50 rounded-xl p-3 text-[#66736D]">
                  <span className="font-semibold text-[#17231F]">Driver Note:</span> "
                  {req.driver_note}"
                </div>
              )}

              {/* Host response note if already decided */}
              {req.owner_response_note && (
                <div className="text-xs bg-[#EAF3EF] border border-[#C5DED3] rounded-xl p-3 text-[#174D3A] flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Your Response:</span> "{req.owner_response_note}"
                  </div>
                </div>
              )}

              {/* Action Buttons for Pending Request */}
              {req.status === 'pending' && (
                <div className="pt-2 flex flex-wrap justify-end gap-2 border-t border-border/80">
                  <button
                    onClick={() => {
                      setSelectedReq(req);
                      setDecisionAction('reject');
                    }}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition min-h-[42px]"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Decline Slot</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedReq(req);
                      setDecisionAction('approve');
                    }}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#174D3A] hover:bg-[#123D2E] transition shadow-xs min-h-[42px]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C8F169]" />
                    <span>Approve Reservation</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Decision Modal */}
      <ConfirmModal
        isOpen={Boolean(selectedReq && decisionAction)}
        title={decisionAction === 'approve' ? 'Approve Driver Reservation?' : 'Decline Driver Request?'}
        message={
          decisionAction === 'approve'
            ? `Confirm charging reservation for ${selectedReq?.driver?.display_name || 'Driver'} at ${new Date(
                selectedReq?.requested_start || ''
              ).toLocaleString()}?`
            : `Decline charging reservation request? You can supply an optional message for the driver.`
        }
        confirmLabel={
          processing
            ? 'Updating...'
            : decisionAction === 'approve'
            ? 'Confirm Approval'
            : 'Confirm Decline'
        }
        isDestructive={decisionAction === 'reject'}
        noteInput={true}
        notePlaceholder={
          decisionAction === 'approve'
            ? 'e.g. Park in Bay #2, code 4920'
            : 'e.g. Bay currently occupied for maintenance'
        }
        onConfirm={handleDecision}
        onCancel={() => {
          setSelectedReq(null);
          setDecisionAction(null);
        }}
      />
    </div>
  );
};
