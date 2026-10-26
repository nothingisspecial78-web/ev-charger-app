import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DataService } from '@/services/dataService';
import { Charger, BookingRequest } from '@/types';
import { MetricCard } from '@/components/common/MetricCard';
import { ChargerStatusBadge, RequestStatusBadge } from '@/components/common/Badges';
import { ConfirmModal, EmptyState } from '@/components/common/Feedback';
import { Link } from 'react-router-dom';
import {
  Zap,
  ListOrdered,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  ArrowRight,
  MapPin,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

export const OwnerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Approve / Reject modal state
  const [selectedReq, setSelectedReq] = useState<BookingRequest | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [chargerList, reqList] = await Promise.all([
        DataService.getOwnerChargers(user.id),
        DataService.getOwnerRequests(user.id),
      ]);
      setChargers(chargerList);
      setRequests(reqList);
    } catch (err) {
      console.error('Owner dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const activeChargers = chargers.filter(c => c.is_published && c.is_active);

  const handleDecision = async (note?: string) => {
    if (!selectedReq || !user || !modalAction) return;
    setProcessing(true);
    try {
      if (modalAction === 'approve') {
        await DataService.approveBookingRequest(selectedReq.id, user.id, note);
      } else {
        await DataService.rejectBookingRequest(selectedReq.id, user.id, note);
      }
      setSelectedReq(null);
      setModalAction(null);
      await fetchData();
    } catch (err: any) {
      alert(err?.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231F] tracking-tight">
            Host Management Hub
          </h1>
          <p className="text-sm text-[#66736D] mt-1">
            Welcome back, {user?.display_name}. Monitor your stations and incoming driver requests.
          </p>
        </div>

        <Link
          to="/owner/chargers/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#174D3A] hover:bg-[#123D2E] text-white text-sm font-semibold transition shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-[#C8F169]" />
          <span>Add New Charger</span>
        </Link>
      </div>

      {/* 1. Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard
          title="Active Listings"
          value={activeChargers.length}
          subtitle={`Out of ${chargers.length} registered stations`}
          icon={<Zap className="w-5 h-5 fill-current" />}
          accentColor="lime"
        />
        <MetricCard
          title="Pending Requests"
          value={pendingRequests.length}
          subtitle="Awaiting your decision"
          icon={<Clock className="w-5 h-5" />}
          accentColor={pendingRequests.length > 0 ? 'amber' : 'primary'}
        />
        <MetricCard
          title="Total Requests"
          value={requests.length}
          subtitle="All-time session queries"
          icon={<ListOrdered className="w-5 h-5" />}
          accentColor="primary"
        />
      </div>

      {/* 2. Priority "Needs Your Attention" Section (WOW FACTOR) */}
      <section className="bg-white rounded-3xl border border-border p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
            <h2 className="text-lg font-bold text-[#17231F]">Needs Your Attention</h2>
          </div>
          <Link
            to="/owner/requests"
            className="text-xs font-semibold text-[#174D3A] hover:underline flex items-center gap-1"
          >
            <span>View All ({requests.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="py-8 text-center text-[#66736D] text-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-semibold text-[#17231F]">You're all caught up!</p>
            <p className="text-xs mt-0.5">No pending driver requests awaiting approval.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map(req => (
              <div
                key={req.id}
                className="bg-[#F5F7F4] rounded-2xl p-4 border border-border/70 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#17231F]">
                      {req.charger?.name || 'Charging Bay'}
                    </span>
                    <RequestStatusBadge status={req.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#66736D]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#174D3A]" />
                      {new Date(req.requested_start).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#174D3A]" />
                      {req.duration_minutes} mins
                    </span>
                    {req.driver?.display_name && (
                      <>
                        <span>•</span>
                        <span>Driver: <strong>{req.driver.display_name}</strong></span>
                      </>
                    )}
                  </div>
                  {req.driver_note && (
                    <p className="text-xs text-[#17231F] italic bg-white/80 p-2 rounded-lg mt-1">
                      "{req.driver_note}"
                    </p>
                  )}
                </div>

                {/* Instant Decision Actions */}
                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => {
                      setSelectedReq(req);
                      setModalAction('reject');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedReq(req);
                      setModalAction('approve');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#174D3A] hover:bg-[#123D2E] transition shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C8F169]" />
                    <span>Approve Slot</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. My Registered Chargers Summary */}
      <section className="bg-white rounded-3xl border border-border p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <h2 className="text-lg font-bold text-[#17231F]">My Charger Listings</h2>
          <Link
            to="/owner/chargers"
            className="text-xs font-semibold text-[#174D3A] hover:underline flex items-center gap-1"
          >
            <span>Manage All ({chargers.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {chargers.length === 0 ? (
          <EmptyState
            title="No chargers registered yet"
            description="Add your first charging bay to start accommodating drivers in your community."
            actionText="Create Charger"
            onAction={() => (window.location.href = '/owner/chargers/new')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chargers.slice(0, 4).map(c => (
              <div
                key={c.id}
                className="bg-[#F5F7F4] rounded-2xl p-4 border border-border/70 flex items-start justify-between gap-3"
              >
                <div>
                  <h3 className="font-bold text-sm text-[#17231F]">{c.name}</h3>
                  <div className="text-xs text-[#66736D] mt-0.5">{c.area || c.address}</div>
                  <div className="flex items-center gap-2 mt-2 text-xs font-semibold">
                    <span className="text-[#174D3A]">{c.power_kw} kW</span>
                    <span className="text-gray-300">•</span>
                    <span>{c.connector_types.join(', ')}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <ChargerStatusBadge status={c.availability_status} />
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.is_published
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {c.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Decision Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(selectedReq && modalAction)}
        title={modalAction === 'approve' ? 'Approve Driver Request?' : 'Decline Driver Request?'}
        message={
          modalAction === 'approve'
            ? `Confirm charging reservation for ${selectedReq?.driver?.display_name || 'Driver'} at ${new Date(selectedReq?.requested_start || '').toLocaleString()}?`
            : `Decline charging reservation request? You can supply an optional message for the driver.`
        }
        confirmLabel={
          processing
            ? 'Updating...'
            : modalAction === 'approve'
            ? 'Confirm Approval'
            : 'Confirm Decline'
        }
        isDestructive={modalAction === 'reject'}
        noteInput={true}
        notePlaceholder={
          modalAction === 'approve'
            ? 'e.g. Park in Bay #2, code 4920'
            : 'e.g. Bay currently occupied for maintenance'
        }
        onConfirm={handleDecision}
        onCancel={() => {
          setSelectedReq(null);
          setModalAction(null);
        }}
      />
    </div>
  );
};
