import React from 'react';
import { Charger } from '@/types';
import { ChargerStatusBadge, ConnectorChip } from './Badges';
import { MapPin, Zap, ArrowRight, ShieldCheck, Navigation, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getGoogleMapsNavUrl, formatDistance } from '@/utils/geo';

export const ChargerCard: React.FC<{
  charger: Charger;
  onSelectOnMap?: (charger: Charger) => void;
  userCoords?: { latitude: number; longitude: number } | null;
}> = ({ charger, onSelectOnMap, userCoords }) => {
  const navUrl = getGoogleMapsNavUrl(charger.latitude, charger.longitude, charger.address);

  return (
    <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 hover:border-[#174D3A]/40 transition-all duration-200 hover:shadow-card flex flex-col justify-between group w-full min-w-0">
      <div className="min-w-0">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base text-[#17231F] group-hover:text-[#174D3A] transition break-words">
              {charger.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-[#66736D] mt-1 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-[#174D3A] flex-shrink-0" />
              <span className="truncate max-w-[220px] sm:max-w-xs">{charger.area || charger.address}</span>
              {charger.distanceKm !== undefined && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#C8F169]/30 text-[#174D3A]">
                  <Navigation className="w-3 h-3 text-[#174D3A]" />
                  {formatDistance(charger.distanceKm)}
                </span>
              )}
            </div>
          </div>
          <div className="self-start sm:self-auto flex-shrink-0">
            <ChargerStatusBadge status={charger.availability_status} />
          </div>
        </div>

        {/* Specs & Power */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4 bg-[#F5F7F4] rounded-xl p-2.5 sm:p-3 my-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#174D3A] shadow-xs flex-shrink-0">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="text-[11px] sm:text-xs text-[#66736D]">Power</div>
              <div className="text-sm font-bold text-[#17231F]">{charger.power_kw} kW</div>
            </div>
          </div>

          <div className="h-6 w-px bg-border"></div>

          <div>
            <div className="text-[11px] sm:text-xs text-[#66736D]">Tariff</div>
            <div className="text-sm font-bold text-[#17231F]">
              {charger.price_per_kwh ? `₹${charger.price_per_kwh}/kWh` : 'Free'}
            </div>
          </div>

          {charger.latitude && charger.longitude && (
            <>
              <div className="h-6 w-px bg-border hidden xs:block"></div>
              <a
                href={navUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xs:inline-flex items-center gap-1 text-[11px] font-semibold text-[#174D3A] hover:underline ml-auto"
                title="Open location in Google Maps"
              >
                <Navigation className="w-3 h-3" />
                <span>Google Maps</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </>
          )}
        </div>

        {/* Connectors */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {charger.connector_types.map(c => (
            <ConnectorChip key={c} connector={c} />
          ))}
        </div>

        {charger.access_notes && (
          <p className="text-xs text-[#66736D] line-clamp-1 italic mb-3">
            "{charger.access_notes}"
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-border/80 flex flex-wrap items-center justify-between gap-2 mt-auto">
        {charger.owner?.display_name ? (
          <span className="text-[11px] text-[#66736D] flex items-center gap-1 truncate max-w-[140px] sm:max-w-none">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="truncate">Host: {charger.owner.display_name.split(' ')[0]}</span>
          </span>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2 ml-auto">
          {onSelectOnMap && charger.latitude && charger.longitude && (
            <button
              type="button"
              onClick={() => onSelectOnMap(charger)}
              className="text-xs font-semibold text-[#174D3A] hover:bg-[#EAF3EF] px-2.5 py-1.5 rounded-lg transition min-h-[36px]"
            >
              Pin on Map
            </button>
          )}

          <Link
            to={`/chargers/${charger.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#174D3A] hover:bg-[#123D2E] text-white text-xs font-semibold transition shadow-xs min-h-[38px] justify-center"
          >
            <span>Request Slot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
