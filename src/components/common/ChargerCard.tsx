import React from 'react';
import { Charger } from '@/types';
import { ChargerStatusBadge, ConnectorChip, PowerBadge, VerifiedHostBadge } from './Badges';
import { MapPin, Zap, ArrowRight, Navigation, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getGoogleMapsNavUrl, formatDistance, estimateDrivingMinutes } from '@/utils/geo';

export const ChargerCard: React.FC<{
  charger: Charger;
  onSelectOnMap?: (charger: Charger) => void;
  userCoords?: { latitude: number; longitude: number } | null;
  isSelected?: boolean;
}> = ({ charger, onSelectOnMap, userCoords, isSelected = false }) => {
  const navUrl = getGoogleMapsNavUrl(charger.latitude, charger.longitude, charger.address);
  const drivingMins = charger.distanceKm !== undefined ? estimateDrivingMinutes(charger.distanceKm) : null;

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between group w-full min-w-0 ${
        isSelected
          ? 'border-[#174D3A] ring-2 ring-[#174D3A]/20 shadow-card bg-emerald-50/20'
          : 'border-border hover:border-[#174D3A]/40 hover:shadow-card hover:-translate-y-0.5'
      } p-4 sm:p-5`}
    >
      <div className="min-w-0">
        {/* Top Header: Name, Locality, Availability Badge */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <PowerBadge powerKw={charger.power_kw} />
              {charger.owner?.display_name && (
                <VerifiedHostBadge name={charger.owner.display_name} />
              )}
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-[#17231F] group-hover:text-[#174D3A] transition-colors break-words leading-snug">
              {charger.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-[#66736D] mt-1.5 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-[#174D3A] flex-shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{charger.area || charger.address}</span>
              {charger.distanceKm !== undefined && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF3EF] text-[#174D3A] border border-[#C5DED3]">
                  <Navigation className="w-3 h-3 text-[#174D3A]" />
                  <span>{formatDistance(charger.distanceKm)}</span>
                  {drivingMins && <span className="text-[#66736D] font-normal">• ~{drivingMins}m drive</span>}
                </span>
              )}
            </div>
          </div>
          <div className="self-start sm:self-auto flex-shrink-0">
            <ChargerStatusBadge status={charger.availability_status} />
          </div>
        </div>

        {/* Specs Box: Power, Tariff & Google Maps Quick Link */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#F5F7F4] rounded-xl p-3 my-3 border border-[#E8EDE9]">
          <div>
            <div className="text-[11px] font-medium text-[#66736D]">Power Output</div>
            <div className="text-sm font-extrabold text-[#17231F] tabular-nums mt-0.5">
              {charger.power_kw} kW
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-[#66736D]">Energy Tariff</div>
            <div className="text-sm font-extrabold text-[#17231F] tabular-nums mt-0.5">
              {charger.price_per_kwh ? `₹${charger.price_per_kwh}/kWh` : 'Free'}
            </div>
          </div>

          {charger.latitude && charger.longitude && (
            <div className="col-span-2 sm:col-span-1 flex items-center sm:justify-end">
              <a
                href={navUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#174D3A] hover:text-[#123D2E] hover:underline"
                title="Open location in Google Maps"
              >
                <Navigation className="w-3.5 h-3.5 text-[#174D3A]" />
                <span>Directions</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Connectors */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {charger.connector_types.map(c => (
            <ConnectorChip key={c} connector={c} />
          ))}
        </div>

        {/* Access Notes */}
        {charger.access_notes && (
          <p className="text-xs text-[#66736D] line-clamp-1 italic mb-3 bg-amber-50/50 px-2 py-1 rounded-md border border-amber-100/80">
            "{charger.access_notes}"
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-border/80 flex flex-wrap items-center justify-between gap-2 mt-auto">
        <div className="text-[11px] text-[#66736D] flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Host confirmation required</span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {onSelectOnMap && charger.latitude && charger.longitude && (
            <button
              type="button"
              onClick={() => onSelectOnMap(charger)}
              className="text-xs font-semibold text-[#174D3A] hover:bg-[#EAF3EF] px-3 py-2 rounded-xl transition-colors min-h-[38px]"
            >
              Pin on Map
            </button>
          )}

          <Link
            to={`/chargers/${charger.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#174D3A] hover:bg-[#123D2E] text-white text-xs font-bold transition shadow-xs hover:shadow-card min-h-[38px] justify-center group/btn"
          >
            <span>Request Slot</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C8F169] group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
