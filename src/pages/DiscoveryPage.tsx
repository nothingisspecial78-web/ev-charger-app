import React, { useEffect, useState } from 'react';
import { Charger, ChargerFilters, ConnectorType, AvailabilityStatus } from '@/types';
import { DataService } from '@/services/dataService';
import { ChargerCard } from '@/components/common/ChargerCard';
import { ChargerMap } from '@/components/common/ChargerMap';
import { SkeletonCard, EmptyState, ErrorState } from '@/components/common/Feedback';
import { calculateDistanceKm } from '@/utils/geo';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import { Search, Map, List, LayoutPanelLeft, X, Crosshair, SlidersHorizontal } from 'lucide-react';

type ViewMode = 'split' | 'list' | 'map';

export const DiscoveryPage: React.FC = () => {
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [query, setQuery] = useState('');
  const [connector, setConnector] = useState<ConnectorType | 'all'>('all');
  const [minPower, setMinPower] = useState<number | 'all'>('all');
  const [status, setStatus] = useState<AvailabilityStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'nearest' | 'power_desc' | 'power_asc' | 'price_asc' | 'name_asc'>('nearest');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      position => { setUserCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude }); setLocating(false); },
      () => { setLocating(false); },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  useEffect(() => { detectLocation(); }, []);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true); setError(null);
      try {
        const filters: ChargerFilters = { query: query.trim() || undefined, connector, minPower, status, sortBy };
        const data = await DataService.getPublishedChargers(filters);
        const enriched = data.map(charger => userCoords && charger.latitude && charger.longitude
          ? { ...charger, distanceKm: calculateDistanceKm(userCoords.latitude, userCoords.longitude, charger.latitude, charger.longitude) }
          : charger);
        if (sortBy === 'nearest' && userCoords) enriched.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
        setChargers(enriched);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'We could not load chargers right now.');
      } finally { setLoading(false); }
    }, query ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [query, connector, minPower, status, sortBy, userCoords, retryKey]);

  const clearAllFilters = () => { setQuery(''); setConnector('all'); setMinPower('all'); setStatus('all'); setSortBy('nearest'); setSelectedCharger(null); };
  const activeFilters = [
    query ? { label: `Search: ${query}`, clear: () => setQuery('') } : null,
    connector !== 'all' ? { label: connector, clear: () => setConnector('all') } : null,
    minPower !== 'all' ? { label: `${minPower} kW+`, clear: () => setMinPower('all') } : null,
    status !== 'all' ? { label: status === 'available' ? 'Available' : status === 'busy' ? 'In use' : 'Offline', clear: () => setStatus('all') } : null,
  ].filter(Boolean) as { label: string; clear: () => void }[];
  const hasActiveFilters = activeFilters.length > 0;
  const viewItems: { value: ViewMode; label: string; icon: React.ElementType }[] = [
    { value: 'split', label: 'Split', icon: LayoutPanelLeft }, { value: 'list', label: 'List', icon: List }, { value: 'map', label: 'Map', icon: Map },
  ];

  return (
    <div className="space-y-6 pb-8">
      <PageHeader title="Find your next charge" description="Compare owner-reported charger details and request a time that works for you." action={<Button type="button" variant="secondary" size="sm" onClick={detectLocation} disabled={locating} aria-label="Use my location"><Crosshair className="h-4 w-4" />{locating ? 'Locating…' : <span className="hidden xs:inline">Near me</span>}</Button>} />
      <section className="rounded-card border border-border bg-surface p-4 sm:p-5">
        <form onSubmit={event => event.preventDefault()} className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search area, address, or charger name" aria-label="Search chargers" className="min-h-[48px] pl-11 pr-11" />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-surface-muted hover:text-foreground"><X className="h-4 w-4" /></button>}
        </form>
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-muted"><SlidersHorizontal className="h-4 w-4" />Filters</span>
          <Select value={connector} onChange={event => setConnector(event.target.value as ConnectorType | 'all')} className="min-h-[40px] w-auto shrink-0 rounded-pill px-3"><option value="all">Connector</option>{(['CCS2', 'Type 2', 'GB/T', 'CHAdeMO', 'Tesla'] as ConnectorType[]).map(value => <option key={value} value={value}>{value}</option>)}</Select>
          <Select value={minPower} onChange={event => setMinPower(event.target.value === 'all' ? 'all' : Number(event.target.value))} className="min-h-[40px] w-auto shrink-0 rounded-pill px-3"><option value="all">Power</option><option value="22">22 kW+</option><option value="50">50 kW+</option><option value="60">60 kW+</option></Select>
          <Select value={status} onChange={event => setStatus(event.target.value as AvailabilityStatus | 'all')} className="min-h-[40px] w-auto shrink-0 rounded-pill px-3"><option value="all">Status</option><option value="available">Available</option><option value="busy">In use</option><option value="offline">Offline</option></Select>
          <Select value={sortBy} onChange={event => setSortBy(event.target.value as typeof sortBy)} className="min-h-[40px] w-auto shrink-0 rounded-pill px-3"><option value="nearest">Nearest</option><option value="power_desc">Power: high to low</option><option value="price_asc">Tariff: low to high</option><option value="name_asc">Name: A–Z</option></Select>
        </div>
        {hasActiveFilters && <div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-muted">Active:</span>{activeFilters.map(filter => <button key={filter.label} type="button" onClick={filter.clear} className="inline-flex min-h-[32px] items-center gap-1 rounded-pill bg-primary-50 px-2.5 text-xs font-semibold text-primary">{filter.label}<X className="h-3 w-3" /></button>)}<button type="button" onClick={clearAllFilters} className="text-xs font-semibold text-primary underline underline-offset-2">Clear all</button></div>}
      </section>

      {error ? <ErrorState message="We could not load these chargers. Please try again." onRetry={() => setRetryKey(value => value + 1)} /> : loading ? <div className="grid gap-4 md:grid-cols-2"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div> : chargers.length === 0 ? <EmptyState title="No chargers match" description="Try a broader search or remove one of the filters." actionText="Clear filters" onAction={clearAllFilters} /> : <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted"><strong className="font-semibold text-foreground">{chargers.length} chargers</strong>{sortBy === 'nearest' && userCoords ? ' · sorted by nearest' : ''}</p><div className="flex rounded-control border border-border bg-surface p-1" role="tablist" aria-label="Result view"><span className="sr-only">View results as</span>{viewItems.map(item => { const Icon = item.icon; return <button key={item.value} type="button" role="tab" aria-selected={viewMode === item.value} onClick={() => setViewMode(item.value)} className={cn('flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold', viewMode === item.value ? 'bg-primary text-white' : 'text-muted hover:text-foreground')}><Icon className="h-4 w-4" /><span className="hidden sm:inline">{item.label}</span></button>; })}</div></div>
        {viewMode === 'split' && <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]"><div className="grid gap-4">{chargers.map(charger => <ChargerCard key={charger.id} charger={charger} isSelected={selectedCharger?.id === charger.id} onSelectOnMap={chargerWithMap => { setSelectedCharger(chargerWithMap); setViewMode('map'); }} />)}</div><div className="sticky top-24 hidden lg:block"><ChargerMap chargers={chargers} selectedCharger={selectedCharger} onSelectCharger={setSelectedCharger} userCoords={userCoords} className="h-[calc(100vh-8rem)] max-h-[680px] w-full rounded-card" /></div></div>}
        {viewMode === 'list' && <div className="grid gap-4 md:grid-cols-2">{chargers.map(charger => <ChargerCard key={charger.id} charger={charger} />)}</div>}
        {viewMode === 'map' && <ChargerMap chargers={chargers} selectedCharger={selectedCharger} onSelectCharger={setSelectedCharger} userCoords={userCoords} className="h-[520px] w-full rounded-card sm:h-[680px]" />}
      </section>}
    </div>
  );
};
