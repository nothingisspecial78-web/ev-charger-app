import React from 'react';
import { Charger } from '@/types';
import { ChargerStatusBadge, ConnectorChip } from './Badges';
import { MapPin, Zap, ArrowRight, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistance } from '@/utils/geo';

export const ChargerCard: React.FC<{
  charger: Charger;
  onSelectOnMap?: (charger: Charger) => void;
  isSelected?: boolean;
}> = ({ charger, onSelectOnMap, isSelected = false }) => (
  <article className={`flex w-full min-w-0 flex-col justify-between rounded-card border bg-surface p-5 transition-colors ${isSelected ? 'border-primary ring-2 ring-primary' : 'border-border hover:border-primary/40'}`}>
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-foreground sm:text-lg">{charger.name}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm text-muted">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{charger.area || charger.address}</span>
            {charger.distanceKm !== undefined && <><span aria-hidden="true">·</span><span>{formatDistance(charger.distanceKm)}</span></>}
          </div>
        </div>
        <ChargerStatusBadge status={charger.availability_status} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 rounded-control bg-surface-muted p-3">
        <div><p className="text-xs text-muted">Power</p><p className="mt-1 flex items-center gap-1 text-lg font-bold tabular-nums text-foreground"><Zap className="h-4 w-4 fill-current text-primary" />{charger.power_kw} kW</p></div>
        <div><p className="text-xs text-muted">Tariff</p><p className="mt-1 text-base font-semibold tabular-nums text-foreground">{charger.price_per_kwh ? `₹${charger.price_per_kwh}/kWh` : 'Free'}</p></div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">{charger.connector_types.map(connector => <ConnectorChip key={connector} connector={connector} />)}</div>
    </div>
    <div className="mt-5 flex items-center justify-between gap-2 border-t border-border pt-4">
      {onSelectOnMap && charger.latitude && charger.longitude ? <button type="button" onClick={() => onSelectOnMap(charger)} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-control px-2 text-sm font-semibold text-primary hover:bg-primary-50"><Navigation className="h-4 w-4" />Map</button> : <span />}
      <Link to={`/chargers/${charger.id}`} className="inline-flex min-h-[44px] items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover">View details<ArrowRight className="h-4 w-4 text-accent" /></Link>
    </div>
  </article>
);
