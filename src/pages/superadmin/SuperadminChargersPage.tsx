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
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231F] tracking-tight">
            Charger Station Moderation
          </h1>
          <p className="text-sm text-[#66736D] mt-1">
            Superadmin override controls to deactivate problematic listings or reactivate resolved bays.
          </p>
        </div>

        <button
          onClick={fetchChargers}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-border text-xs font-semibold text-[#17231F] hover:bg-gray-50 self-start sm:self-auto shadow-xs"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[#66736D] animate-pulse">Loading stations...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F7F4] text-[#66736D] text-xs font-bold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-4 px-6">Charging Station</th>
                  <th className="py-4 px-4">Host</th>
                  <th className="py-4 px-4">Power / Tariff</th>
                  <th className="py-4 px-4">Platform Status</th>
                  <th className="py-4 px-6 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {chargers.map(charger => (
                  <tr key={charger.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#17231F]">{charger.name}</div>
                      <div className="text-xs text-[#66736D] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#174D3A]" />
                        <span>{charger.address}</span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {charger.connector_types.map(c => (
                          <span
                            key={c}
                            className="text-[10px] font-semibold bg-[#EAF3EF] text-[#174D3A] px-1.5 py-0.2 rounded"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-xs text-[#17231F]">
                        {charger.owner?.display_name || 'Host'}
                      </div>
                      <div className="text-[11px] text-[#66736D]">{charger.owner?.phone || '—'}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-[#174D3A] flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        {charger.power_kw} kW
                      </div>
                      <div className="text-xs text-[#66736D]">
                        {charger.price_per_kwh ? `₹${charger.price_per_kwh}/kWh` : 'Free'}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            charger.is_active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {charger.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                        </span>
                        <div>
                          <ChargerStatusBadge status={charger.availability_status} />
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setModTarget(charger)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          charger.is_active
                            ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{charger.is_active ? 'Deactivate' : 'Reactivate'}</span>
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
            ? `Deactivating "${modTarget?.name}" will remove it from driver discovery immediately. An audit record will be logged.`
            : `Reactivate "${modTarget?.name}" to make it discoverable again for EV drivers?`
        }
        confirmLabel={processing ? 'Processing...' : modTarget?.is_active ? 'Confirm Deactivation' : 'Confirm Reactivation'}
        isDestructive={modTarget?.is_active}
        noteInput={true}
        notePlaceholder="Reason for audit log (e.g. Host unresponsive, safety complaint, verified fix)..."
        onConfirm={handleConfirmModeration}
        onCancel={() => setModTarget(null)}
      />
    </div>
  );
};
