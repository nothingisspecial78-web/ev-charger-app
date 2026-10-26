import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DataService } from '@/services/dataService';
import { BookingRequest } from '@/types';
import { RequestStatusBadge } from '@/components/common/Badges';
import { ConfirmModal } from '@/components/common/Feedback';
import { ListOrdered, Calendar, RotateCcw, AlertTriangle, XOctagon } from 'lucide-react';

export const SuperadminRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancellation override modal
  const [overrideTarget, setOverrideTarget] = useState<BookingRequest | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await DataService.getAllRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleConfirmOverride = async (reason?: string) => {
    if (!overrideTarget || !user) return;
    setProcessing(true);
    try {
      await DataService.superadminCancelRequest(overrideTarget.id, user.id, reason);
      setOverrideTarget(null);
      await fetchRequests();
    } catch (err: any) {
      alert(err?.message || 'Override failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231F] tracking-tight">
            Platform Booking Requests Oversight
          </h1>
          <p className="text-sm text-[#66736D] mt-1">
            Superadmin visibility across all driver queries and host decisions with audit trail logging.
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

      {loading ? (
        <div className="py-12 text-center text-[#66736D] animate-pulse">Loading all platform requests...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F7F4] text-[#66736D] text-xs font-bold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-4 px-6">Request ID / Station</th>
                  <th className="py-4 px-4">Driver</th>
                  <th className="py-4 px-4">Requested Time</th>
                  <th className="py-4 px-4">Duration</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#17231F]">
                        {req.charger?.name || 'Charging Bay'}
                      </div>
                      <div className="text-[11px] font-mono text-[#66736D]">{req.id}</div>
                      {req.driver_note && (
                        <div className="text-xs text-gray-500 italic mt-0.5 line-clamp-1">
                          "{req.driver_note}"
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-xs text-[#17231F]">
                        {req.driver?.display_name || 'Driver'}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs">
                      <div className="flex items-center gap-1 text-[#17231F] font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#174D3A]" />
                        <span>
                          {new Date(req.requested_start).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs font-semibold text-[#17231F]">
                      {req.duration_minutes} mins
                    </td>

                    <td className="py-4 px-4">
                      <RequestStatusBadge status={req.status} />
                    </td>

                    <td className="py-4 px-6 text-right">
                      {req.status !== 'cancelled' && (
                        <button
                          onClick={() => setOverrideTarget(req)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition"
                          title="Platform override cancel"
                        >
                          <XOctagon className="w-3.5 h-3.5" />
                          <span>Cancel Override</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Override Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(overrideTarget)}
        title="Administrative Request Cancellation"
        message={`Are you sure you want to administratively override and cancel request ${overrideTarget?.id}? This action will be recorded in the platform audit log.`}
        confirmLabel={processing ? 'Processing...' : 'Confirm Administrative Cancellation'}
        isDestructive={true}
        noteInput={true}
        notePlaceholder="Reason for override (e.g. Disputed session, safety conflict, host request)..."
        onConfirm={handleConfirmOverride}
        onCancel={() => setOverrideTarget(null)}
      />
    </div>
  );
};
