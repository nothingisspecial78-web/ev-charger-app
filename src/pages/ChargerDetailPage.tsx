import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Charger, BookingRequest } from '@/types';
import { DataService } from '@/services/dataService';
import { useAuth } from '@/context/AuthContext';
import { ChargerStatusBadge, ConnectorChip, RequestStatusBadge } from '@/components/common/Badges';
import { ErrorState } from '@/components/common/Feedback';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Zap,
  MapPin,
  Clock,
  ShieldCheck,
  Calendar,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
} from 'lucide-react';

export const ChargerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, switchDemoRole } = useAuth();

  const [charger, setCharger] = useState<Charger | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  // Default to 1 hour from now for smooth testing
  const getDefaultStartTime = () => {
    const d = new Date(Date.now() + 3600000);
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
    // Format YYYY-MM-DDTHH:mm
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [startTime, setStartTime] = useState(getDefaultStartTime());
  const [duration, setDuration] = useState(45);
  const [driverNote, setDriverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Success state
  const [createdRequest, setCreatedRequest] = useState<BookingRequest | null>(null);

  useEffect(() => {
    const loadCharger = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await DataService.getChargerById(id);
        if (!data) {
          setError('Charger listing not found or inactive');
        } else {
          setCharger(data);
        }
      } catch (err: any) {
        setError(err?.message || 'Error loading charger details');
      } finally {
        setLoading(false);
      }
    };
    loadCharger();
  }, [id]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!charger || !user) return;

    setFormError(null);

    const startTimestamp = new Date(startTime).getTime();
    if (isNaN(startTimestamp) || startTimestamp <= Date.now()) {
      setFormError('Please select a future start time.');
      return;
    }

    if (duration < 15 || duration > 720) {
      setFormError('Duration must be between 15 minutes and 12 hours.');
      return;
    }

    setSubmitting(true);
    try {
      const newReq = await DataService.createBookingRequest({
        charger_id: charger.id,
        driver_id: user.id,
        requested_start: new Date(startTime).toISOString(),
        duration_minutes: Number(duration),
        driver_note: driverNote.trim() || undefined,
      });

      setCreatedRequest(newReq);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // Safe fallback
      }
    } catch (err: any) {
      setFormError(err?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-[#66736D] animate-pulse">
        <div className="w-10 h-10 border-3 border-[#174D3A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-semibold">Loading charger specifications...</p>
      </div>
    );
  }

  if (error || !charger) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState
          title="Charger Not Found"
          message={error || 'This charger is not currently available.'}
          onRetry={() => navigate('/chargers')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Breadcrumb / Back button */}
      <div>
        <Link
          to="/chargers"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#174D3A] hover:underline mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Charger Discovery</span>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Charger Information & Specs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-card space-y-6">
            {/* Header info */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231F] tracking-tight">
                  {charger.name}
                </h1>
                <ChargerStatusBadge status={charger.availability_status} />
              </div>
              <div className="flex items-center gap-2 text-sm text-[#66736D]">
                <MapPin className="w-4 h-4 text-[#174D3A] flex-shrink-0" />
                <span>{charger.address}</span>
              </div>
            </div>

            {/* Power & Tariff Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#F5F7F4] rounded-2xl p-4">
              <div>
                <span className="text-xs text-[#66736D]">Max Power</span>
                <div className="text-xl font-extrabold text-[#174D3A] flex items-center gap-1 mt-0.5">
                  <Zap className="w-5 h-5 fill-current" />
                  {charger.power_kw} kW
                </div>
              </div>
              <div>
                <span className="text-xs text-[#66736D]">Tariff Rate</span>
                <div className="text-xl font-extrabold text-[#17231F] mt-0.5">
                  {charger.price_per_kwh ? `₹${charger.price_per_kwh}/kWh` : 'Free'}
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-xs text-[#66736D]">Status Mode</span>
                <div className="text-xs font-semibold text-[#17231F] mt-1 capitalize">
                  Owner Reported
                </div>
              </div>
            </div>

            {/* Supported Connectors */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#66736D] mb-2">
                Supported Connector Standards
              </h3>
              <div className="flex flex-wrap gap-2">
                {charger.connector_types.map(c => (
                  <ConnectorChip key={c} connector={c} className="text-sm px-3 py-1" />
                ))}
              </div>
            </div>

            {/* Description */}
            {charger.description && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#66736D] mb-1.5">
                  About This Charging Station
                </h3>
                <p className="text-sm text-[#66736D] leading-relaxed whitespace-pre-line">
                  {charger.description}
                </p>
              </div>
            )}

            {/* Access & Parking notes */}
            {charger.access_notes && (
              <div className="bg-[#EAF3EF] border border-[#C5DED3] rounded-2xl p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#174D3A] mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Access & Bay Instructions</span>
                </div>
                <p className="text-xs text-[#17231F] leading-relaxed">
                  {charger.access_notes}
                </p>
              </div>
            )}

            {/* Host Profile */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#174D3A] text-white flex items-center justify-center font-bold text-sm">
                  {charger.owner?.display_name ? charger.owner.display_name.charAt(0) : 'H'}
                </div>
                <div>
                  <div className="text-xs text-[#66736D]">Station Host</div>
                  <div className="text-sm font-bold text-[#17231F]">
                    {charger.owner?.display_name || 'Verified Community Host'}
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                Verified Host
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Request Form or Success Card */}
        <div className="lg:col-span-5 sticky top-24">
          {createdRequest ? (
            /* Request Confirmation Card (WOW Factor!) */
            <div className="bg-white rounded-3xl border border-emerald-300 p-6 sm:p-8 shadow-card space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-xl font-extrabold text-[#17231F]">
                  Request Submitted!
                </h2>
                <p className="text-xs text-[#66736D]">
                  Your request has been stored in PostgreSQL and forwarded to the host.
                </p>
              </div>

              {/* Summary Details */}
              <div className="bg-[#F5F7F4] rounded-2xl p-4 text-xs space-y-2 border border-border">
                <div className="flex justify-between">
                  <span className="text-[#66736D]">Request Ref:</span>
                  <span className="font-mono font-bold text-[#17231F]">{createdRequest.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#66736D]">Requested Time:</span>
                  <span className="font-semibold text-[#17231F]">
                    {new Date(createdRequest.requested_start).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#66736D]">Duration:</span>
                  <span className="font-semibold text-[#17231F]">
                    {createdRequest.duration_minutes} minutes
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-border">
                  <span className="text-[#66736D]">Status:</span>
                  <RequestStatusBadge status={createdRequest.status} />
                </div>
              </div>

              {/* Hackathon Demo Fast Track */}
              <div className="bg-[#EAF3EF] border border-[#C5DED3] rounded-2xl p-4 space-y-2">
                <div className="font-bold text-xs text-[#174D3A] flex items-center gap-1.5">
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Demo the Owner Decision Loop</span>
                </div>
                <p className="text-xs text-[#17231F] leading-relaxed">
                  Switch to the host account (Kiran) right now to approve this request and verify the persisted status update!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    switchDemoRole('admin');
                    navigate('/owner/requests');
                  }}
                  className="w-full mt-2 py-2 px-3 bg-[#174D3A] text-white rounded-xl text-xs font-bold hover:bg-[#123D2E] transition shadow-xs"
                >
                  Switch to Host & Decide Request →
                </button>
              </div>

              <div className="flex gap-2">
                <Link
                  to="/my-requests"
                  className="flex-1 py-2.5 px-4 text-center rounded-xl bg-white border border-border text-xs font-semibold text-[#17231F] hover:bg-gray-50 transition"
                >
                  View My Requests
                </Link>
                <button
                  onClick={() => setCreatedRequest(null)}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold text-[#66736D] hover:underline"
                >
                  New Request
                </button>
              </div>
            </div>
          ) : (
            /* Request Form */
            <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-card space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-[#17231F]">
                  Request Charging Slot
                </h2>
                <p className="text-xs text-[#66736D] mt-1">
                  Select your expected arrival and duration.
                </p>
              </div>

              {formError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                {/* Requested Start */}
                <div>
                  <label className="block text-xs font-bold text-[#17231F] mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#174D3A]" />
                    <span>Requested Arrival Date & Time</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    required
                    className="w-full text-sm rounded-xl border border-border p-2.5 focus:outline-none focus:ring-2 focus:ring-[#174D3A] focus:border-transparent"
                  />
                  <span className="text-[11px] text-[#66736D] mt-1 block">
                    Must be in the future.
                  </span>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-bold text-[#17231F] mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#174D3A]" />
                    <span>Duration (Minutes)</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    {[30, 45, 60, 90, 120].map(mins => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDuration(mins)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                          duration === mins
                            ? 'bg-[#174D3A] text-white shadow-xs'
                            : 'bg-[#F5F7F4] text-[#66736D] hover:text-[#17231F]'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="15"
                    max="720"
                    step="5"
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    required
                    className="w-full text-sm rounded-xl border border-border p-2.5 focus:outline-none focus:ring-2 focus:ring-[#174D3A] focus:border-transparent"
                  />
                </div>

                {/* Driver Vehicle / Note */}
                <div>
                  <label className="block text-xs font-bold text-[#17231F] mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#174D3A]" />
                    <span>Driver Note / Vehicle Model (Optional)</span>
                  </label>
                  <textarea
                    value={driverNote}
                    onChange={e => setDriverNote(e.target.value)}
                    placeholder="e.g. Tata Nexon EV, 20% SoC remaining, arriving at 4:30 PM..."
                    rows={3}
                    maxLength={300}
                    className="w-full text-sm rounded-xl border border-border p-2.5 focus:outline-none focus:ring-2 focus:ring-[#174D3A] focus:border-transparent resize-none"
                  />
                </div>

                {/* Disclaimer */}
                <div className="bg-[#F5F7F4] rounded-xl p-3 text-[11px] text-[#66736D] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Notice:</strong> This is a booking request. The charger host must approve your session before your slot is confirmed.
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#174D3A] hover:bg-[#123D2E] text-white font-bold text-sm transition shadow-card flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Persisting to Database...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#C8F169]" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
