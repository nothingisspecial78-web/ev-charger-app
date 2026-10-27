import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Charger, BookingRequest } from '@/types';
import { DataService } from '@/services/dataService';
import { useAuth } from '@/context/AuthContext';
import { ChargerStatusBadge, ConnectorChip, RequestStatusBadge, PowerBadge, VerifiedHostBadge } from '@/components/common/Badges';
import { ErrorState } from '@/components/common/Feedback';
import { getGoogleMapsNavUrl, calculateDistanceKm, estimateDrivingMinutes } from '@/utils/geo';
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
  Navigation,
  ExternalLink,
  Phone,
  Copy,
  Check,
  Sparkles,
  Calculator,
} from 'lucide-react';

export const ChargerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [charger, setCharger] = useState<Charger | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Form state
  const getDefaultStartTime = () => {
    const d = new Date(Date.now() + 1800000); // 30 mins from now
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          setUserCoords({ latitude: 11.2588, longitude: 75.7804 });
        }
      );
    }
  }, []);

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

      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.65 },
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

  const setPresetTime = (minutesFromNow: number) => {
    const d = new Date(Date.now() + minutesFromNow * 60000);
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    setStartTime(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
  };

  const copyPhoneToClipboard = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-[#66736D] animate-pulse">
        <div className="w-12 h-12 border-3 border-[#174D3A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-bold text-[#17231F]">Loading charger specifications...</p>
      </div>
    );
  }

  if (error || !charger) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <ErrorState
          title="Charger Not Found"
          message={error || 'This charger is not currently available.'}
          onRetry={() => navigate('/chargers')}
        />
      </div>
    );
  }

  const dist =
    userCoords && charger.latitude && charger.longitude
      ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, charger.latitude, charger.longitude)
      : null;
  const travelMins = dist ? estimateDrivingMinutes(dist) : null;
  const navUrl = getGoogleMapsNavUrl(charger.latitude, charger.longitude, charger.address);

  // Estimator Calculations
  const estimatedKwh = ((charger.power_kw * (duration / 60)) * 0.9).toFixed(1); // 90% real-world efficiency
  const estimatedCost = charger.price_per_kwh
    ? Math.round(Number(estimatedKwh) * charger.price_per_kwh)
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-2 sm:px-0">
      {/* Breadcrumb Navigation */}
      <div>
        <Link
          to="/chargers"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#174D3A] hover:underline min-h-[38px] group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to All Chargers</span>
        </Link>
      </div>

      {/* Main Grid: Details (Left) + Booking (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Charger Specifications */}
        <div className="lg:col-span-7 space-y-6 min-w-0">
          <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-card space-y-6">
            {/* Header: Title, Tags & Locality */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <PowerBadge powerKw={charger.power_kw} />
                <ChargerStatusBadge status={charger.availability_status} />
                {charger.owner?.display_name && (
                  <VerifiedHostBadge name={charger.owner.display_name} />
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231F] tracking-tight break-words">
                {charger.name}
              </h1>

              <div className="flex items-start gap-2 text-xs sm:text-sm text-[#66736D] mt-2">
                <MapPin className="w-4 h-4 text-[#174D3A] shrink-0 mt-0.5" />
                <span>{charger.address}</span>
              </div>

              {/* Turn-by-Turn Banner */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-[#F5F7F4] p-3.5 rounded-2xl border border-border text-xs">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#174D3A] shrink-0" />
                  <span>
                    {dist !== null ? (
                      <strong>
                        ~{dist.toFixed(1)} km away • ~{travelMins} mins drive from your GPS
                      </strong>
                    ) : (
                      'Coordinates verified on OpenStreetMap'
                    )}
                  </span>
                </div>
                <a
                  href={navUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-border text-[#174D3A] font-bold hover:bg-[#EAF3EF] transition shadow-2xs"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Technical Specs Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#F5F7F4] rounded-2xl p-4 border border-[#E8EDE9]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#66736D]">Peak Output</span>
                <div className="text-xl sm:text-2xl font-extrabold text-[#174D3A] tabular-nums flex items-center gap-1 mt-0.5">
                  <Zap className="w-5 h-5 fill-current text-[#174D3A]" />
                  <span>{charger.power_kw} kW</span>
                </div>
                <span className="text-[10px] text-[#66736D] font-medium">
                  {charger.power_kw >= 50 ? 'Rapid DC Fast Charge' : 'Level 2 Fast AC'}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#66736D]">Tariff Rate</span>
                <div className="text-xl sm:text-2xl font-extrabold text-[#17231F] tabular-nums mt-0.5">
                  {charger.price_per_kwh ? `₹${charger.price_per_kwh}/kWh` : 'Free'}
                </div>
                <span className="text-[10px] text-[#66736D] font-medium">Direct host billing</span>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#66736D]">Booking Policy</span>
                <div className="text-xs font-bold text-emerald-800 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Host Confirmed</span>
                </div>
                <span className="text-[10px] text-[#66736D] font-medium">Zero unexpected queues</span>
              </div>
            </div>

            {/* Connectors */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#66736D] mb-2.5">
                Supported Connector Standards
              </h3>
              <div className="flex flex-wrap gap-2">
                {charger.connector_types.map(c => (
                  <ConnectorChip key={c} connector={c} className="text-sm px-3.5 py-1.5" />
                ))}
              </div>
            </div>

            {/* Description */}
            {charger.description && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#66736D] mb-2">
                  Station Overview
                </h3>
                <p className="text-xs sm:text-sm text-[#17231F] leading-relaxed whitespace-pre-line bg-[#FAFCFA] p-4 rounded-2xl border border-border">
                  {charger.description}
                </p>
              </div>
            )}

            {/* Access & Parking notes */}
            {charger.access_notes && (
              <div className="bg-[#EAF3EF] border border-[#C5DED3] rounded-2xl p-4 space-y-1">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#174D3A]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Gate & Bay Access Instructions</span>
                </div>
                <p className="text-xs text-[#17231F] leading-relaxed">
                  {charger.access_notes}
                </p>
              </div>
            )}

            {/* Host Details & Phone */}
            <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#174D3A] to-[#1F6B50] text-[#C8F169] flex items-center justify-center font-extrabold text-base shadow-xs">
                  {charger.owner?.display_name ? charger.owner.display_name.charAt(0) : 'H'}
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-[#66736D]">Station Host</div>
                  <div className="text-sm font-extrabold text-[#17231F]">
                    {charger.owner?.display_name || 'Community Host'}
                  </div>
                </div>
              </div>

              {charger.owner?.phone && (
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${charger.owner.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF3EF] hover:bg-[#DDF0E7] text-[#174D3A] text-xs font-bold transition shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Host</span>
                  </a>
                  <button
                    onClick={() => copyPhoneToClipboard(charger.owner!.phone!)}
                    className="p-1.5 rounded-xl border border-border text-[#66736D] hover:text-[#17231F] hover:bg-gray-50 transition"
                    title="Copy Phone Number"
                  >
                    {copiedPhone ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Booking Request Form or Success Card */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 w-full">
          {createdRequest ? (
            /* Request Confirmation Card */
            <div className="bg-white rounded-3xl border border-emerald-300 p-6 sm:p-8 shadow-card space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-xl font-extrabold text-[#17231F]">
                  Request Submitted!
                </h2>
                <p className="text-xs text-[#66736D]">
                  Your reservation query has been dispatched to the station host.
                </p>
              </div>

              {/* Summary Details */}
              <div className="bg-[#F5F7F4] rounded-2xl p-4 text-xs space-y-2.5 border border-border">
                <div className="flex justify-between">
                  <span className="text-[#66736D]">Request Ref:</span>
                  <span className="font-mono font-bold text-[#17231F] truncate max-w-[180px]">
                    {createdRequest.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#66736D]">Arrival Time:</span>
                  <span className="font-bold text-[#17231F]">
                    {new Date(createdRequest.requested_start).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#66736D]">Duration:</span>
                  <span className="font-bold text-[#17231F]">
                    {createdRequest.duration_minutes} minutes
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-[#66736D]">Current Status:</span>
                  <RequestStatusBadge status={createdRequest.status} />
                </div>
              </div>

              {/* Navigation button */}
              <a
                href={navUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-3 bg-[#174D3A] hover:bg-[#123D2E] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
              >
                <Navigation className="w-4 h-4 text-[#C8F169]" />
                <span>Open Turn-by-Turn Navigation</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <div className="flex gap-2.5">
                <Link
                  to="/my-requests"
                  className="flex-1 py-3 px-3 text-center rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition shadow-xs flex items-center justify-center min-h-[44px]"
                >
                  Track in My Requests
                </Link>
                <button
                  onClick={() => setCreatedRequest(null)}
                  className="py-3 px-4 rounded-xl text-xs font-bold text-[#66736D] bg-white border border-border hover:bg-gray-50 min-h-[44px]"
                >
                  New Booking
                </button>
              </div>
            </div>
          ) : !user ? (
            /* Guest Prompt: Sign in to request */
            <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-card space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EAF3EF] text-[#174D3A] flex items-center justify-center mx-auto shadow-xs">
                <Zap className="w-7 h-7 fill-current" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#17231F]">
                  Sign In to Reserve Station
                </h2>
                <p className="text-xs text-[#66736D] mt-2 leading-relaxed">
                  Sign in or create a driver profile to request a charging slot at this station.
                </p>
              </div>
              <div className="flex flex-col gap-2.5 pt-2">
                <Link
                  to="/login"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#174D3A] hover:bg-[#123D2E] text-white font-extrabold text-xs sm:text-sm transition shadow-card flex items-center justify-center min-h-[44px]"
                >
                  Sign In to Reserve Slot
                </Link>
                <Link
                  to="/signup"
                  className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-gray-50 border border-border text-[#17231F] font-bold text-xs sm:text-sm transition flex items-center justify-center min-h-[44px]"
                >
                  Create Driver Account
                </Link>
              </div>
            </div>
          ) : (
            /* Request Form */
            <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-card space-y-5">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#174D3A] mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#174D3A]" />
                  <span>Verified Driver Booking</span>
                </div>
                <h2 className="text-xl font-extrabold text-[#17231F] tracking-tight">
                  Request Charging Slot
                </h2>
                <p className="text-xs text-[#66736D] mt-1">
                  Choose your arrival schedule and expected charging window.
                </p>
              </div>

              {formError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                {/* Arrival Schedule with Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#17231F] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#174D3A]" />
                      <span>Arrival Date & Time</span>
                    </label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setPresetTime(15)}
                        className="text-[10px] font-bold text-[#174D3A] hover:underline bg-[#EAF3EF] px-1.5 py-0.5 rounded"
                      >
                        +15m
                      </button>
                      <button
                        type="button"
                        onClick={() => setPresetTime(60)}
                        className="text-[10px] font-bold text-[#174D3A] hover:underline bg-[#EAF3EF] px-1.5 py-0.5 rounded"
                      >
                        +1h
                      </button>
                    </div>
                  </div>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    required
                    className="w-full text-xs sm:text-sm rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-[#174D3A] min-h-[44px] font-medium"
                  />
                </div>

                {/* Duration Pills */}
                <div>
                  <label className="block text-xs font-bold text-[#17231F] mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#174D3A]" />
                    <span>Charging Duration</span>
                  </label>
                  <div className="grid grid-cols-5 gap-1.5 mb-2">
                    {[30, 45, 60, 90, 120].map(mins => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDuration(mins)}
                        className={`py-2 rounded-xl text-xs font-bold transition min-h-[38px] ${
                          duration === mins
                            ? 'bg-[#174D3A] text-white shadow-xs'
                            : 'bg-[#F5F7F4] text-[#66736D] hover:text-[#17231F] hover:bg-[#EAF3EF]'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Estimator Widget (WOW FACTOR) */}
                <div className="bg-gradient-to-br from-[#EAF3EF] to-[#D5E9DF] border border-[#C5DED3] rounded-2xl p-3.5 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-[#174D3A]">
                    <span className="flex items-center gap-1">
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Estimated Session Output</span>
                    </span>
                    <span>~{estimatedKwh} kWh</span>
                  </div>
                  <div className="flex items-center justify-between text-[#66736D] text-[11px]">
                    <span>Estimated Tariff</span>
                    <span className="font-extrabold text-[#17231F] text-xs">
                      {charger.price_per_kwh ? `~₹${estimatedCost}` : 'Free'}
                    </span>
                  </div>
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
                    placeholder="e.g. Tata Nexon EV, 25% SoC, need quick 30-min top up..."
                    rows={2}
                    maxLength={200}
                    className="w-full text-xs sm:text-sm rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-[#174D3A] resize-none"
                  />
                </div>

                {/* Disclaimer */}
                <div className="bg-[#F5F7F4] rounded-xl p-3 text-[11px] text-[#66736D] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Host Confirmation Required:</strong> The host verifies station availability before confirming your slot.
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-4 rounded-xl bg-[#174D3A] hover:bg-[#123D2E] text-white font-extrabold text-sm transition-all shadow-card hover:shadow-elevated flex items-center justify-center gap-2 disabled:opacity-60 min-h-[48px] group"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#C8F169] group-hover:translate-x-0.5 transition-transform" />
                      <span>Request Charging Slot</span>
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
