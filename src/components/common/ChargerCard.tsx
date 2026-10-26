import React from 'react';
import { Charger } from '@/types';
import { ChargerStatusBadge, ConnectorChip } from './Badges';
import { MapPin, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ChargerCard: React.FC<{
  charger: Charger;
  onSelectOnMap?: (charger: Charger) => void;
}> = ({ charger, onSelectOnMap }) => {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 hover:border-[#174D3A]/40 transition-all duration-200 hover:shadow-card flex flex-col justify-between group">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-bold text-base text-[#17231F] group-hover:text-[#174D3A] transition">
              {charger.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-[#66736D] mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#174D3A] flex-shrink-0" />
              <span className="truncate">{charger.area || charger.address}</span>
            </div>
          </div>
          <ChargerStatusBadge status={charger.availability_status} />
        </div>

        {/* Specs & Power */}
        <div className="flex items-center gap-3 bg-[#F5F7F4] rounded-xl p-3 my-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#174D3A] shadow-xs">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="text-xs text-[#66736D]">Power</div>
              <div className="text-sm font-bold text-[#17231F]">{charger.power_kw} kW</div>
            </div>
          </div>

          <div className="h-6 w-px bg-border"></div>

          <div>
            <div className="text-xs text-[#66736D]">Tariff</div>
            <div className="text-sm font-bold text-[#17231F]">
              {charger.price_per_kwh ? `₹${charger.price_per_kwh}/kWh` : 'Free / Host Spec'}
            </div>
          </div>
        </div>

        {/* Connectors */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {charger.connector_types.map(c => (
            <ConnectorChip key={c} connector={c} />
          ))}
        </div>

        {charger.access_notes && (
          <p className="text-xs text-[#66736D] line-clamp-1 italic mb-4">
            "{charger.access_notes}"
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-border/80 flex items-center justify-between gap-2 mt-auto">
        {charger.owner?.display_name ? (
          <span className="text-[11px] text-[#66736D] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Host: {charger.owner.display_name.split(' ')[0]}</span>
          </span>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          {onSelectOnMap && charger.latitude && charger.longitude && (
            <button
              type="button"
              onClick={() => onSelectOnMap(charger)}
              className="text-xs font-semibold text-[#174D3A] hover:underline px-2 py-1"
            >
              Pin
            </button>
          )}

          <Link
            to={`/chargers/${charger.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#174D3A] hover:bg-[#123D2E] text-white text-xs font-semibold transition shadow-xs"
          >
            <span>Request Slot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
