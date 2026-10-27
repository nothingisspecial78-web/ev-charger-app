import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DataService } from '@/services/dataService';
import { Charger } from '@/types';
import { ChargerStatusBadge } from '@/components/common/Badges';
import { EmptyState, ConfirmModal } from '@/components/common/Feedback';
import { Link } from 'react-router-dom';
import {
  Zap,
  PlusCircle,
  Edit3,
  Eye,
  EyeOff,
  Trash2,
  MapPin,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { getGoogleMapsNavUrl } from '@/utils/geo';
import { useToast } from '@/components/ui/Toast';
import { useNavigate } from 'react-router-dom';

export const OwnerChargersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState(true);

  // Toggle publish / deactivation
  const [deactivatingCharger, setDeactivatingCharger] = useState<Charger | null>(null);

  const fetchChargers = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await DataService.getOwnerChargers(user.id);
      setChargers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChargers();
  }, [user]);

  const handleTogglePublish = async (charger: Charger) => {
    if (!user) return;
    try {
      const nextPublished = !charger.is_published;
      await DataService.updateCharger(charger.id, user.id, {
        is_published: nextPublished,
      });
      await fetchChargers();
    } catch (err: any) {
      toast(err?.message || 'Failed to update publication status', 'error');
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivatingCharger || !user) return;
    try {
      await DataService.updateCharger(deactivatingCharger.id, user.id, {
        is_active: false,
        is_published: false,
      });
      setDeactivatingCharger(null);
      await fetchChargers();
    } catch (err: any) {
      toast(err?.message || 'Failed to deactivate charger', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-20 w-full max-w-full overflow-hidden px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-primary uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 fill-current text-primary" />
            <span>Charging Stations Portfolio</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            My Charger Listings
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1 font-medium">
            Publish, edit technical specifications, and toggle public visibility for your charging bays.
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

      {loading ? (
        <div className="py-16 text-center text-xs sm:text-sm text-muted animate-pulse">
          <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <span>Loading your charger portfolio...</span>
        </div>
      ) : chargers.length === 0 ? (
        <EmptyState
          title="No charging stations registered yet"
          description="Create your first station listing with power specifications, connectors, and parking instructions."
          actionText="Register Station"
          onAction={() => navigate('/owner/chargers/new')}
        />
      ) : (
        <div className="space-y-5">
          {/* Mobile Card Layout (<768px) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {chargers.map(charger => (
              <div
                key={charger.id}
                className="bg-white rounded-3xl border border-border p-5 shadow-card space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-base text-foreground truncate">{charger.name}</h3>
                    <div className="text-xs text-muted flex items-center gap-1.5 mt-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{charger.area || charger.address}</span>
                    </div>
                  </div>
                  <ChargerStatusBadge status={charger.availability_status} />
                </div>

                <div className="flex items-center justify-between bg-background rounded-2xl p-3 text-xs border border-border">
                  <div>
                    <span className="text-muted block font-semibold">Peak Power</span>
                    <span className="font-extrabold text-primary text-sm">{charger.power_kw} kW</span>
                  </div>
                  <div>
                    <span className="text-muted block font-semibold">Energy Tariff</span>
                    <span className="font-extrabold text-foreground text-sm">
                      {charger.price_per_kwh ? `₹${charger.price_per_kwh}/kWh` : 'Free'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block font-semibold">Visibility</span>
                    <button
                      onClick={() => handleTogglePublish(charger)}
                      className={`font-bold px-2.5 py-1 rounded-full text-xs mt-0.5 transition ${
                        charger.is_published
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {charger.is_published ? 'Published' : 'Draft'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex flex-wrap gap-1">
                    {charger.connector_types.map(c => (
                      <span
                        key={c}
                        className="text-[11px] font-bold bg-primary-50 text-primary px-2 py-0.5 rounded-md"
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/owner/chargers/${charger.id}/edit`}
                      className="p-2.5 rounded-xl text-gray-700 hover:text-primary hover:bg-primary-50 min-h-[40px] min-w-[40px] flex items-center justify-center border border-border transition"
                      title="Edit Charger"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    {charger.is_active && (
                      <button
                        onClick={() => setDeactivatingCharger(charger)}
                        className="p-2.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 min-h-[40px] min-w-[40px] flex items-center justify-center border border-border transition"
                        title="Deactivate Station"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>=768px) */}
          <div className="hidden md:block bg-white rounded-3xl border border-border overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-background text-muted text-xs font-extrabold uppercase tracking-wider border-b border-border">
                  <tr>
                    <th className="py-4 px-6">Charging Station</th>
                    <th className="py-4 px-4">Power / Tariff</th>
                    <th className="py-4 px-4">Bay Availability</th>
                    <th className="py-4 px-4">Public Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/80">
                  {chargers.map(charger => (
                    <tr key={charger.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-5 px-6">
                        <div className="font-extrabold text-foreground text-base">{charger.name}</div>
                        <div className="text-xs text-muted flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{charger.area || charger.address}</span>
                        </div>
                        <div className="flex gap-1.5 mt-2">
                          {charger.connector_types.map(c => (
                            <span
                              key={c}
                              className="text-[11px] font-bold bg-primary-50 text-primary px-2 py-0.5 rounded-md border border-primary-200"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-5 px-4">
                        <div className="font-extrabold text-primary text-base flex items-center gap-1">
                          <Zap className="w-4 h-4 fill-current" />
                          <span>{charger.power_kw} kW</span>
                        </div>
                        <div className="text-xs font-semibold text-muted mt-1">
                          {charger.price_per_kwh ? `₹${charger.price_per_kwh}/kWh` : 'Free'}
                        </div>
                      </td>

                      <td className="py-5 px-4">
                        <ChargerStatusBadge status={charger.availability_status} />
                      </td>

                      <td className="py-5 px-4">
                        <button
                          onClick={() => handleTogglePublish(charger)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-2xs ${
                            charger.is_published
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          title="Click to toggle driver visibility"
                        >
                          {charger.is_published ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                              <span>Draft Only</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/owner/chargers/${charger.id}/edit`}
                            className="p-2.5 rounded-xl text-gray-700 hover:text-primary hover:bg-primary-50 transition border border-border min-h-[38px] min-w-[38px] flex items-center justify-center shadow-2xs"
                            title="Edit Station Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          {charger.is_active && (
                            <button
                              onClick={() => setDeactivatingCharger(charger)}
                              className="p-2.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition border border-border min-h-[38px] min-w-[38px] flex items-center justify-center shadow-2xs"
                              title="Deactivate Station"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Modal */}
      <ConfirmModal
        isOpen={Boolean(deactivatingCharger)}
        title="Deactivate Charging Bay?"
        message={`Are you sure you want to deactivate "${deactivatingCharger?.name}"? Drivers will no longer be able to discover or request sessions.`}
        confirmLabel="Deactivate Station"
        isDestructive={true}
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setDeactivatingCharger(null)}
      />
    </div>
  );
};
