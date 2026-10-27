import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, Clock, FileText, MapPin, Navigation, Send, Zap } from 'lucide-react';
import { Charger, BookingRequest } from '@/types';
import { DataService } from '@/services/dataService';
import { useAuth } from '@/context/AuthContext';
import { ChargerStatusBadge, ConnectorChip, RequestStatusBadge } from '@/components/common/Badges';
import { ErrorState } from '@/components/common/Feedback';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { FormField, fieldClassName } from '@/components/ui/FormField';
import { Textarea } from '@/components/ui/Textarea';
import { getGoogleMapsNavUrl, calculateDistanceKm, estimateDrivingMinutes } from '@/utils/geo';

const defaultStartTime = () => {
  const date = new Date(Date.now() + 1800000);
  date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15, 0, 0);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const ChargerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [charger, setCharger] = useState<Charger | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [startTime, setStartTime] = useState(defaultStartTime());
  const [duration, setDuration] = useState(45);
  const [driverNote, setDriverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdRequest, setCreatedRequest] = useState<BookingRequest | null>(null);

  useEffect(() => { DataService.getChargerById(id || '').then(data => { if (!data) setError('This charger listing is not available.'); else setCharger(data); }).catch(() => setError('We could not load this charger.')).finally(() => setLoading(false)); }, [id]);
  useEffect(() => { if (navigator.geolocation) navigator.geolocation.getCurrentPosition(position => setUserCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude })); }, []);

  const submitRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!charger || !user) return;
    setFormError(null);
    const startTimestamp = new Date(startTime).getTime();
    if (!Number.isFinite(startTimestamp) || startTimestamp <= Date.now()) { setFormError('Choose a future start time.'); return; }
    if (duration < 15 || duration > 720) { setFormError('Duration must be between 15 minutes and 12 hours.'); return; }
    setSubmitting(true);
    try { const request = await DataService.createBookingRequest({ charger_id: charger.id, driver_id: user.id, requested_start: new Date(startTime).toISOString(), duration_minutes: duration, driver_note: driverNote.trim() || undefined }); setCreatedRequest(request); }
    catch (err: unknown) { setFormError(err instanceof Error ? err.message : 'We could not submit your request.'); }
    finally { setSubmitting(false); }
  };
  if (loading) return <div className="space-y-4 py-16"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /><p className="text-center text-sm text-muted">Loading charger details…</p></div>;
  if (error || !charger) return <ErrorState title="Charger not found" message={error || 'This charger is not currently available.'} onRetry={() => navigate('/chargers')} />;

  const distance = userCoords && charger.latitude && charger.longitude ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, charger.latitude, charger.longitude) : null;
  const navUrl = getGoogleMapsNavUrl(charger.latitude, charger.longitude, charger.address);
  const estimateKwh = ((charger.power_kw * (duration / 60)) * 0.9).toFixed(1);
  const estimateCost = charger.price_per_kwh ? Math.round(Number(estimateKwh) * charger.price_per_kwh) : 0;
  const ownCharger = user?.id === charger.owner_id;

  return <div className="mx-auto max-w-6xl space-y-6 pb-8">
    <Link to="/chargers" className="inline-flex min-h-[40px] items-center gap-2 text-sm font-semibold text-primary hover:underline"><ArrowLeft className="h-4 w-4" />Back to chargers</Link>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <Card><CardContent className="space-y-7 sm:p-7">
        <div><div className="flex flex-wrap items-center gap-2"><ChargerStatusBadge status={charger.availability_status} /><span className="text-sm text-muted">Owner-reported status</span></div><h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-[32px]">{charger.name}</h1><p className="mt-2 flex items-start gap-2 text-sm leading-6 text-muted"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{charger.area || charger.address}</p></div>
        <div className="grid grid-cols-3 gap-3 rounded-control bg-surface-muted p-4"><div><p className="text-xs text-muted">Power</p><p className="mt-1 text-lg font-bold tabular-nums">{charger.power_kw} kW</p></div><div><p className="text-xs text-muted">Tariff</p><p className="mt-1 text-lg font-bold tabular-nums">{charger.price_per_kwh ? `₹${charger.price_per_kwh}` : 'Free'}</p><p className="text-xs text-muted">{charger.price_per_kwh ? 'per kWh' : 'no tariff set'}</p></div><div><p className="text-xs text-muted">Connectors</p><p className="mt-1 text-lg font-bold tabular-nums">{charger.connector_types.length}</p></div></div>
        <div><h2 className="text-base font-semibold">Supported connectors</h2><div className="mt-3 flex flex-wrap gap-2">{charger.connector_types.map(connector => <ConnectorChip key={connector} connector={connector} className="text-sm" />)}</div></div>
        {charger.description && <div><h2 className="text-base font-semibold">About this charger</h2><p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted">{charger.description}</p></div>}
        {charger.access_notes && <div className="rounded-control border border-primary-200 bg-primary-50 p-4"><h2 className="text-sm font-semibold text-primary">Access notes</h2><p className="mt-1 text-sm leading-6 text-foreground">{charger.access_notes}</p></div>}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5"><p className="text-sm text-muted">{distance !== null ? `${distance.toFixed(1)} km away · about ${estimateDrivingMinutes(distance)} min drive` : 'Location details provided by the host.'}</p><a href={navUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-2 rounded-control border border-border px-3 text-sm font-semibold text-primary hover:bg-primary-50"><Navigation className="h-4 w-4" />Directions</a></div>
      </CardContent></Card>

      <div className="lg:sticky lg:top-24">{createdRequest ? <Card className="border-success/30"><CardContent className="space-y-5"><div className="text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-success" /><h2 className="mt-3 text-xl font-bold">Request sent</h2><p className="mt-1 text-sm text-muted">The host must confirm your requested time.</p></div><div className="space-y-3 rounded-control bg-surface-muted p-4 text-sm"><div className="flex justify-between gap-3"><span className="text-muted">Reference</span><span className="truncate font-semibold">{createdRequest.id}</span></div><div className="flex justify-between gap-3"><span className="text-muted">Time</span><span className="font-semibold">{new Date(createdRequest.requested_start).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span></div><div className="flex justify-between gap-3"><span className="text-muted">Duration</span><span className="font-semibold">{createdRequest.duration_minutes} min</span></div><div className="flex items-center justify-between border-t border-border pt-3"><span className="text-muted">Status</span><RequestStatusBadge status={createdRequest.status} /></div></div><Link to="/my-requests" className="flex min-h-[44px] items-center justify-center rounded-control bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover">View my requests</Link></CardContent></Card> : ownCharger ? <Card><CardContent className="text-center"><Zap className="mx-auto h-8 w-8 text-primary" /><h2 className="mt-3 text-lg font-semibold">Your charger listing</h2><p className="mt-2 text-sm leading-6 text-muted">Drivers can request this listing. Manage its details from the host workspace.</p><Link to={`/owner/chargers/${charger.id}/edit`} className="mt-4 inline-flex min-h-[44px] items-center rounded-control border border-border px-4 text-sm font-semibold text-primary">Edit listing</Link></CardContent></Card> : !user ? <Card><CardContent className="space-y-4 text-center"><Zap className="mx-auto h-8 w-8 text-primary" /><h2 className="text-lg font-semibold">Sign in to request</h2><p className="text-sm leading-6 text-muted">Create a driver account or sign in to request a charging time.</p><Link to="/login" className="flex min-h-[44px] items-center justify-center rounded-control bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover">Sign in</Link><Link to="/signup" className="flex min-h-[44px] items-center justify-center rounded-control border border-border px-4 text-sm font-semibold">Create driver account</Link></CardContent></Card> : <Card><CardContent><h2 className="text-xl font-bold">Request a charging slot</h2><p className="mt-1 text-sm text-muted">Choose a time and tell the host what to expect.</p>{formError && <div className="mt-4 flex items-start gap-2 rounded-control border border-danger/20 bg-danger-bg p-3 text-sm text-danger-fg" role="alert"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{formError}</div>}<form onSubmit={submitRequest} className="mt-5 space-y-4"><FormField id="request-start" label="Requested start" required><input id="request-start" type="datetime-local" value={startTime} onChange={event => setStartTime(event.target.value)} required className={fieldClassName('text-sm')} /></FormField><fieldset><legend className="text-sm font-semibold">Duration</legend><div className="mt-2 grid grid-cols-5 gap-1.5">{[30, 45, 60, 90, 120].map(value => <button key={value} type="button" aria-pressed={duration === value} onClick={() => setDuration(value)} className={`min-h-[42px] rounded-control text-xs font-semibold ${duration === value ? 'bg-primary text-white' : 'bg-surface-muted text-muted hover:text-foreground'}`}>{value}m</button>)}</div></fieldset><div className="rounded-control bg-surface-muted p-3 text-sm"><div className="flex justify-between"><span className="text-muted">Estimate</span><span className="font-semibold">{charger.price_per_kwh ? `~₹${estimateCost} · ${estimateKwh} kWh` : `${estimateKwh} kWh`}</span></div></div><FormField id="driver-note" label="Note for the host"><Textarea id="driver-note" value={driverNote} onChange={event => setDriverNote(event.target.value)} placeholder="Optional vehicle or arrival note" rows={3} maxLength={200} /></FormField><p className="flex gap-2 text-xs leading-5 text-muted"><Clock className="mt-0.5 h-4 w-4 shrink-0" />This is a request. The host must confirm it.</p><Button type="submit" className="w-full" loading={submitting}><Send className="h-4 w-4" />Request slot</Button></form></CardContent></Card>}</div>
    </div>
  </div>;
};
