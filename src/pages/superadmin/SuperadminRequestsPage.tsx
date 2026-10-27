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
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#174D3A] uppercase tracking-wider mb-1">
            <ListOrdered className="w-4 h-4 text-[#174D3A]" />
            <span>Audit Trail & Oversight</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#17231F] tracking-tight">
            Platform Booking Requests Oversight
          </h1>
          <p className="text-xs sm:text-sm text-[#66736D] mt-1 font-medium">
            Superadmin visibility across all driver queries and host decisions with audit trail logging.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-border text-xs font-bold text-[#17231F] hover:bg-gray-50 self-start sm:self-auto shadow-2xs hover:shadow-xs min-h-[40px] transition-all"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs sm:text-sm text-[#66736D] animate-pulse">
          <div className="w-10 h-10 border-3 border-[#174D3A] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <span>Loading all platform requests...</span>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-card">
          {/* Mobile Card View (< 768px) */}
          <div className="block md:hidden divide-y divide-border/80">
            {requests.map(req => (
              <div key={req.id} className="p-5 space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-[#17231F] text-base leading-snug">{req.charger?.name || 'Charging Bay'}</h3>
                    <div className="text-xs text-[#66736D] mt-0.5 truncate">
                      Driver: {req.driver?.display_name || 'Anonymous'}
                    </div>
                  </div>
                  <RequestStatusBadge status={req.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 bg-[#F5F7F4] rounded-2xl p-3 text-xs border border-[#E8EDE9]">
                  <div>
                    <span className="text-[#66736D] block font-semibold">Scheduled Start</span>
                    <span className="font-bold text-[#17231F]">
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
                    <span className="font-bold text-[#17231F]">{req.duration_minutes} mins</span>
                  </div>
                </div>

                {req.status === 'pending' && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setOverrideTarget(req)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition min-h-[38px]"
                    >
                      <XOctagon className="w-3.5 h-3.5" />
                      <span>Admin Cancel Override</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F7F4] text-[#66736D] text-xs font-extrabold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-4 px-6">Charging Bay</th>
                  <th className="py-4 px-4">Driver / Requester</th>
                  <th className="py-4 px-4">Requested Schedule</th>
                  <th className="py-4 px-4">Duration</th>
                  <th className="py-4 px-4">State</th>
                  <th className="py-4 px-6 text-right">Superadmin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-5 px-6">
                      <div className="font-extrabold text-[#17231F] text-base">{req.charger?.name || 'Charging Bay'}</div>
                      <div className="text-[11px] font-mono text-[#66736D]">ID: {req.id.slice(0, 8)}</div>
                    </td>

                    <td className="py-5 px-4">
                      <div className="font-bold text-[#17231F]">{req.driver?.display_name || 'Driver'}</div>
                      <div className="text-xs text-[#66736D]">{req.driver?.phone || 'No phone'}</div>
                    </td>

                    <td className="py-5 px-4 font-semibold text-[#17231F] text-xs">
                      {new Date(req.requested_start).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-5 px-4 font-extrabold text-[#174D3A] text-xs">
                      {req.duration_minutes} mins
                    </td>

                    <td className="py-5 px-4">
                      <RequestStatusBadge status={req.status} />
                    </td>

                    <td className="py-5 px-6 text-right">
                      {req.status === 'pending' ? (
                        <button
                          onClick={() => setOverrideTarget(req)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition shadow-2xs"
                        >
                          <XOctagon className="w-3.5 h-3.5" />
                          <span>Override Cancel</span>
                        </button>
                      ) : (
                        <span className="text-xs text-[#66736D] font-medium">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancellation Override Modal */}
      <ConfirmModal
        isOpen={Boolean(overrideTarget)}
        title="Override & Cancel Booking Request?"
        message={`As Superadmin, you are cancelling request ${overrideTarget?.id.slice(0, 8)} on behalf of the platform. This action is recorded in audit logs.`}
        confirmLabel={processing ? 'Cancelling...' : 'Confirm Admin Override'}
        isDestructive={true}
        noteInput={true}
        notePlaceholder="Audit reason for cancellation override..."
        onConfirm={handleConfirmOverride}
        onCancel={() => setOverrideTarget(null)}
      />
    </div>
  );
};
