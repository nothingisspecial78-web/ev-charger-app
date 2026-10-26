import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DataService } from '@/services/dataService';
import { Charger } from '@/types';
import { ChargerStatusBadge, ConnectorChip } from '@/components/common/Badges';
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
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const OwnerChargersPage: React.FC = () => {
  const { user } = useAuth();
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
      alert(err?.message || 'Failed to update publication status');
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
      alert(err?.message || 'Failed to deactivate charger');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231F] tracking-tight">
            My Charger Listings
          </h1>
          <p className="text-sm text-[#66736D] mt-1">
            Publish, edit, and update the specifications of your charging bays.
          </p>
        </div>

        <Link
          to="/owner/chargers/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#174D3A] hover:bg-[#123D2E] text-white text-sm font-semibold transition shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-[#C8F169]" />
          <span>Add Charger</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[#66736D] animate-pulse">
          Loading charger records...
        </div>
      ) : chargers.length === 0 ? (
        <EmptyState
          title="No chargers registered yet"
          description="Create your first listing with connector specifications and availability details."
          actionText="Create Charger"
          onAction={() => (window.location.href = '/owner/chargers/new')}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F7F4] text-[#66736D] text-xs font-bold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-4 px-6">Charger Station</th>
                  <th className="py-4 px-4">Power / Tariff</th>
                  <th className="py-4 px-4">Availability</th>
                  <th className="py-4 px-4">Publication</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {chargers.map(charger => (
                  <tr key={charger.id} className="hover:bg-gray-50/80 transition">
                    {/* Station Name & Area */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#17231F]">{charger.name}</div>
                      <div className="text-xs text-[#66736D] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#174D3A]" />
                        <span>{charger.area || charger.address}</span>
                      </div>
                      <div className="flex gap-1 mt-1.5">
                        {charger.connector_types.map(c => (
                          <span
                            key={c}
                            className="text-[10px] font-semibold bg-[#EAF3EF] text-[#174D3A] px-1.5 py-0.5 rounded"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Power & Price */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#174D3A] flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        {charger.power_kw} kW
                      </div>
                      <div className="text-xs text-[#66736D] mt-0.5">
                        {charger.price_per_kwh ? `₹${charger.price_per_kwh}/kWh` : 'Free'}
                      </div>
                    </td>

                    {/* Availability */}
                    <td className="py-4 px-4">
                      <ChargerStatusBadge status={charger.availability_status} />
                    </td>

                    {/* Publication Toggle */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleTogglePublish(charger)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                          charger.is_published
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        title="Click to toggle public visibility"
                      >
                        {charger.is_published ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-700" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-gray-500" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/owner/chargers/${charger.id}/edit`}
                          className="p-2 rounded-xl text-gray-600 hover:text-[#174D3A] hover:bg-[#EAF3EF] transition"
                          title="Edit Station Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        {charger.is_active && (
                          <button
                            onClick={() => setDeactivatingCharger(charger)}
                            className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
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
