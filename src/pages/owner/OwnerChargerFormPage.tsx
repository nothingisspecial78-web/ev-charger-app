import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DataService } from '@/services/dataService';
import { ConnectorType, AvailabilityStatus, SUPPORTED_CONNECTORS } from '@/types';
import {
  ArrowLeft,
  Zap,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Crosshair,
  Sparkles,
} from 'lucide-react';

export const OwnerChargerFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [latitude, setLatitude] = useState<string>('11.2588');
  const [longitude, setLongitude] = useState<string>('75.7804');
  const [connectors, setConnectors] = useState<ConnectorType[]>(['CCS2']);
  const [powerKw, setPowerKw] = useState<number>(60);
  const [pricePerKwh, setPricePerKwh] = useState<string>('18.5');
  const [accessNotes, setAccessNotes] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('available');
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    if (!isEditing || !id) return;
    const fetchExisting = async () => {
      try {
        const existing = await DataService.getChargerById(id);
        if (!existing) {
          setFormError('Charger not found');
          return;
        }
        setName(existing.name);
        setDescription(existing.description || '');
        setAddress(existing.address);
        setArea(existing.area || '');
        setLatitude(existing.latitude ? String(existing.latitude) : '');
        setLongitude(existing.longitude ? String(existing.longitude) : '');
        setConnectors(existing.connector_types);
        setPowerKw(existing.power_kw);
        setPricePerKwh(existing.price_per_kwh !== undefined && existing.price_per_kwh !== null ? String(existing.price_per_kwh) : '');
        setAccessNotes(existing.access_notes || '');
        setAvailabilityStatus(existing.availability_status);
        setIsPublished(existing.is_published);
      } catch (err: any) {
        setFormError(err?.message || 'Failed to load charger');
      } finally {
        setLoading(false);
      }
    };
    fetchExisting();
  }, [id, isEditing]);

  const toggleConnector = (connector: ConnectorType) => {
    if (connectors.includes(connector)) {
      if (connectors.length === 1) return; // Keep at least one
      setConnectors(connectors.filter(c => c !== connector));
    } else {
      setConnectors([...connectors, connector]);
    }
  };

  const autofillCurrentCoords = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setFormError(null);

    // Validations
    if (!name.trim() || name.trim().length < 3) {
      setFormError('Station name must be at least 3 characters.');
      return;
    }
    if (!address.trim() || address.trim().length < 5) {
      setFormError('Please enter a complete location address.');
      return;
    }
    if (connectors.length === 0) {
      setFormError('Select at least one supported connector standard.');
      return;
    }
    if (powerKw <= 0 || powerKw > 500) {
      setFormError('Power rating must be between 1 and 500 kW.');
      return;
    }

    const latNum = latitude.trim() ? Number(latitude) : undefined;
    const lngNum = longitude.trim() ? Number(longitude) : undefined;
    if (latNum !== undefined && (latNum < -90 || latNum > 90)) {
      setFormError('Latitude must be between -90 and 90.');
      return;
    }
    if (lngNum !== undefined && (lngNum < -180 || lngNum > 180)) {
      setFormError('Longitude must be between -180 and 180.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        address: address.trim(),
        area: area.trim() || null,
        latitude: latNum,
        longitude: lngNum,
        connector_types: connectors,
        power_kw: Number(powerKw),
        price_per_kwh: pricePerKwh.trim() ? Number(pricePerKwh) : null,
        access_notes: accessNotes.trim() || null,
        availability_status: availabilityStatus,
        is_published: isPublished,
        is_active: true,
      };

      if (isEditing && id) {
        await DataService.updateCharger(id, user.id, payload);
      } else {
        await DataService.createCharger(user.id, payload);
      }

      navigate('/owner/chargers');
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save charger listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-muted animate-pulse">
        <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <span>Loading station specifications...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 px-2 sm:px-0">
      <div>
        <Link
          to="/owner/chargers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline mb-2 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to My Chargers</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          {isEditing ? 'Edit Charging Bay' : 'Register New Charger'}
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1 font-medium">
          Configure technical specifications, tariffs, and parking access instructions for EV drivers.
        </p>
      </div>

      {formError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basics */}
        <div className="bg-white rounded-3xl border border-border p-6 sm:p-7 shadow-card space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-primary border-b border-border/80 pb-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Station Identity</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Charger / Station Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Central Market Fast Charge"
              required
              className="w-full text-xs sm:text-sm rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Description & Surrounding Amenities (Optional)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Dedicated parking bay with security guard, 24/7 lighting, café and restrooms 50 meters away..."
              rows={3}
              maxLength={800}
              className="w-full text-xs sm:text-sm rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>

        {/* Section 2: Location */}
        <div className="bg-white rounded-3xl border border-border p-6 sm:p-7 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>2. Location & Coordinates</span>
            </h2>
            <button
              type="button"
              onClick={autofillCurrentCoords}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Use Current GPS</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Complete Physical Address *
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. Plot 14, Commercial Lane, Near Central Market, Kozhikode, Kerala"
              required
              className="w-full text-xs sm:text-sm rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Area / Locality
              </label>
              <input
                type="text"
                value={area}
                onChange={e => setArea(e.target.value)}
                placeholder="e.g. Kozhikode Central"
                className="w-full text-xs sm:text-sm rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Latitude (For Map Pin)
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={e => setLatitude(e.target.value)}
                placeholder="e.g. 11.2588"
                className="w-full text-xs sm:text-sm rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Longitude (For Map Pin)
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={e => setLongitude(e.target.value)}
                placeholder="e.g. 75.7804"
                className="w-full text-xs sm:text-sm rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Charging Details */}
        <div className="bg-white rounded-3xl border border-border p-6 sm:p-7 shadow-card space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-primary border-b border-border/80 pb-2 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>3. Technical Specifications</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-foreground mb-2">
              Supported Connector Types *
            </label>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_CONNECTORS.map(connector => {
                const active = connectors.includes(connector);
                return (
                  <button
                    key={connector}
                    type="button"
                    onClick={() => toggleConnector(connector)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                      active
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-background text-muted border-border hover:text-foreground hover:bg-gray-100'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>{connector}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Max Output Power (kW) *
              </label>
              <input
                type="number"
                min="1"
                max="500"
                step="0.5"
                value={powerKw}
                onChange={e => setPowerKw(Number(e.target.value))}
                required
                className="w-full text-xs sm:text-sm rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-primary font-extrabold text-primary"
              />
              <span className="text-[11px] text-muted mt-1 block">
                {powerKw >= 50 ? 'Classified as Rapid DC Fast Charging' : 'Classified as Level 2 AC Fast Charging'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Current Availability Status
              </label>
              <select
                value={availabilityStatus}
                onChange={e => setAvailabilityStatus(e.target.value as any)}
                className="w-full text-xs sm:text-sm rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-primary font-bold"
              >
                <option value="available">Available Now</option>
                <option value="busy">In Use (Busy)</option>
                <option value="offline">Offline / Maintenance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Access & Pricing */}
        <div className="bg-white rounded-3xl border border-border p-6 sm:p-7 shadow-card space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-primary border-b border-border/80 pb-2 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>4. Access & Energy Tariff</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Tariff Rate per kWh (₹ INR, leave blank if free)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={pricePerKwh}
              onChange={e => setPricePerKwh(e.target.value)}
              placeholder="e.g. 18.5"
              className="w-full text-xs sm:text-sm rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Driveway, Access & Bay Notes
            </label>
            <textarea
              value={accessNotes}
              onChange={e => setAccessNotes(e.target.value)}
              placeholder="e.g. Enter via Gate 2. Guard will unlock Bay #3. Safe turning radius for electric SUVs..."
              rows={3}
              maxLength={500}
              className="w-full text-xs sm:text-sm rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={e => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <span className="text-xs font-bold text-foreground">
                Publish station immediately to driver discovery hub
              </span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-2">
          <Link
            to="/owner/chargers"
            className="w-full sm:w-auto text-center px-6 py-3 rounded-xl border border-border text-sm font-bold text-gray-700 hover:bg-gray-50 transition min-h-[44px] flex items-center justify-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-extrabold transition-all shadow-card hover:shadow-elevated flex items-center justify-center gap-2 disabled:opacity-60 min-h-[44px]"
          >
            <Save className="w-4 h-4 text-accent" />
            <span>{submitting ? 'Saving Station...' : isEditing ? 'Update Listing' : 'Save & Publish Charger'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
