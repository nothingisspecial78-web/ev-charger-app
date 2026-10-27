import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DataService } from '@/services/dataService';
import { Charger } from '@/types';
import { ChargerStatusBadge } from '@/components/common/Badges';
import { ConfirmModal } from '@/components/common/Feedback';
import { Zap, ShieldAlert, CheckCircle2, RotateCcw, MapPin, Power } from 'lucide-react';

export const SuperadminChargersPage: React.FC = () => {
  const { user } = useAuth();
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState(true);

  // Moderation modal
  const [modTarget, setModTarget] = useState<Charger | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchChargers = async () => {
    setLoading(true);
    try {
      const data = await DataService.getAllChargers();
      setChargers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChargers();
  }, []);

  const handleConfirmModeration = async (reason?: string) => {
    if (!modTarget || !user) return;
    setProcessing(true);
    try {
      const newActive = !modTarget.is_active;
      await DataService.moderateCharger(modTarget.id, newActive, user.id, reason);
      setModTarget(null);
      await fetchChargers();
    } catch (err: any) {
      alert(err?.message || 'Moderation action failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#174D3A] uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 fill-current text-[#174D3A]" />
            <span>Station Governance</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#17231F] tracking-tight">
            Charger Station Moderation
          </h1>
          <p className="text-xs sm:text-sm text-[#66736D] mt-1 font-medium">
            Superadmin override controls to deactivate problematic listings or reactivate approved bays.
          </p>
        </div>

        <button
          onClick={fetchChargers}
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
          <span>Loading charging stations...</span>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-card">
          {/* Mobile Card View (< 768px) */}
          <div className="block md:hidden divide-y divide-border/80">
            {chargers.map(charger => (
              <div key={charger.id} className="p-5 space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-[#17231F] text-base leading-snug">{charger.name}</h3>
                    <div className="text-xs text-[#66736D] flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#174D3A] shrink-0" />
                      <span className="truncate">{charger.address}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    <span
                      className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        charger.is_active
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {charger.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                    </span>
                    <ChargerStatusBadge status={charger.availability_status} />
                  </div>
                </div>

                <div className="flex items-center justify-between bg-[#F5F7F4] rounded-2xl p-3 text-xs border border-[#E8EDE9]">
                  <div>
                    <span className="text-[#66736D] block font-semibold">Peak Power</span>
                    <span className="font-extrabold text-[#174D3A] text-sm">{charger.power_kw} kW</span>
                  </div>
                  <div>
                    <span className="text-[#66736D] block font-semibold">Tariff</span>
                    <span className="font-extrabold text-[#17231F] text-sm">
                      {charger.price_per_kwh ? `₹${charger.price_per_kwh}/kWh` : 'Free'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#66736D] block font-semibold">Plugs</span>
                    <span className="font-bold text-[#17231F]">{charger.connector_types.join(', ')}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setModTarget(charger)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition min-h-[40px] ${
                      charger.is_active
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{charger.is_active ? 'Deactivate Bay' : 'Reactivate Bay'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F7F4] text-[#66736D] text-xs font-extrabold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-4 px-6">Station / Location</th>
                  <th className="py-4 px-4">Power / Connectors</th>
                  <th className="py-4 px-4">Tariff</th>
                  <th className="py-4 px-4">System Status</th>
                  <th className="py-4 px-6 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {chargers.map(charger => (
                  <tr key={charger.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-5 px-6">
                      <div className="font-extrabold text-[#17231F] text-base">{charger.name}</div>
                      <div className="text-xs text-[#66736D] flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#174D3A] shrink-0" />
                        <span>{charger.area || charger.address}</span>
                      </div>
                    </td>

                    <td className="py-5 px-4">
                      <div className="font-extrabold text-[#174D3A] flex items-center gap-1">
                        <Zap className="w-4 h-4 fill-current" />
                        <span>{charger.power_kw} kW</span>
                      </div>
                      <div className="text-xs text-[#66736D] mt-0.5 font-medium">
                        {charger.connector_types.join(', ')}
                      </div>
                    </td>

                    <td className="py-5 px-4 font-bold text-[#17231F]">
                      {charger.price_per_kwh ? `₹${charger.price_per_kwh}/kWh` : 'Free'}
                    </td>

                    <td className="py-5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            charger.is_active
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {charger.is_active ? 'ACTIVE' : 'DISABLED'}
                        </span>
                        <ChargerStatusBadge status={charger.availability_status} />
                      </div>
                    </td>

                    <td className="py-5 px-6 text-right">
                      <button
                        onClick={() => setModTarget(charger)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs ${
                          charger.is_active
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{charger.is_active ? 'Disable' : 'Enable'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Moderation Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(modTarget)}
        title={modTarget?.is_active ? 'Deactivate Charging Station?' : 'Reactivate Charging Station?'}
        message={
          modTarget?.is_active
            ? `Are you sure you want to administratively deactivate "${modTarget?.name}"? It will immediately be hidden from driver searches.`
            : `Are you sure you want to restore "${modTarget?.name}"? Drivers will once again be able to discover and request slots.`
        }
        confirmLabel={processing ? 'Updating...' : modTarget?.is_active ? 'Deactivate Station' : 'Reactivate Station'}
        isDestructive={Boolean(modTarget?.is_active)}
        noteInput={true}
        notePlaceholder="Provide moderation audit reason..."
        onConfirm={handleConfirmModeration}
        onCancel={() => setModTarget(null)}
      />
    </div>
  );
};
