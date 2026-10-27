import React, { useState, useEffect } from 'react';
import { Charger, ChargerFilters, ConnectorType, AvailabilityStatus } from '@/types';
import { DataService } from '@/services/dataService';
import { ChargerCard } from '@/components/common/ChargerCard';
import { ChargerMap } from '@/components/common/ChargerMap';
import { SkeletonCard, EmptyState, ErrorState } from '@/components/common/Feedback';
import { calculateDistanceKm } from '@/utils/geo';
import {
  Search,
  Map,
  List,
  X,
  Zap,
  RotateCcw,
  Navigation,
  Crosshair,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  MapPin,
  Check,
} from 'lucide-react';

export const DiscoveryPage: React.FC = () => {
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User GPS Location
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);

  // Filters state
  const [query, setQuery] = useState('');
  const [connector, setConnector] = useState<ConnectorType | 'all'>('all');
  const [minPower, setMinPower] = useState<number | 'all'>('all');
  const [status, setStatus] = useState<AvailabilityStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'nearest' | 'power_desc' | 'power_asc' | 'price_asc' | 'name_asc'>('nearest');

  // UI state
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);

  // Request browser location
  const detectLocation = () => {
    if (!navigator.geolocation) {
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocating(false);
      },
      err => {
        // Kozhikode default
        setUserCoords({ latitude: 11.2588, longitude: 75.7804 });
        setLocationDenied(true);
        setLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  const fetchChargers = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: ChargerFilters = {
        query: query.trim() || undefined,
        connector,
        minPower,
        status,
        sortBy,
      };
      const data = await DataService.getPublishedChargers(filters);

      // Attach distance if userCoords available
      let enriched = data.map(c => {
        if (userCoords && c.latitude && c.longitude) {
          const dist = calculateDistanceKm(userCoords.latitude, userCoords.longitude, c.latitude, c.longitude);
          return { ...c, distanceKm: dist };
        }
        return c;
      });

      // Sort by nearest if selected
      if (sortBy === 'nearest' && userCoords) {
        enriched.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
      }

      setChargers(enriched);
    } catch (err: any) {
      setError(err?.message || 'Failed to load chargers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChargers();
  }, [connector, minPower, status, sortBy, userCoords]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchChargers();
  };

  const clearAllFilters = () => {
    setQuery('');
    setConnector('all');
    setMinPower('all');
    setStatus('all');
    setSortBy('nearest');
    setSelectedCharger(null);
  };

  const hasActiveFilters =
    Boolean(query) || connector !== 'all' || minPower !== 'all' || status !== 'all';

  return (
    <div className="space-y-5 sm:space-y-7 pb-16 w-full max-w-full overflow-hidden">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#174D3A] uppercase tracking-wider mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Driver Discovery Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17231F] tracking-tight">
            Find your next charge
          </h1>
          <p className="text-xs sm:text-sm text-[#66736D] mt-1.5 font-medium">
            Discover verified private & commercial stations near you. Review technical specs and request a slot.
          </p>
        </div>

        {/* View Mode Toggle & GPS Refresh */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={detectLocation}
            disabled={locating}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white border border-border text-[#174D3A] hover:bg-[#EAF3EF] transition-all shadow-2xs hover:shadow-xs min-h-[40px]"
            title="Update Current GPS Location"
          >
            <Crosshair className={`w-4 h-4 text-[#174D3A] ${locating ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">{locating ? 'Locating GPS...' : 'Near Me (GPS)'}</span>
          </button>

          <div className="flex items-center bg-white p-1 rounded-xl border border-border shadow-2xs">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[34px] ${
                viewMode === 'split'
                  ? 'bg-[#174D3A] text-white shadow-xs'
                  : 'text-[#66736D] hover:text-[#17231F]'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[34px] ${
                viewMode === 'list'
                  ? 'bg-[#174D3A] text-white shadow-xs'
                  : 'text-[#66736D] hover:text-[#17231F]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[34px] ${
                viewMode === 'map'
                  ? 'bg-[#174D3A] text-white shadow-xs'
                  : 'text-[#66736D] hover:text-[#17231F]'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Search & Filter Card */}
      <div className="bg-white rounded-3xl border border-border p-4 sm:p-5 shadow-card space-y-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
          <div className="relative flex-1 min-w-0">
            <Search className="w-5 h-5 text-[#66736D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search area, address, or charger (e.g. Kozhikode, 60kW, CCS2)..."
              className="w-full text-xs sm:text-sm rounded-xl border border-border pl-11 pr-9 py-3 focus:outline-none focus:ring-2 focus:ring-[#174D3A] focus:border-transparent placeholder-[#66736D]/70 min-h-[46px] font-medium transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  fetchChargers();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 sm:px-7 py-3 rounded-xl bg-[#174D3A] hover:bg-[#123D2E] text-white text-xs sm:text-sm font-extrabold transition-all shadow-xs hover:shadow-card whitespace-nowrap min-h-[46px] flex items-center gap-2"
          >
            <span>Search</span>
          </button>
        </form>

        {/* Quick Filter Chips (Pill Bar) */}
        <div className="space-y-3 pt-2 border-t border-border/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Connector selection pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 max-w-full">
              <span className="text-xs font-bold text-[#66736D] mr-1 hidden sm:inline">Connector:</span>
              {(['all', 'CCS2', 'Type 2', 'GB/T', 'CHAdeMO'] as const).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setConnector(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all min-h-[34px] ${
                    connector === c
                      ? 'bg-[#174D3A] text-white shadow-2xs'
                      : 'bg-[#F5F7F4] text-[#66736D] hover:bg-[#EAF3EF] hover:text-[#174D3A]'
                  }`}
                >
                  {c === 'all' ? 'All Plugs' : c}
                </button>
              ))}
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs font-bold text-[#66736D] hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-[#F5F7F4] border border-border rounded-xl px-3 py-1.5 font-bold text-[#17231F] text-xs focus:outline-none focus:ring-2 focus:ring-[#174D3A] min-h-[36px]"
              >
                <option value="nearest">Nearest to Me 📍</option>
                <option value="power_desc">Power: High to Low</option>
                <option value="price_asc">Tariff: Low to High</option>
                <option value="name_asc">Name: A–Z</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Secondary filter pills (Power & Availability) */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="font-bold text-[#66736D] mr-1 hidden sm:inline">Power:</span>
              {[
                { val: 'all', label: 'Any Power' },
                { val: 22, label: '22 kW+' },
                { val: 50, label: '50 kW+ (Rapid)' },
                { val: 60, label: '60 kW+ (Ultra)' },
              ].map(p => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setMinPower(p.val as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    minPower === p.val
                      ? 'bg-[#C8F169] text-[#17231F] font-bold shadow-2xs'
                      : 'bg-white border border-border text-[#66736D] hover:bg-gray-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <span className="font-bold text-[#66736D] mr-1 hidden sm:inline">Status:</span>
              {[
                { val: 'all', label: 'All Statuses' },
                { val: 'available', label: 'Available Now' },
                { val: 'busy', label: 'In Use' },
              ].map(s => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => setStatus(s.val as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    status === s.val
                      ? 'bg-emerald-800 text-white font-bold shadow-2xs'
                      : 'bg-white border border-border text-[#66736D] hover:bg-gray-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Results Section */}
      {error ? (
        <ErrorState message={error} onRetry={fetchChargers} />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : chargers.length === 0 ? (
        <EmptyState
          title="No chargers match your criteria"
          description="Try relaxing your connector or power filters, or search for a broader area in Kerala."
          actionText="Clear All Filters"
          onAction={clearAllFilters}
        />
      ) : (
        <div className="space-y-4">
          {/* Active Results Summary */}
          <div className="flex items-center justify-between text-xs text-[#66736D] px-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#174D3A] text-white font-bold text-[11px]">
                {chargers.length}
              </span>
              <span>
                verified chargers {sortBy === 'nearest' && userCoords ? '(sorted by nearest to your location)' : ''}
              </span>
            </div>
            {selectedCharger && (
              <button
                onClick={() => setSelectedCharger(null)}
                className="text-[#174D3A] font-bold hover:underline flex items-center gap-1"
              >
                <span>Clear pinned ({selectedCharger.name})</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Split View Layout */}
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Map Panel: on top on mobile, sticky on desktop */}
              <div className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-24 w-full">
                <ChargerMap
                  chargers={chargers}
                  selectedCharger={selectedCharger}
                  onSelectCharger={c => setSelectedCharger(c)}
                  userCoords={userCoords}
                  className="h-[320px] sm:h-[420px] lg:h-[640px] w-full rounded-3xl shadow-card"
                />
              </div>

              {/* List Column */}
              <div className="lg:col-span-7 order-2 lg:order-1 space-y-4 max-h-none lg:max-h-[820px] lg:overflow-y-auto lg:pr-1">
                {chargers.map(charger => (
                  <ChargerCard
                    key={charger.id}
                    charger={charger}
                    isSelected={selectedCharger?.id === charger.id}
                    onSelectOnMap={c => {
                      setSelectedCharger(c);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    userCoords={userCoords}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Cards Only Layout */}
          {viewMode === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {chargers.map(charger => (
                <ChargerCard
                  key={charger.id}
                  charger={charger}
                  userCoords={userCoords}
                />
              ))}
            </div>
          )}

          {/* Map Only Layout */}
          {viewMode === 'map' && (
            <div className="space-y-4">
              <ChargerMap
                chargers={chargers}
                selectedCharger={selectedCharger}
                onSelectCharger={c => setSelectedCharger(c)}
                userCoords={userCoords}
                className="h-[540px] sm:h-[720px] w-full rounded-3xl shadow-card"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
