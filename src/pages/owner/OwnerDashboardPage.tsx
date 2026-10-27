import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DataService } from '@/services/dataService';
import { Charger, BookingRequest } from '@/types';
import { MetricCard } from '@/components/common/MetricCard';
import { ChargerStatusBadge, RequestStatusBadge } from '@/components/common/Badges';
import { ConfirmModal, EmptyState } from '@/components/common/Feedback';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/Toast';
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
  Phone,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const OwnerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

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
      toast(err?.message || 'Action failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhone(text);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 w-full max-w-full overflow-hidden">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-primary uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Host Station Operations</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Host Management Hub
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1 font-medium">
            Welcome back, {user?.display_name}. Monitor your stations, confirm driver slots, and view queue status.
          </p>
        </div>

        <Link
          to="/owner/chargers/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-extrabold transition-all shadow-card hover:shadow-elevated self-start sm:self-auto min-h-[44px]"
        >
          <PlusCircle className="w-4 h-4 text-accent" />
          <span>Add New Charger</span>
        </Link>
      </div>

      {/* 1. Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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
          subtitle="Awaiting your confirmation"
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

      {/* 2. Priority "Needs Your Attention" Section */}
      <section className="bg-white rounded-3xl border border-border p-6 sm:p-7 shadow-card space-y-5">
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <h2 className="text-lg font-extrabold text-foreground">Needs Your Attention</h2>
          </div>
          <Link
            to="/owner/requests"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All Queue ({requests.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="py-10 text-center text-muted text-sm bg-surface-muted rounded-2xl border border-dashed border-border">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2.5" />
            <p className="font-extrabold text-foreground text-base">You're all caught up!</p>
            <p className="text-xs text-muted mt-1">No pending driver requests awaiting approval.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map(req => (
              <div
                key={req.id}
                className="bg-background rounded-2xl p-4 sm:p-5 border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-primary/30"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-extrabold text-base text-foreground truncate">
                      {req.charger?.name || 'Charging Bay'}
                    </span>
                    <RequestStatusBadge status={req.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {new Date(req.requested_start).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {req.duration_minutes} mins
                    </span>
                  </div>

                  {/* Driver contact information */}
                  {req.driver && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="font-bold text-foreground">
                        Driver: {req.driver.display_name}
                      </span>
                      {req.driver.phone && (
                        <div className="inline-flex items-center gap-1.5 bg-white border border-border rounded-lg px-2.5 py-1 text-[11px] font-bold text-primary">
                          <Phone className="w-3 h-3 text-primary" />
                          <a href={`tel:${req.driver.phone}`} className="hover:underline">
                            {req.driver.phone}
                          </a>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(req.driver!.phone!)}
                            className="text-gray-400 hover:text-gray-700 p-0.5 ml-1"
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
                  )}

                  {req.driver_note && (
                    <p className="text-xs text-foreground italic bg-white p-2.5 rounded-xl border border-border/80">
                      "{req.driver_note}"
                    </p>
                  )}
                </div>

                {/* Instant Decision Actions */}
                <div className="flex items-center gap-2.5 self-stretch sm:self-end md:self-auto justify-end">
                  <button
                    onClick={() => {
                      setSelectedReq(req);
                      setModalAction('reject');
                    }}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition min-h-[42px]"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedReq(req);
                      setModalAction('approve');
                    }}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover transition shadow-xs hover:shadow-card min-h-[42px]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                    <span>Confirm Slot</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. My Registered Chargers Summary */}
      <section className="bg-white rounded-3xl border border-border p-6 sm:p-7 shadow-card space-y-5">
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-foreground">My Charger Listings</h2>
            <p className="text-xs text-muted">Manage station availability, tariffs, and technical specifications.</p>
          </div>
          <Link
            to="/owner/chargers"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>Manage All ({chargers.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {chargers.length === 0 ? (
          <EmptyState
            title="No stations registered yet"
            description="Add your first charging bay to begin receiving driver bookings."
            actionText="Register Station"
            onAction={() => navigate('/owner/chargers/new')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chargers.slice(0, 4).map(c => (
              <div
                key={c.id}
                className="bg-background rounded-2xl p-4 sm:p-5 border border-border/80 flex items-start justify-between gap-3 hover:border-primary/40 transition-colors"
              >
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm text-foreground truncate">{c.name}</h3>
                  <div className="text-xs text-muted mt-0.5 truncate">{c.area || c.address}</div>
                  <div className="flex items-center gap-2 mt-2 text-xs font-bold">
                    <span className="text-primary">{c.power_kw} kW</span>
                    <span className="text-gray-300">•</span>
                    <span className="truncate text-gray-700">{c.connector_types.join(', ')}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <ChargerStatusBadge status={c.availability_status} />
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      c.is_published
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
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
        title={modalAction === 'approve' ? 'Confirm Driver Slot?' : 'Decline Driver Request?'}
        message={
          modalAction === 'approve'
            ? `Confirm charging reservation for ${selectedReq?.driver?.display_name || 'Driver'} at ${new Date(
                selectedReq?.requested_start || ''
              ).toLocaleString()}?`
            : `Decline charging reservation request? You can supply an optional note for the driver.`
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
            ? 'e.g. Park in Bay #2, gate code 4920'
            : 'e.g. Bay currently occupied for routine maintenance'
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
